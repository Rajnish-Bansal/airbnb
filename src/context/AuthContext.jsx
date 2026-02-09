import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Check local storage for persisted user
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('airbnb_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const login = (userData) => {
    // Mock login logic
    const mockUser = {
      id: 1,
      name: 'Rajnish', // Default Name
      email: userData.email,
      avatar: null, // Could be a URL
      isHost: false, // Default to false
      ...userData
    };
    setUser(mockUser);
    localStorage.setItem('airbnb_user', JSON.stringify(mockUser));
    setIsAuthModalOpen(false); // Close modal on login
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('airbnb_user');
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const newUser = { ...prev, ...updates };
      localStorage.setItem('airbnb_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthModalOpen, openAuthModal, closeAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
