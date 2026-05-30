import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, List, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/molecules/ConfirmationModal/ConfirmationModal';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
    { path: '/admin/listings', label: 'Listings', icon: <List size={20} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
           <Link to="/" className="admin-logo">
             <Shield size={28} />
             <span>Admin</span>
           </Link>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <header className="admin-top-bar">
           <h1 className="admin-page-title">
             {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
           </h1>
           
           <div className="admin-user-profile">
             <div className="admin-info">
               <span className="admin-name">{user?.name || 'Administrator'}</span>
               <span className="admin-role">Super Admin</span>
             </div>
             <div className="admin-avatar">
               {user?.name?.charAt(0).toUpperCase() || 'A'}
             </div>
           </div>
        </header>

        <Outlet />
      </main>

      <ConfirmationModal 
        isOpen={isLogoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out of Hostify Admin?"
        confirmText="Log out"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={() => {
          logout();
          setIsLogoutModalOpen(false);
          navigate('/');
        }}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
