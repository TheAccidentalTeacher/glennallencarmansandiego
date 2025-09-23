import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthService } from '../api';
import type { User, LoginRequest, RegisterRequest } from '../api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (data: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAuth = async () => {
    try {
      // Development auto-login (remove in production)
      const isDevelopment = import.meta.env.DEV;
      if (isDevelopment && !AuthService.isAuthenticated()) {
        console.log('🔧 Development mode: Auto-logging in as teacher...');
        
        // Mock teacher user for development
        const mockTeacher: User = {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'teacher@school.edu',
          displayName: 'Ms. Johnson',
          role: 'teacher',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setUser(mockTeacher);
        console.log('✅ Auto-login successful (mock user)!');
        setIsLoading(false);
        return;
      }

      if (AuthService.isAuthenticated()) {
        const response = await AuthService.getProfile();
        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          // Token is invalid, clear it
          AuthService.clearAuth();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      AuthService.clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await AuthService.register(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during registration' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      AuthService.clearAuth();
    }
  };

  const updateProfile = async (data: { displayName?: string; email?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await AuthService.updateProfile(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Profile update failed' 
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred updating profile' 
      };
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (AuthService.isAuthenticated()) {
        const response = await AuthService.getProfile();
        if (response.success && response.data) {
          setUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;