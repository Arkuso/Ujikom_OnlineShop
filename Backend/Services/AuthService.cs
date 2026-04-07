using AutoMapper;
using Backend.Data;
using Backend.DTOs;
using Backend.DTOs.Auth;
using Backend.Helpers;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly JwtHelper _jwtHelper;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _environment;

        public AuthService(AppDbContext context, JwtHelper jwtHelper, IMapper mapper, IWebHostEnvironment environment)
        {
            _context = context;
            _jwtHelper = jwtHelper;
            _mapper = mapper;
            _environment = environment;
        }

        public async Task<ServiceResponse<string>> Login(LoginRequest request)
        {
            var response = new ServiceResponse<string>();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower().Equals(request.Email.ToLower()));

            if (user == null)
            {
                response.Success = false;
                response.Message = "User not found.";
            }
            else if (!PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                response.Success = false;
                response.Message = "Wrong password.";
            }
            else
            {
                response.Data = _jwtHelper.GenerateToken(user);
                response.Message = "Login successful.";
            }

            return response;
        }

        public async Task<ServiceResponse<int>> Register(RegisterRequest request)
        {
            var response = new ServiceResponse<int>();
            if (await UserExists(request.Email))
            {
                response.Success = false;
                response.Message = "User already exists.";
                return response;
            }

            // Gunakan Mapper untuk Name, Email, Role
            var user = _mapper.Map<User>(request);

            // Hash password manual
            user.PasswordHash = PasswordHasher.HashPassword(request.Password);
            user.Role = "Customer";

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            response.Data = user.Id;
            response.Message = "Registration successful.";
            return response;
        }

        public async Task<ServiceResponse<string>> UploadProfileImage(int userId, IFormFile image)
        {
            var response = new ServiceResponse<string>();
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                response.Success = false;
                response.Message = "User not found.";
                return response;
            }

            var imagesFolder = Path.Combine(_environment.WebRootPath, "images", "profiles");
            if (!Directory.Exists(imagesFolder))
                Directory.CreateDirectory(imagesFolder);

            var fileName = $"{userId}_{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(imagesFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            user.ProfileImageUrl = $"/images/profiles/{fileName}";
            await _context.SaveChangesAsync();

            response.Data = user.ProfileImageUrl;
            response.Message = "Profile image updated.";
            return response;
        }

        private async Task<bool> UserExists(string email)
        {
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower()))
            {
                return true;
            }
            return false;
        }
    }
}
