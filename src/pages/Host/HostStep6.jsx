import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import { Info, Plus, Pencil, Trash2, IndianRupee, ChevronDown } from 'lucide-react';
import './HostStep1.css';
import './HostStep6.css'; 

const HostStep6 = () => {
  const navigate = useNavigate();
  const { listingData, updateListingData, saveDraft } = useHost();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getGstRate = (price) => {
    const p = Number(price) || 0;
    if (p <= 1000) return 0;
    if (p <= 7500) return 5;
    return 18;
  };
  const [showExitModal, setShowExitModal] = useState(false);

  const handleSaveAndExit = () => {
    setShowExitModal(true);
  };

  const confirmSaveAndExit = () => {
    saveDraft(5);
    navigate('/become-a-host/dashboard');
  };

  const handleNext = () => {
    saveDraft(5);
    navigate('/become-a-host/step6');
  };

  return (
    <div className="host-step-container aesthetic-bg">
      <div className="step-content">
        <header className="pricing-header">
           <h1 className="step-title">Now, set your price</h1>
           <p className="step-subheading">You can change it anytime. Start with a base price or add room-specific rates.</p>
        </header>


        {/* Base Price Card */}
        <div className="pricing-main-card glass-card premium-border">
          <div className="card-header">
            <h3 className="section-title">Standard Pricing</h3>
          </div>
          
          <div className="price-inputs-grid">
            <div className="price-field-container">
              <label>Weekday Price <span style={{ color: 'var(--primary)' }}>*</span></label>
              <div className="price-input-wrapper large focus-glow">
                 <span className="currency gradient-text">₹</span>
                 <input 
                   type="number"
                   placeholder="0"
                   value={listingData.price}
                   onChange={(e) => {
                     const newPrice = e.target.value;
                     const currentWeekendPrice = listingData.weekendPrice;
                     if (!currentWeekendPrice || currentWeekendPrice === listingData.price) {
                       updateListingData({ price: newPrice, weekendPrice: newPrice });
                     } else {
                       updateListingData({ price: newPrice });
                     }
                   }}
                 />
                 <span className="per-night">per night</span>
              </div>
            </div>

            <div className="price-field-container">
              <label>Weekend Price</label>
              <div className="price-input-wrapper large focus-glow">
                 <span className="currency gradient-text">₹</span>
                 <input 
                   type="number"
                   placeholder="0"
                   value={listingData.weekendPrice}
                   onChange={(e) => updateListingData({ weekendPrice: e.target.value })}
                 />
                 <span className="per-night">per night</span>
              </div>
            </div>
          </div>

          {/* Dynamic Price Breakdown */}
          {listingData.price > 0 && (
            <div className="price-breakdown-section">
              <div className="breakdown-divider"></div>
              
              <div className="breakdown-columns">
                <div className="breakdown-col">
                  <h4 className="breakdown-subtitle">You'll earn</h4>
                  <div className="breakdown-row highlight">
                    <span>Base price</span>
                    <span>₹{Number(listingData.price).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <div className="info-wrap">
                      <span>Payment gateway charges (2%)</span>
                      <Info size={14} className="info-icon" />
                    </div>
                    <span>-₹{(listingData.price * 0.02).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="breakdown-divider light"></div>
                  <div className="breakdown-row final">
                    <span>Your payout</span>
                    <span className="payout-amount">₹{(listingData.price * 0.98).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div className="breakdown-col guest-side">
                  <h4 className="breakdown-subtitle">Guest pays</h4>
                  <div className="breakdown-row">
                    <span>Base price</span>
                    <span>₹{Number(listingData.price).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>GST ({getGstRate(listingData.price)}%)</span>
                    <span>₹{(listingData.price * (getGstRate(listingData.price) / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="breakdown-divider light"></div>
                  <div className="breakdown-row final">
                    <span>Total guest price</span>
                    <span className="guest-total">₹{(Number(listingData.price || 0) + (listingData.price * (getGstRate(listingData.price) / 100))).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Stay Requirements Section */}
        <section className="step-section" style={{ marginTop: '48px' }}>
          <h2 className="step-heading">Stay Requirements <span style={{ color: 'var(--primary)' }}>*</span></h2>
          <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Minimum nights</label>
                <p style={{ fontSize: '14px', color: '#717171', marginBottom: '12px' }}>Minimum number of nights guests must book</p>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px', maxWidth: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select 
                    className="guest-select"
                    value={listingData.minStay || 1}
                    onChange={(e) => updateListingData({ minStay: parseInt(e.target.value) })}
                    style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px', fontSize: '16px', fontWeight: '400', color: '#717171', appearance: 'none', outline: 'none', cursor: 'pointer', zIndex: 1 }}
                  >
                    {[...Array(30)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'night' : 'nights'}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '16px', pointerEvents: 'none', color: '#717171', zIndex: 0 }}>
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Maximum nights</label>
                <p style={{ fontSize: '14px', color: '#717171', marginBottom: '12px' }}>Maximum number of nights guests can book</p>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px', maxWidth: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select 
                    className="guest-select"
                    value={listingData.maxStay || 365}
                    onChange={(e) => updateListingData({ maxStay: parseInt(e.target.value) })}
                    style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px', fontSize: '16px', fontWeight: '400', color: '#717171', appearance: 'none', outline: 'none', cursor: 'pointer', zIndex: 1 }}
                  >
                    <option value="7">7 nights</option>
                    <option value="14">14 nights</option>
                    <option value="30">30 nights</option>
                    <option value="60">60 nights</option>
                    <option value="90">90 nights</option>
                    <option value="180">180 nights</option>
                    <option value="365">365 nights (1 year)</option>
                  </select>
                  <div style={{ position: 'absolute', right: '16px', pointerEvents: 'none', color: '#717171', zIndex: 0 }}>
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


      </div>

      <div className="host-footer">
        <button className="back-btn" onClick={() => navigate('/become-a-host/step4')}>Back</button>
        <div className="footer-right">
           <button className="save-exit-btn" onClick={handleSaveAndExit}>Save & Exit</button>
           <button className="next-btn" onClick={handleNext}>Save & Next</button>
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

export default HostStep6;
