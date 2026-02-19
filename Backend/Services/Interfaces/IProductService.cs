using Backend.DTOs;
using Backend.DTOs.Product;

namespace Backend.Services.Interfaces
{
    public interface IProductService
    {
        Task<ServiceResponse<List<ProductDto>>> GetAllProducts();
        Task<ServiceResponse<ProductDto>> GetProductById(int id);
        Task<ServiceResponse<ProductDto>> CreateProduct(CreateProductDto productDto);
        Task<ServiceResponse<ProductDto>> AddStock(UpdateStockDto stockDto);
        Task<ServiceResponse<bool>> DeleteProduct(int id);
    }
}
