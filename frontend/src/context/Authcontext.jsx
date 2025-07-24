import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user info
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You might want to verify the token with a /me endpoint
      setUser({ token }); // Simplified - in real app, decode token or fetch user data
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log("[LOGIN] Attempting login with:", email);
      const response = await api.post('/auth/login', { email, password });
      console.log("[LOGIN] Response:", response.data);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("[LOGIN] Error:", error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (formData) => {
    try {
      console.log("[SIGNUP] Attempting signup with:", formData);
      const response = await api.post('/auth/register', formData);
      console.log("[SIGNUP] Response:", response.data);
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("[SIGNUP] Error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors
          ? error.response.data.errors.map(e => e.msg).join(', ')
          : (error.response?.data?.message || 'Signup failed')
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};