using Backend.DTOs;
using Backend.DTOs.Order;

namespace Backend.Services.Interfaces
{
    public interface IOrderService
    {
        Task<ServiceResponse<OrderDto>> Checkout();
        Task<ServiceResponse<List<OrderDto>>> GetMyOrders();
        Task<ServiceResponse<List<OrderDto>>> GetAllOrders();
        Task<ServiceResponse<OrderDto>> UpdateOrderStatus(int orderId, UpdateOrderStatusDto request);
    }
}
