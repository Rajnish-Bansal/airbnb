import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share, Heart, Star, MapPin, Wifi, Car, Utensils, Monitor, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Navbar from '../../components/organisms/Navbar/Navbar';
import GuestSelector from '../../components/molecules/GuestSelector/GuestSelector';
import { useAuth } from '../../context/AuthContext';
import { useHost } from '../../context/HostContext';
import { useSearch } from '../../context/SearchContext';
import { mockListings } from '../../data/mockListings';
import { differenceInDays, format } from 'date-fns';
import './RoomDetails.css';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { listings: hostListings } = useHost();
  const { addToRecentlyViewed } = useSearch();
  
  // Combine both sources
  const allListings = [...mockListings, ...hostListings];
  const listing = allListings.find(l => l.id == id); // Loose equality for string/number id mismatch protection

  // Track recently viewed
  useEffect(() => {
    if (listing) {
      addToRecentlyViewed(listing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing]);

  // Date State
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 5);
    return tomorrow;
  });

  // Guest State
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const guestSelectorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestSelectorRef.current && !guestSelectorRef.current.contains(event.target)) {
        setShowGuestSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reviews State
  const [showAllReviews, setShowAllReviews] = useState(false);
  const displayedReviews = showAllReviews ? listing?.reviews : listing?.reviews?.slice(0, 6);

  if (!listing) {
    return <div>Property not found</div>;
  }

  const nights = Math.max(differenceInDays(endDate, startDate), 1);
  const totalGuests = guests.adults + guests.children;
  const totalBasePrice = listing.price * nights;
  const serviceFee = Math.round(totalBasePrice * 0.14);
  const totalPrice = totalBasePrice + serviceFee;

  const guestLabel = `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;

  const handleReserve = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    
    navigate('/booking', {
      state: {
        listing,
        startDate,
        endDate,
        guests,
        totalPrice,
        nights
      }
    });
  };

  return (
    <div className="room-details">
      <Navbar />
      <div className="room-content">
        {/* Back Button */}
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back to results</span>
        </button>
        {/* Title Header */}
        <h1 className="room-title">{listing.title || `Stunning stay in ${listing.location}`}</h1>
        <div className="room-header-meta">
          <div className="left-meta">
            <Star size={14} fill="black" /> 
            <span className="rating-bold">{listing.rating}</span>
            <span className="dot">·</span>
            <span className="reviews-link">{listing.reviewsCount} reviews</span>
            <span className="dot">·</span>
            <span className="location-link">{listing.location}</span>
          </div>
          <div className="right-actions">
            <button className="action-btn"><Share size={16} /> Share</button>
            <button className="action-btn"><Heart size={16} /> Save</button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="room-gallery">
          <div className="main-image" style={{backgroundImage: `url(${listing.image})`}}></div>
          <div className="side-images">
             <div className="side-img" style={{backgroundImage: `url(${listing.image})`}}></div>
             <div className="side-img" style={{backgroundImage: `url(${listing.image})`}}></div>
             <div className="side-img" style={{backgroundImage: `url(${listing.image})`}}></div>
             <div className="side-img" style={{backgroundImage: `url(${listing.image})`, opacity: 0.8}}>
               <button className="show-photos-btn">Show all photos</button>
             </div>
          </div>
        </div>

        <div className="room-content-grid">
           {/* Left Column: Details */}
           <div className="room-details-left">
              <div className="host-section">
                 <div className="host-info">
                    <h2>Hosted by {listing.host.name}</h2>
                    <p>4 guests · 2 bedrooms · 2 beds · 2 baths</p>
                 </div>
                 <div className="host-avatar" style={{backgroundImage: `url(${listing.host.image})`}}></div>
              </div>

              {/* Highlights */}
              <div className="highlights-section">
                 <div className="highlight-item">
                    <div className="h-icon"><MapPin size={24} /></div>
                    <div className="h-text">
                       <h3>Great location</h3>
                       <p>95% of recent guests gave the location a 5-star rating.</p>
                    </div>
                 </div>
                 <div className="highlight-item">
                    <div className="h-icon"><Wifi size={24} /></div>
                    <div className="h-text">
                       <h3>Fast Wifi</h3>
                       <p>At 246 Mbps, you can take video calls and stream videos for your whole group.</p>
                    </div>
                 </div>
              </div>

              <div className="divider"></div>

              <div className="description-section">
                 <p>{listing.description}</p>
                 <br />
                 <p>Relax in this calm, stylish space. Enjoy morning coffee on the private terrace overlooking the ocean, just steps away from the finest beaches.</p>
              </div>

              <div className="divider"></div>

              {/* Amenities */}
              <div className="amenities-section">
                 <h2>What this place offers</h2>
                 <div className="amenities-grid">
                    <div className="amenity-item"><Wifi size={20} /> Wifi</div>
                    <div className="amenity-item"><Car size={20} /> Free parking</div>
                    <div className="amenity-item"><Utensils size={20} /> Kitchen</div>
                    <div className="amenity-item"><Monitor size={20} /> TV</div>
                 </div>
              </div>
           </div>

           {/* Right Column: Reservation Sidebar */}
           <div className="room-sidebar-wrapper">
              <div className="reservation-card">
                 <div className="card-header">
                    <div className="price-tag">
                       <span className="price-large">₹{listing.price.toLocaleString('en-IN')}</span> <span className="night-text">night</span>
                    </div>
                    <div className="card-rating">
                       <Star size={12} fill="black" /> {listing.rating} · <span className="reviews-grey">{listing.reviewsCount} reviews</span>
                    </div>
                 </div>

                 <div className="date-picker-box">
                    <div className="date-inputs">
                       <div className="date-input border-right">
                          <label>CHECK-IN</label>
                          <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            dateFormat="MMM d"
                            customInput={<div className="clickable-date">{format(startDate, 'MMM d')}</div>}
                          />
                       </div>
                       <div className="date-input">
                          <label>CHECKOUT</label>
                          <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            dateFormat="MMM d"
                            customInput={<div className="clickable-date">{format(endDate, 'MMM d')}</div>}
                          />
                       </div>
                    </div>
                    <div className="guest-input-wrapper" ref={guestSelectorRef}>
                      <div className="guest-input" onClick={() => setShowGuestSelector(!showGuestSelector)}>
                         <label>GUESTS</label>
                         <div className="guest-display">
                           <span>{guestLabel}</span>
                           {showGuestSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                         </div>
                      </div>
                      {showGuestSelector && (
                        <div className="details-guest-selector">
                          <GuestSelector guests={guests} onChange={setGuests} />
                        </div>
                      )}
                    </div>
                 </div>

                 <button className="reserve-btn" onClick={handleReserve}>Reserve</button>

                 <div className="no-charge-text">You won't be charged yet</div>

                 <div className="price-breakdown">
                    <div className="pb-row">
                       <span>₹{listing.price.toLocaleString('en-IN')} x {nights} nights</span>
                       <span>₹{totalBasePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pb-row">
                       <span>Service fee</span>
                       <span>₹{serviceFee.toLocaleString('en-IN')}</span>
                    </div>
                 </div>

                 <div className="total-row">
                    <span>Total before taxes</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="divider"></div>

        {/* Reviews Section */}
        <div className="reviews-section">
           <div className="reviews-summary-header">
              <Star size={20} fill="black" />
              {listing.rating} · {listing.reviewsCount} reviews
           </div>

           <div className="reviews-grid">
              {displayedReviews && displayedReviews.length > 0 ? (
                displayedReviews.map(review => (
                  <div key={review.id} className="review-item">
                     <div className="review-user-info">
                        <div className="user-avatar" style={{backgroundImage: `url(${review.avatar})`}}></div>
                        <div>
                           <div className="user-name">{review.user}</div>
                           <div className="review-date">{review.date}</div>
                        </div>
                     </div>
                     <div className="review-comment">
                        {review.comment}
                     </div>
                  </div>
                ))
              ) : (
                <div className="no-reviews">No reviews yet for this stay.</div>
              )}
           </div>

           {listing.reviews && listing.reviews.length > 6 && (
             <button 
               className="show-more-reviews"
               onClick={() => setShowAllReviews(!showAllReviews)}
             >
               {showAllReviews ? (
                 <>
                   <ChevronUp size={18} />
                   Show less
                 </>
               ) : (
                 <>
                   <ChevronDown size={18} />
                   Show all {listing.reviewsCount} reviews
                 </>
               )}
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
