import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import { Zap, MessageSquare, Shield, CheckCircle, ChevronDown } from 'lucide-react';
import './HostStep1.css'; 

const HostStep4 = () => {
  const navigate = useNavigate();
  const { listingData, updateListingData, saveDraft } = useHost();

  const [showExitModal, setShowExitModal] = useState(false);

  const handleSaveAndExit = () => {
    setShowExitModal(true);
  };

  const confirmSaveAndExit = () => {
    saveDraft(6);
    navigate('/become-a-host/dashboard');
  };

  const handleNext = () => {
    saveDraft(6);
    navigate('/become-a-host/step7');
  };

  const handleBookingTypeSelect = (isInstant) => {
    updateListingData({ instantBooking: isInstant });
  };

  const toggleGuestRequirement = (req) => {
    const currentReqs = listingData.guestRequirements || { verifiedID: true, positiveReviews: false };
    updateListingData({
      guestRequirements: {
        ...currentReqs,
        [req]: !currentReqs[req]
      }
    });
  };

  return (
    <div className="host-step-container aesthetic-bg">
      <div className="step-content">
        <header className="pricing-header">
           <h1 className="step-title">Booking & Cancellation Settings</h1>
        </header>
        
        {/* Booking Style Selection */}
        <section className="step-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Instant Book Card */}
            <div 
              className={`selection-card glass-card ${listingData.instantBooking ? 'selected' : ''}`}
              onClick={() => handleBookingTypeSelect(true)}
              style={{ 
                padding: '24px', 
                borderRadius: '16px', 
                cursor: 'pointer',
                border: listingData.instantBooking ? '2px solid #222' : '1px solid #e0e0e0',
                background: listingData.instantBooking ? '#f7f7f7' : 'white',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ background: '#FFB400', padding: '8px', borderRadius: '50%', color: 'white' }}>
                  <Zap size={24} fill="currentColor" />
                </div>
                {listingData.instantBooking && <div className="checked-icon"><CheckCircle size={24} fill="#222" color="white" /></div>}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Use Instant Book</h3>
              <p style={{ fontSize: '14px', color: '#717171', lineHeight: '1.5' }}>
                Guests can book automatically. You verify their ID and reviews beforehand.
              </p>
            </div>

            {/* Request to Book Card */}
            <div 
              className={`selection-card glass-card ${!listingData.instantBooking ? 'selected' : ''}`}
              onClick={() => handleBookingTypeSelect(false)}
              style={{ 
                padding: '24px', 
                borderRadius: '16px', 
                cursor: 'pointer',
                border: !listingData.instantBooking ? '2px solid #222' : '1px solid #e0e0e0',
                background: !listingData.instantBooking ? '#f7f7f7' : 'white',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '50%', color: 'white' }}>
                  <MessageSquare size={24} />
                </div>
                {!listingData.instantBooking && <div className="checked-icon"><CheckCircle size={24} fill="#222" color="white" /></div>}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Approve all requests</h3>
              <p style={{ fontSize: '14px', color: '#717171', lineHeight: '1.5' }}>
                Guests must send a reservation request. You have 24 hours to accept or decline.
              </p>
            </div>

          </div>
        </section>

        {/* Guest Requirements - Only shown for Instant Book */}
        {listingData.instantBooking && (
          <section className="step-section" style={{ marginTop: '32px', animation: 'fadeIn 0.3s ease' }}>
            <h2 className="step-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="#717171" />
              Guest Requirements
            </h2>
            <p style={{ fontSize: '14px', color: '#717171', marginBottom: '24px' }}>
              Only guests who meet these requirements can book instantly. Others must send a request.
            </p>
            
            <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '16px' }}>
              
              {/* Requirement 1: Verified ID */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Government-issued ID</div>
                  <div style={{ fontSize: '14px', color: '#717171' }}>Require guests to submit ID to Hostify.</div>
                </div>
                <div 
                  className={`toggle-switch ${listingData.guestRequirements?.verifiedID ? 'active' : ''}`}
                  onClick={() => toggleGuestRequirement('verifiedID')}
                  style={{ 
                    width: '50px', height: '32px', background: listingData.guestRequirements?.verifiedID ? '#222' : '#ddd', 
                    borderRadius: '32px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                  }}
                >
                  <div style={{ 
                    width: '28px', height: '28px', background: 'white', borderRadius: '50%', 
                    position: 'absolute', top: '2px', left: listingData.guestRequirements?.verifiedID ? '20px' : '2px', 
                    transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}></div>
                </div>
              </div>

              <div style={{ height: '1px', background: '#ebebeb', margin: '0 0 24px 0' }}></div>

              {/* Requirement 2: Positive Reviews */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>Recommended by other hosts</div>
                  <div style={{ fontSize: '14px', color: '#717171' }}>Require guests to have positive reviews from other hosts.</div>
                </div>
                <div 
                  className={`toggle-switch ${listingData.guestRequirements?.positiveReviews ? 'active' : ''}`}
                  onClick={() => toggleGuestRequirement('positiveReviews')}
                  style={{ 
                    width: '50px', height: '32px', background: listingData.guestRequirements?.positiveReviews ? '#222' : '#ddd', 
                    borderRadius: '32px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                  }}
                >
                  <div style={{ 
                    width: '28px', height: '28px', background: 'white', borderRadius: '50%', 
                    position: 'absolute', top: '2px', left: listingData.guestRequirements?.positiveReviews ? '20px' : '2px', 
                    transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}></div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Cancellation Policy Section */}
        <section className="step-section" style={{ marginTop: '48px' }}>
          <h2 className="step-heading" style={{ fontSize: '22px', fontWeight: '700', color: '#222', marginBottom: '16px' }}>
            Cancellation Policy <span style={{ color: 'var(--primary)' }}>*</span>
          </h2>
          <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.7)', border: '1px solid #e2e2e2' }}>
            <p style={{ fontSize: '14px', color: '#717171', marginBottom: '24px' }}>
              Choose a standard cancellation policy for your listing:
            </p>
            
            <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px', maxWidth: '100%', marginBottom: '24px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select 
                className="guest-select cancel-select-no-arrow"
                value={listingData.cancellationPolicyType || 'Flexible'}
                onChange={(e) => updateListingData({ cancellationPolicyType: e.target.value })}
                style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px', fontSize: '16px', fontWeight: '400', color: '#717171', appearance: 'none', outline: 'none', cursor: 'pointer', zIndex: 1 }}
              >
                <option value="Flexible">Flexible - Full refund 1 day prior to arrival</option>
                <option value="Moderate">Moderate - Full refund 5 days prior to arrival</option>
                <option value="Strict">Strict - 50% refund up to 1 week before arrival</option>
                <option value="Non-Refundable">Non-Refundable - No refunds after booking</option>
              </select>
              <div style={{ position: 'absolute', right: '16px', pointerEvents: 'none', color: '#717171', zIndex: 0 }}>
                <ChevronDown size={20} />
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f7f7f7', borderRadius: '12px', border: '1px solid #e2e2e2' }}>
              <p style={{ fontSize: '13px', color: '#717171', margin: 0, lineHeight: '1.6' }}>
                Hint: A flexible policy attracts more bookings (recommended for new hosts), while a stricter policy gives you more certainty if guests cancel.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="host-footer">
        <button className="back-btn" onClick={() => navigate('/become-a-host/step5')}>Back</button>
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

export default HostStep4;
