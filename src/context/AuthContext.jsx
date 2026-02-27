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

  // Mock Database of Users
  const [allUsers, setAllUsers] = useState([
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Host', status: 'Active', joinDate: '2025-10-15' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Guest', status: 'Active', joinDate: '2025-11-02' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Host', status: 'Suspended', joinDate: '2025-09-20' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'Guest', status: 'Active', joinDate: '2025-12-05' },
    { id: 5, name: 'Evan Wright', email: 'evan@example.com', role: 'Host', status: 'Active', joinDate: '2026-01-10' },
  ]);

  const login = (userData) => {
    // Find the actual user in DB to assign proper defaults
    // Since state closure prevents accessing the latest `allUsers` array directly before initialization playfully, we will just use `setAllUsers` callback or rely on the fact it's already set.
    // Wait, `allUsers` is defined below. Let's just look up the array if it exists
    const userInDb = allUsers.find(u => u.email === userData.email);

    // Mock login logic
    const mockUser = {
      id: userInDb ? userInDb.id : Math.floor(Math.random() * 10000) + 10,
      name: userInDb ? userInDb.name : 'Rajnish', // Default Name
      email: userData.email,
      avatar: null, // Could be a URL
      isHost: userInDb ? userInDb.role === 'Host' : false, // Default to false
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

  const suspendUser = (id) => {
    setAllUsers(prev => prev.map(u => 
      u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
    ));
  };

  const deleteUser = (id) => {
    setAllUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthModalOpen, openAuthModal, closeAuthModal, allUsers, suspendUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
