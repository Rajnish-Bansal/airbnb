import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, ExternalLink, MapPin, Home } from 'lucide-react';
import { useHost } from '../../context/HostContext';
import './HostStep1.css'; // Reusing base styles
import './HostStep2.css'; // Specific styles for split layout
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Mock Geocoding Data
const CITIES = {
  'New Delhi': [28.6139, 77.2090],
  'Delhi': [28.6139, 77.2090],
  'Mumbai': [19.0760, 72.8777],
  'Bangalore': [12.9716, 77.5946],
  'Bengaluru': [12.9716, 77.5946],
  'Kolkata': [22.5726, 88.3639],
  'Chennai': [13.0827, 80.2707],
  'Hyderabad': [17.3850, 78.4867],
  'Pune': [18.5204, 73.8567],
  'Ahmedabad': [23.0225, 72.5714],
  'Jaipur': [26.9124, 75.7873],
  'Goa': [15.2993, 74.1240],
  'London': [51.5074, -0.1278],
  'New York': [40.7128, -74.0060],
  'Paris': [48.8566, 2.3522],
  'Dubai': [25.2048, 55.2708]
};

// Component to handle map movement
const MapUpdater = ({ center }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 13);
    }
  }, [center, map]);

  return null;
};

// Component to track map moves and update coordinates
const MapEventHandler = ({ onMapMove }) => {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onMapMove({ lat: center.lat, lng: center.lng });
    },
  });
  return null;
};

