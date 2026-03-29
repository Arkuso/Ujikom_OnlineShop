import api from './api';
import { ServiceResponse } from '../types/response';
import { Order } from '../types/order';

const orderService = {
  async getMyOrders(): Promise<ServiceResponse<Order[]>> {
    const response = await api.get<ServiceResponse<Order[]>>('/Order');
    return response.data;
  },

  async getAllOrders(): Promise<ServiceResponse<Order[]>> {
    const response = await api.get<ServiceResponse<Order[]>>('/Order/admin');
    return response.data;
  },

  async checkout(): Promise<ServiceResponse<Order>> {
    const response = await api.post<ServiceResponse<Order>>('/Order/checkout');
    return response.data;
  },

  async updateStatus(id: number, status: string): Promise<ServiceResponse<Order>> {
    const response = await api.put<ServiceResponse<Order>>(`/Order/${id}/status`, { status });
    return response.data;
  },
};

export default orderService;
