using Backend.DTOs;
using Backend.DTOs.Order;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<ServiceResponse<List<OrderDto>>>> GetMyOrders()
        {
            return Ok(await _orderService.GetMyOrders());
        }

        [HttpPost("checkout")]
        [Authorize]
        public async Task<ActionResult<ServiceResponse<OrderDto>>> Checkout()
        {
            var response = await _orderService.Checkout();
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
    }
}
