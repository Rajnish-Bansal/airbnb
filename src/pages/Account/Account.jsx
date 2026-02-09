import React from 'react';
import Navbar from '../../components/organisms/Navbar/Navbar';
import { User, Shield, CreditCard, Bell, Eye, FileText, ChevronRight, Wallet as WalletIcon } from 'lucide-react';
import './Account.css';

import { Link } from 'react-router-dom';

const Account = () => {
  const settingsOptions = [
    {
      id: 0,
      icon: <WalletIcon size={32} />, // Importing from lucide-react (needs updating import)
      title: "Wallet",
      description: "Manage your balances, payment methods, and transaction history",
      link: "/wallet"
    },
    {
      id: 1,
      icon: <User size={32} />,
      title: "Personal Info",
      description: "Provide personal details and how we can reach you"
    },
    {
      id: 2,
      icon: <Shield size={32} />,
      title: "Login & Security",
      description: "Update your password and secure your account"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="account-page-container">
        <h1 className="account-title">Account</h1>
        <p className="account-subtitle">Rajnish, user@example.com · <span className="go-to-profile">Go to profile</span></p>

        <div className="settings-grid">
          {settingsOptions.map(option => (
            option.link ? (
              <Link to={option.link} key={option.id} className="setting-card" style={{textDecoration: 'none'}}>
                <div className="setting-icon fa-thin">
                  {option.icon}
                </div>
                <div className="setting-info">
                  <h3 className="setting-title">{option.title}</h3>
                  <p className="setting-desc">{option.description}</p>
                </div>
              </Link>
            ) : (
              <div key={option.id} className="setting-card">
                <div className="setting-icon fa-thin">
                  {option.icon}
                </div>
                <div className="setting-info">
                  <h3 className="setting-title">{option.title}</h3>
                  <p className="setting-desc">{option.description}</p>
                </div>
              </div>
            )
          ))}
        </div>

        <div className="account-footer">
           <p>Need to deactivate your account? <span className="footer-link">Take care of that now</span></p>
        </div>
      </div>
    </>
  );
};

export default Account;
