import React from 'react';
import { Star, Heart, Eye } from 'lucide-react';
import './ListingCard.css';

const ListingCard = ({ image, location, distance, dates, price, rating, isRecentlyViewed }) => {
  return (
    <div className="listing-card">
      <div className="listing-image-wrapper">
        <img src={image} alt={location} className="listing-image" />
        <button className="favorite-button">
          <Heart size={24} color="white" className="heart-icon" />
        </button>
        {isRecentlyViewed && (
          <div className="recently-viewed-badge">
            <Eye size={14} />
            <span>Recently viewed</span>
          </div>
        )}
      </div>
      <div className="listing-details">
        <div className="listing-header">
          <h3 className="listing-location">{location}</h3>
          <div className="listing-rating">
            <Star size={12} fill="black" className="star-icon" />
            <span>{rating}</span>
          </div>
        </div>
        <p className="listing-info">{distance}</p>
        <p className="listing-info">{dates}</p>
        <p className="listing-price">
          <span className="price-bold">₹{price.toLocaleString('en-IN')}</span> night
        </p>
      </div>
    </div>
  );
};

export default ListingCard;
