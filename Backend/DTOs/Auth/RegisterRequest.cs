using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Auth
{
    public class RegisterRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required, MinLength(6)]
        public string Password { get; set; } = string.Empty;
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = "Customer"; // Add Role with default
    }
}
