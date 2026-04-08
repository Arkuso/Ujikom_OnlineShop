using Backend.Models;

namespace Backend.Services.Interfaces
{
    public interface IXenditService
    {
        Task<string?> CreateInvoiceAsync(Order order, string userEmail = "buyer@onlineshop.com");
    }
}
