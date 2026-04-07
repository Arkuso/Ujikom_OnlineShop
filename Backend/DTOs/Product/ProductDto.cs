using System.ComponentModel.DataAnnotations;
using System.Globalization; // Tambahkan using ini untuk format mata uang jika perlu
using Microsoft.AspNetCore.Http; // Add this using

namespace Backend.DTOs.Product
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        // Data asli (Angka) - Tetap diperlukan untuk perhitungan
        public decimal Price { get; set; }

        // Data Tampilan (String) - Otomatis menambahkan "Rp" dan pemisah ribuan
        // Contoh: 150000 akan menjadi "Rp 150.000"
        public string FormattedPrice => string.Format(new CultureInfo("id-ID"), "{0:C0}", Price);

        public int Stock { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string? ImageUrl2 { get; set; }
        public string? ImageUrl3 { get; set; }
        public string? ImageUrl4 { get; set; }
        
        public string? Specifications { get; set; } // JSON String

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class CreateProductDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        // Input tetap angka agar validasi mudah & aman
        [Required]
        public decimal Price { get; set; }
        
        [Required]
        public int Stock { get; set; }

        public List<IFormFile>? ImageFiles { get; set; }
        
        public string? Specifications { get; set; } // JSON String

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }

    public class UpdateProductDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int Stock { get; set; }

        public List<IFormFile>? ImageFiles { get; set; }
        
        public string? Specifications { get; set; } // JSON String

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}
