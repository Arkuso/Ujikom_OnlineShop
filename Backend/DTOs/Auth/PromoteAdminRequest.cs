using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Auth
{
    public class PromoteAdminRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
