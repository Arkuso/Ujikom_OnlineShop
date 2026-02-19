using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Product
{
    public class UpdateStockDto
    {
        [Required]
        public int ProductId { get; set; }
        [Required]
        public int QuantityToAdd { get; set; }
    }
}
