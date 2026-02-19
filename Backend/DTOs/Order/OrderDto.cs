using System.Globalization;

namespace Backend.DTOs.Order
{
    public class OrderDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string FormattedTotalAmount => string.Format(new CultureInfo("id-ID"), "{0:C0}", TotalAmount);
        public string Status { get; set; } = string.Empty;
        public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string FormattedPrice => string.Format(new CultureInfo("id-ID"), "{0:C0}", Price);
    }
}
