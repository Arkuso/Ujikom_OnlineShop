import api from './api';
import { ServiceResponse } from '../types/response';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

const authService = {
  async login(request: LoginRequest): Promise<ServiceResponse<AuthResponse>> {
    const response = await api.post<ServiceResponse<AuthResponse>>('/Auth/login', request);
    return response.data;
  },

  async register(request: RegisterRequest): Promise<ServiceResponse<number>> {
    const response = await api.post<ServiceResponse<number>>('/Auth/register', request);
    return response.data;
  },

  async uploadProfileImage(imageFile: File): Promise<ServiceResponse<string>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post<ServiceResponse<string>>('/Auth/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default authService;
