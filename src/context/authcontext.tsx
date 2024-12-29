import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import { useNotification } from '../components/providers/notification-provider';

interface AuthContextType {
  isAuthenticated: boolean;
  user: CognitoUser | null;
  userAttributes: Record<string, string> | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [userAttributes, setUserAttributes] = useState<Record<string, string> | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const session = await authService.getSession();
      if (session) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          const attributes = await authService.getUserAttributes(currentUser);
          setUserAttributes(attributes);
        }
      }
    } catch (error) {
      // Silent fail for auth check
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);
      setIsAuthenticated(true);
      setUser(result.user as CognitoUser);
      const attributes = await authService.getUserAttributes(result.user);
      setUserAttributes(attributes);
      showNotification('Login successful', 'success');
    } catch (error) {
      console.error('Login error:', error);
      showNotification('Login failed. Please check your credentials.', 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setUserAttributes(null);
      showNotification('Logout successful', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Logout failed. Please try again.', 'error');
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await authService.signUp(email, password, name);
      showNotification('Registration successful. Please verify your email.', 'success');
    } catch (error) {
      console.error('Registration error:', error);
      showNotification('Registration failed. Please try again.', 'error');
      throw error;
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    if (!email || !code) {
      throw new Error('Email and verification code are required');
    }
    try {
      await authService.confirmSignUp(email, code);
      showNotification('Email verification successful. You can now log in.', 'success');
    } catch (error: any) {
      console.error('Verification error:', error);
      showNotification('Verification failed. Please try again.', 'error');
      throw new Error(error.message || 'Verification failed');
    }
  };

  const value = {
    isAuthenticated,
    user,
    userAttributes,
    login,
    logout,
    register,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};