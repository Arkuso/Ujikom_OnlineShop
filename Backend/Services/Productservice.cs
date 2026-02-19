using AutoMapper; // Wajib ada agar IMapper dikenali
using Backend.Data;
using Backend.DTOs;
using Backend.DTOs.Product;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System.IO;
    
namespace Backend.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;
        // Interface IMapper sekarang sudah dikenali
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _environment;

        public ProductService(AppDbContext context, IMapper mapper, IWebHostEnvironment environment)
        {
            _context = context;
            _mapper = mapper;
            _environment = environment;
        }

        public async Task<ServiceResponse<List<ProductDto>>> GetAllProducts()
        {
            var response = new ServiceResponse<List<ProductDto>>();
            var products = await _context.Products.Include(p => p.Category).ToListAsync();
            // Gunakan AutoMapper untuk mapping otomatis
            response.Data = _mapper.Map<List<ProductDto>>(products);
            return response;
        }

        public async Task<ServiceResponse<ProductDto>> GetProductById(int id)
        {
            var response = new ServiceResponse<ProductDto>();
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                response.Success = false;
                response.Message = "Product not found.";
                return response;
            }

            // Gunakan AutoMapper
            response.Data = _mapper.Map<ProductDto>(product);
            return response;
        }

        public async Task<ServiceResponse<ProductDto>> CreateProduct(CreateProductDto productDto)
        {
            var response = new ServiceResponse<ProductDto>();

            // 1. Validasi Kategori (Sama seperti sebelumnya)

            Category? category = null;

            if (productDto.CategoryId > 0)
            {
                category = await _context.Categories.FindAsync(productDto.CategoryId);
            }

            if (category == null && !string.IsNullOrEmpty(productDto.CategoryName))
            {
                category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name.ToLower() == productDto.CategoryName.ToLower());
            }

            if (category == null)
            {
                response.Success = false;
                response.Message = "Category not found. Please provide a valid CategoryId or CategoryName.";
                return response;
            }

            // 2. Proses Upload Gambar
            string imageUrl = "https://via.placeholder.com/150"; // Default image jika tidak ada upload

            if (productDto.ImageFile != null)
            {
                // Buat nama file unik (misal: guid_namafile.jpg)
                string uniqueFileName = Guid.NewGuid().ToString() + "_" + productDto.ImageFile.FileName;

                // Tentukan folder penyimpanan (wwwroot/images)
                string uploadsFolder = Path.Combine(_environment.WebRootPath, "images");

                // Buat folder jika belum ada
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Simpan file fisik
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await productDto.ImageFile.CopyToAsync(fileStream);
                }

                // Set URL gambar untuk disimpan di database
                // Contoh: /images/guid_namafile.jpg
                imageUrl = "/images/" + uniqueFileName;
            }

            // 3. Simpan ke Database
            var product = _mapper.Map<Product>(productDto);
            product.CategoryId = category.Id;
            product.ImageUrl = imageUrl; // Set path gambar hasil upload

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Reload product untuk mendapatkan data Kategori yang baru saja disimpan (optional tapi bagus)
            // Atau cukup set manual untuk response
            response.Data = _mapper.Map<ProductDto>(product);
            response.Data.CategoryName = category.Name; // Set manual karena Product.Category mungkin null (EF Core belum load ulang)

            response.Message = "Product created successfully.";
            return response;
        }

        public async Task<ServiceResponse<ProductDto>> AddStock(UpdateStockDto stockDto)
        {
            var response = new ServiceResponse<ProductDto>();
            // stockDto.ProductId sekarang aman (tidak ambiguous)
            var product = await _context.Products.FindAsync(stockDto.ProductId);
            
            if (product == null)
            {
                response.Success = false;
                response.Message = "Product not found.";
                return response;
            }

            // product.Stock aman karena Model Product sudah benar
            product.Stock += stockDto.QuantityToAdd;
            await _context.SaveChangesAsync();

            // Load kategori agar CategoryName terisi di DTO result
            await _context.Entry(product).Reference(p => p.Category).LoadAsync();

            response.Data = _mapper.Map<ProductDto>(product);
            response.Message = "Stock updated successfully.";
            return response;
        }

        public async Task<ServiceResponse<bool>> DeleteProduct(int id)
        {
            var response = new ServiceResponse<bool>();
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                response.Success = false;
                response.Message = "Product not found.";
                return response;
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            response.Data = true;
            response.Message = "Product deleted successfully.";
            return response;
        }
    }
}
