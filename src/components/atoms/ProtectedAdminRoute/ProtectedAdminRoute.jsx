import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const ProtectedAdminRoute = () => {
  const { user } = useAuth();

  if (!user || !user.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
