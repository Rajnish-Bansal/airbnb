import React from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../ListingCard/ListingCard';
import { useSearch } from '../../../context/SearchContext';
import { Clock } from 'lucide-react';
import './RecentlyViewed.css';

const RecentlyViewed = () => {
  const { recentlyViewed } = useSearch();

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="recently-viewed-section">
      <div className="section-header">
        <Clock size={24} />
        <h2>Recently Viewed</h2>
      </div>
      <div className="recently-viewed-grid">
        {recentlyViewed.slice(0, 4).map(listing => (
          <Link 
            to={`/rooms/${listing.id}`} 
            key={listing.id} 
            style={{textDecoration: 'none', color: 'inherit', display: 'block'}}
          >
            <ListingCard {...listing} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
