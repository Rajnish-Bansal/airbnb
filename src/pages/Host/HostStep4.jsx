import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import { Sparkles, Zap, MessageSquare, Shield, CheckCircle } from 'lucide-react';
import './HostStep1.css'; 

const HostStep4 = () => {
  const navigate = useNavigate();
  const { listingData, updateListingData, saveDraft } = useHost();

  const handleSaveAndExit = () => {
    saveDraft(4);
    navigate('/become-a-host/dashboard');
  };

  const handleNext = () => {
    saveDraft(5);
    navigate('/become-a-host/step5');
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
           <Sparkles className="header-decoration" />
           <h1 className="step-title">Decide how guests will book</h1>
           <p className="step-subheading">You can choose to approve every request or let guests book instantly.</p>
        </header>
        
        {/* Booking Style Selection */}
        <section className="step-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            
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
                <div style={{ background: '#FF385C', padding: '8px', borderRadius: '50%', color: 'white' }}>
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
                  <div style={{ fontSize: '14px', color: '#717171' }}>Require guests to submit ID to Airbnb.</div>
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
      </div>

      <div className="host-footer">
        <button className="back-btn" onClick={() => navigate('/become-a-host/step3')}>Back</button>
        <div className="footer-right">
           <button className="save-exit-btn" onClick={handleSaveAndExit}>Save & Exit</button>
           <button className="next-btn btn-solid" onClick={handleNext}>Save & Next</button>
        </div>
      </div>
    </div>
  );
};

export default HostStep4;
