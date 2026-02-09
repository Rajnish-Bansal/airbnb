import React from 'react';
import { X } from 'lucide-react';
import { useSearch } from '../../../context/SearchContext';
import './FilterChips.css';

const FilterChips = ({ onFilterRemove }) => {
  const { filters, updateFilters } = useSearch();

  const hasActiveFilters = () => {
    return (
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 50000 ||
      filters.propertyTypes.length > 0 ||
      filters.amenities.length > 0 ||
      filters.instantBook ||
      filters.minRating > 0
    );
  };

  if (!hasActiveFilters()) return null;

  const removePropertyType = (type) => {
    const newTypes = filters.propertyTypes.filter(t => t !== type);
    const newFilters = { ...filters, propertyTypes: newTypes };
    updateFilters(newFilters);
    onFilterRemove(newFilters);
  };

  const removeAmenity = (amenity) => {
    const newAmenities = filters.amenities.filter(a => a !== amenity);
    const newFilters = { ...filters, amenities: newAmenities };
    updateFilters(newFilters);
    onFilterRemove(newFilters);
  };

  const removePriceRange = () => {
    const newFilters = { ...filters, priceRange: [0, 50000] };
    updateFilters(newFilters);
    onFilterRemove(newFilters);
  };

  const removeInstantBook = () => {
    const newFilters = { ...filters, instantBook: false };
    updateFilters(newFilters);
    onFilterRemove(newFilters);
  };

  const removeRating = () => {
    const newFilters = { ...filters, minRating: 0 };
    updateFilters(newFilters);
    onFilterRemove(newFilters);
  };

  const clearAll = () => {
    const newFilters = {
      priceRange: [0, 50000],
      propertyTypes: [],
      amenities: [],
      instantBook: false,
      minRating: 0,
    };
    updateFilters(newFilters);
    onFilterRemove(newFilters);
  };

  const hasPriceFilter = filters.priceRange[0] > 0 || filters.priceRange[1] < 50000;

  return (
    <div className="filter-chips-container">
      {/* Price Range Chip */}
      {hasPriceFilter && (
        <div className="filter-chip-item">
          ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
          <button onClick={removePriceRange} className="chip-remove">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Property Type Chips */}
      {filters.propertyTypes.map(type => (
        <div key={type} className="filter-chip-item">
          {type}
          <button onClick={() => removePropertyType(type)} className="chip-remove">
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Amenity Chips */}
      {filters.amenities.map(amenity => (
        <div key={amenity} className="filter-chip-item">
          {amenity}
          <button onClick={() => removeAmenity(amenity)} className="chip-remove">
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Instant Book Chip */}
      {filters.instantBook && (
        <div className="filter-chip-item">
          Instant Book
          <button onClick={removeInstantBook} className="chip-remove">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Rating Chip */}
      {filters.minRating > 0 && (
        <div className="filter-chip-item">
          {filters.minRating}+ ★
          <button onClick={removeRating} className="chip-remove">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Clear All Button */}
      <button className="clear-all-chip" onClick={clearAll}>
        Clear all
      </button>
    </div>
  );
};

export default FilterChips;
