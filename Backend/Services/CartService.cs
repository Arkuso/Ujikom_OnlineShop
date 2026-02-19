using AutoMapper;
using System.Security.Claims;
using Backend.Data;
using Backend.DTOs;
using Backend.DTOs.Cart;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;

        public CartService(AppDbContext context, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
        }

        private int GetUserId() => int.Parse(_httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        public async Task<ServiceResponse<List<CartItemDto>>> GetMyCart()
        {
            var response = new ServiceResponse<List<CartItemDto>>();
            var userId = GetUserId();

            var cartItems = await _context.Carts
                .Include(c => c.Product)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            response.Data = _mapper.Map<List<CartItemDto>>(cartItems);

            return response;
        }

        public async Task<ServiceResponse<List<CartItemDto>>> AddToCart(AddToCartDto request)
        {
            var response = new ServiceResponse<List<CartItemDto>>();
            var userId = GetUserId();

            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                response.Success = false;
                response.Message = "Product not found.";
                return response;
            }

            var cartItem = await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == request.ProductId);

            if (cartItem != null)
            {
                cartItem.Quantity += request.Quantity;
            }
            else
            {
                cartItem = _mapper.Map<Cart>(request); 
                cartItem.UserId = userId; 
                _context.Carts.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            return await GetMyCart();
        }

        public async Task<ServiceResponse<bool>> RemoveFromCart(int cartId)
        {
            var userId = GetUserId();
            var cartItem = await _context.Carts
                .FirstOrDefaultAsync(c => c.Id == cartId && c.UserId == userId);

            if (cartItem == null)
            {
                return new ServiceResponse<bool> { Success = false, Message = "Item not found." };
            }

            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();
            return new ServiceResponse<bool> { Data = true, Message = "Item removed." };
        }
    }
}
