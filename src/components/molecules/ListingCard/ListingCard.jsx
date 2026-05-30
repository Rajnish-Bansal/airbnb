import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, Eye } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import './ListingCard.css';

const ListingCard = ({ id, image, location, distance, price, rating, isRecentlyViewed, ...listing }) => {
  const navigate = useNavigate();
  const { user, openAuthModal, showNotification } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showNudge, setShowNudge] = useState(false);

  // Dynamic details calculation
  const bedroomsCount = listing.bedrooms || Math.max(1, Math.floor((listing.maxGuests || 2) / 2));
  const bedsCount = listing.beds || Math.max(1, Math.floor((listing.maxGuests || 2) / 2)) * 2;
  const bathroomsCount = listing.bathrooms || Math.max(1, Math.floor((listing.maxGuests || 2) / 3));
  const detailText = `${bedroomsCount} bedroom${bedroomsCount > 1 ? 's' : ''} · ${bedsCount} queen bed${bedsCount > 1 ? 's' : ''} · ${bathroomsCount} bathroom${bathroomsCount > 1 ? 's' : ''}`;
  
  useEffect(() => {
    if (showNudge) {
      const timer = setTimeout(() => setShowNudge(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNudge]);

  const handleCardClick = () => {
    navigate(`/rooms/${id}`, {
      state: {
        listing: {
          id,
          image,
          location,
          distance,
          price,
          rating,
          ...listing,
        }
      }
    });
  };

  return (
    <div className="listing-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="listing-image-wrapper">
        <img src={image} alt={location} className="listing-image" />
        <button 
          className="favorite-button" 
          onClick={(e) => {
            e.stopPropagation();
            if (!user) {
              setShowNudge(true);
              return;
            }
            
            setIsFavorite(!isFavorite);
            if (!isFavorite) {
              showNotification('Saved to wishlist!', 'success');
            }
          }}
        >
          <Heart 
            size={20} 
            className="heart-icon" 
            fill={isFavorite ? 'var(--primary)' : 'none'}
            stroke={isFavorite ? 'var(--primary)' : '#222'}
          />
        </button>
        {showNudge && (
          <div className="listing-nudge fade-in">
            <span>🔒 To save property, please login</span>
          </div>
        )}
        {isRecentlyViewed && (
          <div className="recently-viewed-badge">
            <Eye size={12} />
            <span>Recently viewed</span>
          </div>
        )}
      </div>
      <div className="listing-details">
        <div className="listing-header">
          <h3 className="listing-location">{location}</h3>
          <div className="listing-rating">
            <Star size={14} fill="var(--primary)" stroke="var(--primary)" style={{ position: 'relative', top: '-1px' }} />
            <span>{rating} ({listing.reviewsCount || 0})</span>
          </div>
        </div>
        <p className="listing-info">{detailText}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: '8px' }}>
           <p className="listing-price" style={{ margin: 0 }}>
             <span className="price-bold">₹{price.toLocaleString('en-IN')}</span> / night
           </p>
           <button style={{ padding: '4px 10px', background: 'var(--primary)', color: 'white', borderRadius: '6px', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>View Details</button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