const HostStep2 = () => {
  const navigate = useNavigate();
  const { listingData, updateListingData, saveDraft } = useHost();
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  
  // Ensure address object exists
  const address = listingData.address || {};
  const coordinates = listingData.coordinates || { lat: 28.6139, lng: 77.2090 };
  
  // Separate state for map center to decouple camera movement from marker dragging
  const [mapCenter, setMapCenter] = React.useState(coordinates);

  const handleMapMove = (newCenter) => {
    updateListingData({
      coordinates: newCenter
    });
  };

  const handleAddressChange = (field, value) => {
    // Update structured address
    const newAddress = { ...listingData.address, [field]: value };
    
    // Auto-update location string if city/state/country changes
    let newLocation = listingData.location;
    if (field === 'city' || field === 'state' || field === 'country') {
       const city = field === 'city' ? value : newAddress.city;
       const country = field === 'country' ? value : newAddress.country;
       newLocation = [city, country].filter(Boolean).join(', ');
    }

    // Show suggestions only when typing in city field
    if (field === 'city') {
      setShowSuggestions(true);
    }

    updateListingData({ 
       address: newAddress,
       location: newLocation
    });
  };

  const handleCitySelect = (city) => {
    // Mock auto-fill for state/country based on city
    const defaults = { 
      'New Delhi': { state: 'Delhi', country: 'India' }, 
      'Delhi': { state: 'Delhi', country: 'India' },
      'Mumbai': { state: 'Maharashtra', country: 'India' }, 
      'Bangalore': { state: 'Karnataka', country: 'India' }, 
      'Bengaluru': { state: 'Karnataka', country: 'India' },
      'Kolkata': { state: 'West Bengal', country: 'India' },
      'Chennai': { state: 'Tamil Nadu', country: 'India' },
      'Hyderabad': { state: 'Telangana', country: 'India' },
      'Pune': { state: 'Maharashtra', country: 'India' },
      'Ahmedabad': { state: 'Gujarat', country: 'India' },
      'Jaipur': { state: 'Rajasthan', country: 'India' },
      'Goa': { state: 'Goa', country: 'India' },
      'London': { state: 'England', country: 'UK' }, 
      'New York': { state: 'NY', country: 'USA' },
      'Paris': { state: 'Île-de-France', country: 'France' },
      'Dubai': { state: 'Dubai', country: 'UAE' }
    };
    const filledData = defaults[city] || { state: '', country: '' };

    const newAddress = { 
      ...listingData.address, 
      city: city,
      state: filledData.state || address.state,
      country: filledData.country || address.country
    };

    // Update coordinates if city is in our list
    const newCoords = CITIES[city] ? { lat: CITIES[city][0], lng: CITIES[city][1] } : coordinates;
    
    if (CITIES[city]) {
      setMapCenter(newCoords);
    }

    updateListingData({ 
       address: newAddress,
       location: `${city}, ${newAddress.country}`,
       coordinates: newCoords
    });
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = () => {
    // Simulate getting current location
    const demoLocation = {
      apt: 'Flat 4B',
      street: 'Connaught Circus',
      city: 'New Delhi',
      state: 'Delhi',
      zip: '110001',
      country: 'India'
    };
    
    const demoCoords = { lat: 28.6139, lng: 77.2090 };

    setMapCenter(demoCoords);

    updateListingData({ 
      address: demoLocation,
      location: 'New Delhi, India',
      coordinates: demoCoords,
      notification: { message: 'Location found!', type: 'success' }
    });
  };

  const [showExitModal, setShowExitModal] = React.useState(false);

  const handleSaveAndExit = () => {
    setShowExitModal(true);
  };

  const confirmSaveAndExit = () => {
    saveDraft(2);
    navigate('/become-a-host/dashboard');
  };

  const handleNext = () => {
    saveDraft(3);
    navigate('/become-a-host/step4');
  };

  const filteredCities = Object.keys(CITIES).filter(city => 
    city.toLowerCase().includes((address.city || '').toLowerCase())
  );

  return (
    <div className="host-step-container aesthetic-bg location-large-container">
      <div className="step-content">
        <header className="pricing-header">
           <h1 className="step-title">Where's your place located?</h1>
           <p className="step-subheading">Your address is only shared with guests after they've booked.</p>
        </header>
        
        <div className="location-split-layout">
          {/* Address Input - Left Side */}
          <div className="location-inputs glass-card premium-border" style={{ padding: '32px', borderRadius: '24px' }}>
            
            <button className="current-location-btn" style={{ width: '100%', marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }} onClick={handleUseCurrentLocation}>
               <Navigation size={18} />
               Use current location
            </button>

            <div style={{ margin: '24px 0', borderBottom: '1px solid #ebebeb', position: 'relative' }}>
               <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 10px', color: '#717171', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>or enter manually</span>
            </div>

            <section className="step-section" style={{ marginBottom: '24px' }}>
              <input 
                type="text" 
                className="host-input" 
                placeholder="Apt, floor, bldg (Optional)"
                value={address.apt || ''}
                onChange={(e) => handleAddressChange('apt', e.target.value)}
                style={{ marginBottom: '16px' }}
              />
              <input 
                type="text" 
                className="host-input" 
                placeholder="Street address *"
                value={address.street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                style={{ marginBottom: '16px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div style={{ position: 'relative' }}>
                   <input 
                     type="text" 
                     className="host-input" 
                     placeholder="City *" 
                     value={address.city || ''}
                     onChange={(e) => handleAddressChange('city', e.target.value)}
                     onFocus={() => setShowSuggestions(true)}
                     onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                   />
                   {showSuggestions && (address.city || '').length > 0 && filteredCities.length > 0 && (
                     <div className="city-suggestions glass-card">
                       {filteredCities.map(city => (
                         <div 
                           key={city} 
                           className="city-suggestion-item"
                           onClick={() => handleCitySelect(city)}
                         >
                           {city}
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
                 <input 
                   type="text" 
                   className="host-input" 
                   placeholder="State *" 
                   value={address.state || ''}
                   onChange={(e) => handleAddressChange('state', e.target.value)}
                 />
              </div>
            </section>
             <section className="step-section" style={{ marginBottom: '0' }}>
              <input 
                type="text" 
                className="host-input" 
                placeholder="Pincode *" 
                value={address.zip || ''}
                onChange={(e) => handleAddressChange('zip', e.target.value)}
                style={{ marginBottom: '16px' }} 
              />
               <input 
                 type="text" 
                 className="host-input" 
                 placeholder="Country / Region *" 
                 value={address.country || ''}
                 onChange={(e) => handleAddressChange('country', e.target.value)}
               />
             </section>
          </div>

          <div className="location-map">
             <div className="map-container-wrapper glass-card premium-border" style={{ height: '100%', minHeight: '400px', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
               <MapContainer 
                 center={[mapCenter.lat, mapCenter.lng]} 
                 zoom={13} 
                 style={{ height: '100%', width: '100%' }}
                 scrollWheelZoom={true}
               >
                 <TileLayer
                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 />
                 <MapUpdater center={mapCenter} />
                 <MapEventHandler onMapMove={handleMapMove} />
               </MapContainer>
               
               {/* Fixed Center Marker */}
               <div style={{ 
                 position: 'absolute', 
                 top: '50%', 
                 left: '50%', 
                 transform: 'translate(-50%, -100%)', 
                 zIndex: 1000,
                 pointerEvents: 'none',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center'
               }}>
                 <div style={{ 
                   backgroundColor: 'var(--primary)', 
                   padding: '12px', 
                   borderRadius: '50%', 
                   boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   width: '48px',
                   height: '48px'
                 }}>
                   <Home size={24} color="white" fill="white" />
                 </div>
                 <div style={{ 
                   width: '4px', 
                   height: '16px', 
                   backgroundColor: '#333', 
                   marginTop: '-2px',
                   borderRadius: '2px',
                   opacity: 0.6
                 }}></div>
                 <div style={{
                    width: '12px',
                    height: '4px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '50%',
                    marginTop: '-2px'
                 }}></div>
               </div>

             </div>
             
             {/* Verification Link */}
             <div style={{ marginTop: '12px', textAlign: 'right' }}>
               <a 
                 href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '14px', color: 'var(--primary)', textDecoration: 'none' }}
               >
                 <ExternalLink size={14} />
                 Test on Google Maps
               </a>
             </div>
          </div>
        </div>
      </div>

      <div className="host-footer">
        <button className="back-btn" onClick={() => navigate('/become-a-host/step2')}>Back</button>
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

export default HostStep2;
