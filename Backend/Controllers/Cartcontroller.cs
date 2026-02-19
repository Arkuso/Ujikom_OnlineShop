using Backend.DTOs;
using Backend.DTOs.Cart;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ServiceResponse<List<CartItemDto>>>> GetMyCart()
        {
            return Ok(await _cartService.GetMyCart());
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ServiceResponse<List<CartItemDto>>>> AddToCart(AddToCartDto request)
        {
            var result = await _cartService.AddToCart(request);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<ActionResult<ServiceResponse<bool>>> RemoveFromCart(int id)
        {
            var result = await _cartService.RemoveFromCart(id);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }
    }
}
