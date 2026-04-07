import api from './api';
import { ServiceResponse } from '../types/response';
import { Product, CreateProductDto } from '../types/product';

const productService = {
  async getAll(): Promise<ServiceResponse<Product[]>> {
    const response = await api.get<ServiceResponse<Product[]>>('/Product');
    return response.data;
  },

  async getSale(): Promise<ServiceResponse<Product[]>> {
    const response = await api.get<ServiceResponse<Product[]>>('/Product/sale');
    return response.data;
  },

  async getFeatured(): Promise<ServiceResponse<Product[]>> {
    const response = await api.get<ServiceResponse<Product[]>>('/Product/featured');
    return response.data;
  },

  async getById(id: number): Promise<ServiceResponse<Product>> {
    const response = await api.get<ServiceResponse<Product>>(`/Product/${id}`);
    return response.data;
  },

  async create(data: CreateProductDto): Promise<ServiceResponse<Product>> {
    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('Description', data.description);
    formData.append('Price', data.price.toString());
    formData.append('Stock', data.stock.toString());
    formData.append('CategoryId', data.categoryId.toString());
    
    if (data.specifications) {
      formData.append('Specifications', data.specifications);
    }

    if (data.imageFiles && data.imageFiles.length > 0) {
      data.imageFiles.forEach(file => {
        formData.append('ImageFiles', file);
      });
    }

    const response = await api.post<ServiceResponse<Product>>('/Product', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async update(id: number, data: CreateProductDto): Promise<ServiceResponse<Product>> {
    const formData = new FormData();
    formData.append('Name', data.name);
    formData.append('Description', data.description);
    formData.append('Price', data.price.toString());
    formData.append('Stock', data.stock.toString());
    formData.append('CategoryId', data.categoryId.toString());
    
    if (data.specifications) {
      formData.append('Specifications', data.specifications);
    }

    if (data.imageFiles && data.imageFiles.length > 0) {
      data.imageFiles.forEach(file => {
        formData.append('ImageFiles', file);
      });
    }

    const response = await api.put<ServiceResponse<Product>>(`/Product/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(id: number): Promise<ServiceResponse<boolean>> {
    const response = await api.delete<ServiceResponse<boolean>>(`/Product/${id}`);
    return response.data;
  },

  async addStock(productId: number, quantityToAdd: number): Promise<ServiceResponse<Product>> {
    const response = await api.post<ServiceResponse<Product>>('/Product/add-stock', {
      productId,
      quantityToAdd,
    });
    return response.data;
  },
};

export default productService;
