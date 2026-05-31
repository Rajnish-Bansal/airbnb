import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Share, Heart, Star, MapPin, Wifi, Car, Utensils, Monitor, ChevronDown, ChevronUp, ArrowLeft, Wind, Briefcase, Coffee, Waves, Dumbbell, Flame, Bath, Home } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Navbar from '../../components/organisms/Navbar/Navbar';
import Footer from '../../components/organisms/Footer/Footer';
import GuestSelector from '../../components/molecules/GuestSelector/GuestSelector';
import { useAuth } from '../../context/AuthContext';
import { useHost } from '../../context/HostContext';
import { useSearch } from '../../context/SearchContext';
import { fetchListingById, fetchBookedDates, toggleWishlist } from '../../services/api';
import { differenceInDays, format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import MapView from '../../components/molecules/MapView/MapView';
import { DUMMY_LISTINGS } from '../../constants/mockData';
import { calculateDetailedPrice } from '../../utils/pricing';
import './RoomDetails.css';

const normalizeListing = (data) => {
  if (!data) return null;

  const firstPhoto =
    data.image ||
    (Array.isArray(data.photos) && data.photos.length > 0
      ? (typeof data.photos[0] === 'string' ? data.photos[0] : data.photos[0]?.url)
      : '') ||
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop';

  return {
    ...data,
    id: data.id || data._id,
    title: data.title || data.description?.split(' - ')[0] || 'Stay',
    location: data.location || data.city || 'Unknown location',
    propertyType: data.propertyType || data.type || 'Stay',
    description: data.description || 'A beautiful place to stay.',
    image: firstPhoto,
    photos: Array.isArray(data.photos) ? data.photos : [firstPhoto],
    rating: data.rating ?? 0,
    reviewsCount: data.reviewsCount ?? 0,
    price: Number(data.price || 0),
    weekendPrice: Number(data.weekendPrice || data.price || 0),
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    host: data.host || {
      name: 'Hostify Host',
      image: 'https://i.pravatar.cc/150?u=hostify'
    },
    coordinates: data.coordinates || { lat: 20.5937, lng: 78.9629 }
  };
};

const RangeInput = React.forwardRef(({ value, onClick, startDate, endDate }, ref) => (
  <div className="date-inputs" onClick={onClick} ref={ref}>
     <div className="date-input border-right">
        <label>CHECK-IN</label>
        <div className="clickable-date">{startDate ? format(startDate, 'MMM d') : 'Add date'}</div>
     </div>
     <div className="date-input">
        <label>CHECKOUT</label>
        <div className="clickable-date">{endDate ? format(endDate, 'MMM d') : 'Add date'}</div>
     </div>
  </div>
));

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuthModal, showNotification, toggleFavoriteLocally } = useAuth();
  const { listings: hostListings } = useHost();
  const { addToRecentlyViewed } = useSearch();
  const routeListing = location.state?.listing || null;
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use isFavorite directly from AuthContext
  const isFavorite = user?.wishlist?.includes(id) || false;

  const [showNudge, setShowNudge] = useState(false);
  const [showMessageNudge, setShowMessageNudge] = useState(false);
  
  useEffect(() => {
    if (showNudge) {
      const timer = setTimeout(() => setShowNudge(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showNudge]);

  useEffect(() => {
    if (showMessageNudge) {
      const timer = setTimeout(() => setShowMessageNudge(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showMessageNudge]);

  // Fetch listing data
  useEffect(() => {
    const getListing = async () => {
      try {
        let initialized = false;

        if (routeListing && (routeListing.id || routeListing._id) == id) {
          setListing(normalizeListing(routeListing));
          initialized = true;
        }

        if (!initialized) {
          const localListing = hostListings.find(l => (l._id || l.id) == id);
          if (localListing) {
            setListing(normalizeListing(localListing));
            initialized = true;
          }
        }

        if (!initialized) {
          const mockListing = DUMMY_LISTINGS.find(l => (l._id || l.id) == id);
          if (mockListing) {
            setListing(normalizeListing(mockListing));
            initialized = true;
          }
        }

        // Always fetch the absolute latest data from the API in the background/foreground to guarantee fresh sync
        const data = await fetchListingById(id);
        if (data) {
          setListing(normalizeListing(data));
        }
      } catch (err) {
        console.error("Failed to fetch listing details:", err);
      } finally {
        setLoading(false);
      }
    };
    getListing();
  }, [id, hostListings, routeListing]);

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
  const [blockedDates, setBlockedDates] = useState([]);

  // Fetch blocked dates
  useEffect(() => {
    const loadBlockedDates = async () => {
      try {
        const datesStr = await fetchBookedDates(id);
        const dates = datesStr.map(d => new Date(d));
        setBlockedDates(dates);
      } catch (err) {
        console.error("Failed to load blocked dates", err);
      }
    };
    if (id) {
      loadBlockedDates();
    }
  }, [id]);

  // Prevent selecting date ranges that span across blocked dates
  const maxCheckoutDate = React.useMemo(() => {
    if (!startDate || !blockedDates.length) return null;
    const nextBlockedDate = [...blockedDates]
      .sort((a, b) => a - b)
      .find(d => d > startDate);
    
    if (nextBlockedDate) {
      const maxDate = new Date(nextBlockedDate);
      maxDate.setDate(maxDate.getDate() - 1);
      return maxDate;
    }
    return null;
  }, [startDate, blockedDates]);

  // Guest State
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const guestSelectorRef = useRef(null);
  const mapRef = useRef(null);

  // Pending reserve: set when user clicks Reserve but isn't logged in yet
  const [pendingReserve, setPendingReserve] = useState(false);

  const scrollToMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestSelectorRef.current && !guestSelectorRef.current.contains(event.target)) {
        setShowGuestSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-complete reserve after login
  useEffect(() => {
    if (user && pendingReserve && listing) {
      setPendingReserve(false);
      navigate('/booking', {
        state: {
          listing,
          startDate,
          endDate,
          guests,
          totalPrice: priceStats?.totalPrice,
          nights
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingReserve]);

  // Reviews State
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Inject mock reviews for demo purposes if listing has reviewsCount but empty list
  const getAugmentedReviews = () => {
    if (!listing) return [];
    if (listing.reviews && listing.reviews.length > 0) return listing.reviews;
    
    if (listing.reviewsCount > 0) {
      return [
        {
          id: 'mock1',
          user: 'Sarah Miller',
          date: 'March 2024',
          avatar: 'https://i.pravatar.cc/150?u=sarah',
          comment: 'This place is exactly as pictured. Very clean and the view is spectacular. The host was very responsive and check-in was a breeze.',
          ratings: { cleanliness: 5, accuracy: 5, communication: 5, location: 5, checkin: 5, value: 5 }
        },
        {
          id: 'mock2',
          user: 'James Wilson',
          date: 'February 2024',
          avatar: 'https://i.pravatar.cc/150?u=james',
          comment: 'Excellent stay! The location is perfect for exploring. Beds were comfortable and the wifi was fast enough for my remote work.',
          ratings: { cleanliness: 5, accuracy: 4, communication: 5, location: 5, checkin: 5, value: 4 }
        },
        {
          id: 'mock3',
          user: 'Priya Sharma',
          date: 'January 2024',
          avatar: 'https://i.pravatar.cc/150?u=priya',
          comment: 'Beautiful apartment with everything we needed. We loved sitting on the balcony in the evenings. Definitely recommended for a peaceful getaway.',
          ratings: { cleanliness: 4, accuracy: 5, communication: 5, location: 4, checkin: 5, value: 5 }
        }
      ];
    }
    return [];
  };

  const getReviewRating = (review) => {
    if (review.rating) return Number(review.rating).toFixed(1);
    if (review.ratings) {
      const vals = Object.values(review.ratings);
      if (vals.length > 0) {
        const avg = vals.reduce((sum, val) => sum + val, 0) / vals.length;
        return avg.toFixed(1);
      }
    }
    return '5.0';
  };

  const reviewsToDisplay = getAugmentedReviews();
  const displayedReviews = showAllReviews ? reviewsToDisplay : reviewsToDisplay.slice(0, 6);
  const hostName = listing?.host?.name || 'Host';
  const hostImage = listing?.host?.image || 'https://i.pravatar.cc/150?u=hostify';

  if (loading) return <div className="loading-container">Loading property details...</div>;
  if (!listing) return <div className="error-container">Property not found</div>;

  const nights = Math.max(differenceInDays(endDate, startDate), 1);
  const totalGuests = (guests.adults || 0) + (guests.children || 0);

  const priceStats = calculateDetailedPrice(listing, startDate, endDate);

  const guestLabel = `${totalGuests} guest${totalGuests > 1 ? 's' : ''}`;

  const calculateReviewCategories = () => {
    if (!reviewsToDisplay || reviewsToDisplay.length === 0) return null;
    
    const totals = {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      checkin: 0,
      value: 0
    };

    reviewsToDisplay.forEach(r => {
      const rt = r.ratings || { cleanliness: 5, accuracy: 5, communication: 5, location: 5, checkin: 5, value: 5 };
      totals.cleanliness += rt.cleanliness || 5;
      totals.accuracy += rt.accuracy || 5;
      totals.communication += rt.communication || 5;
      totals.location += rt.location || 5;
      totals.checkin += rt.checkin || 5;
      totals.value += rt.value || 5;
    });

    const count = reviewsToDisplay.length;
    return {
      cleanliness: (totals.cleanliness / count).toFixed(1),
      accuracy: (totals.accuracy / count).toFixed(1),
      communication: (totals.communication / count).toFixed(1),
      location: (totals.location / count).toFixed(1),
      checkin: (totals.checkin / count).toFixed(1),
      value: (totals.value / count).toFixed(1)
    };
  };

  const reviewStats = calculateReviewCategories();

  const handleReserve = () => {
    if (!user) {
      setPendingReserve(true);
      openAuthModal();
      return;
    }
    
    navigate('/booking', {
      state: {
        listing,
        startDate,
        endDate,
        guests,
        totalPrice: priceStats.totalPrice,
        nights
      }
    });
  };

  const handleSave = async () => {
    if (!user) {
      setShowNudge(true);
      return;
    }
    
    const newFavoriteStatus = !isFavorite;
    toggleFavoriteLocally(id);
    
    if (newFavoriteStatus) {
      showNotification('Saved to wishlist!', 'success');
    } else {
      showNotification('Removed from wishlist', 'info');
    }
    
    try {
      await toggleWishlist(id);
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      toggleFavoriteLocally(id);
      showNotification('Failed to save. Please try again.', 'error');
    }
  };
  const handleShare = async () => {
    const shareData = {
      title: listing.title || 'Hostify Stay',
      text: `Check out this amazing stay in ${listing.location} on Hostify!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      showNotification('Link copied to clipboard!', 'success');
    }
  };

  const handleMessageHost = () => {
    if (!user) {
      setShowMessageNudge(true);
      return;
    }
    navigate('/inbox', { state: { hostName, hostImage } });
  };

  return (
    <div className="room-details">
      <Helmet>
        <title>{listing.title ? `${listing.propertyType || 'Stay'} in ${listing.location} - ${listing.title}` : `Hostify | ${listing.propertyType || 'Stay'} in ${listing.location}`}</title>
        <meta name="description" content={listing.description} />
        <meta property="og:title" content={`${listing.propertyType} in ${listing.location}`} />
        <meta property="og:description" content={listing.description} />
        <meta property="og:image" content={listing.image} />
        <meta property="og:type" content="website" />
      </Helmet>
      <Navbar />
      <div className="room-content">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
          
          {/* Back button container */}
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
            {location.state?.fromHost ? (
              <Link 
                to="/become-a-host/dashboard?tab=listings" 
                className="back-circle-btn"
                style={{ textDecoration: 'none' }}
                title="Back"
              >
                <ArrowLeft size={20} />
              </Link>
            ) : (
              <button className="back-button" onClick={() => navigate(-1)} title="Go Back" style={{ marginBottom: 0 }}>
                <ArrowLeft size={20} />
              </button>
            )}
          </div>

          {/* Title and Meta Column */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            
            {/* Title Row */}
            <div className="room-title-header-row" style={{ justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
              <h1 className="room-title" style={{ margin: 0 }}>{listing.title || `Stunning stay in ${listing.location}`}</h1>
              
              <button 
                onClick={() => navigate('/')}
                style={{
                  background: 'white',
                  border: '1px solid #DDDDDD',
                  borderRadius: '24px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: '#222',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Back to home
              </button>
            </div>

            {/* Meta Row */}
            <div className="room-header-meta" style={{ marginBottom: 0 }}>
              <div className="left-meta">
                <Star size={14} fill="black" /> 
                <span className="rating-bold">{listing.rating}</span>
                <span className="dot">·</span>
                <span className="reviews-link">{listing.reviewsCount} reviews</span>
                <span className="dot">·</span>
                <button 
                  className="location-link-btn" 
                  onClick={scrollToMap}
                >
                  {listing.location}
                </button>
                <span className="dot">·</span>
                <button 
                  className="view-on-map-link"
                  onClick={scrollToMap}
                >
                  View on map
                </button>
              </div>
          <div className="right-actions">
            <button className="action-btn" onClick={handleShare}><Share size={16} /> Share</button>
            <button 
              className={`action-btn ${isFavorite ? 'active' : ''}`} 
              onClick={handleSave}
              style={{ color: isFavorite ? '#e11d48' : 'inherit', position: 'relative' }}
            >
              <Heart 
                size={16} 
                fill={isFavorite ? '#e11d48' : 'none'} 
                stroke={isFavorite ? '#e11d48' : 'currentColor'} 
              /> 
              {isFavorite ? 'Saved' : 'Save'}
              
              {showNudge && (
                <div className="details-nudge fade-in">
                   <span>🔒 To save property, please login</span>
                </div>
              )}
            </button>
            </div>
          </div>
        </div>
        </div>

        {/* Gallery Grid */}
        <div className="room-gallery">
          <div className="main-image" style={{backgroundImage: `url(${listing.image})`}}></div>
          <div className="side-images">
             <div className="side-img" style={{backgroundImage: `url(${listing.image || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'})`}}></div>
             <div className="side-img" style={{backgroundImage: `url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80')`}}></div>
             <div className="side-img" style={{backgroundImage: `url('https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80')`}}></div>
             <div className="side-img" style={{backgroundImage: `url(${listing.image})`}}></div>
          </div>
          <button className="show-photos-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Show all photos
          </button>
        </div>

        <div className="room-content-grid">
           {/* Left Column: Details */}
           <div className="room-details-left">
              <div className="host-section">
                 <div className="host-info">
                    <h2>Hosted by {hostName}</h2>
                    <p>4 guests · 2 bedrooms · 2 beds · 2 baths</p>
                    <div className="host-actions-row">
                       <button className="host-action-btn primary" onClick={handleMessageHost} style={{ position: 'relative' }}>
                         Message Host
                         {showMessageNudge && (
                           <div className="details-nudge fade-in">
                              <span>🔒 Please login to message</span>
                           </div>
                         )}
                       </button>
                    </div>
                 </div>
                 <div className="host-avatar" style={{backgroundImage: `url(${hostImage})`}}></div>
              </div>

              <div className="description-section">
                 <p>
                    {listing.description} Relax in this calm, stylish space. Enjoy morning coffee on the private terrace overlooking the ocean, just steps away from the finest beaches.
                 </p>
              </div>

              <div className="divider"></div>

              {/* Amenities */}
              <div className="amenities-section">
                 <h2>What this place offers</h2>
                 <div className="amenities-grid">
                    {listing.amenities && listing.amenities.length > 0 ? (
                       (showAllAmenities ? listing.amenities : listing.amenities.slice(0, 6)).map((amenity, idx) => {
                          const lower = amenity.toLowerCase();
                          let icon = <Wifi size={20} />; // default fallback
                          if (lower.includes('wifi')) icon = <Wifi size={20} />;
                          else if (lower.includes('park') || lower.includes('car')) icon = <Car size={20} />;
                          else if (lower.includes('kitchen') || lower.includes('cook') || lower.includes('utensils')) icon = <Utensils size={20} />;
                          else if (lower.includes('tv') || lower.includes('screen') || lower.includes('monitor')) icon = <Monitor size={20} />;
                          else if (lower.includes('air cond') || lower.includes('ac') || lower.includes('cool') || lower.includes('wind') || lower.includes('dryer') || lower.includes('iron')) icon = <Wind size={20} />;
                          else if (lower.includes('desk') || lower.includes('workspace') || lower.includes('work') || lower.includes('briefcase')) icon = <Briefcase size={20} />;
                          else if (lower.includes('coffee')) icon = <Coffee size={20} />;
                          else if (lower.includes('pool') || lower.includes('beach') || lower.includes('waves')) icon = <Waves size={20} />;
                          else if (lower.includes('gym') || lower.includes('fitness') || lower.includes('dumbbell')) icon = <Dumbbell size={20} />;
                          else if (lower.includes('fireplace') || lower.includes('flame') || lower.includes('fire')) icon = <Flame size={20} />;
                          else if (lower.includes('tub') || lower.includes('bath') || lower.includes('jacuzzi') || lower.includes('hot')) icon = <Bath size={20} />;
                          
                          return (
                             <div key={idx} className="amenity-item">
                                {icon}
                                <span>{amenity}</span>
                             </div>
                          );
                       })
                    ) : (
                       (showAllAmenities ? [
                          { name: 'Wifi', icon: <Wifi size={20} /> },
                          { name: 'Free parking', icon: <Car size={20} /> },
                          { name: 'Kitchen', icon: <Utensils size={20} /> },
                          { name: 'TV', icon: <Monitor size={20} /> },
                          { name: 'Air conditioning', icon: <Wind size={20} /> },
                          { name: 'Dedicated workspace', icon: <Briefcase size={20} /> },
                          { name: 'Coffee maker', icon: <Coffee size={20} /> }
                       ] : [
                          { name: 'Wifi', icon: <Wifi size={20} /> },
                          { name: 'Free parking', icon: <Car size={20} /> },
                          { name: 'Kitchen', icon: <Utensils size={20} /> },
                          { name: 'TV', icon: <Monitor size={20} /> },
                          { name: 'Air conditioning', icon: <Wind size={20} /> },
                          { name: 'Dedicated workspace', icon: <Briefcase size={20} /> }
                       ]).map((amenity, idx) => (
                          <div key={idx} className="amenity-item">
                             {amenity.icon}
                             <span>{amenity.name}</span>
                          </div>
                       ))
                    )}
                 </div>
                 {((listing.amenities && listing.amenities.length > 6) || (!listing.amenities || listing.amenities.length === 0)) && (
                    <button 
                       className="show-more-reviews" 
                       onClick={() => setShowAllAmenities(!showAllAmenities)}
                       style={{ marginTop: '24px' }}
                    >
                       {showAllAmenities ? (
                          <>
                             <ChevronUp size={18} />
                             Show less
                          </>
                       ) : (
                          <>
                             <ChevronDown size={18} />
                             Show all {listing.amenities ? listing.amenities.length : 7} amenities
                          </>
                       )}
                    </button>
                 )}
              </div>

              <div className="divider"></div>

              {/* House Rules */}
              <div className="house-rules-section amenities-section">
                 <h2>House rules</h2>
                 <div className="amenities-grid">
                    <div className="amenity-item">
                       <span className="rule-icon">🕙</span>
                       <span className="rule-text">Check-in after 3:00 PM<br />Checkout before 11:00 AM</span>
                    </div>
                    <div className="amenity-item">
                       <span className="rule-icon">🚭</span>
                       <span className="rule-text">No smoking</span>
                    </div>
                    <div className="amenity-item">
                       <span className="rule-icon">🎉</span>
                       <span className="rule-text">No parties or events</span>
                    </div>
                    <div className="amenity-item">
                       <span className="rule-icon">🍺</span>
                       <span className="rule-text">No drinking</span>
                    </div>
                    <div className="amenity-item">
                       <span className="rule-icon">🐾</span>
                       <span className="rule-text">No pets</span>
                    </div>
                    <div className="amenity-item">
                       <span className="rule-icon">🔕</span>
                       <span className="rule-text">Quiet hours 10:00 PM – 8:00 AM</span>
                    </div>
                 </div>
              </div>

              <div className="divider"></div>

              {/* Cancellation Policy */}
              <div className="cancellation-section amenities-section">
                 <h2>Cancellation policy</h2>
                 <p style={{ color: 'var(--secondary)', lineHeight: 1.6, marginTop: '16px' }}>
                   Free cancellation for 48 hours. After that, cancel before check-in and get a 50% refund, minus the service fee.
                 </p>
                 <button className="show-all-btn" style={{ marginTop: '16px' }}>Show details</button>
              </div>

           </div>

           <div className="room-sidebar-wrapper">
              <div className="reservation-card">
                 <div className="card-header hide-on-mobile">
                    <div className="price-tag">
                       <span className="price-large">₹{listing.price.toLocaleString('en-IN')}</span><span className="night-text">/night</span>
                    </div>
                 </div>

                 <div className="mobile-price-display show-only-mobile">
                    <div className="price-tag">
                       <span className="price-large">₹{listing.price.toLocaleString('en-IN')}</span><span className="night-text">/night</span>
                    </div>
                    <div className="mobile-dates-summary">
                       {format(startDate, 'MMM d')} – {format(endDate, 'MMM d')}
                    </div>
                 </div>

                 <div className="date-picker-box hide-on-mobile">
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        const start = update[0];
                        let end = update[1];
                        
                        if (start && end) {
                          const isSameDate = start.getFullYear() === end.getFullYear() &&
                                             start.getMonth() === end.getMonth() &&
                                             start.getDate() === end.getDate();
                          if (isSameDate) {
                            end = null; // Revert to awaiting checkout
                          }
                        }
                        
                        setStartDate(start);
                        setEndDate(end);
                      }}
                      dayClassName={(date) => {
                        if (startDate && !endDate) {
                          const nextDay = new Date(startDate);
                          nextDay.setDate(nextDay.getDate() + 1);
                          const isStart = date.getFullYear() === startDate.getFullYear() && date.getMonth() === startDate.getMonth() && date.getDate() === startDate.getDate();
                          const isNext = date.getFullYear() === nextDay.getFullYear() && date.getMonth() === nextDay.getMonth() && date.getDate() === nextDay.getDate();
                          
                          if (isStart || isNext) {
                            return "react-datepicker__day--selected react-datepicker__day--in-range custom-auto-highlight";
                          }
                        }
                        return null;
                      }}
                      minDate={new Date()}
                      maxDate={startDate && !endDate ? (maxCheckoutDate || undefined) : undefined}
                      excludeDates={blockedDates}
                      monthsShown={2}
                      customInput={<RangeInput startDate={startDate} endDate={endDate} />}
                    />
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

                 <div className="price-breakdown hide-on-mobile">
                     <div className="pb-row">
                        <span>
                           {priceStats.weekendNights > 0 && listing.price !== listing.weekendPrice ? (
                             `₹${listing.price.toLocaleString('en-IN')} x ${priceStats.weekdayNights} weekdays + ₹${listing.weekendPrice.toLocaleString('en-IN')} x ${priceStats.weekendNights} weekends`
                           ) : (
                             `₹${listing.price.toLocaleString('en-IN')} x ${nights} nights`
                           )}
                        </span>
                        <span>₹{priceStats.subtotal.toLocaleString('en-IN')}</span>
                     </div>
                     {priceStats.discountAmount > 0 && (
                        <div className="pb-row discount-row" style={{ color: '#008a05', fontWeight: '600' }}>
                           <span className="discount-label">{priceStats.discountBadge}</span>
                           <span className="discount-value">-₹{priceStats.discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                     )}
                     <div className="pb-row">
                        <span>Taxes</span>
                        <span>₹{priceStats.gstAmount.toLocaleString('en-IN')}</span>
                     </div>
                  </div>

                  <div className="total-row hide-on-mobile">
                     <span>Total (incl. taxes)</span>
                     <span>₹{priceStats.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
              </div>


           </div>
        </div>

          <div className="divider"></div>

         {/* Meet Your Host Section */}
         <div className="meet-host-section-compact">
            <h2 className="host-compact-title">Meet your host</h2>
            <div className="compact-host-card">
               <div className="compact-host-identity">
                  <div className="compact-avatar" style={{backgroundImage: `url(${hostImage})`}} />
                  <span className="compact-host-name">{hostName}</span>
               </div>
               <div className="compact-metrics-row">
                  <div className="compact-metric">
                     <span className="cmetric-val">{listing.rating || '4.76'}</span>
                     <span className="cmetric-lbl">Rating</span>
                  </div>
                  <div className="compact-metric">
                     <span className="cmetric-val">{listing.reviewsCount || 87}</span>
                     <span className="cmetric-lbl">Reviews</span>
                  </div>
                  <div className="compact-metric">
                     <span className="cmetric-val">8 yrs</span>
                     <span className="cmetric-lbl">Experience</span>
                  </div>
                  <div className="compact-metric">
                     <span className="cmetric-val">100%</span>
                     <span className="cmetric-lbl">Response</span>
                  </div>
                  <div className="compact-metric">
                     <span className="cmetric-val">&le;1 hr</span>
                     <span className="cmetric-lbl">Replies in</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="divider"></div>

         {/* Reviews Section */}
        <div className="reviews-section">
           {reviewStats && (
              <div className="review-categories-grid">
                 {Object.entries(reviewStats).map(([key, value]) => (
                    <div key={key} className="category-item">
                       <div className="category-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                       <div className="category-bar-wrapper">
                          <div className="category-bar">
                             <div 
                               className="category-progress" 
                               style={{ width: `${(value / 5) * 100}%` }}
                             ></div>
                          </div>
                          <span className="category-value">{value}</span>
                       </div>
                    </div>
                 ))}
              </div>
           )}

           <div className="reviews-grid">
              {(displayedReviews && displayedReviews.length > 0) ? (
                displayedReviews.map(review => (
                  <div key={review.id} className="review-item">
                     <div className="review-user-info">
                        <div className="user-avatar" style={{backgroundImage: `url(${review.avatar})`}}></div>
                        <div>
                           <div className="user-name">{review.user}</div>
                           <div className="review-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="review-date">{review.date}</span>
                              <span className="review-dot" style={{ color: 'var(--text-secondary)' }}>·</span>
                              <span className="review-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>
                                 <Star size={12} fill="black" stroke="black" />
                                 {getReviewRating(review)}
                              </span>
                           </div>
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

           {reviewsToDisplay && reviewsToDisplay.length > 6 && (
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


         {/* Map Section */}
         <div className="location-section" ref={mapRef}>
            <h2 className="section-subtitle">Where you'll be</h2>
            <div className="location-info">
               <div className="location-text">
                  <h3>{listing.location || listing.city}</h3>
                  <p className="secondary-text">
                     {listing.neighborhoodDescription || "This property is located in a vibrant and safe neighborhood, offering a perfect blend of convenience and local character. Exact location details will be shared after your booking is confirmed."}
                  </p>
               </div>
            </div>
            
            <MapView listings={[listing]} isSingle={true} />
            

         </div>
      </div>
        <div className="divider"></div>
        <Footer />
    </div>
  );
};

export default RoomDetails;
