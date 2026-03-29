import api from './api';
import { ServiceResponse } from '../types/response';
import { Category, CreateCategoryDto } from '../types/category';

const categoryService = {
  async getAll(): Promise<ServiceResponse<Category[]>> {
    const response = await api.get<ServiceResponse<Category[]>>('/Category');
    return response.data;
  },

  async create(data: CreateCategoryDto): Promise<ServiceResponse<Category>> {
    const response = await api.post<ServiceResponse<Category>>('/Category', data);
    return response.data;
  },

  async update(id: number, data: CreateCategoryDto): Promise<ServiceResponse<Category>> {
    const response = await api.put<ServiceResponse<Category>>(`/Category/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<ServiceResponse<boolean>> {
    const response = await api.delete<ServiceResponse<boolean>>(`/Category/${id}`);
    return response.data;
  },
};

export default categoryService;
