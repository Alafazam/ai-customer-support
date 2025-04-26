'use client';

import { AuthResponse, LoginCredentials } from '@/types/auth';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'auth_user';
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-secret-key';

function encryptData(data: AuthResponse): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

function decryptData(encryptedData: string): AuthResponse {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

export function setAuthUser(data: AuthResponse) {
  if (typeof window !== 'undefined') {
    const encryptedData = encryptData(data);
    localStorage.setItem(STORAGE_KEY, encryptedData);
  }
}

export function getAuthUser(): AuthResponse | null {
  if (typeof window === 'undefined') return null;
  
  const encryptedData = localStorage.getItem(STORAGE_KEY);
  if (!encryptedData) return null;
  return decryptData(encryptedData);
}

export function removeAuthUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Login failed');
  }
}

export { type AuthResponse, type LoginCredentials }; 