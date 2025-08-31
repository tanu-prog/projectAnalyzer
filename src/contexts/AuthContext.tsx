import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
 
  AuthService
  
} from '../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'hr' | 'candidate';
  profile?: {
    phone?: string;
    linkedin?: string;
    location?: string;
    bio?: string;
  };
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, role: 'hr' | 'candidate') => Promise<void>;
  register: (email: string, password: string, name: string, role: 'hr' | 'candidate') => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('career_ai_token');
    
    if (token) {
      AuthService.setAuthToken(token);
      // Verify token by getting current user
      if (
        AuthService &&
        typeof AuthService.getCurrentUser === 'function'
      ) {
        try {
          const response = AuthService.getCurrentUser();
          if (response) {
            setUser(response.data);
          }
        } catch {
          // Token invalid, clear it
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role: 'hr' | 'candidate'): Promise<void> => {
    setLoading(true);
    try {
      const response = await AuthService.login(email, password, role) as unknown as AuthResponse;
      AuthService.setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'hr' | 'candidate'): Promise<void> => {
    setLoading(true);
    try {
      const response = await AuthService.register({ email, password, name, role }) as unknown as AuthResponse;
      AuthService.setAuthToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.setAuthToken('');
    localStorage.removeItem('career_ai_user');
    setUser(null);
  };

  const isAuthenticated = !!user && !!localStorage.getItem('career_ai_token');

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      register, 
      logout, 
      loading, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
}