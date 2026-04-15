import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../components/organisms/Navbar/Navbar';
import HeroSearch from '../components/molecules/HeroSearch/HeroSearch';
import Categories from '../components/molecules/Categories/Categories';
import ListingCard from '../components/molecules/ListingCard/ListingCard';
import FilterPanel from '../components/molecules/FilterPanel/FilterPanel';
// import FilterSidebar from '../components/molecules/FilterSidebar/FilterSidebar'; // Option 3: Always-visible sidebar
import FilterChips from '../components/molecules/FilterChips/FilterChips';
import MapView from '../components/molecules/MapView/MapView';
import { Helmet } from 'react-helmet-async';
import './Home.css';

import { fetchListings } from '../services/api';
import { Link } from 'react-router-dom';
import { Sliders, Map, List } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import Footer from '../components/organisms/Footer/Footer';

import { DUMMY_LISTINGS } from '../constants/mockData';

const Home = () => {
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { filters, recentlyViewed, searchParams, updateSearchParams, updateFilters } = useSearch();
  
  // Handle Scroll Morph (Throttled)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 80) {
            setIsScrolled(true);
          } else {
            setIsScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch listings on mount
  useEffect(() => {
    const getListings = async () => {
      try {
        const data = await fetchListings();
        if (data && data.length > 0) {
          setAllListings(data);
        } else {
          // Fallback to dummy data for design demo if API is empty
          setAllListings(DUMMY_LISTINGS);
        }
      } catch (err) {
        console.error("Failed to fetch listings, using fallback:", err);
        setAllListings(DUMMY_LISTINGS);
      } finally {
        setLoading(false);
      }
    };
    getListings();
  }, []);



  const applyFilters = (listings, params, currentFilters) => {
    const { destination, guests, startDate, endDate } = params;
    let filtered = [...listings];

    // Filter by Destination
    if (destination) {
      const lowerCaseDest = destination.toLowerCase();
      filtered = filtered.filter(listing => 
        listing.location.toLowerCase().includes(lowerCaseDest)
      );
    }

    // Filter by Guests
    if (guests) {
      filtered = filtered.filter(listing => 
        (listing.maxGuests || 2) >= guests
      );
    }

    // Filter by Dates
    if (startDate && endDate) {
      filtered = filtered.filter(listing => {
        if (!listing.availableFrom || !listing.availableTo) return false;
        const availFrom = new Date(listing.availableFrom);
        const availTo = new Date(listing.availableTo);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return availFrom <= start && availTo >= end;
      });
    }

    // Apply advanced filters
    filtered = filtered.filter(listing => 
      listing.price >= currentFilters.priceRange[0] && 
      listing.price <= currentFilters.priceRange[1]
    );

    if (currentFilters.propertyTypes.length > 0) {
      filtered = filtered.filter(listing => 
        currentFilters.propertyTypes.includes(listing.propertyType)
      );
    }

    if (currentFilters.amenities.length > 0) {
      filtered = filtered.filter(listing => 
        currentFilters.amenities.every(amenity => 
          listing.amenities.includes(amenity)
        )
      );
    }

    if (currentFilters.instantBook) {
      filtered = filtered.filter(listing => listing.instantBook === true);
    }

    if (currentFilters.minRating > 0) {
      filtered = filtered.filter(listing => listing.rating >= currentFilters.minRating);
    }

    return filtered;
  };

  const filteredListings = useMemo(() => {
    if (loading || allListings.length === 0) return [];
    return applyFilters(allListings, searchParams, filters);
  }, [allListings, searchParams, filters, loading]);
  
  const allLocations = useMemo(() => 
    [...new Set(allListings.map(item => item.location))],
    [allListings]
  );

  const handleSearch = useCallback((newSearchParams) => {
    updateSearchParams(newSearchParams);
  }, [updateSearchParams]);

  const handleFilterApply = useCallback((newFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  const handleReset = useCallback(() => {
    updateSearchParams({ destination: '', guests: null, startDate: null, endDate: null });
    setSearchKey(prev => prev + 1);
  }, [updateSearchParams]);

  return (
    <>
    <div className="home-container">
      <Helmet>
        <title>Hostify - Find your next home away from home</title>
        <meta name="description" content="Discover unique properties around the world. Book your perfect stay with Hostify." />
        <meta property="og:title" content="Hostify - Premium Vacation Rentals" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop" />
      </Helmet>
      
      <Navbar onSearch={handleSearch} onLogoClick={handleReset} scrolled={isScrolled} />
      
      <div className={`hero-search-wrapper ${isScrolled ? 'scrolled' : ''}`}>
        <div className="compact-search-container">
          <HeroSearch key={searchKey} onSearch={handleSearch} allLocations={allLocations} />
        </div>
      </div>

      <div className="sticky-sub-navbar">
        <div className="sub-navbar-container">
          {/* Categories removed as requested */}
          <div className="sub-navbar-filters">
            <button className="filter-trigger-btn elevate" onClick={() => setShowFilters(true)}>
              <Sliders size={18} />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <main className="main-content">
        {/* Results Header */}
        <div className="results-header">
          <div className="results-info">
            <h2 className="section-title">
              {searchParams.destination ? `Stays in ${searchParams.destination}` : 'Recently added properties'}
            </h2>
            <div className="results-count">
              {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
            </div>
          </div>
          
        </div>

        {/* Active Filter Chips */}
        <FilterChips onFilterRemove={handleFilterApply} />

        {/* Map or List View */}
        {showMap ? (
          <MapView listings={filteredListings} />
        ) : (
          <div className="listings-grid">
            {filteredListings.map(listing => {
              const listingId = listing._id || listing.id;
              const isRecentlyViewed = recentlyViewed.some(item => (item._id || item.id) === listingId);
              return (
                <ListingCard 
                  key={listingId}
                  {...listing} 
                  image={listing.image || (listing.photos && listing.photos[0])}
                  id={listingId} 
                  isRecentlyViewed={isRecentlyViewed} 
                />
              );
            })}
          </div>
        )}
      </main>

      <FilterPanel 
        isOpen={showFilters} 
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
      />

      {/* ========== OPTION 3: Always-Visible Sidebar (COMMENTED OUT) ========== */}
      {/* 
      <div className="home-layout">
        <FilterSidebar onApply={handleFilterApply} />
        
        <main className="main-content-with-sidebar">
          <RecentlyViewed />
          
          <div className="results-header">
            <h2>{filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'}</h2>
          </div>

          <div className="listings-grid">
            {filteredListings.map(listing => (
              <Link to={`/rooms/${listing.id}`} key={listing.id} style={{textDecoration: 'none', color: 'inherit', display: 'block'}}>
                <ListingCard {...listing} />
              </Link>
            ))}
          </div>
        </main>
      </div>
      */}
      {/* Floating Toggle Button */}
      <button 
        className={`view-toggle-btn floating-toggle ${showMap ? 'active' : ''}`}
        onClick={() => setShowMap(!showMap)}
      >
        {showMap ? (
          <>
            <List size={18} />
            <span>Show list</span>
          </>
        ) : (
          <>
            <Map size={18} />
            <span>Show map</span>
          </>
        )}
      </button>
    </div>
    <Footer />
    </>
  );
};

export default Home;
