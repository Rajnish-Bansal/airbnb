import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/organisms/Navbar/Navbar';
import ListingCard from '../../components/molecules/ListingCard/ListingCard';
import { fetchWishlist } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DUMMY_LISTINGS } from '../../constants/mockData';
import Footer from '../../components/organisms/Footer/Footer';
import PageHeader from '../../components/molecules/PageHeader/PageHeader';
import { Star, MapPin, Users, Briefcase } from 'lucide-react';
import '../Bookings/Bookings.css';
import './Wishlist.css';

const Wishlist = () => {
  const { user, openAuthModal } = useAuth();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setSavedListings([]);
        setLoading(false);
        return;
      }
      
      try {
        const wishlist = await fetchWishlist();
        setSavedListings(wishlist);
      } catch (err) {
        console.error("Error loading wishlist from DB:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadWishlist();
  }, [user]);

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
            {!user ? (
              <>
                <p style={{ marginBottom: '24px' }}>Log in to view and save properties to your wishlist across all your devices.</p>
                <button 
                  onClick={openAuthModal}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Log in
                </button>
              </>
            ) : (
              <p>Save properties you like to view them later!</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;
