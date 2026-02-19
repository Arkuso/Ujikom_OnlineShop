using Backend.DTOs;
using Backend.DTOs.Category;

namespace Backend.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<ServiceResponse<List<CategoryDto>>> GetAllCategories();
        Task<ServiceResponse<CategoryDto>> GetCategoryById(int id);
        Task<ServiceResponse<CategoryDto>> AddCategory(CreateCategoryDto newCategory);
        Task<ServiceResponse<CategoryDto>> UpdateCategory(int id, CreateCategoryDto updatedCategory);
        Task<ServiceResponse<bool>> DeleteCategory(int id);
    }
}
