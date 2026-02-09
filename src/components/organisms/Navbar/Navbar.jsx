import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, User, Bell } from 'lucide-react';
import { useHost } from '../../../context/HostContext';
import { useAuth } from '../../../context/AuthContext';
import AuthModal from '../../molecules/AuthModal/AuthModal';
import './Navbar.css';

const Navbar = ({ onSearch, onLogoClick }) => {
  const { listings } = useHost();
  const { user, login, logout, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const isHost = listings && listings.length > 0;
  const isHostMode = location.pathname.startsWith('/become-a-host');

  const handleAuthComplete = (userData) => {
    if (userData) {
      login(userData);
    } else {
      closeAuthModal();
    }
  };
  
  // Close search when scrolling could be a nice touch, but let's stick to click-outside for now.

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
            <Link 
              to="/" 
              style={{ textDecoration: 'none' }}
              onClick={() => {
                if (onLogoClick) onLogoClick();
              }}
            >
               <span className="logo-text">airbnb</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="navbar-user">
            {user ? (
               isHostMode ? (
                  <Link to="/" className="host-link">Switch to traveling</Link>
               ) : isHost ? (
                  <Link to="/become-a-host/dashboard" className="host-link">Switch to hosting</Link>
               ) : (
                  <Link to="/become-a-host" className="host-link">Become a host</Link>
               )
            ) : (
               <div className="host-link" onClick={openAuthModal} style={{cursor: 'pointer'}}>Become a host</div>
            )}
            
            {/* Globe icon removed */}
            
            <Link to="/notifications" className="globe-button" style={{ marginLeft: '8px', cursor: 'pointer', color: 'inherit', textDecoration: 'none', padding: '12px' }}>
               <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                 <Bell size={18} />
                 <span style={{ position: 'absolute', top: '-2px', right: '-1px', width: '8px', height: '8px', backgroundColor: '#ff385c', borderRadius: '50%', border: '1px solid white' }}></span>
               </span>
            </Link>

            <div className="user-menu-container" style={{ position: 'relative' }} ref={userMenuRef}>
                <div 
                  className="user-menu-button" 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                   <Menu size={18} />
                   {user ? (
                      <div className="user-avatar-small">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                   ) : (
                      <User size={18} className="user-icon" />
                   )}
                </div>

                {isUserMenuOpen && (
                  <div className="user-dropdown-menu">
                     {user ? (
                        <>
                      {/* Name Display */}
                      <Link to="/profile" className="menu-item-bold" style={{ cursor: 'pointer', paddingBottom: '4px', textDecoration: 'none', display: 'block', color: 'inherit' }}>{user.name || 'User'}</Link>
                      <div className="menu-item" style={{ cursor: 'default', paddingTop: '0', fontSize: '12px', color: '#717171' }}>{user.email}</div>
                      <div className="menu-divider"></div>
                      
                      <div className="menu-item-bold">Messages</div>
                      <Link to="/notifications" className="menu-item-bold" style={{textDecoration: 'none', display: 'block', color: 'inherit'}} onClick={() => setIsUserMenuOpen(false)}>Notifications</Link>
                      <Link to="/bookings" className="menu-item-bold" style={{textDecoration: 'none', display: 'block', color: 'inherit'}} onClick={() => setIsUserMenuOpen(false)}>My Bookings</Link>
                      <Link to="/wishlists" className="menu-item-bold" style={{textDecoration: 'none', display: 'block', color: 'inherit'}} onClick={() => setIsUserMenuOpen(false)}>Wishlists</Link>
                      <Link to="/wallet" className="menu-item-bold" style={{textDecoration: 'none', display: 'block', color: 'inherit'}} onClick={() => setIsUserMenuOpen(false)}>Wallet</Link>
                      <div className="menu-divider"></div>
                      <Link to="/account" className="menu-item" style={{textDecoration: 'none'}}>Account</Link>
                       <div className="menu-item" onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                       }}>Log out</div>
                        </>
                     ) : (
                        <>

                          <Link to="/login" className="menu-item-bold" style={{textDecoration: 'none', display: 'block', color: 'inherit'}} onClick={() => setIsUserMenuOpen(false)}>Log in</Link>
                          <Link to="/signup" className="menu-item" style={{textDecoration: 'none', display: 'block', color: 'inherit'}} onClick={() => setIsUserMenuOpen(false)}>Sign up</Link>
                          <div className="menu-divider"></div>
                          <div className="menu-item">Become a host</div>
                          <div className="menu-item">Help Center</div>
                        </>
                     )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </header>



      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleAuthComplete} 
      />
    </>
  );
};

export default Navbar;
