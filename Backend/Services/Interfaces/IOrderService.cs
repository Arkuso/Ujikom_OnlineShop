using Backend.DTOs;
using Backend.DTOs.Order;

namespace Backend.Services.Interfaces
{
    public interface IOrderService
    {
        Task<ServiceResponse<OrderDto>> Checkout();
        Task<ServiceResponse<List<OrderDto>>> GetMyOrders();
    }
}
