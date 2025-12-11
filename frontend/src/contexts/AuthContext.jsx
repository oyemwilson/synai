import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthProvider initializing...');
    const { token, user: storedUser } = authService.getAuthData();
    console.log('📦 Stored auth data:', { 
      hasToken: !!token, 
      hasUser: !!storedUser,
      user: storedUser 
    });
    
    if (token && storedUser) {
      setUser(storedUser);
      
      // Verify token is still valid
      authService.getProfile()
        .then(userData => {
          console.log('✅ Token is valid, user:', userData);
          setUser(userData);
        })
        .catch((error) => {
          console.error('❌ Token validation failed:', error);
          authService.clearAuthData();
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('🔐 No stored auth data found');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    console.log('👤 Login attempt for:', email);
    try {
      const { user: userData } = await authService.login(email, password);
      console.log('✅ Login successful, setting user:', userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('❌ Login failed in context:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    // Also update in localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      authService.setAuthData(token, userData);
    }
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
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