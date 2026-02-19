using Backend.DTOs.Category;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
        {
            var result = await _categoryService.GetAllCategories();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetById(int id)
        {
            var result = await _categoryService.GetCategoryById(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")] // Hanya Admin yang boleh tambah kategori
        public async Task<ActionResult<CategoryDto>> Create(CreateCategoryDto request)
        {
            var result = await _categoryService.AddCategory(request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CategoryDto>> Update(int id, CreateCategoryDto request)
        {
            var result = await _categoryService.UpdateCategory(id, request);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<bool>> Delete(int id)
        {
            var result = await _categoryService.DeleteCategory(id);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }
    }
}
