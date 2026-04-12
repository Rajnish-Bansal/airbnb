import React from 'react';
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

const Home = () => {
  const [allListings, setAllListings] = React.useState([]);
  const [filteredListings, setFilteredListings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchKey, setSearchKey] = React.useState(0);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showMap, setShowMap] = React.useState(false);
  const { filters, recentlyViewed, searchParams, updateSearchParams, updateFilters } = useSearch();
  
  // Fetch listings on mount
  React.useEffect(() => {
    const getListings = async () => {
      try {
        const data = await fetchListings();
        setAllListings(data);
        setFilteredListings(data);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
      } finally {
        setLoading(false);
      }
    };
    getListings();
  }, []);

  // Automatically hide map when search is cleared
  React.useEffect(() => {
    if (!searchParams.destination && showMap) {
      setShowMap(false);
    }
  }, [searchParams.destination, showMap]);

  // Sync filtered listings with context on mount and when filters/params change
  React.useEffect(() => {
    if (allListings.length > 0) {
      applyFilters(searchParams, filters);
    }
  }, [searchParams, filters, allListings]);
  
  // Extract unique locations for autocomplete
  const allLocations = [...new Set(allListings.map(item => item.location))];

  const applyFilters = (searchParams, currentFilters) => {
    const { destination, guests, startDate, endDate } = searchParams;
    
    let filtered = [...allListings];

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
    // Price Range
    filtered = filtered.filter(listing => 
      listing.price >= currentFilters.priceRange[0] && 
      listing.price <= currentFilters.priceRange[1]
    );

    // Property Types
    if (currentFilters.propertyTypes.length > 0) {
      filtered = filtered.filter(listing => 
        currentFilters.propertyTypes.includes(listing.propertyType)
      );
    }

    // Amenities
    if (currentFilters.amenities.length > 0) {
      filtered = filtered.filter(listing => 
        currentFilters.amenities.every(amenity => 
          listing.amenities.includes(amenity)
        )
      );
    }

    // Instant Book
    if (currentFilters.instantBook) {
      filtered = filtered.filter(listing => listing.instantBook === true);
    }

    // Minimum Rating
    if (currentFilters.minRating > 0) {
      filtered = filtered.filter(listing => listing.rating >= currentFilters.minRating);
    }

    setFilteredListings(filtered);
  };

  const handleSearch = (newSearchParams) => {
    updateSearchParams(newSearchParams);
  };

  const handleFilterApply = (newFilters) => {
    updateFilters(newFilters);
  };

  const handleReset = () => {
    updateSearchParams({ destination: '', guests: null, startDate: null, endDate: null });
    setFilteredListings(allListings);
    setSearchKey(prev => prev + 1);
  };

  return (
    <div className="home-container">
      <Helmet>
        <title>Hostify - Find your next home away from home</title>
        <meta name="description" content="Discover unique properties around the world. Book your perfect stay with Hostify." />
        <meta property="og:title" content="Hostify - Premium Vacation Rentals" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop" />
      </Helmet>
      <Navbar onSearch={handleSearch} onLogoClick={handleReset} />
      <div style={{ paddingTop: '80px' }}>
        <HeroSearch key={searchKey} onSearch={handleSearch} allLocations={allLocations} />
      </div>

      {/* ========== OPTION 2: Filter Chips with Modal Panel ========== */}
      <main className="main-content" style={{ paddingTop: '10px' }}>
        {/* Filter Button */}
        <div className="filter-bar">
          <div className="filter-left">
            <button className="filter-trigger-btn" onClick={() => setShowFilters(true)}>
              <Sliders size={18} />
              Filters
            </button>
            {searchParams.destination && (
              <button 
                className={`view-toggle-btn ${showMap ? 'active' : ''}`}
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? (
                  <>
                    <List size={18} />
                    Show list
                  </>
                ) : (
                  <>
                    <Map size={18} />
                    Show map
                  </>
                )}
              </button>
            )}
          </div>
          <div className="results-count">
            {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
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
                <Link to={`/rooms/${listingId}`} key={listingId} style={{textDecoration: 'none', color: 'inherit', display: 'block'}}>
                  <ListingCard {...listing} id={listingId} isRecentlyViewed={isRecentlyViewed} />
                </Link>
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
    </div>
  );
};

export default Home;
