import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import { 
  Wifi, 
  Utensils, 
  Waves, 
  Wind, 
  Tv, 
  Monitor, 
  Flame, 
  Car, 
  Dog, 
  Snowflake,
  Shirt,
  Droplet,
  Coffee,
  Shield,
  AlertTriangle,
  Accessibility,
  Dumbbell,
  Building2
} from 'lucide-react';
import './HostStep1.css';
import './HostStep2.css';

const amenitiesList = [
  { name: 'Wifi', icon: Wifi },
  { name: 'Kitchen', icon: Utensils },
  { name: 'Breakfast', icon: Coffee },
  { name: 'Washer', icon: Shirt },
  { name: 'Dryer', icon: Wind },
  { name: 'Air conditioning', icon: Snowflake },
  { name: 'Heating', icon: Flame },
  { name: 'Water heater', icon: Droplet },
  { name: 'Iron', icon: Shirt },
  { name: 'Dedicated workspace', icon: Monitor },
  { name: 'TV', icon: Tv },
  { name: 'Pool', icon: Waves },
  { name: 'Parking', icon: Car },
  { name: 'Pets allowed', icon: Dog },
  { name: 'Smoke detector', icon: AlertTriangle },
  { name: 'Carbon monoxide detector', icon: Shield },
  { name: 'Fire extinguisher', icon: Shield },
  { name: 'First aid kit', icon: Shield },
  { name: 'Step-free access', icon: Accessibility },
  { name: 'Wide doorways', icon: Accessibility },
  { name: 'Accessible bathroom', icon: Accessibility },
  { name: 'Gym', icon: Dumbbell },
  { name: 'Elevator', icon: Building2 },
];

const HostStep3 = () => {
  const navigate = useNavigate();
  const { listingData, updateListingData, saveDraft } = useHost();

  const [showExitModal, setShowExitModal] = useState(false);

  const handleSaveAndExit = () => {
    setShowExitModal(true);
  };

  const confirmSaveAndExit = () => {
    saveDraft(3);
    navigate('/become-a-host/dashboard');
  };

  const handleNext = () => {
    saveDraft(3);
    navigate('/become-a-host/step3');
  };

  const toggleAmenity = (amenity) => {
    const current = listingData.amenities || [];
    if (current.includes(amenity)) {
      updateListingData({ amenities: current.filter(a => a !== amenity) });
    } else {
      updateListingData({ amenities: [...current, amenity] });
    }
  };

  return (
    <div className="host-step-container aesthetic-bg">
      <div className="step-content">
        <header className="pricing-header">
           <h1 className="step-title">Tell guests what your place has to offer</h1>
        </header>
        
        {/* Amenities Section */}
        <section className="step-section">
          <h2 className="step-heading" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            Amenities <span style={{ color: 'var(--primary)' }}>*</span>
            <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#717171' }}>(Select minimum 3)</span>
          </h2>
          <div className="amenities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {amenitiesList.map(({ name, icon: Icon }) => (
              <div 
                key={name}
                className={`aesthetic-card glass-card ${listingData.amenities?.includes(name) ? 'selected' : ''}`}
                onClick={() => toggleAmenity(name)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', padding: '24px' }}
              >
                <Icon size={32} strokeWidth={1.5} color={listingData.amenities?.includes(name) ? 'var(--primary)' : '#222'} />
                <div className="amenity-label" style={{ fontWeight: '600', fontSize: '16px' }}>{name}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="host-footer">
        <button className="back-btn" onClick={() => navigate('/become-a-host/step1')}>Back</button>
        <div className="footer-right">
           <button className="save-exit-btn" onClick={handleSaveAndExit}>Save & Exit</button>
           <button className="next-btn btn-solid" onClick={handleNext}>Save & Next</button>
        </div>
      </div>

      {showExitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000
        }}>
          <div className="glass-card premium-border" style={{
            background: 'white', padding: '32px', borderRadius: '24px',
            maxWidth: '400px', width: '90%', textAlign: 'center',
            boxShadow: '0 16px 48px rgba(0,0,0,0.12)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#222' }}>
              Save and Exit?
            </h3>
            <p style={{ fontSize: '14px', color: '#717171', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to save your progress and exit the onboarding? You can always continue where you left off.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowExitModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd',
                  background: 'white', fontWeight: '600', cursor: 'pointer', color: '#222'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmSaveAndExit}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                  background: 'var(--primary, #FF385C)', color: 'white', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Yes, Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostStep3;
