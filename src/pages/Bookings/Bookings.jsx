import React, { useState } from 'react';
import Navbar from '../../components/organisms/Navbar/Navbar';
import './Bookings.css';
import { MapPin, Calendar, Users, Briefcase, MessageSquare, Star } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import RatingModal from '../../components/molecules/RatingModal/RatingModal';

const Bookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { userBookings } = useBooking();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Simple filter for demo purposes. 
  // In a real app, we'd filter by date vs current date.
  // For now, we'll just show all in 'upcoming' or assume context has the right data.
  const upcomingBookings = userBookings;
  const pastBookings = [];

  const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleRateStay = (booking) => {
    setSelectedBooking(booking);
    setShowRatingModal(true);
  };

  const handleSubmitRating = (ratingData) => {
    console.log('Rating submitted:', ratingData);
    // In a real app, this would send the rating to the backend
    alert(`Thank you for rating ${ratingData.booking.title}!`);
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1 className="page-title">My Bookings</h1>
        
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
        </div>

        <div className="bookings-grid">
          {bookings.length > 0 ? (
             bookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-image-wrapper">
                    <div className="booking-image" style={{backgroundImage: `url(${booking.image})`}}></div>
                    <div className="image-shine"></div>
                    <div className={`booking-status-badge ${booking.status === 'Pending Approval' ? 'pending' : 'confirmed'}`}>
                      {booking.status === 'Pending Approval' ? (
                        <><Calendar size={12} /> Pending Approval</>
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
                       {booking.host && (
                          <div className="host-avatar" 
                               style={{backgroundImage: `url(${booking.host.image})`}}
                               title={`Hosted by ${booking.host.name}`}
                          ></div>
                       )}
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
                              <span>{booking.code}</span>
                            </div>
                        </div>
                      )}
                    </div>

                    <div className="booking-footer">
                       <div className="booking-price">
                          <span className="price-label">Paid</span>
                          <span className="price-value">{booking.price || '₹12,400'}</span>
                       </div>
                       
                       <div className="booking-actions">
                          {activeTab === 'upcoming' ? (
                            <>
                              <button className="action-btn-secondary" title="Message Host">
                                <MessageSquare size={16} />
                              </button>
                              {booking.status === 'Pending Approval' ? (
                                 <button className="action-btn-primary" style={{background: '#fff', color: '#666', border: '1px solid #ddd'}}>Cancel</button>
                              ) : (
                                 <button className="action-btn-primary">Manage</button>
                              )}
                            </>
                          ) : (
                            <button className="action-btn-primary" onClick={() => handleRateStay(booking)}>
                               Rate Stay
                            </button>
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
    </>
  );
};

export default Bookings;
