using Backend.Models;

namespace Backend.Data
{
    public static class DbSeeder
    {
        public static void Seed(AppDbContext context)
        {
            // Seed Default Admin User
            if (!context.Users.Any(u => u.Email == "admin@admin.com"))
            {
                context.Users.Add(new User
                {
                    Name = "Cingok",
                    Email = "Cingok@gmail.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("adminpassword123"),
                    Role = "Admin"
                });
                context.SaveChanges();
            }

            // Seed Default Categories
            // Daftar kategori yang diinginkan
            var defaultCategories = new List<Category>
            {
                new Category { Name = "Headphones", Description = "Devices for listening to audio" },
                new Category { Name = "Speakers", Description = "Devices used for audio output" },
                new Category { Name = "Smart Phones", Description = "Mobile phones with computing capabilities" },
                new Category { Name = "Computers", Description = "Electronic devices for processing data" }
            };

            foreach (var cat in defaultCategories)
            {
                // Cek apakah kategori dengan nama ini sudah ada?
                if (!context.Categories.Any(c => c.Name == cat.Name))
                {
                    context.Categories.Add(cat);
                }
            }
            
            // Simpan perubahan jika ada penambahan baru
            if (context.ChangeTracker.HasChanges())
            {
                context.SaveChanges();
            }
        }
    }
}
