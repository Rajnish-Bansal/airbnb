import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import { Sparkles, Home } from 'lucide-react';
import './HostLanding.css';
import './HostStep1.css'; // Borrow global aesthetic styles

const HostLanding = () => {
  const { listings } = useHost();
  const navigate = useNavigate();

  useEffect(() => {
    if (listings && listings.length > 0) {
      navigate('/become-a-host/dashboard');
    }
  }, [listings, navigate]);

  return (
    <div className="host-landing-container aesthetic-bg" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="host-landing-content" style={{ textAlign: 'center', maxWidth: '800px' }}>
        <header className="pricing-header">
           <Sparkles className="header-decoration" />
           <h1 className="step-title" style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-2px' }}>Airbnb it.</h1>
           <p className="step-subheading" style={{ fontSize: '24px', color: '#222' }}>You could earn extra income hosting your place.</p>
        </header>
        


        <Link to="/become-a-host/step1" className="btn-solid" style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', padding: '24px 48px', borderRadius: '20px', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <div className="setup-icon-wrapper" style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
            <Home size={28} />
          </div>
          <div className="setup-text" style={{ textAlign: 'left' }}>
            <span className="setup-title" style={{ display: 'block', fontSize: '20px', fontWeight: '800' }}>Airbnb Setup</span>
            <span className="setup-desc" style={{ fontSize: '14px', opacity: 0.9 }}>Start your hosting journey today.</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HostLanding;
