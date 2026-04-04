export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profileImageUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
