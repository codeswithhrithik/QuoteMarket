/**
 * ============================================================================
 * Authentication Context
 * ============================================================================
 * Manages user state, login credentials, company profile defaults,
 * persistent localStorage sync, and onboarding status.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('quotecraft_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('quotecraft_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token to API headers and verify profile
  useEffect(() => {
    async function verifyUser() {
      if (token) {
        try {
          const res = await authAPI.getProfile();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('quotecraft_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session verification failed, logging out:', error);
          logout();
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('quotecraft_token', res.data.token);
      localStorage.setItem('quotecraft_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('quotecraft_token', res.data.token);
      localStorage.setItem('quotecraft_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('quotecraft_token');
    localStorage.removeItem('quotecraft_user');
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('quotecraft_user', JSON.stringify(merged));
      return merged;
    });
  };

  const refreshUser = async () => {
    if (!token) return null;
    try {
      const res = await authAPI.getProfile();
      if (res.data && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('quotecraft_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (err) {
      console.warn('refreshUser error:', err);
    }
    return null;
  };

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerInitialPlan, setScannerInitialPlan] = useState('3m');

  const openScannerModal = (planId = '3m') => {
    if (planId && typeof planId === 'string') {
      setScannerInitialPlan(planId);
    }
    setScannerOpen(true);
  };

  const closeScannerModal = () => setScannerOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        scannerOpen,
        scannerInitialPlan,
        openScannerModal,
        closeScannerModal,
        login,
        register,
        logout,
        updateUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
