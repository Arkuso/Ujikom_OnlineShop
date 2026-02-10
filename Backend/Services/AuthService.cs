using Backend.Data;
using Backend.DTOs;
using Backend.DTOs.Auth;
using Backend.Helpers;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public AuthService(AppDbContext context, JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
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

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = PasswordHasher.HashPassword(request.Password),
                Role = "Customer" // Default role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            response.Data = user.Id;
            response.Message = "Registration successful.";
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
