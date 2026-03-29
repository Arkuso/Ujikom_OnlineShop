export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  formattedPrice: string;
}

export interface Order {
  id: number;
  userId: number;
  userEmail: string;
  orderDate: string;
  totalAmount: number;
  formattedTotalAmount: string;
  status: string;
  items: OrderItem[];
}
