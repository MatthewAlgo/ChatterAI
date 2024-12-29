'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { authService } from '../../services/auth.service';
import { useNotification } from './notification-provider';

interface AuthContextType {
  isAuthenticated: boolean;
  user: CognitoUser | null;
  userAttributes: Record<string, string> | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  isVerified: boolean;
  pendingVerificationEmail: string | null;
  setPendingVerificationEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [userAttributes, setUserAttributes] = useState<Record<string, string> | null>(null);
  const [isVerified, setIsVerified] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);
      setUser(result.user as CognitoUser);
      setIsAuthenticated(true);
      const attributes = await authService.getUserAttributes(result.user);
      setUserAttributes(attributes);
      showNotification('Login successful', 'success');
    } catch (error: any) {
      if (error.name === 'UserNotConfirmedException') {
        setPendingVerificationEmail(email);
        setIsVerified(false);
        showNotification('Please verify your email to continue', 'error');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setUserAttributes(null);
      showNotification('Logged out successfully', 'success');
    } catch (error: any) {
      showNotification(error.message || 'Logout failed', 'error');
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      await authService.signUp(email, password, name);
      showNotification('Registration successful. Please check your email for verification.', 'success');
    } catch (error: any) {
      showNotification(error.message || 'Registration failed', 'error');
      throw error;
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      await authService.confirmSignUp(email, code);
      showNotification('Email verified successfully', 'success');
    } catch (error: any) {
      showNotification(error.message || 'Verification failed', 'error');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      userAttributes,
      login,
      logout,
      register,
      verifyEmail,
      isVerified,
      pendingVerificationEmail,
      setPendingVerificationEmail
    }}>
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