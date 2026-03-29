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

  // Mendapatkan profil user (biasanya token di-decode di frontend atau ada endpoint profile)
  // Untuk project ini kita simpan data di localStorage.
};

export default authService;
