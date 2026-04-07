using Backend.DTOs;
using Backend.DTOs.Auth;
using Backend.Data;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, AppDbContext context, IConfiguration configuration)
        {
            _authService = authService;
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<ServiceResponse<int>>> Register(RegisterRequest request)
        {
            var response = await _authService.Register(request);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<ActionResult<ServiceResponse<object>>> Login(LoginRequest request)
        {
            var response = await _authService.Login(request);
            if (!response.Success)
            {
                return BadRequest(response);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
            var authResponse = new ServiceResponse<object>
            {
                Data = new
                {
                    token = response.Data,
                    user = new
                    {
                        id = user?.Id,
                        name = user?.Name,
                        email = user?.Email,
                        role = user?.Role,
                        profileImageUrl = user?.ProfileImageUrl
                    }
                },
                Message = response.Message,
                Success = response.Success
            };

            return Ok(authResponse);
        }

        [Authorize]
        [HttpPost("upload-profile-image")]
        public async Task<ActionResult<ServiceResponse<string>>> UploadProfileImage(IFormFile image)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var response = await _authService.UploadProfileImage(userId, image);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("internal/promote-admin")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<ActionResult<ServiceResponse<bool>>> PromoteAdmin(
            [FromBody] PromoteAdminRequest request,
            [FromHeader(Name = "X-Internal-Key")] string internalKey)
        {
            var response = new ServiceResponse<bool>();

            var expectedKey = _configuration["InternalSecurity:PromoteAdminKey"];
            if (string.IsNullOrWhiteSpace(expectedKey) || internalKey != expectedKey)
            {
                response.Success = false;
                response.Message = "Invalid internal key.";
                return Unauthorized(response);
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (user == null)
            {
                response.Success = false;
                response.Message = "User not found.";
                return NotFound(response);
            }

            if (user.Role == "Admin")
            {
                response.Data = true;
                response.Message = "User already has Admin role.";
                return Ok(response);
            }

            user.Role = "Admin";
            await _context.SaveChangesAsync();

            response.Data = true;
            response.Message = $"User {user.Email} promoted to Admin.";
            return Ok(response);
        }
    }
}
