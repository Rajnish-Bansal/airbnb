import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import {
  Home,
  MapPin,
  Users,
  IndianRupee,
  Image as ImageIcon,
  CheckCircle2,
  Book,
  Clock
} from 'lucide-react';
import './HostStep1.css';
import './HostStep7.css';

const HostStep7 = () => {
  const navigate = useNavigate();
  const { listingData, updateListingData, publishListing, saveDraft } = useHost();

  const handlePublish = () => {
    publishListing(); // Adds to dashboard with 'Pending' status
    updateListingData({ notification: { message: 'Listing submitted for approval!', type: 'success' } });
    navigate('/become-a-host/dashboard');
  };

  const hasRooms = (listingData.rooms || []).length > 0;

  // Helper to safely get the cover photo URL
  const getCoverPhoto = () => {
    if (listingData.photos && listingData.photos.length > 0) {
      const firstPhoto = listingData.photos[0];
      if (typeof firstPhoto === 'string') return firstPhoto;
      // Try url first, then fall back to creating new blob URL from file
      if (firstPhoto && firstPhoto.url) return firstPhoto.url;
      if (firstPhoto && firstPhoto.file) return URL.createObjectURL(firstPhoto.file);
    }
    return null;
  };

  const coverPhotoUrl = getCoverPhoto();

  const [showExitModal, setShowExitModal] = useState(false);

  const handleSaveAndExit = () => {
    setShowExitModal(true);
  };

  const confirmSaveAndExit = () => {
    saveDraft(7);
    navigate('/become-a-host/dashboard');
  };

  return (
    <div className="host-step-container aesthetic-bg review-large-container">
      <div className="step-content">
        <header className="pricing-header">
           <h1 className="step-title">Review your listing</h1>
           <p className="step-subheading">Here's a quick look at what guests will see. Make sure everything looks perfect!</p>
        </header>

        <div className="review-card glass-card premium-border" style={{ borderRadius: '32px', overflow: 'hidden', padding: '0' }}>
           {/* Cover Image Preview */}
           <div className="review-cover-image" style={{ height: '300px', position: 'relative' }}>
             {coverPhotoUrl ? (
               <img src={coverPhotoUrl} alt="Listing Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             ) : (
               <div className="placeholder-cover" style={{ height: '300px', background: '#f7f7f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#717171' }}>
                 <ImageIcon size={48} opacity={0.3} />
                 <span style={{ marginLeft: '12px', fontWeight: '600' }}>No photos added</span>
               </div>
             )}
             <div className="gradient-badge" style={{ position: 'absolute', top: '24px', left: '24px' }}>
                Preview Mode
             </div>
           </div>

           <div className="review-content" style={{ padding: '40px' }}>
              {/* Title & Desc */}
              <div className="review-header-aesthetic" style={{ marginBottom: '32px' }}>
                <div className="review-title" style={{ fontSize: '28px', fontWeight: '800', color: '#222', marginBottom: '8px' }}>
                  {listingData.title || 'Untitled Listing'}
                </div>
                <div className="review-subtitle" style={{ fontSize: '16px', color: '#717171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} /> {listingData.location || 'Location not set'} • {listingData.type}
                </div>
              </div>

              <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

                 {/* Property Type */}
                 <div className="summary-item-aesthetic glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                    <div className="summary-icon-wrapper" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
                      <Home size={24} />
                    </div>
                    <div className="summary-details">
                       <span className="summary-label" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#717171', fontWeight: '700', marginBottom: '4px' }}>Property Type</span>
                       <span className="summary-value" style={{ fontSize: '16px', fontWeight: '600' }}>
                          {listingData.type}
                          {listingData.placeType && ` • ${listingData.placeType === 'entire' ? 'Entire Place' : 'Private Room'}`}
                       </span>
                    </div>
                 </div>

                 {/* Guests / Basics */}
                 <div className="summary-item-aesthetic glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                    <div className="summary-icon-wrapper" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
                      <Users size={24} />
                    </div>
                    <div className="summary-details">
                       <span className="summary-label" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#717171', fontWeight: '700', marginBottom: '4px' }}>Basics</span>
                       <span className="summary-value" style={{ fontSize: '16px', fontWeight: '600' }}>
                          {listingData.guests} guests • {listingData.bedrooms || 0} BR • {listingData.bathrooms || 1} BA
                       </span>
                    </div>
                 </div>

                 {/* Pricing Section */}
                 <div className="summary-item-aesthetic glass-card" style={{ padding: '20px', borderRadius: '16px', gridColumn: 'span 2' }}>
                    <div className="summary-icon-wrapper" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
                      <IndianRupee size={24} />
                    </div>
                    <div className="summary-details">
                       <span className="summary-label" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#717171', fontWeight: '700', marginBottom: '4px' }}>Pricing & Rooms</span>

                       {/* Base Price */}
                       {!hasRooms && (
                          <div className="room-breakdown" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <span style={{ fontWeight: 600 }}>Base Rate</span>
                             <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>₹{listingData.price} <small style={{ color: '#717171', fontSize: '12px' }}>/night</small></span>
                          </div>
                       )}

                       {/* Room Categories */}
                       {hasRooms && (
                          <div className="room-breakdown">
                             {listingData.rooms.map((room, i) => (
                                <div key={i} className="room-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                   <span style={{ fontWeight: 500 }}>{room.category} <span style={{ color: '#717171', fontWeight: '400' }}>(x{room.quantity || 1})</span></span>
                                   <span style={{ fontWeight: 700 }}>₹{room.price}</span>
                                </div>
                             ))}
                             <div className="total-units-summary" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                                <span>Total Rooms</span>
                                <span>{listingData.rooms.reduce((acc, r) => acc + (parseInt(r.quantity) || 1), 0)} Units</span>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Amenities */}
                 <div className="summary-item-aesthetic glass-card" style={{ padding: '20px', borderRadius: '16px', gridColumn: 'span 2' }}>
                    <div className="summary-icon-wrapper" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div className="summary-details">
                       <span className="summary-label" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#717171', fontWeight: '700', marginBottom: '4px' }}>Amenities Selection</span>
                       <span className="summary-value" style={{ fontSize: '15px', color: '#484848', lineHeight: '1.5' }}>
                          {(listingData.amenities || []).length > 0
                             ? (listingData.amenities || []).join(' • ')
                             : 'No amenities selected'}
                       </span>
                    </div>
                 </div>

                 {/* Booking Settings */}
                 <div className="summary-item-aesthetic glass-card" style={{ padding: '20px', borderRadius: '16px', gridColumn: 'span 2' }}>
                    <div className="summary-icon-wrapper" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
                      <MapPin size={24} />
                    </div>
                    <div className="summary-details">
                       <span className="summary-label" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#717171', fontWeight: '700', marginBottom: '8px' }}>Booking Settings</span>

                       <div style={{ marginBottom: '12px' }}>
                         <div style={{ fontSize: '14px', fontWeight: '600', color: '#222', marginBottom: '4px' }}>
                            {listingData.instantBooking ? 'Instant Book On' : 'Request to Book'}
                         </div>
                         <div style={{ fontSize: '14px', color: '#717171' }}>
                            {listingData.instantBooking 
                               ? 'Guests can book automatically.' 
                               : 'You approve every request within 24 hours.'}
                         </div>
                       </div>

                       {listingData.instantBooking && listingData.guestRequirements && (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#484848', marginBottom: '4px' }}>Guest Requirements:</div>
                            <div style={{ fontSize: '13px', color: '#717171' }}>
                               {listingData.guestRequirements.verifiedID && '• Government-issued ID required ' }
                               {listingData.guestRequirements.positiveReviews && '• Positive reviews required'}
                               {!listingData.guestRequirements.verifiedID && !listingData.guestRequirements.positiveReviews && 'None'}
                            </div>
                          </div>
                       )}
                    </div>
                 </div>

                  {/* Conditional: Room-Specific Information (only for private rooms) */}
                  {listingData.placeType === 'private' && (
                    <div className="summary-item-aesthetic glass-card" style={{ padding: '20px', borderRadius: '16px', gridColumn: 'span 2' }}>
                      <div className="summary-icon-wrapper" style={{ color: 'var(--primary)', marginBottom: '12px' }}>
                        <Home size={24} />
                      </div>
                      <div className="summary-details">
                        <span className="summary-label" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', color: '#717171', fontWeight: '700', marginBottom: '12px' }}>Room Details</span>
                        
                        {/* Shared Spaces */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>Shared Spaces:</div>
                          <div style={{ fontSize: '14px', color: '#484848', lineHeight: '1.8' }}>
                            {listingData.sharedSpaces?.privateBathroom && '✓ Private bathroom • '}
                            {listingData.sharedSpaces?.sharedKitchen && '✓ Shared kitchen • '}
                            {listingData.sharedSpaces?.sharedLivingRoom && '✓ Shared living room'}
                            {listingData.sharedSpaces?.otherSpaces && (
                              <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                                Other: {listingData.sharedSpaces.otherSpaces}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Host Presence */}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>Host Presence:</div>
                          <div style={{ fontSize: '14px', color: '#484848', lineHeight: '1.8' }}>
                            {listingData.hostPresence?.hostPresent && '✓ Host will be present • '}
                            {listingData.hostPresence?.roommatesPresent && '✓ Roommates present • '}
                            Access: {listingData.hostPresence?.accessHours || '24/7'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

              </div>
           </div>
        </div>

      </div>

      <div className="host-footer" style={{ borderTop: 'none', background: 'transparent', boxShadow: 'none' }}>
        <button className="back-btn" onClick={() => navigate('/become-a-host/step6')}>Back</button>
        <div className="footer-right">
           <button className="save-exit-btn" onClick={handleSaveAndExit}>Save & Exit</button>
           <button className="next-btn btn-solid" style={{ paddingLeft: '40px', paddingRight: '40px' }} onClick={handlePublish}>Publish Listing</button>
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

export default HostStep7;
