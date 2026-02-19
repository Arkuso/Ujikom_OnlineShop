using Backend.DTOs;
using Backend.DTOs.Product;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<ActionResult<ServiceResponse<List<ProductDto>>>> GetAllProducts()
        {
            return Ok(await _productService.GetAllProducts());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServiceResponse<ProductDto>>> GetProductById(int id)
        {
            var response = await _productService.GetProductById(id);
            if (!response.Success)
            {
                return NotFound(response);
            }
            return Ok(response);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")] // Pastikan hanya Admin
        public async Task<ActionResult<ServiceResponse<ProductDto>>> CreateProduct([FromForm] CreateProductDto productDto)
        {
            // [FromForm] penting agar Swagger menampilkan tombol upload file
            var response = await _productService.CreateProduct(productDto);
            return Ok(response);
        }

        [HttpPost("add-stock")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ServiceResponse<ProductDto>>> AddStock(UpdateStockDto stockDto)
        {
            var response = await _productService.AddStock(stockDto);
            if (!response.Success)
            {
                return NotFound(response);
            }
            return Ok(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ServiceResponse<bool>>> DeleteProduct(int id)
        {
            var response = await _productService.DeleteProduct(id);
            if (!response.Success)
            {
                return NotFound(response);
            }
            return Ok(response);
        }
    }
}
