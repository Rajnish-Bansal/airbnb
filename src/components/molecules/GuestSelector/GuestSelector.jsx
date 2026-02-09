import React from 'react';
import { Minus, Plus } from 'lucide-react';
import './GuestSelector.css';

const GuestCounter = ({ label, subLabel, count, onIncrement, onDecrement, canDecrement }) => (
  <div className="guest-counter">
    <div className="guest-info">
      <div className="guest-label">{label}</div>
      {subLabel && <div className="guest-sub-label">{subLabel}</div>}
    </div>
    <div className="guest-controls">
      <button 
        className={`counter-btn ${!canDecrement ? 'disabled' : ''}`} 
        onClick={onDecrement}
        disabled={!canDecrement}
      >
        <Minus size={16} />
      </button>
      <span className="count-value">{count}</span>
      <button className="counter-btn" onClick={onIncrement}>
        <Plus size={16} />
      </button>
    </div>
  </div>
);

const GuestSelector = ({ guests, onChange }) => {
  const updateCount = (type, delta) => {
    const newCount = (guests[type] || 0) + delta;
    if (newCount < 0) return;
    onChange({ ...guests, [type]: newCount });
  };

  return (
    <div className="guest-selector-popup">
      <GuestCounter 
        label="Adults" 
        subLabel="Ages 13 or above"
        count={guests.adults || 0}
        onDecrement={() => updateCount('adults', -1)}
        onIncrement={() => updateCount('adults', 1)}
        canDecrement={guests.adults > 0}
      />

      <GuestCounter 
        label="Children" 
        subLabel="Ages 2–12"
        count={guests.children || 0}
        onDecrement={() => updateCount('children', -1)}
        onIncrement={() => updateCount('children', 1)}
        canDecrement={guests.children > 0}
      />
    </div>
  );
};

export default GuestSelector;
