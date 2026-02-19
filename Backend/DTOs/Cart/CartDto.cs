using System.Globalization;

namespace Backend.DTOs.Cart
{
    public class CartItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string FormattedPrice => string.Format(new CultureInfo("id-ID"), "{0:C0}", Price);
        public int Quantity { get; set; }
        public decimal TotalPrice => Price * Quantity;
        public string FormattedTotalPrice => string.Format(new CultureInfo("id-ID"), "{0:C0}", TotalPrice);
    }

    public class AddToCartDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
