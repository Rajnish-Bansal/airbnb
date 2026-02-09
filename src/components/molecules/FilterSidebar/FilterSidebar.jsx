import React, { useState } from 'react';
import './FilterSidebar.css';
import { useSearch } from '../../../context/SearchContext';

const FilterSidebar = ({ onApply }) => {
  const { filters, updateFilters, resetFilters } = useSearch();
  const [localFilters, setLocalFilters] = useState(filters);

  const amenitiesList = [
    'WiFi',
    'Kitchen',
    'Parking',
    'Pool',
    'Air Conditioning',
    'Washer',
    'Dryer',
    'TV',
    'Gym',
    'Hot Tub',
  ];

  const propertyTypes = [
    'Apartment',
    'House',
    'Villa',
    'Cabin',
    'Cottage',
    'Loft',
    'Treehouse',
    'Boat',
  ];

  const handlePriceChange = (index, value) => {
    const newRange = [...localFilters.priceRange];
    newRange[index] = parseInt(value) || 0;
    const newFilters = { ...localFilters, priceRange: newRange };
    setLocalFilters(newFilters);
    updateFilters(newFilters);
    onApply(newFilters);
  };

  const toggleAmenity = (amenity) => {
    const newAmenities = localFilters.amenities.includes(amenity)
      ? localFilters.amenities.filter(a => a !== amenity)
      : [...localFilters.amenities, amenity];
    const newFilters = { ...localFilters, amenities: newAmenities };
    setLocalFilters(newFilters);
    updateFilters(newFilters);
    onApply(newFilters);
  };

  const togglePropertyType = (type) => {
    const newTypes = localFilters.propertyTypes.includes(type)
      ? localFilters.propertyTypes.filter(t => t !== type)
      : [...localFilters.propertyTypes, type];
    const newFilters = { ...localFilters, propertyTypes: newTypes };
    setLocalFilters(newFilters);
    updateFilters(newFilters);
    onApply(newFilters);
  };

  const handleInstantBookChange = (checked) => {
    const newFilters = { ...localFilters, instantBook: checked };
    setLocalFilters(newFilters);
    updateFilters(newFilters);
    onApply(newFilters);
  };

  const handleRatingChange = (rating) => {
    const newFilters = { ...localFilters, minRating: rating };
    setLocalFilters(newFilters);
    updateFilters(newFilters);
    onApply(newFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      priceRange: [0, 50000],
      propertyTypes: [],
      amenities: [],
      instantBook: false,
      minRating: 0,
    };
    setLocalFilters(defaultFilters);
    resetFilters();
    onApply(defaultFilters);
  };

  return (
    <div className="filter-sidebar">
      <div className="sidebar-header">
        <h3>Filters</h3>
        <button className="reset-filters-btn" onClick={handleReset}>
          Clear all
        </button>
      </div>

      <div className="sidebar-content">
        {/* Price Range */}
        <div className="sidebar-section">
          <h4>Price Range</h4>
          <div className="price-inputs-sidebar">
            <div className="price-input-group-sidebar">
              <label>Min</label>
              <input
                type="number"
                value={localFilters.priceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                placeholder="₹0"
              />
            </div>
            <span className="price-separator-sidebar">-</span>
            <div className="price-input-group-sidebar">
              <label>Max</label>
              <input
                type="number"
                value={localFilters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                placeholder="₹50000"
              />
            </div>
          </div>
          <div className="price-display-sidebar">
            ₹{localFilters.priceRange[0].toLocaleString()} - ₹{localFilters.priceRange[1].toLocaleString()}
          </div>
        </div>

        {/* Property Type */}
        <div className="sidebar-section">
          <h4>Property Type</h4>
          <div className="sidebar-chips">
            {propertyTypes.map(type => (
              <button
                key={type}
                className={`sidebar-chip ${localFilters.propertyTypes.includes(type) ? 'active' : ''}`}
                onClick={() => togglePropertyType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="sidebar-section">
          <h4>Amenities</h4>
          <div className="sidebar-checkboxes">
            {amenitiesList.map(amenity => (
              <label key={amenity} className="sidebar-checkbox-label">
                <input
                  type="checkbox"
                  checked={localFilters.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Instant Book */}
        <div className="sidebar-section">
          <label className="sidebar-checkbox-label instant-book-sidebar">
            <input
              type="checkbox"
              checked={localFilters.instantBook}
              onChange={(e) => handleInstantBookChange(e.target.checked)}
            />
            <span>
              <strong>Instant Book</strong>
              <p>Book without waiting for host approval</p>
            </span>
          </label>
        </div>

        {/* Minimum Rating */}
        <div className="sidebar-section">
          <h4>Minimum Rating</h4>
          <div className="sidebar-rating-options">
            {[0, 3, 4, 4.5].map(rating => (
              <button
                key={rating}
                className={`sidebar-rating-btn ${localFilters.minRating === rating ? 'active' : ''}`}
                onClick={() => handleRatingChange(rating)}
              >
                {rating === 0 ? 'Any' : `${rating}+ ★`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
