using Backend.DTOs;
using Backend.DTOs.Product;

namespace Backend.Services.Interfaces
{
    public interface IProductService
    {
        Task<ServiceResponse<List<ProductDto>>> GetAllProducts();
        Task<ServiceResponse<List<ProductDto>>> GetSaleProducts();
        Task<ServiceResponse<List<ProductDto>>> GetFeaturedProducts();
        Task<ServiceResponse<ProductDto>> GetProductById(int id);
        Task<ServiceResponse<ProductDto>> CreateProduct(CreateProductDto productDto);
        Task<ServiceResponse<ProductDto>> UpdateProduct(int id, UpdateProductDto productDto);
        Task<ServiceResponse<ProductDto>> AddStock(UpdateStockDto stockDto);
        Task<ServiceResponse<bool>> DeleteProduct(int id);
    }
}
