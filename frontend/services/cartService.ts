import api from './api';
import { ServiceResponse } from '../types/response';
import { CartItem, AddToCartDto } from '../types/cart';

const cartService = {
  async getCart(): Promise<ServiceResponse<CartItem[]>> {
    const response = await api.get<ServiceResponse<CartItem[]>>('/Cart');
    return response.data;
  },

  async addToCart(data: AddToCartDto): Promise<ServiceResponse<CartItem[]>> {
    const response = await api.post<ServiceResponse<CartItem[]>>('/Cart', data);
    return response.data;
  },

  async updateQuantity(id: number, quantity: number): Promise<ServiceResponse<CartItem[]>> {
    const response = await api.put<ServiceResponse<CartItem[]>>(`/Cart/${id}`, { quantity });
    return response.data;
  },

  async removeItem(id: number): Promise<ServiceResponse<boolean>> {
    const response = await api.delete<ServiceResponse<boolean>>(`/Cart/${id}`);
    return response.data;
  },
};

export default cartService;
