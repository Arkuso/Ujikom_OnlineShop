using Backend.DTOs;
using Backend.DTOs.Auth;

namespace Backend.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ServiceResponse<int>> Register(RegisterRequest request);
        Task<ServiceResponse<string>> Login(LoginRequest request);
        Task<ServiceResponse<string>> UploadProfileImage(int userId, IFormFile image);
    }
}
