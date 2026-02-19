using AutoMapper;
using Backend.Data;
using Backend.DTOs;
using Backend.DTOs.Category;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public CategoryService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ServiceResponse<List<CategoryDto>>> GetAllCategories()
        {
            var response = new ServiceResponse<List<CategoryDto>>();
            var categories = await _context.Categories.ToListAsync();
            response.Data = _mapper.Map<List<CategoryDto>>(categories);
            return response;
        }

        public async Task<ServiceResponse<CategoryDto>> GetCategoryById(int id)
        {
            var response = new ServiceResponse<CategoryDto>();
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                response.Success = false;
                response.Message = "Category not found.";
                return response;
            }

            response.Data = _mapper.Map<CategoryDto>(category);
            return response;
        }

        public async Task<ServiceResponse<CategoryDto>> AddCategory(CreateCategoryDto newCategory)
        {
            var category = _mapper.Map<Category>(newCategory);
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return await GetCategoryById(category.Id);
        }

        public async Task<ServiceResponse<CategoryDto>> UpdateCategory(int id, CreateCategoryDto updatedCategory)
        {
            var response = new ServiceResponse<CategoryDto>();
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                response.Success = false;
                response.Message = "Category not found.";
                return response;
            }

            _mapper.Map(updatedCategory, category); // Update properties otomatis
            await _context.SaveChangesAsync();
            return await GetCategoryById(category.Id);
        }

        public async Task<ServiceResponse<bool>> DeleteCategory(int id)
        {
            var response = new ServiceResponse<bool>();
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                response.Success = false;
                response.Message = "Category not found.";
                return response;
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            response.Data = true;
            return response;
        }
    }
}
