import React, { useState } from 'react';
import './FilterPanel.css';
import { X, Sliders } from 'lucide-react';
import { useSearch } from '../../../context/SearchContext';

const FilterPanel = ({ isOpen, onClose, onApply, availablePropertyTypes }) => {
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

  const propertyTypes = availablePropertyTypes && availablePropertyTypes.length > 0
    ? availablePropertyTypes
    : [
      'Apartment/Flat',
      'Studio',
      'Villa (Luxury)',
      'House (Standard)',
    ];

  const handlePriceChange = (index, value) => {
    const newRange = [...localFilters.priceRange];
    newRange[index] = parseInt(value);
    setLocalFilters({ ...localFilters, priceRange: newRange });
  };

  const toggleAmenity = (amenity) => {
    const newAmenities = localFilters.amenities.includes(amenity)
      ? localFilters.amenities.filter(a => a !== amenity)
      : [...localFilters.amenities, amenity];
    setLocalFilters({ ...localFilters, amenities: newAmenities });
  };

  const togglePropertyType = (type) => {
    const newTypes = localFilters.propertyTypes.includes(type)
      ? localFilters.propertyTypes.filter(t => t !== type)
      : [...localFilters.propertyTypes, type];
    setLocalFilters({ ...localFilters, propertyTypes: newTypes });
  };

  const handleApply = () => {
    updateFilters(localFilters);
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    setLocalFilters({
      priceRange: [0, 50000],
      propertyTypes: [],
      amenities: [],
      instantBook: false,
      minRating: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="filter-overlay" onClick={onClose}></div>
      <div className="filter-panel">
        <div className="filter-header">
          <h2><Sliders size={24} /> Filters</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="filter-content">
          {/* Price Range */}
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <div className="price-input-group">
                <label>Min Price</label>
                <input
                  type="number"
                  value={localFilters.priceRange[0]}
                  onChange={(e) => handlePriceChange(0, e.target.value)}
                  placeholder="₹0"
                />
              </div>
              <div className="price-separator">-</div>
              <div className="price-input-group">
                <label>Max Price</label>
                <input
                  type="number"
                  value={localFilters.priceRange[1]}
                  onChange={(e) => handlePriceChange(1, e.target.value)}
                  placeholder="₹50000"
                />
              </div>
            </div>
            <div className="price-range-slider">
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={localFilters.priceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="range-min"
              />
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={localFilters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="range-max"
              />
            </div>
            <div className="price-display">
              ₹{localFilters.priceRange[0].toLocaleString()} - ₹{localFilters.priceRange[1].toLocaleString()}
            </div>
          </div>

          {/* Property Type */}
          <div className="filter-section">
            <h3>Property Type</h3>
            <div className="filter-chips">
              {propertyTypes.map(type => (
                <button
                  key={type}
                  className={`filter-chip ${localFilters.propertyTypes.includes(type) ? 'active' : ''}`}
                  onClick={() => togglePropertyType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="filter-section">
            <h3>Amenities</h3>
            <div className="filter-checkboxes">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="checkbox-label">
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
          <div className="filter-section">
            <label className="checkbox-label instant-book">
              <input
                type="checkbox"
                checked={localFilters.instantBook}
                onChange={(e) => setLocalFilters({ ...localFilters, instantBook: e.target.checked })}
              />
              <span>
                <strong>Instant Book</strong>
                <p>Listings you can book without waiting for host approval</p>
              </span>
            </label>
          </div>

          {/* Minimum Rating */}
          <div className="filter-section">
            <h3>Minimum Rating</h3>
            <div className="rating-options">
              {[0, 3, 4, 4.5].map(rating => (
                <button
                  key={rating}
                  className={`rating-btn ${localFilters.minRating === rating ? 'active' : ''}`}
                  onClick={() => setLocalFilters({ ...localFilters, minRating: rating })}
                >
                  {rating === 0 ? 'Any' : `${rating}+ ★`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-footer">
          <button className="reset-btn" onClick={handleReset}>
            Clear All
          </button>
          <button className="apply-btn" onClick={handleApply}>
            Show Results
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
