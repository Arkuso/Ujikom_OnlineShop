using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";

        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public List<OrderProduct> OrderProducts { get; set; } = new List<OrderProduct>();
    }
}
