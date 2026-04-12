import React from 'react';
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

  const handleSaveAndExit = () => {
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
           <p className="step-subheading">Guests search for these features when they're looking for a place to stay.</p>
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
    </div>
  );
};

export default HostStep3;
