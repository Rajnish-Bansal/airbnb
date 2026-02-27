import { useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import './HostStep1.css';

const propertyTypes = [
  { label: 'Apartment/Flat', icon: '🏢' },
  { label: 'Villa (Luxury)', icon: '🏡' },
  { label: 'House (Standard)', icon: '🏛️' },
];

const placeTypes = [
  { id: 'entire', label: 'An entire place', description: 'Guests have the whole place to themselves.' },
  { id: 'private', label: 'A private room', description: 'Guests have their own room in a home, plus access to shared spaces.' },
];

const HostStep1 = () => {
  const navigate = useNavigate();
  const { listingData, updateListingData, saveDraft } = useHost();

  const handleSaveAndExit = () => {
    saveDraft(1);
    navigate('/become-a-host/dashboard');
  };

  const handleNext = () => {
    saveDraft(2);
    navigate('/become-a-host/step2');
  };

  const handlePropertyTypeSelect = (typeLabel) => {
    updateListingData({ type: typeLabel });
  };

  return (
    <div className="host-step-container aesthetic-bg">
      <div className="step-content">
        <header className="pricing-header">
           <h1 className="step-title">Let's start with the basics</h1>
           <p className="step-subheading">Which of these best describes your place and how guests will stay?</p>
        </header>
        
        {/* Property Type Section */}
        <section className="step-section">
          <h2 className="step-heading">Property Category <span style={{ color: '#ff385c' }}>*</span></h2>
          <div className="type-grid">
            {propertyTypes.map(type => (
               <div 
                 key={type.label}
                  className={`aesthetic-card glass-card ${listingData.type === type.label ? 'selected' : ''}`}
                  onClick={() => handlePropertyTypeSelect(type.label)}
                >
                 <div className="type-icon">{type.icon}</div>
                 <div className="type-name">{type.label}</div>
               </div>
            ))}
          </div>
        </section>

        {/* Place Type Section */}
        <section className="step-section">
            <h2 className="step-heading">Privacy Level <span style={{ color: '#ff385c' }}>*</span></h2>
            <div className="place-type-list">
              {placeTypes.map(place => (
                 <div 
                   key={place.id}
                   className={`aesthetic-card glass-card ${listingData.placeType === place.id ? 'selected' : ''}`}
                   onClick={() => updateListingData({ placeType: place.id })}
                 >
                   <div className="place-info">
                     <div className="place-label">{place.label}</div>
                     <div className="place-desc">{place.description}</div>
                   </div>
                 </div>
              ))}
            </div>
          </section>

        {/* Multi-Unit Section */}
        <section className="step-section">
          <h2 className="step-heading">Inventory & Units <span style={{ color: '#ff385c' }}>*</span></h2>
          <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: listingData.isMultiUnit ? '20px' : '0' }}>
                <div>
                  <label style={{ fontSize: '16px', fontWeight: '600', color: '#222', display: 'block' }}>Multiple identical units?</label>
                  <p style={{ fontSize: '14px', color: '#717171', margin: '4px 0 0 0' }}>If you have several identical rooms, cabins, or apartments, list them as one and manage inventory together.</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={listingData.isMultiUnit || false}
                    onChange={(e) => updateListingData({ isMultiUnit: e.target.checked, unitCount: e.target.checked ? 2 : 1 })}
                  />
                  <span className="toggle-slider"></span>
                </label>
             </div>

             {listingData.isMultiUnit && (
               <div style={{ paddingTop: '20px', borderTop: '1px solid #eee' }}>
                 <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>How many identical units do you have?</label>
                 <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px', maxWidth: '300px' }}>
                   <select 
                     className="guest-select"
                     value={listingData.unitCount || 2}
                     onChange={(e) => updateListingData({ unitCount: parseInt(e.target.value) })}
                     style={{ border: 'none', backgroundColor: 'transparent' }}
                   >
                     {[...Array(49)].map((_, i) => (
                       <option key={i + 2} value={i + 2}>
                         {i + 2} units
                       </option>
                     ))}
                   </select>
                 </div>
               </div>
             )}
          </div>
        </section>

        {/* Conditional: Shared Spaces Section (only for private rooms) */}
        {listingData.placeType === 'private' && (
          <section className="step-section">
            <h2 className="step-heading">Shared Spaces <span style={{ color: '#ff385c' }}>*</span></h2>
            <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px' }}>
              <p style={{ fontSize: '14px', color: '#717171', marginBottom: '20px' }}>
                Which areas can guests access?
              </p>
              {/* Private Bathroom */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '16px', fontWeight: '600', color: '#222', display: 'block' }}>Private bathroom</label>
                  <p style={{ fontSize: '14px', color: '#717171', margin: '4px 0 0 0' }}>Guest has their own private bathroom</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={listingData.sharedSpaces?.privateBathroom || false}
                    onChange={(e) => updateListingData({
                      sharedSpaces: { ...listingData.sharedSpaces, privateBathroom: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Shared Kitchen */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '16px', fontWeight: '600', color: '#222', display: 'block' }}>Shared kitchen access</label>
                  <p style={{ fontSize: '14px', color: '#717171', margin: '4px 0 0 0' }}>Guest can use the kitchen</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={listingData.sharedSpaces?.sharedKitchen || false}
                    onChange={(e) => updateListingData({
                      sharedSpaces: { ...listingData.sharedSpaces, sharedKitchen: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Shared Living Room */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '16px', fontWeight: '600', color: '#222', display: 'block' }}>Shared living room access</label>
                  <p style={{ fontSize: '14px', color: '#717171', margin: '4px 0 0 0' }}>Guest can use the living room</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={listingData.sharedSpaces?.sharedLivingRoom || false}
                    onChange={(e) => updateListingData({
                      sharedSpaces: { ...listingData.sharedSpaces, sharedLivingRoom: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Other Spaces */}
              <div>
                <label style={{ fontSize: '16px', fontWeight: '600', color: '#222', display: 'block', marginBottom: '8px' }}>Other shared spaces (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Balcony, Garden, Gym"
                  value={listingData.sharedSpaces?.otherSpaces || ''}
                  onChange={(e) => updateListingData({
                    sharedSpaces: { ...listingData.sharedSpaces, otherSpaces: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e2e2',
                    borderRadius: '12px',
                    fontSize: '14px',
                    background: '#fcfcfc'
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Conditional: Host Presence Section (only for private rooms) */}
        {listingData.placeType === 'private' && (
          <section className="step-section">
            <h2 className="step-heading">Host Presence</h2>
            <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px' }}>
              
              {/* Host Present */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '16px', fontWeight: '600', color: '#222', display: 'block' }}>Will you be present during the stay?</label>
                  <p style={{ fontSize: '14px', color: '#717171', margin: '4px 0 0 0' }}>You'll be living in the property while guests stay</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={listingData.hostPresence?.hostPresent || false}
                    onChange={(e) => updateListingData({
                      hostPresence: { ...listingData.hostPresence, hostPresent: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Roommates Present */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '16px', fontWeight: '600', color: '#222', display: 'block' }}>Are other roommates present?</label>
                  <p style={{ fontSize: '14px', color: '#717171', margin: '4px 0 0 0' }}>Other people live in the property</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={listingData.hostPresence?.roommatesPresent || false}
                    onChange={(e) => updateListingData({
                      hostPresence: { ...listingData.hostPresence, roommatesPresent: e.target.checked }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {/* Access Hours */}
              <div>
                <label style={{ fontSize: '16px', fontWeight: '600', color: '#222', display: 'block', marginBottom: '8px' }}>Guest access hours</label>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px', maxWidth: '300px' }}>
                  <select
                    className="guest-select"
                    value={listingData.hostPresence?.accessHours || '24/7'}
                    onChange={(e) => updateListingData({
                      hostPresence: { ...listingData.hostPresence, accessHours: e.target.value }
                    })}
                    style={{ border: 'none', backgroundColor: 'transparent' }}
                  >
                    <option value="24/7">24/7 Access</option>
                    <option value="08:00-22:00">8 AM - 10 PM</option>
                    <option value="09:00-21:00">9 AM - 9 PM</option>
                    <option value="custom">Custom Hours</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        )}


        {/* Property Capacity Section - Conditional based on placeType */}
        <section className="step-section">
          <h2 className="step-heading">
            {listingData.placeType === 'private' ? 'Room Capacity' : 'Property Capacity'} <span style={{ color: '#ff385c' }}>*</span>
          </h2>
          
          {/* For Entire Place: Show Bedrooms, Bathrooms, Guests */}
          {listingData.placeType === 'entire' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Bedrooms</label>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px' }}>
                  <select 
                    className="guest-select"
                    value={listingData.bedrooms || 0}
                    onChange={(e) => updateListingData({ bedrooms: parseInt(e.target.value) })}
                    style={{ border: 'none', backgroundColor: 'transparent' }}
                  >
                    {[...Array(11)].map((_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? 'Studio' : `${i} ${i === 1 ? 'bedroom' : 'bedrooms'}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Bathrooms</label>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px' }}>
                  <select 
                    className="guest-select"
                    value={listingData.bathrooms || 1}
                    onChange={(e) => updateListingData({ bathrooms: parseInt(e.target.value) })}
                    style={{ border: 'none', backgroundColor: 'transparent' }}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'bathroom' : 'bathrooms'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Guests</label>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px' }}>
                  <select 
                    className="guest-select"
                    value={listingData.guests}
                    onChange={(e) => updateListingData({ guests: parseInt(e.target.value) })}
                    style={{ border: 'none', backgroundColor: 'transparent' }}
                  >
                    {[...Array(16)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* For Private Room: Show Beds and Guests only */}
          {listingData.placeType === 'private' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '600px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Beds in room</label>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px' }}>
                  <select 
                    className="guest-select"
                    value={listingData.beds || 1}
                    onChange={(e) => updateListingData({ beds: parseInt(e.target.value) })}
                    style={{ border: 'none', backgroundColor: 'transparent' }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'bed' : 'beds'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Guests</label>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px' }}>
                  <select 
                    className="guest-select"
                    value={listingData.guests}
                    onChange={(e) => updateListingData({ guests: parseInt(e.target.value) })}
                    style={{ border: 'none', backgroundColor: 'transparent' }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Check-in/Check-out Times Section */}
        <section className="step-section">
          <h2 className="step-heading">Check-in and Check-out Times <span style={{ color: '#ff385c' }}>*</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Check-in</label>
              <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px' }}>
                <select 
                  className="guest-select"
                  value={listingData.checkInTime || '15:00'}
                  onChange={(e) => updateListingData({ checkInTime: e.target.value })}
                  style={{ border: 'none', backgroundColor: 'transparent' }}
                >
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Check-out</label>
              <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px' }}>
                <select 
                  className="guest-select"
                  value={listingData.checkOutTime || '11:00'}
                  onChange={(e) => updateListingData({ checkOutTime: e.target.value })}
                  style={{ border: 'none', backgroundColor: 'transparent' }}
                >
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* House Rules Section */}
        <section className="step-section">
          <h2 className="step-heading">House Rules</h2>
          <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px' }}>
            
            {/* Smoking */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '16px', fontWeight: '600', color: '#222', display: 'block' }}>Smoking allowed</label>
                <p style={{ fontSize: '14px', color: '#717171', margin: '4px 0 0 0' }}>Allow guests to smoke inside the property</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={listingData.houseRules?.smoking || false}
                  onChange={(e) => updateListingData({ 
                    houseRules: { ...listingData.houseRules, smoking: e.target.checked }
                  })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* Events/Parties */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '16px', fontWeight: '600', color: '#222', display: 'block' }}>Events/Parties allowed</label>
                <p style={{ fontSize: '14px', color: '#717171', margin: '4px 0 0 0' }}>Allow guests to host events or parties</p>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={listingData.houseRules?.events || false}
                  onChange={(e) => updateListingData({ 
                    houseRules: { ...listingData.houseRules, events: e.target.checked }
                  })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>



          </div>
        </section>
      </div>

      <div className="host-footer">
        <button className="back-btn" onClick={() => navigate('/become-a-host')}>Back</button>
        <div className="footer-right">
           <button className="save-exit-btn" onClick={handleSaveAndExit}>Save & Exit</button>
           <button className="next-btn btn-solid" onClick={handleNext}>Save & Next</button>
        </div>
      </div>
    </div>
  );
};

export default HostStep1;
