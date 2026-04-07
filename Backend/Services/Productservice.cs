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
            return await GetSaleProducts();
        }

        public async Task<ServiceResponse<List<ProductDto>>> GetSaleProducts()
        {
            var response = new ServiceResponse<List<ProductDto>>();
            var products = await _context.Products
                .Include(p => p.Category)
                .OrderBy(p => p.Id)
                .ToListAsync();

            response.Data = _mapper.Map<List<ProductDto>>(products);
            return response;
        }

        public async Task<ServiceResponse<List<ProductDto>>> GetFeaturedProducts()
        {
            var response = new ServiceResponse<List<ProductDto>>();
            var products = await _context.Products
                .Include(p => p.Category)
                .OrderByDescending(p => p.Id)
                .Take(8)
                .ToListAsync();

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
            string imageUrl = "https://via.placeholder.com/1000x1200?text=Product";
            string? imageUrl2 = null;
            string? imageUrl3 = null;
            string? imageUrl4 = null;

            if (productDto.ImageFiles != null && productDto.ImageFiles.Count > 0)
            {
                var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
                string uploadsFolder = Path.Combine(webRootPath, "images");

                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var uploadedUrls = new List<string>();

                foreach (var file in productDto.ImageFiles.Take(4)) // Max 4
                {
                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(fileStream);
                    }
                    uploadedUrls.Add("/images/" + uniqueFileName);
                }

                if (uploadedUrls.Count > 0) imageUrl = uploadedUrls[0];
                if (uploadedUrls.Count > 1) imageUrl2 = uploadedUrls[1];
                if (uploadedUrls.Count > 2) imageUrl3 = uploadedUrls[2];
                if (uploadedUrls.Count > 3) imageUrl4 = uploadedUrls[3];
            }

            // 3. Simpan ke Database
            var product = _mapper.Map<Product>(productDto);
            product.CategoryId = category.Id;
            product.ImageUrl = imageUrl;
            product.ImageUrl2 = imageUrl2;
            product.ImageUrl3 = imageUrl3;
            product.ImageUrl4 = imageUrl4;
            product.Specifications = productDto.Specifications;

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Reload product untuk mendapatkan data Kategori yang baru saja disimpan (optional tapi bagus)
            // Atau cukup set manual untuk response
            response.Data = _mapper.Map<ProductDto>(product);
            response.Data.CategoryName = category.Name; // Set manual karena Product.Category mungkin null (EF Core belum load ulang)

            response.Message = "Product created successfully.";
            return response;
        }

        public async Task<ServiceResponse<ProductDto>> UpdateProduct(int id, UpdateProductDto productDto)
        {
            var response = new ServiceResponse<ProductDto>();
            var product = await _context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                response.Success = false;
                response.Message = "Product not found.";
                return response;
            }

            // 1. Validasi Kategori
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

            // 2. Update fields
            product.Name = productDto.Name;
            product.Description = productDto.Description;
            product.Price = productDto.Price;
            product.Stock = productDto.Stock;
            product.CategoryId = category.Id;

            // 3. Update field spesifikasi
            product.Specifications = productDto.Specifications;

            // 4. Proses Upload Gambar (jika ada file baru)
            if (productDto.ImageFiles != null && productDto.ImageFiles.Count > 0)
            {
                var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
                string uploadsFolder = Path.Combine(webRootPath, "images");

                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var uploadedUrls = new List<string>();

                foreach (var file in productDto.ImageFiles.Take(4))
                {
                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(fileStream);
                    }
                    uploadedUrls.Add("/images/" + uniqueFileName);
                }

                // Override images if new files were uploaded
                if (uploadedUrls.Count > 0) product.ImageUrl = uploadedUrls[0];
                if (uploadedUrls.Count > 1) product.ImageUrl2 = uploadedUrls[1];
                if (uploadedUrls.Count > 2) product.ImageUrl3 = uploadedUrls[2];
                if (uploadedUrls.Count > 3) product.ImageUrl4 = uploadedUrls[3];
            }

            await _context.SaveChangesAsync();

            response.Data = _mapper.Map<ProductDto>(product);
            response.Data.CategoryName = category.Name;
            response.Message = "Product updated successfully.";
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
