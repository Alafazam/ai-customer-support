export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPPORT_AGENT' | 'CUSTOMER';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
} 