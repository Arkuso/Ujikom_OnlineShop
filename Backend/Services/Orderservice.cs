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

        public OrderService(AppDbContext context, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }

        private int GetUserId() => int.Parse(_httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        public async Task<ServiceResponse<List<OrderDto>>> GetMyOrders()
        {
            var userId = GetUserId();
            var orders = await _context.Orders
                .Include(o => o.OrderProducts)
                .ThenInclude(op => op.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var orderDtos = _mapper.Map<List<OrderDto>>(orders);

            return new ServiceResponse<List<OrderDto>> { Data = orderDtos };
        }

        public async Task<ServiceResponse<OrderDto>> Checkout()
        {
            var response = new ServiceResponse<OrderDto>();
            var userId = GetUserId();

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

            var order = new Order
            {
                UserId = userId,
                TotalAmount = totalAmount,
                OrderDate = DateTime.UtcNow,
                Status = "Completed",
                OrderProducts = cartItems.Select(c => new OrderProduct
                {
                    ProductId = c.ProductId,
                    Quantity = c.Quantity,
                    Price = c.Product.Price
                }).ToList()
            };

            _context.Orders.Add(order);

            foreach (var item in cartItems)
            {
                item.Product.Stock -= item.Quantity;
            }

            _context.Carts.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            // Mapping result
            response.Data = _mapper.Map<OrderDto>(order);
            response.Message = "Order placed successfully!";
            return response;
        }
    }
}
