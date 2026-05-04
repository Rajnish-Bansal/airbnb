import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, Menu, User, Bell, Search } from 'lucide-react';
import { useHost } from '../../../context/HostContext';
import { useAuth } from '../../../context/AuthContext';
import AuthModal from '../../molecules/AuthModal/AuthModal';
import './Navbar.css';

const Navbar = ({ onLogoClick, scrolled }) => {
  const { listings } = useHost();
  const { user, logout, isAuthModalOpen, openAuthModal, closeAuthModal, allUsers } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);
  
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

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
      // Check if user is a host in DB, or was passed explicitly
      const userInDb = allUsers?.find(u => u.email === userData.email);
      const isHostUser = userInDb?.role === 'Host' || userData.isHost;
      userData.isHost = isHostUser;

      if (redirectAfterLogin) {
        navigate(redirectAfterLogin);
        setRedirectAfterLogin(null);
      } else if (isHostUser) {
        navigate('/become-a-host');
      }
    } else {
      closeAuthModal();
      setRedirectAfterLogin(null);
      navigate('/');
    }
  };
  
  // Close search when scrolling could be a nice touch, but let's stick to click-outside for now.

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link 
              to="/" 
              className="logo-wrapper"
              onClick={() => {
                if (onLogoClick) onLogoClick();
              }}
            >
               <span className="logo-icon">🌿</span>
               <span className="logo-text">Hostify</span>
            </Link>
            <span className="navbar-made-in-india"><span>🇮🇳</span> Made in India</span>
          </div>

          {/* Search Pill - Only visible on scroll - REMOVED per user request */}

          {/* User Menu */}
          <div className="navbar-user">
            {user ? (
               isHostMode ? (
                  <Link to="/" className="host-switch-btn">Switch to Traveling</Link>
               ) : isHost ? (
                  <Link to="/become-a-host/dashboard" className="host-link">Switch to hosting</Link>
               ) : (
                  <Link to="/become-a-host" className="host-link">Become a host</Link>
               )
            ) : (
               <div className="host-link" onClick={() => { setRedirectAfterLogin('/become-a-host'); openAuthModal(); }} style={{cursor: 'pointer'}}>Become a host</div>
            )}
            
            {/* Globe icon removed */}
            
            {user && (
              <Link to="/notifications" className="notifications-btn">
                 <span className="notifications-icon-wrapper">
                   <Bell size={18} />
                 </span>
              </Link>
            )}

            <div className="user-menu-container" ref={userMenuRef}>
                <div 
                  className="user-menu-button" 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                   {user ? (
                      <span className="user-name-text">
                        {user.name?.split(' ')[0]}
                      </span>
                   ) : (
                      <User size={18} className="user-icon" />
                   )}
                   <Menu size={18} />
                </div>

                {isUserMenuOpen && (
                  <>
                    <div className="mobile-menu-overlay show-only-mobile" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="user-dropdown-menu">
                       {user ? (
                          <>
                        <div className="user-profile-header" onClick={() => { navigate('/profile'); setIsUserMenuOpen(false); }}>
                          <div className="user-name-display">{user.name || 'User'}</div>
                          {user.email && <div className="user-email-display">{user.email}</div>}
                        </div>
                        <div className="menu-divider"></div>
                        
                        <Link to="/profile" className="menu-item" onClick={() => setIsUserMenuOpen(false)}>Profile</Link>
                        <Link to="/bookings" className="menu-item" onClick={() => setIsUserMenuOpen(false)}>My Bookings</Link>
                        <Link to="/wallet" className="menu-item" onClick={() => setIsUserMenuOpen(false)}>Wallet</Link>
                        <div className="menu-divider"></div>
                        <div className="menu-item" onClick={() => {
                           logout();
                           setIsUserMenuOpen(false);
                        }}>Logout</div>
                          </>
                       ) : (
                          <>
  
                            <div className="menu-item-bold" onClick={() => { openAuthModal(); setIsUserMenuOpen(false); }}>Log in</div>
                            <div className="menu-item" onClick={() => { openAuthModal(); setIsUserMenuOpen(false); }}>Sign up</div>
                            <div className="menu-divider"></div>
                            <div className="menu-item" onClick={() => { setRedirectAfterLogin('/become-a-host'); openAuthModal(); setIsUserMenuOpen(false); }}>Become a host</div>
                            <div className="menu-item">Help Center</div>
                          </>
                       )}
                    </div>
                  </>
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
