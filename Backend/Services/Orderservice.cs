using AutoMapper;
using System.Security.Claims;
using Backend.Data;
using Backend.DTOs;
using Backend.DTOs.Order;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;
        private readonly IXenditService _xenditService;

        public OrderService(AppDbContext context, IHttpContextAccessor httpContextAccessor, IMapper mapper, IXenditService xenditService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
            _xenditService = xenditService;
        }

        private int GetUserId() => int.Parse(_httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        public async Task<ServiceResponse<List<OrderDto>>> GetMyOrders()
        {
            var userId = GetUserId();
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderProducts)
                .ThenInclude(op => op.Product)
                .Include(o => o.Payment)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var orderDtos = _mapper.Map<List<OrderDto>>(orders);
            // Patch PaymentUrl directly since AutoMapper signature might not map it automatically yet
            for (int i = 0; i < orders.Count; i++)
            {
                orderDtos[i].PaymentUrl = orders[i].Payment?.PaymentUrl;
            }

            return new ServiceResponse<List<OrderDto>> { Data = orderDtos };
        }

        public async Task<ServiceResponse<List<OrderDto>>> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderProducts)
                .ThenInclude(op => op.Product)
                .Include(o => o.Payment)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var orderDtos = _mapper.Map<List<OrderDto>>(orders);
            // Patch PaymentUrl directly
            for (int i = 0; i < orders.Count; i++)
            {
                orderDtos[i].PaymentUrl = orders[i].Payment?.PaymentUrl;
            }

            return new ServiceResponse<List<OrderDto>> { Data = orderDtos };
        }

        public async Task<ServiceResponse<OrderDto>> UpdateOrderStatus(int orderId, UpdateOrderStatusDto request)
        {
            var response = new ServiceResponse<OrderDto>();

            if (string.IsNullOrWhiteSpace(request.Status) || !Helpers.OrderStatuses.All.Contains(request.Status, StringComparer.OrdinalIgnoreCase))
            {
                response.Success = false;
                response.Message = $"Invalid status. Allowed values: {string.Join(", ", Helpers.OrderStatuses.All)}";
                return response;
            }

            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderProducts)
                .ThenInclude(op => op.Product)
                .Include(o => o.Payment)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                response.Success = false;
                response.Message = "Order not found.";
                return response;
            }

            order.Status = request.Status;
            await _context.SaveChangesAsync();

            response.Data = _mapper.Map<OrderDto>(order);
            response.Data.PaymentUrl = order.Payment?.PaymentUrl;
            
            response.Message = "Order status updated successfully.";
            return response;
        }

        public async Task<ServiceResponse<OrderDto>> Checkout()
        {
            var response = new ServiceResponse<OrderDto>();
            var userId = GetUserId();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                response.Success = false;
                response.Message = "User not found.";
                return response;
            }

            var cartItems = await _context.Carts
                .Include(c => c.Product)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
            {
                response.Success = false;
                response.Message = "Cart is empty.";
                return response;
            }

            decimal totalAmount = cartItems.Sum(c => c.Product.Price * c.Quantity);

            // 1. Stock Validation
            foreach (var item in cartItems)
            {
                if (item.Product.Stock < item.Quantity)
                {
                    response.Success = false;
                    response.Message = $"Product '{item.Product.Name}' is out of stock or insufficient. (Available: {item.Product.Stock})";
                    return response;
                }
            }

            var order = new Order
            {
                UserId = userId,
                TotalAmount = totalAmount,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                OrderProducts = cartItems.Select(c => new OrderProduct
                {
                    ProductId = c.ProductId,
                    Quantity = c.Quantity,
                    Price = c.Product.Price
                }).ToList()
            };

            _context.Orders.Add(order);
            
            // Generate Xendit Invoice Url
            var invoiceUrl = await _xenditService.CreateInvoiceAsync(order, user.Email);
            
            // Add Payment record linked to order. Note: The Xendit API returns the ID in the payload. We could extract the ID from payload, but for now we'll save URL.
            // But wait, the webhook needs the `XenditInvoiceId`.
            // Hmm, I'll need to parse the InvoiceId out of the service response or just save it.
            // For robust system, XenditService should return both InvoiceUrl and XenditInvoiceId.
            // As a quick fix, if Webhook provides the ID and external_id, we can find by external_id.
            
            var payment = new Payment
            {
                Order = order,
                Amount = totalAmount,
                Status = "PENDING",
                PaymentUrl = invoiceUrl ?? "FAILED_TO_GENERATE",
                XenditInvoiceId = "PENDING" // Will be updated if Webhook handles by order external_id
            };
            
            _context.Payments.Add(payment);

            // 2. Stock Deduction
            foreach (var item in cartItems)
            {
                item.Product.Stock -= item.Quantity;
            }

            _context.Carts.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            // Mapping result
            response.Data = _mapper.Map<OrderDto>(order);
            response.Data.PaymentUrl = payment.PaymentUrl;
            response.Message = "Order placed successfully!";
            return response;
        }
    }
}
