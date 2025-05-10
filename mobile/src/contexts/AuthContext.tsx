import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import authService from '../services/authService';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (id: string, data: Partial<RegisterData>) => Promise<void>;
  deleteUserAccount: (id: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'user_data';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      if (response.user) {
        setUser(response.user);
        await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(response.user));
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(data);
      return response;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserInfo = async (id: string, data: Partial<RegisterData>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateUser(id, data);
      setUser(updatedUser);
      await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.message || 'Update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUserAccount = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.deleteUser(id);
      await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Delete failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUserInfo,
        deleteUserAccount,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};