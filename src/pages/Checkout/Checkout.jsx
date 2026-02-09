import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Star, CreditCard, Wallet, Smartphone, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '../../components/organisms/Navbar/Navbar';
import { mockListings } from '../../data/mockListings';
import { useBooking } from '../../context/BookingContext';
import './Checkout.css';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addBooking } = useBooking();
  
  // Prioritize listing and data from state
  const stateData = location.state || {};
  const listing = stateData.listing || mockListings.find(l => l.id === parseInt(id));
  
  // Get dynamic data from state or use fallbacks
  const bookingData = {
    startDate: stateData.startDate || new Date().toISOString(),
    endDate: stateData.endDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    guests: stateData.guests || { adults: 1, children: 0 },
    nights: stateData.nights || 5,
    totalPrice: stateData.totalPrice || (listing?.price || 0) * 5 + 2500
  };

  const { startDate, endDate, guests, nights, totalPrice } = bookingData;
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const formattedDates = `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
  const totalGuestsCount = guests.adults + guests.children;
  const guestsLabel = `${totalGuestsCount} guest${totalGuestsCount > 1 ? 's' : ''}`;

  const [isProcessing, setIsProcessing] = useState(false);

  if (!listing) return <div>Listing not found</div>;

  const handleConfirmPay = () => {
    setIsProcessing(true);
    
    // Simulate network delay
    setTimeout(() => {
       const newBooking = {
          title: listing.title || `Stunning stay in ${listing.location}`,
          location: listing.location,
          dates: formattedDates,
          guests: guestsLabel,
          price: `₹${totalPrice.toLocaleString('en-IN')}`,
          image: listing.image,
          host: listing.host
       };
       
       addBooking(newBooking);
       navigate('/bookings');
    }, 1500);
  };

  return (
    <>
      <div className="checkout-navbar">
         <div className="checkout-nav-container">
            <div className="logo-text" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>airbnb</div>
         </div>
      </div>
      
      <div className="checkout-container">
         <div className="checkout-header">
            <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft size={18} /></button>
            <h1>Request to book</h1>
         </div>

         <div className="checkout-grid">
            {/* Left Column: Form */}
            <div className="checkout-left">
               <div className="checkout-section">
                  <h2>Your trip</h2>
                  <div className="trip-details">
                     <div className="trip-row">
                        <div>
                           <div className="trip-label">Dates</div>
                           <div className="trip-value">{formattedDates}</div>
                        </div>
                        <div className="edit-link">Edit</div>
                     </div>
                     <div className="trip-row">
                        <div>
                           <div className="trip-label">Guests</div>
                           <div className="trip-value">{guestsLabel}</div>
                        </div>
                        <div className="edit-link">Edit</div>
                     </div>
                  </div>
               </div>

               <div className="checkout-divider"></div>

               <div className="checkout-section">
                  <h2>Pay with</h2>
                   <div className="payment-method-selector">
                      <div className="pm-option selected">
                         <div className="pm-info">
                            <CreditCard size={20} />
                            <span>Credit or debit card</span>
                         </div>
                         <div className="pm-radio-outer"><div className="pm-radio-inner"></div></div>
                      </div>
                      <div className="pm-option">
                         <div className="pm-info">
                            <Smartphone size={20} />
                            <span>UPI</span>
                         </div>
                         <div className="pm-radio-outer"></div>
                      </div>
                      <div className="pm-option">
                         <div className="pm-info">
                            <Wallet size={20} />
                            <span>Net Banking</span>
                         </div>
                         <div className="pm-radio-outer"></div>
                      </div>
                   </div>

                  <div className="card-form">
                     <input type="text" placeholder="Card number" className="card-input full-width" />
                     <div className="card-row">
                        <input type="text" placeholder="Expiration" className="card-input half-width" />
                        <input type="text" placeholder="CVV" className="card-input half-width" />
                     </div>
                     <input type="text" placeholder="Zip code" className="card-input full-width" />
                     <input type="text" placeholder="Country/Region" className="card-input full-width" defaultValue="India" />
                  </div>
               </div>

               <div className="checkout-divider"></div>

               <div className="checkout-section">
                  <h2>Required for your trip</h2>
                  <div className="message-host">
                     <div className="mh-text">
                        <h3>Message the Host</h3>
                        <p>Let {listing.host.name} know why you're traveling and when you'll check in.</p>
                     </div>
                     <button className="add-btn-outline">Add</button>
                  </div>
               </div>
                
               <div className="checkout-divider"></div>

                <button className="confirm-btn" onClick={handleConfirmPay} disabled={isProcessing}>
                   {isProcessing ? 'Processing...' : 'Confirm and pay'}
                </button>

                <div className="secure-checkout">
                   <ShieldCheck size={16} />
                   <span>Secure checkout</span>
                </div>
            </div>

            {/* Right Column: Listing Summary */}
            <div className="checkout-right">
               <div className="listing-summary-card">
                  <div className="summary-header">
                     <div className="summary-image" style={{backgroundImage: `url(${listing.image})`}}></div>
                     <div className="summary-info">
                        <div className="summary-category">Entire home</div>
                        <div className="summary-title">{listing.title || listing.description.substring(0, 40) + '...'}</div>
                        <div className="summary-rating"><Star size={12} fill="black" /> {listing.rating} (124 reviews)</div>
                     </div>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="price-details-title">Price details</div>
                  
                  <div className="summary-row">
                     <span>₹{listing.price.toLocaleString('en-IN')} x {nights} nights</span>
                     <span>₹{(listing.price * nights).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row">
                     <span>Service fee</span>
                     <span>₹2,500</span>
                  </div>
                  
                  <div className="summary-divider"></div>

                  <div className="summary-total">
                     <span>Total (INR)</span>
                     <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </>
  );
};

export default Checkout;
