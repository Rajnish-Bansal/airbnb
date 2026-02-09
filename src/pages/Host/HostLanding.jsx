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
    <div className="host-landing-container aesthetic-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="host-landing-content" style={{ textAlign: 'center', maxWidth: '800px' }}>
        <header className="pricing-header">
           <Sparkles className="header-decoration" />
           <h1 className="step-title" style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-2px' }}>Airbnb it.</h1>
           <p className="step-subheading" style={{ fontSize: '24px', color: '#222' }}>You could earn extra income hosting your place.</p>
        </header>
        
        <div className="earnings-card glass-card premium-border" style={{ padding: '48px', borderRadius: '32px', marginBottom: '48px', position: 'relative' }}>
           <div className="earnings-amount" style={{ fontSize: '72px', fontWeight: '900', color: '#ff385c', marginBottom: '8px' }}>₹45,000</div> 
           <div className="earnings-period" style={{ fontSize: '18px', fontWeight: '600', color: '#717171' }}><span className="highlight" style={{ color: '#222', borderBottom: '2px solid #ff385c' }}>7 nights</span> at an estimated ₹6,428 a night</div>
           
           <div className="earnings-slider-container" style={{ margin: '40px 0 24px' }}>
             <div className="slider-track" style={{ height: '12px', background: '#f0f0f0', borderRadius: '6px', position: 'relative' }}>
               <div className="slider-fill" style={{ width: '40%', height: '100%', background: 'linear-gradient(to right, #ff385c, #bd1e59)', borderRadius: '6px' }}></div>
               <div className="slider-thumb" style={{ left: '40%', position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', width: '30px', height: '30px', background: 'white', border: '2px solid #ff385c', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}></div>
             </div>
           </div>
           
           <div className="earnings-disclaimer">
             <a href="#" style={{ color: '#717171', fontSize: '14px', textDecoration: 'underline' }}>Learn how we estimate your earnings</a>
           </div>
        </div>

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
