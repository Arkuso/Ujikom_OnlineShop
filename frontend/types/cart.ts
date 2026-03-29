export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  formattedPrice: string;
  quantity: number;
  totalPrice: number;
  formattedTotalPrice: string;
}

export interface AddToCartDto {
  productId: number;
  quantity: number;
}
