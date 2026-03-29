using Backend.DTOs;
using Backend.DTOs.Cart;

namespace Backend.Services.Interfaces
{
    public interface ICartService
    {
        Task<ServiceResponse<List<CartItemDto>>> GetMyCart();
        Task<ServiceResponse<List<CartItemDto>>> AddToCart(AddToCartDto request);
        Task<ServiceResponse<List<CartItemDto>>> UpdateCartQuantity(int cartId, int quantity);
        Task<ServiceResponse<bool>> RemoveFromCart(int cartId);
    }
}
