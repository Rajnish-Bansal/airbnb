import React, { createContext, useContext, useState } from 'react';
import { sendOtp, verifyOtp, googleLogin } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hostify_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestOtp = async (phone) => {
    setLoading(true);
    setError(null);
    try {
      await sendOtp(phone);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (phone, code) => {
    setLoading(true);
    setError(null);
    try {
      const data = await verifyOtp(phone, code);
      setUser(data.user);
      localStorage.setItem('hostify_token', data.token);
      localStorage.setItem('hostify_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await googleLogin(userData);
      setUser(data.user);
      localStorage.setItem('hostify_token', data.token);
      localStorage.setItem('hostify_user', JSON.stringify(data.user));
      setIsAuthModalOpen(false);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setError(null);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hostify_token');
    localStorage.removeItem('hostify_user');
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const newUser = { ...prev, ...updates };
      localStorage.setItem('hostify_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      requestOtp, 
      confirmOtp,
      loginWithGoogle,
      logout, 
      updateUser, 
      isAuthModalOpen, 
      openAuthModal, 
      closeAuthModal, 
      loading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
