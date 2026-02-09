import React from 'react';
import Navbar from '../components/organisms/Navbar/Navbar';
import HeroSearch from '../components/molecules/HeroSearch/HeroSearch';
import Categories from '../components/molecules/Categories/Categories';
import ListingCard from '../components/molecules/ListingCard/ListingCard';
import FilterPanel from '../components/molecules/FilterPanel/FilterPanel';
// import FilterSidebar from '../components/molecules/FilterSidebar/FilterSidebar'; // Option 3: Always-visible sidebar
import FilterChips from '../components/molecules/FilterChips/FilterChips';
import MapView from '../components/molecules/MapView/MapView';
import './Home.css';

import { mockListings } from '../data/mockListings';
import { Link } from 'react-router-dom';
import { Sliders, Map, List } from 'lucide-react';
import { useSearch } from '../context/SearchContext';

const Home = () => {
  const [filteredListings, setFilteredListings] = React.useState(mockListings);
  const [searchKey, setSearchKey] = React.useState(0);
  const [showFilters, setShowFilters] = React.useState(false);
  const [showMap, setShowMap] = React.useState(false);
  const { filters, recentlyViewed, searchParams, updateSearchParams, updateFilters } = useSearch();
  
  // Automatically hide map when search is cleared
  React.useEffect(() => {
    if (!searchParams.destination && showMap) {
      setShowMap(false);
    }
  }, [searchParams.destination, showMap]);

  // Sync filtered listings with context on mount and when filters/params change
  React.useEffect(() => {
    applyFilters(searchParams, filters);
  }, [searchParams, filters]);
  
  // Extract unique locations for autocomplete
  const allLocations = [...new Set(mockListings.map(item => item.location))];

  const applyFilters = (searchParams, currentFilters) => {
    const { destination, guests, startDate, endDate } = searchParams;
    
    let filtered = mockListings;

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
        return listing.availableFrom <= startDate && listing.availableTo >= endDate;
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
    applyFilters(newSearchParams, filters);
  };

  const handleFilterApply = (newFilters) => {
    updateFilters(newFilters);
    applyFilters(searchParams, newFilters);
  };

  const handleReset = () => {
    updateSearchParams({ destination: '', guests: null, startDate: null, endDate: null });
    setFilteredListings(mockListings);
    setSearchKey(prev => prev + 1);
  };

  return (
    <div className="home-container">
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
              const isRecentlyViewed = recentlyViewed.some(item => item.id === listing.id);
              return (
                <Link to={`/rooms/${listing.id}`} key={listing.id} style={{textDecoration: 'none', color: 'inherit', display: 'block'}}>
                  <ListingCard {...listing} isRecentlyViewed={isRecentlyViewed} />
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
