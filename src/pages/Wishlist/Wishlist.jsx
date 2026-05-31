import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/organisms/Navbar/Navbar';
import ListingCard from '../../components/molecules/ListingCard/ListingCard';
import { fetchListings } from '../../services/api';
import { DUMMY_LISTINGS } from '../../constants/mockData';
import Footer from '../../components/organisms/Footer/Footer';
import PageHeader from '../../components/molecules/PageHeader/PageHeader';
import { Star, MapPin, Users, Briefcase } from 'lucide-react';
import '../Bookings/Bookings.css';
import './Wishlist.css';

const Wishlist = () => {
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        // Get all saved IDs from local storage
        const savedIds = Object.keys(localStorage)
          .filter(key => key.startsWith('wishlist_') && localStorage.getItem(key) === 'true')
          .map(key => key.replace('wishlist_', ''));

        // Fetch all listings
        let all = [];
        try {
           all = await fetchListings();
           if (!all || all.length === 0) all = DUMMY_LISTINGS;
        } catch {
           all = DUMMY_LISTINGS;
        }

        const saved = all.filter(item => savedIds.includes(String(item.id || item._id)));
        setSavedListings(saved);
      } catch (err) {
        console.error("Error loading wishlist:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWishlist();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container">
        <PageHeader title="My Wishlist" />
        
        {loading ? (
          <div>Loading your wishlist...</div>
        ) : savedListings.length > 0 ? (
          <div className="listings-grid">
            {savedListings.map(listing => {
              const listingId = listing._id || listing.id;
              return (
                <Link to={`/rooms/${listingId}`} key={listingId} style={{textDecoration: 'none', color: 'inherit', display: 'block'}}>
                  <ListingCard {...listing} />
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#666' }}>
            <h2 style={{ marginBottom: '16px', color: '#222' }}>Your wishlist is empty</h2>
            <p>Save properties you like to view them later!</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
