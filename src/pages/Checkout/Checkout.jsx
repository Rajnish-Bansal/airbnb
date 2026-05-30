import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Star, CreditCard, Wallet, Smartphone, ShieldCheck, CheckCircle, Calendar, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fetchListingById, createBooking, fetchBookedDates } from '../../services/api';
import { useHost } from '../../context/HostContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../../components/molecules/AuthModal/AuthModal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import GuestSelector from '../../components/molecules/GuestSelector/GuestSelector';
import { calculateDetailedPrice } from '../../utils/pricing';
import './Checkout.css';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { listings: hostListings } = useHost();
  const { user, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
  
  const [listing, setListing] = useState(location.state?.listing || null);
  const [loading, setLoading] = useState(!location.state?.listing);
  
  // Fetch listing if not in state
  React.useEffect(() => {
    if (!listing && id) {
      const getListing = async () => {
        try {
          // Try to find in host listings first (local state/dummy data)
          const localListing = hostListings.find(l => (l._id || l.id) == id);
          if (localListing) {
            setListing({
              ...localListing,
              image: localListing.image || (localListing.photos && localListing.photos[0])
            });
            setLoading(false);
            return;
          }

          // Otherwise fetch from API
          const data = await fetchListingById(id);
          const normalizedData = {
            ...data,
            image: data.image || (data.photos && data.photos[0])
          };
          setListing(normalizedData);
        } catch (err) {
          console.error("Failed to fetch listing for checkout:", err);
        } finally {
          setLoading(false);
        }
      };
      getListing();
    }
  }, [id, listing, hostListings]);

  const stateData = location.state || {};
  
  const [startDate, setStartDate] = useState(stateData.startDate ? new Date(stateData.startDate) : new Date());
  const [endDate, setEndDate] = useState(stateData.endDate ? new Date(stateData.endDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
  const [guests, setGuests] = useState(stateData.guests || { adults: 1, children: 0 });
  const [blockedDates, setBlockedDates] = useState([]);
  
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [isEditingGuests, setIsEditingGuests] = useState(false);
  const [expandedSection, setExpandedSection] = useState((user?.name && user?.phone) ? 'payment' : 'guest');
  
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '+91 ');
  
  React.useEffect(() => {
    if (user) {
      let isFirstTimePreFill = false;
      if (!guestName && user.name) { setGuestName(user.name); isFirstTimePreFill = true; }
      if ((!guestPhone || guestPhone === '+91 ') && user.phone) { setGuestPhone(user.phone); isFirstTimePreFill = true; }
      
      if (isFirstTimePreFill && user.name && user.phone) {
        setExpandedSection('payment');
      }
    }
  }, [user]);
  
  const dateEditorRef = React.useRef(null);
  const guestEditorRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isEditingDates && dateEditorRef.current && !dateEditorRef.current.contains(event.target)) {
        setIsEditingDates(false);
      }
      if (isEditingGuests && guestEditorRef.current && !guestEditorRef.current.contains(event.target)) {
        setIsEditingGuests(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditingDates, isEditingGuests]);
  
  React.useEffect(() => {
    if (listing && (listing._id || listing.id)) {
       fetchBookedDates(listing._id || listing.id)
         .then(datesStr => setBlockedDates(datesStr.map(d => new Date(d))))
         .catch(console.error);
    }
  }, [listing]);

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

  const priceStats = calculateDetailedPrice(listing, startDate, endDate) || {};
  const nights = priceStats.nights || 5;
  const totalPrice = priceStats.totalPrice || ((listing?.price || 0) * nights);
  
  const formattedDates = `${format(startDate, 'MMM d, yyyy')} – ${format(endDate || startDate, 'MMM d, yyyy')}`;
  const totalGuestsCount = (guests.adults || 0) + (guests.children || 0);
  const guestsLabel = `${totalGuestsCount} guest${totalGuestsCount > 1 ? 's' : ''}`;

  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (loading) return <div className="loading-container">Loading checkout details...</div>;
  if (!listing) return <div className="error-container">Listing not found</div>;

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) {
       setCouponError('Please enter a coupon code');
       return;
    }

    // Mock valid coupon: SAVE20 gives 20% off
    if (couponCode.trim().toUpperCase() === 'SAVE20') {
       const calculatedDiscount = Math.floor(totalPrice * 0.20);
       setDiscount(calculatedDiscount);
       setIsCouponApplied(true);
    } else {
       setCouponError('Invalid or expired coupon code');
       setDiscount(0);
       setIsCouponApplied(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setDiscount(0);
    setIsCouponApplied(false);
    setCouponError('');
  };

  const finalPrice = totalPrice - discount;

  const handleConfirmPay = async () => {
    // Require login before finalizing booking
    if (!user) {
      openAuthModal();
      return;
    }

    if (!listing._id && !listing.id) {
      setBookingError('Cannot book this listing — missing listing ID.');
      return;
    }

    setIsProcessing(true);
    setBookingError('');

    try {
      const result = await createBooking({
        listingId: listing._id || listing.id,
        startDate,
        endDate,
        guests,
        totalPrice: finalPrice
      });

      // Show confirmation
      setConfirmedBooking(result);
    } catch (err) {
      setBookingError(err.message || 'Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // If booking confirmed, show a success screen
  if (confirmedBooking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', padding: '40px' }}>
        <div style={{ background: 'white', maxWidth: 860, width: '100%', borderRadius: '24px', padding: '40px', boxShadow: '0 24px 64px rgba(0,0,0,0.06)', textAlign: 'center', animation: 'fadeIn 0.6s ease-out' }}>
          
          <div style={{ width: 72, height: 72, background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
             <CheckCircle size={36} color="#10b981" />
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--secondary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Booking Confirmed! 🎉</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 12, lineHeight: 1.5 }}>
            Pack your bags! Your stay at <strong style={{ color: 'var(--secondary)' }}>{confirmedBooking.listing?.location || listing.location}</strong> is officially secured.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
            We've sent your booking details to <strong style={{ color: 'var(--secondary)' }}>{user?.email || 'your email'}</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', textAlign: 'left', marginBottom: 32 }}>
            {/* Receipt Card */}
            <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
               <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 8 }}>Booking Reference</div>
               <div style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '2px', marginBottom: 20 }}>{confirmedBooking.code}</div>
               
               <div style={{ height: 1, background: 'var(--border-light)', margin: '0 -24px 20px' }}></div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                 <span style={{ color: 'var(--text-secondary)' }}>Dates</span>
                 <span style={{ fontWeight: 600, color: 'var(--secondary)', textAlign: 'right', flex: 1, paddingLeft: 16 }}>{formattedDates}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 12 }}>
                 <span style={{ color: 'var(--text-secondary)' }}>Guests</span>
                 <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{guestsLabel}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 12 }}>
                 <span style={{ color: 'var(--text-secondary)' }}>Total Paid</span>
                 <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{finalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
               </div>
            </div>

            {/* Trip Details Card */}
            <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
               <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--secondary)', marginBottom: 16 }}>Trip Details</h3>
               
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', backgroundImage: `url(${listing.host?.image || 'https://ui-avatars.com/api/?name=' + (listing.host?.name || 'Host')})`, backgroundSize: 'cover' }}></div>
                  <div style={{ flex: 1 }}>
                     <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--secondary)' }}>Hosted by {listing.host?.name || 'your host'}</div>
                     <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>They will be your primary contact.</div>
                     <div style={{ fontSize: 13, color: 'var(--secondary)', marginTop: 2, fontWeight: 500 }}>+91 98765 43210</div>
                  </div>
                  <button style={{ padding: '8px 16px', background: 'white', color: 'var(--secondary)', borderRadius: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border-light)' }}>
                     Message
                  </button>
               </div>

               <div style={{ height: 1, background: 'var(--border-light)', margin: '0 -24px 20px' }}></div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                     <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Check-in</div>
                     <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>After 2:00 PM</div>
                  </div>
                  <div>
                     <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Check-out</div>
                     <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Before 11:00 AM</div>
                  </div>
               </div>

               <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--secondary)', marginBottom: 4 }}>Location</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{listing.location}<br/><span style={{ fontSize: 13, color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>Get Directions</span></div>
               </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button
              style={{ padding: '14px 32px', background: 'var(--secondary)', color: 'white', borderRadius: '12px', fontSize: 15, fontWeight: 700, cursor: 'pointer', border: 'none', minWidth: 200 }}
              onClick={() => navigate('/bookings')}
            >
              View My Bookings
            </button>
            <button
              style={{ padding: '14px 32px', background: 'white', color: 'var(--secondary)', borderRadius: '12px', fontSize: 15, fontWeight: 700, cursor: 'pointer', border: '1px solid var(--border-light)', minWidth: 200 }}
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }


  const isFormValid = guestName.trim() !== '' && guestPhone.length === 14 && expandedSection === 'payment';

  return (
    <>
      <div className="checkout-navbar">
         <div className="checkout-nav-container" style={{ padding: '0 48px', width: '100%', display: 'flex', alignItems: 'center' }}>
            <div className="logo-text" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em' }}>Hostify</div>
         </div>
      </div>
      
      <div className="checkout-container">
         <div className="checkout-header">
            <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft size={20} /></button>
            <h1>Confirm and pay</h1>
         </div>

         <div className="checkout-grid">
            {/* Left Column: Form */}
            <div className="checkout-left">

               <div className="checkout-section" style={{ padding: '24px' }}>
                  <div className="section-header" onClick={() => setExpandedSection(expandedSection === 'guest' ? '' : 'guest')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                     <h2 style={{ marginBottom: 0 }}>1. Guest details</h2>
                     <ChevronDown size={24} style={{ color: 'var(--secondary)', transform: expandedSection === 'guest' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                  </div>
                  {expandedSection === 'guest' && (
                     <div className="section-content" style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                        <div className="airbnb-input-container" style={{ marginTop: 0 }}>
                           <div className="airbnb-input-group top-input">
                              <label>Full name <span style={{ color: '#dc2626' }}>*</span></label>
                              <input type="text" placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                           </div>
                           <div className="airbnb-input-group">
                              <label>Mobile number <span style={{ color: '#dc2626' }}>*</span></label>
                              <input type="tel" placeholder="+91 0000000000" maxLength={14} value={guestPhone} onChange={(e) => {
                                 let val = e.target.value;
                                 if (!val.startsWith('+91 ')) val = '+91 ';
                                 const digits = val.substring(4).replace(/\D/g, '');
                                 setGuestPhone('+91 ' + digits);
                              }} />
                           </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '12px', padding: '0 4px' }}>
                           <AlertCircle size={14} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                           <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              Please ensure your mobile number is correct. The host will use this number to communicate your check-in details.
                           </span>
                        </div>
                        <button 
                           disabled={!(guestName.trim() !== '' && guestPhone.length === 14)}
                           onClick={() => setExpandedSection('payment')}
                           style={{ 
                             marginTop: '24px', 
                             padding: '12px 24px', 
                             background: 'var(--secondary)', 
                             color: 'white', 
                             border: 'none', 
                             borderRadius: 'var(--radius-md)', 
                             fontWeight: 700, 
                             cursor: (guestName.trim() !== '' && guestPhone.length === 14) ? 'pointer' : 'not-allowed',
                             opacity: (guestName.trim() !== '' && guestPhone.length === 14) ? 1 : 0.5
                           }}
                        >
                           Continue to payment
                        </button>
                     </div>
                  )}
               </div>

               <div className="checkout-section" style={{ padding: '24px' }}>
                  <div className="section-header" onClick={() => setExpandedSection(expandedSection === 'payment' ? '' : 'payment')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                     <h2 style={{ marginBottom: 0 }}>2. Choose payment method</h2>
                     <ChevronDown size={24} style={{ color: 'var(--secondary)', transform: expandedSection === 'payment' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                  </div>
                  {expandedSection === 'payment' && (
                     <div className="section-content" style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease-out' }}>
                         <div className="payment-method-selector">
                            <div className="pm-option selected">
                               <div className="pm-info">
                                  <CreditCard size={22} strokeWidth={1.5} />
                                  <span>Credit or debit card</span>
                               </div>
                               <div className="pm-radio-outer">
                                  <div className="pm-radio-inner"></div>
                               </div>
                            </div>
                            <div className="pm-option">
                               <div className="pm-info">
                                  <Smartphone size={22} strokeWidth={1.5} />
                                  <span>UPI (PhonePe, Google Pay)</span>
                               </div>
                               <div className="pm-radio-outer">
                                  <div className="pm-radio-inner"></div>
                               </div>
                            </div>
                            <div className="pm-option">
                               <div className="pm-info">
                                  <Wallet size={22} strokeWidth={1.5} />
                                  <span>Digital Wallets</span>
                               </div>
                               <div className="pm-radio-outer">
                                  <div className="pm-radio-inner"></div>
                               </div>
                            </div>
                         </div>

                        <div className="airbnb-input-container">
                           <div className="airbnb-input-group top-input">
                              <label>Card number</label>
                              <input type="text" placeholder="0000 0000 0000 0000" />
                           </div>
                           <div className="airbnb-input-row">
                              <div className="airbnb-input-group">
                                 <label>Expiration</label>
                                 <input type="text" placeholder="MM/YY" />
                              </div>
                              <div className="airbnb-input-group">
                                 <label>CVV</label>
                                 <input type="text" placeholder="123" />
                              </div>
                           </div>
                           <div className="airbnb-input-group">
                              <label>Cardholder name</label>
                              <input type="text" placeholder="Name on card" />
                           </div>
                        </div>
                     </div>
                  )}
               </div>


                
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  <button className="confirm-btn" style={{ margin: 0 }} onClick={handleConfirmPay} disabled={isProcessing || !isFormValid}>
                     {isProcessing ? 'Processing...' : user ? 'Confirm and Pay Now' : 'Log in to Confirm'}
                  </button>

                  {bookingError && (
                    <div style={{ color: '#dc2626', fontSize: 14, padding: '12px 16px', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                      ⚠️ {bookingError}
                    </div>
                  )}

                  <div className="secure-checkout">
                     <span style={{ opacity: 0.6 }}>Guaranteed safe & secure checkout</span>
                  </div>
               </div>
            </div>

            {/* Right Column: Listing Summary (Sticky) */}
            <div className="checkout-right">
               <div className="listing-summary-card">
                  <div className="summary-header">
                     <div className="summary-image" style={{backgroundImage: `url(${listing.image})`}}></div>
                     <div className="summary-container">
                        <div className="summary-category">Boutique Stay</div>
                        <div className="summary-title">{listing.title || 'Premium Property'}</div>
                        <div className="summary-rating">
                           <Star size={14} fill="currentColor" /> 
                           <span>{listing.rating}</span>
                           <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>(124 reviews)</span>
                        </div>
                     </div>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="price-details-title" style={{ marginBottom: '16px' }}>Trip details</div>
                  <div className="summary-row" style={{ marginBottom: '16px', alignItems: 'center', position: 'relative' }} ref={dateEditorRef}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Dates</span>
                        <span style={{ fontWeight: '500' }}>{formattedDates} ({nights} night{nights !== 1 ? 's' : ''})</span>
                     </div>
                     <button className="edit-link" onClick={() => setIsEditingDates(true)}>Edit</button>
                     {isEditingDates && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, marginTop: '8px', background: 'white', borderRadius: '16px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', padding: '16px', border: '1px solid #ddd' }}>
                            <DatePicker
                                selectsRange={true}
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(update) => {
                                  const start = update[0];
                                  let end = update[1];
                                  if (start && end) {
                                    const isSameDate = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate();
                                    if (isSameDate) end = null;
                                  }
                                  setStartDate(start);
                                  setEndDate(end);
                                  if (start && end) setIsEditingDates(false);
                                }}
                                dayClassName={(date) => {
                                  if (startDate && !endDate) {
                                    const nextDay = new Date(startDate);
                                    nextDay.setDate(nextDay.getDate() + 1);
                                    const isStart = date.getFullYear() === startDate.getFullYear() && date.getMonth() === startDate.getMonth() && date.getDate() === startDate.getDate();
                                    const isNext = date.getFullYear() === nextDay.getFullYear() && date.getMonth() === nextDay.getMonth() && date.getDate() === nextDay.getDate();
                                    if (isStart || isNext) return "react-datepicker__day--selected react-datepicker__day--in-range custom-auto-highlight";
                                  }
                                  return null;
                                }}
                                minDate={new Date()}
                                maxDate={startDate && !endDate ? (maxCheckoutDate || undefined) : undefined}
                                excludeDates={blockedDates}
                                monthsShown={1}
                                inline
                            />
                        </div>
                     )}
                  </div>
                  <div className="summary-row" style={{ marginBottom: '24px', alignItems: 'center', position: 'relative' }} ref={guestEditorRef}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Guests</span>
                        <span style={{ fontWeight: '500' }}>{guestsLabel}</span>
                     </div>
                     <button className="edit-link" onClick={() => setIsEditingGuests(true)}>Edit</button>
                     {isEditingGuests && (
                        <GuestSelector guests={guests} onChange={setGuests} />
                     )}
                  </div>

                  <div className="price-details-title">Price details</div>
                  
                  <div className="summary-row">
                     <span>₹{listing.price.toLocaleString('en-IN')} x {nights} nights</span>
                     <span>₹{(priceStats.subtotal || listing.price * nights).toLocaleString('en-IN')}</span>
                  </div>
                  
                  {priceStats.discountAmount > 0 && (
                     <div className="summary-row discount-row" style={{ color: '#16a34a', fontWeight: '600' }}>
                        <span>{priceStats.discountBadge}</span>
                        <span>-₹{priceStats.discountAmount.toLocaleString('en-IN')}</span>
                     </div>
                  )}

                  <div className="summary-row">
                     <span>Taxes</span>
                     <span>₹{(priceStats.gstAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  
                  {isCouponApplied && (
                     <div className="summary-row discount-row" style={{ color: '#16a34a', fontWeight: '600' }}>
                        <span>Coupon ({couponCode.toUpperCase()})</span>
                        <span>-₹{discount.toLocaleString('en-IN')}</span>
                     </div>
                  )}
                  
                  <div className="summary-divider"></div>

                  <div className="summary-total">
                     <span>Total (INR)</span>
                     <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {!isCouponApplied ? (
                    <div className="coupon-inline" style={{ marginTop: '32px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                           <input 
                              type="text" 
                              style={{ flex: 1, padding: '12px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }} 
                              placeholder="Add coupon" 
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                           />
                           <button 
                             onClick={handleApplyCoupon}
                             style={{ padding: '0 20px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '600', cursor: 'pointer' }}
                           >
                             Apply
                           </button>
                        </div>
                        {couponError && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '8px' }}>{couponError}</div>}
                    </div>
                  ) : (
                    <div style={{ marginTop: '32px', padding: '16px', background: '#f0fdf4', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '14px' }}>✓ Coupon Applied</span>
                        <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}>Remove</button>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Auth Modal - shown when unauthenticated user tries to confirm booking */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={(userData) => {
          closeAuthModal();
          // If login was successful, auto-proceed with booking
          if (userData) {
            setTimeout(() => handleConfirmPay(), 300);
          }
        }}
      />
    </>
  );
};

export default Checkout;
