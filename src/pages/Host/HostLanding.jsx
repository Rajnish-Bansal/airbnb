import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import { Sparkles, Home } from 'lucide-react';
import './HostLanding.css';
import './HostStep1.css'; // Borrow global aesthetic styles

const HostLanding = () => {
  const { listings, importAirbnbListing } = useHost();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [airbnbUrl, setAirbnbUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (listings && listings.length > 0) {
      navigate('/become-a-host/dashboard');
    }
  }, [listings, navigate]);

  const handleImport = async () => {
    if (!airbnbUrl) return;
    setIsImporting(true);
    setError(null);
    try {
      await importAirbnbListing(airbnbUrl);
      navigate('/become-a-host/step1');
    } catch (err) {
      setError(err.message || 'Failed to import listing. Please check the URL.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="host-landing-container aesthetic-bg" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="host-landing-content" style={{ textAlign: 'center', maxWidth: '800px' }}>
        <header className="pricing-header">
           <Sparkles className="header-decoration" />
           <h1 className="step-title" style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-3px', marginBottom: '16px' }}>Hostify it.</h1>
           <p className="step-subheading" style={{ fontSize: '28px', color: '#222', marginBottom: '60px', opacity: 0.8 }}>You could earn extra income hosting your place.</p>
        </header>
        
        <div className="onboarding-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Manual Setup */}
          <Link to="/become-a-host/step1" className="setup-card manual-setup" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '32px', borderRadius: '24px', textDecoration: 'none', background: 'rgba(15, 23, 42, 0.05)', border: '1.5px solid rgba(15, 23, 42, 0.1)', transition: 'all 0.3s ease' }}>
            <div className="setup-icon-wrapper" style={{ background: 'var(--secondary)', color: 'white', padding: '16px', borderRadius: '16px' }}>
              <Home size={32} />
            </div>
            <div className="setup-text" style={{ textAlign: 'left' }}>
              <span className="setup-title" style={{ display: 'block', fontSize: '22px', fontWeight: '800', color: 'var(--secondary)' }}>Hostify Setup</span>
              <span className="setup-desc" style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Start your hosting journey manually.</span>
            </div>
          </Link>

          {/* Magic Import */}
          <div className="setup-card magic-setup" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '32px', borderRadius: '24px', cursor: 'pointer', background: 'white', border: '1.5px solid var(--primary)', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)', transition: 'all 0.3s ease' }}>
            <div className="setup-icon-wrapper" style={{ background: 'var(--primary)', color: 'var(--secondary)', padding: '16px', borderRadius: '16px' }}>
              <Sparkles size={32} />
            </div>
            <div className="setup-text" style={{ textAlign: 'left' }}>
              <span className="setup-title" style={{ display: 'block', fontSize: '22px', fontWeight: '800', color: 'var(--secondary)' }}>Magic Import</span>
              <span className="setup-desc" style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Onboard instantly from an Airbnb link.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Magic Import Modal */}
      {isModalOpen && (
        <div className="import-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="import-modal-content" style={{ background: 'white', width: '90%', maxWidth: '500px', borderRadius: '32px', padding: '48px', position: 'relative', textAlign: 'center' }}>
            <button className="close-btn" onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
            
            <Sparkles size={48} style={{ color: 'var(--primary)', marginBottom: '24px' }} />
            <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>Magic Import</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Paste your Airbnb listing URL to instantly populate your Hostify property.</p>

            {isImporting ? (
              <div className="importing-state" style={{ padding: '24px 0' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                <p style={{ fontWeight: '600' }}>Magically importing details...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div className="import-form">
                <input 
                  type="text" 
                  placeholder="https://www.airbnb.com/rooms/..." 
                  value={airbnbUrl}
                  onChange={(e) => setAirbnbUrl(e.target.value)}
                  style={{ width: '100%', padding: '20px', borderRadius: '16px', border: '2px solid var(--border-light)', marginBottom: '16px', fontSize: '16px' }}
                />
                {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}
                <button 
                  onClick={handleImport}
                  disabled={!airbnbUrl}
                  style={{ width: '100%', padding: '20px', borderRadius: '16px', border: 'none', background: 'var(--secondary)', color: 'white', fontWeight: '800', fontSize: '18px', cursor: 'pointer', opacity: airbnbUrl ? 1 : 0.6 }}
                >
                  Start Magic Import
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HostLanding;
