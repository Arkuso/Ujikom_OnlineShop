using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public string XenditInvoiceId { get; set; } = string.Empty;
        public string PaymentUrl { get; set; } = string.Empty;
        
        // e.g., PENDING, PAID, EXPIRED, FAILED (to store payment status)
        public string Status { get; set; } = "PENDING";
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
