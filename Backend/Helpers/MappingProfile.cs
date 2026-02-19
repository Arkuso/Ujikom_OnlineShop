using AutoMapper;
using Backend.DTOs.Auth;
using Backend.DTOs.Cart;
using Backend.DTOs.Category;
using Backend.DTOs.Order;
using Backend.DTOs.Product;
using Backend.Models;

namespace Backend.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // === Product Mapping ===
            CreateMap<Product, ProductDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name));

            CreateMap<CreateProductDto, Product>()
                .ForMember(dest => dest.ImageUrl, opt => opt.Ignore()); // Ignore ImageUrl as it's handled manually in Service

            // === Category Mapping ===
            CreateMap<Category, CategoryDto>();
            CreateMap<CreateCategoryDto, Category>();

            // === User/Auth Mapping ===
            CreateMap<RegisterRequest, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()); // Ignore PasswordHash karena akan di-hash manual
            // CreateMap<User, UserDto>(); // Jika nanti ada UserDto

            // === Cart Mapping ===
            // Mapping dari Cart (Model) ke CartItemDto (Tampilan)
            // Perhatikan: CartItemDto mengambil data dari relasi Product
            CreateMap<Cart, CartItemDto>()
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Product.ImageUrl))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Product.Price))
                // FormattedPrice & TotalPrice sudah di-handle oleh properti di DTO (Computed Property)
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity));

            CreateMap<AddToCartDto, Cart>();

            // === Order Mapping ===
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.OrderProducts));

            CreateMap<OrderProduct, OrderItemDto>()
                .ForMember(dest => dest.ProductId, opt => opt.MapFrom(src => src.ProductId))
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Quantity))
                .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Price));
        }
    }
}
