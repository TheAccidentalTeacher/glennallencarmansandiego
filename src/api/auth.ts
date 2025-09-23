import { api, TokenManager } from './client';
import type { ApiResponse } from './client';

// Auth Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'teacher' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  role: 'teacher' | 'admin';
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface UpdateProfileRequest {
  displayName?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Authentication Service
export class AuthService {
  // Register new user
  static async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    if (response.success && response.data) {
      TokenManager.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
    }
    
    return response;
  }

  // Login user
  static async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    if (response.success && response.data) {
      TokenManager.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
    }
    
    return response;
  }

  // Logout user
  static async logout(): Promise<ApiResponse> {
    const response = await api.post('/auth/logout');
    TokenManager.clearTokens();
    return response;
  }

  // Get current user profile
  static async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return api.get<{ user: User }>('/auth/profile');
  }

  // Update user profile
  static async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> {
    return api.put<{ user: User }>('/auth/profile', data);
  }

  // Change password
  static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    return api.put('/auth/password', data);
  }

  // Refresh tokens
  static async refreshTokens(): Promise<ApiResponse<{ tokens: AuthTokens }>> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<{ tokens: AuthTokens }>('/auth/refresh', {
      refreshToken,
    });

    if (response.success && response.data) {
      TokenManager.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
    }

    return response;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }

  // Clear authentication state
  static clearAuth(): void {
    TokenManager.clearTokens();
  }
}

export default AuthService;