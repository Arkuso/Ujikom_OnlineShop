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

        // Ganti string ImageUrl menjadi IFormFile
        // public string ImageUrl { get; set; } = string.Empty;
        public IFormFile? ImageFile { get; set; }

        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
    }
}
