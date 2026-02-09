import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [activeField, setActiveField] = useState(null);

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch({ 
        destination,
        checkIn,
        checkOut,
        guests
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        {/* Destination */}
        <div 
            className={`search-input-group ${activeField === 'destination' ? 'active' : ''}`}
            onClick={() => setActiveField('destination')}
        >
          <label>Where</label>
          <input 
            type="text" 
            placeholder="Search destinations" 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setActiveField('destination')}
          />
        </div>
        
        <div className="divider"></div>
        
        {/* Check In */}
        <div 
            className={`search-input-group ${activeField === 'checkIn' ? 'active' : ''}`}
            onClick={() => setActiveField('checkIn')}
        >
          <label>Check in</label>
          <input 
            type="text"
            placeholder="Add dates"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            onFocus={(e) => {
                setActiveField('checkIn');
                e.target.type = 'date';
            }}
            onBlur={(e) => {
                if(!e.target.value) e.target.type = 'text';
            }}
          />
        </div>
        
        <div className="divider"></div>
        
        {/* Check Out */}
        <div 
            className={`search-input-group ${activeField === 'checkOut' ? 'active' : ''}`}
            onClick={() => setActiveField('checkOut')}
        >
          <label>Check out</label>
           <input 
            type="text"
            placeholder="Add dates"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            onFocus={(e) => {
                setActiveField('checkOut');
                e.target.type = 'date';
            }}
             onBlur={(e) => {
                if(!e.target.value) e.target.type = 'text';
            }}
          />
        </div>
        
        <div className="divider"></div>
        
        {/* Guests */}
        <div 
            className={`search-input-group ${activeField === 'guests' ? 'active' : ''}`}
            onClick={() => setActiveField('guests')}
        >
          <label>Who</label>
          <input 
            type="text"
            placeholder="Add guests" 
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            onFocus={() => setActiveField('guests')}
          />
          <button className="search-button-large" onClick={(e) => {
              e.stopPropagation();
              handleSearchClick();
          }}>
            <Search size={18} strokeWidth={2.5} color="white" />
          </button>
        </div>
      </div>
      {/* Background overlay to close active state when clicking outside could be added here */}
    </div>
  );
};

export default SearchBar;
