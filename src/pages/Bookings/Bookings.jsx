import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/organisms/Navbar/Navbar';
import './Bookings.css';
import { MapPin, Calendar, Users, Briefcase, MessageSquare, Star, FileText } from 'lucide-react';
import PageHeader from '../../components/molecules/PageHeader/PageHeader';
import RatingModal from '../../components/molecules/RatingModal/RatingModal';
import InvoiceModal from '../../components/molecules/InvoiceModal/InvoiceModal';
import { fetchMyTrips, updateBookingStatus } from '../../services/api';
import { format } from 'date-fns';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [addressModalBooking, setAddressModalBooking] = useState(null);
  const [contactModalBooking, setContactModalBooking] = useState(null);
  const [manageModalBooking, setManageModalBooking] = useState(null);
  const [cancelConfirmBookingId, setCancelConfirmBookingId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchMyTrips();
        const formatted = data.map(b => ({
          id: b._id,
          title: b.listing?.title || 'Property',
          location: b.listing?.location || '',
          address: b.listing?.location || '',
          dates: `${format(new Date(b.startDate), 'MMM d')} - ${format(new Date(b.endDate), 'MMM d, yyyy')}`,
          guests: `${b.guests?.adults + (b.guests?.children || 0)} guests`,
          price: `₹${b.totalPrice?.toLocaleString('en-IN')}`,
          status: b.status,
          code: b.code,
          image: b.listing?.image || (b.listing?.photos?.[0]?.url) || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
          host: b.listing?.host || (b.listing?.hostId ? { name: b.listing.hostId.name, image: b.listing.hostId.avatar, email: b.listing.hostId.email, phone: b.listing.hostId.phone } : null),
          listingId: b.listing?._id
        }));
        
        const now = new Date();
        const upcoming = formatted.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled');
        const past = formatted.filter(b => b.status === 'Completed');
        const cancelled = formatted.filter(b => b.status === 'Cancelled');
        
        setUpcomingBookings(upcoming);
        setPastBookings(past);
        setCancelledBookings(cancelled);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = (bookingId) => {
    setCancelConfirmBookingId(bookingId);
  };

  const confirmCancel = async () => {
    if (!cancelConfirmBookingId) return;
    setIsCancelling(true);
    try {
      await updateBookingStatus(cancelConfirmBookingId, 'Cancelled');
      setManageModalBooking(null);
      setCancelConfirmBookingId(null);
      loadBookings(); // Refresh list to move it to past bookings
    } catch (err) {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const bookings = activeTab === 'upcoming' ? upcomingBookings : activeTab === 'past' ? pastBookings : cancelledBookings;

  const handleRateStay = (booking) => {
    setSelectedBooking(booking);
    setShowRatingModal(true);
  };

  const handleViewInvoice = (booking) => {
    setSelectedBooking(booking);
    setShowInvoiceModal(true);
  };

  const handleSubmitRating = (ratingData) => {
    console.log('Rating submitted:', ratingData);
    alert(`Thank you for rating ${ratingData.booking.title}!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container">
        <PageHeader title="My Bookings" />
        
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        <div className="bookings-grid">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>Loading your trips...</div>
          ) : bookings.length > 0 ? (
             bookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-image-wrapper">
                    <div className="booking-image" style={{backgroundImage: `url(${booking.image})`}}></div>
                    <div className="image-shine"></div>
                    <div className={`booking-status-badge ${booking.status === 'Pending Approval' ? 'pending' : booking.status === 'Completed' ? 'completed' : booking.status === 'Cancelled' ? 'cancelled' : 'confirmed'}`}>
                      {booking.status === 'Pending Approval' ? (
                        <><Calendar size={12} /> Pending Approval</>
                      ) : booking.status === 'Completed' ? (
                        <><Star size={12} fill="white" /> Completed</>
                      ) : booking.status === 'Cancelled' ? (
                        <><Calendar size={12} /> Cancelled</>
                      ) : (
                        <><Star size={12} fill="white" /> Confirmed</>
                      )}
                    </div>
                  </div>
                  
                  <div className="booking-info">
                    <div className="booking-header">
                       <div className="booking-main-data">
                         <h3 className="booking-title">{booking.title}</h3>
                         <div className="booking-location">
                           <MapPin size={14} /> {booking.location}
                         </div>
                       </div>
                    </div>
                    
                    <div className="booking-info-box">
                      <div className="detail-item">
                        <span className="detail-label">Dates</span>
                        <div className="detail-value">
                          <Calendar size={14} className="detail-icon" />
                          <span>{booking.dates}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                         <span className="detail-label">Guests</span>
                         <div className="detail-value">
                           <Users size={14} className="detail-icon" />
                           <span>{booking.guests || '1 guest'}</span>
                         </div>
                      </div>
                      {booking.code && (
                        <div className="detail-item">
                            <span className="detail-label">{booking.status === 'Pending Approval' ? 'Request ID' : 'Reference'}</span>
                            <div className="detail-value">
                              <Briefcase size={14} className="detail-icon" />
                              <span style={{ whiteSpace: 'nowrap', fontSize: '11px', letterSpacing: '0.3px' }}>{booking.code}</span>
                            </div>
                        </div>
                      )}
                      {booking.status !== 'Pending Approval' && booking.status !== 'Cancelled' && (
                        <div className="detail-item" style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '4px' }}>
                            <button 
                              onClick={() => setAddressModalBooking(booking)}
                              style={{
                                width: '100%',
                                background: 'var(--primary-soft)',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                fontSize: '13px',
                                fontWeight: '700',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-lg)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                              }}
                              className="get-address-btn"
                            >
                              📍 Get complete address
                            </button>
                         </div>
                       )}
                    </div>

                    <div className="booking-footer">
                       <div className="booking-price">
                          <span className="price-label">Paid</span>
                          <span className="price-value">{booking.price}</span>
                       </div>
                       
                       <div className="booking-actions">
                          {activeTab === 'upcoming' ? (
                            <>
                              <button 
                                className="action-btn-secondary" 
                                title="Contact Host"
                                onClick={() => setContactModalBooking(booking)}
                                style={{ gap: '6px' }}
                              >
                                <MessageSquare size={13} />
                                <span>Contact</span>
                              </button>
                               {booking.status === 'Pending Approval' ? (
                                 <button 
                                   className="action-btn-primary cancel-btn"
                                   onClick={() => handleCancelBooking(booking.id)}
                                 >
                                   Cancel
                                 </button>
                              ) : (
                                 <button 
                                   className="action-btn-primary"
                                   onClick={() => setManageModalBooking(booking)}
                                 >
                                   Manage
                                 </button>
                              )}
                            </>
                          ) : activeTab === 'past' ? (
                            <div className="past-actions">
                              <button className="action-btn-secondary invoice-btn" onClick={() => handleViewInvoice(booking)} title="Download Invoice">
                                 <FileText size={16} />
                                 <span>Invoice</span>
                              </button>
                              <button className="action-btn-primary" onClick={() => handleRateStay(booking)}>
                                 Rate Stay
                              </button>
                            </div>
                          ) : (
                            <div className="past-actions">
                               <button 
                                 className="action-btn-primary" 
                                 onClick={() => navigate(`/rooms/${booking.listingId}`)}
                                 style={{ width: '100%', background: '#eee', color: '#717171', border: '1px solid #ddd' }}
                               >
                                 View Property
                               </button>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
             ))
          ) : (
            <div className="empty-state">
              <h3>No trips booked... yet!</h3>
              <p>Time to dust off your bags and start planning your next adventure</p>
              <button 
                onClick={() => navigate('/')}
                style={{
                  marginTop: '24px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(227, 28, 95, 0.3)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Start exploring
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          booking={selectedBooking}
          onSubmit={handleSubmitRating}
        />
      )}

      {selectedBooking && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          booking={selectedBooking}
        />
      )}

      {addressModalBooking && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setAddressModalBooking(null)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
              border: '1px solid rgba(0,0,0,0.05)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#222', marginBottom: '16px', letterSpacing: '-0.3px' }}>
              📍 Complete Address
            </h3>
            <p style={{ fontSize: '15px', color: '#484848', lineHeight: '1.5', fontWeight: '500', marginBottom: '24px' }}>
              {addressModalBooking.address || addressModalBooking.listing?.address || (addressModalBooking.location ? `123 Grand Trunk Road, Downtown, ${addressModalBooking.location}` : '123 Main Street, New Delhi, India')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressModalBooking.address || addressModalBooking.listing?.address || addressModalBooking.location || 'New Delhi, India')}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(50, 192, 192, 0.25)',
                  display: 'inline-block'
                }}
              >
                Open in Google Maps
              </a>
              <button 
                onClick={() => setAddressModalBooking(null)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '14px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {contactModalBooking && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000,
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setContactModalBooking(null)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
              border: '1px solid rgba(0,0,0,0.05)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
               <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-secondary)', backgroundImage: `url(${contactModalBooking.host?.image || 'https://ui-avatars.com/api/?name=' + (contactModalBooking.host?.name || 'Host')})`, backgroundSize: 'cover' }}></div>
               <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#222', margin: 0, letterSpacing: '-0.3px' }}>
                    {contactModalBooking.host?.name || 'Your Host'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#717171' }}>Host for your trip</p>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     📞
                  </div>
                  <div>
                     <p style={{ margin: 0, fontSize: '12px', color: '#717171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</p>
                     <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#222' }}>{contactModalBooking.host?.phone || '+91 98765 43210'}</p>
                  </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     ✉️
                  </div>
                  <div>
                     <p style={{ margin: 0, fontSize: '12px', color: '#717171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</p>
                     <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#222' }}>{contactModalBooking.host?.email || 'contact@hostify.in'}</p>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => setContactModalBooking(null)}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                fontWeight: '700',
                fontSize: '14px',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {manageModalBooking && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(8px)'
          }}
          onClick={() => setManageModalBooking(null)}
        >
          <div 
            style={{
              background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '440px', width: '90%',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)', position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#222', marginBottom: '8px', letterSpacing: '-0.3px' }}>
              Manage Trip
            </h3>
            <p style={{ fontSize: '14px', color: '#717171', marginBottom: '24px' }}>{manageModalBooking.title} • {manageModalBooking.dates}</p>
            
            <div style={{ background: '#f8f8f8', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                 <span style={{ color: '#484848', fontSize: '14px', fontWeight: 600 }}>Total Paid</span>
                 <span style={{ color: '#222', fontSize: '14px', fontWeight: 800 }}>{manageModalBooking.price}</span>
              </div>
              <div style={{ height: 1, background: '#e5e5e5', margin: '12px 0' }}></div>
              <p style={{ margin: 0, fontSize: '12px', color: '#717171', lineHeight: 1.5 }}>
                 <strong>Cancellation Policy:</strong> Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <button 
                 onClick={() => navigate(`/rooms/${manageModalBooking.listingId}`)}
                 style={{ width: '100%', background: 'var(--primary)', color: 'white', fontWeight: '700', fontSize: '14px', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
               >
                 View Property Details
               </button>
               <button 
                 onClick={() => handleCancelBooking(manageModalBooking.id)}
                 disabled={isCancelling}
                 style={{ width: '100%', background: 'white', border: '1px solid #ff385c', color: '#ff385c', fontWeight: '700', fontSize: '14px', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease' }}
               >
                 {isCancelling ? 'Cancelling...' : 'Cancel Reservation'}
               </button>
               <button 
                 onClick={() => setManageModalBooking(null)}
                 style={{ width: '100%', background: 'transparent', border: 'none', color: '#717171', fontWeight: '600', fontSize: '14px', padding: '8px', cursor: 'pointer', marginTop: '4px' }}
               >
                 Close
               </button>
            </div>
           </div>
         </div>
       )}

       {cancelConfirmBookingId && (
         <div 
           style={{
             position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.45)',
             display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, backdropFilter: 'blur(8px)'
           }}
           onClick={() => !isCancelling && setCancelConfirmBookingId(null)}
         >
           <div 
             style={{
               background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '380px', width: '90%',
               boxShadow: '0 24px 48px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center'
             }}
             onClick={(e) => e.stopPropagation()}
           >
             <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff0f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
               <span style={{ fontSize: '24px' }}>⚠️</span>
             </div>
             <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#222', marginBottom: '12px' }}>
               Cancel Reservation?
             </h3>
             <p style={{ fontSize: '14px', color: '#717171', marginBottom: '24px', lineHeight: 1.5 }}>
               Are you completely sure you want to cancel this reservation? This action cannot be undone.
             </p>
             <div style={{ display: 'flex', gap: '12px' }}>
               <button 
                 onClick={() => setCancelConfirmBookingId(null)}
                 disabled={isCancelling}
                 style={{ flex: 1, background: '#f8f8f8', color: '#222', fontWeight: '700', fontSize: '14px', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', cursor: 'pointer' }}
               >
                 Keep it
               </button>
               <button 
                 onClick={confirmCancel}
                 disabled={isCancelling}
                 style={{ flex: 1, background: '#ff385c', color: 'white', fontWeight: '700', fontSize: '14px', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
               >
                 {isCancelling ? 'Cancelling...' : 'Yes, cancel'}
               </button>
             </div>
           </div>
         </div>
        )}
    </div>
  );
};

export default Bookings;
