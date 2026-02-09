import React from 'react';
import { Palmtree, Mountain, Umbrella, Tent, Castle, Ship, Snowflake, Fan } from 'lucide-react';
import './Categories.css';

const categories = [
  { label: 'Tropical', icon: Palmtree },
  { label: 'Amazing views', icon: Mountain },
  { label: 'Beachfront', icon: Umbrella },
  { label: 'Camping', icon: Tent },
  { label: 'Castles', icon: Castle },
  { label: 'Boats', icon: Ship },
  { label: 'Arctic', icon: Snowflake },
  { label: 'Windmills', icon: Fan },
  { label: 'Tropical', icon: Palmtree },
  { label: 'Amazing views', icon: Mountain },
  { label: 'Beachfront', icon: Umbrella },
  { label: 'Camping', icon: Tent },
  { label: 'Castles', icon: Castle },
  { label: 'Boats', icon: Ship },
  { label: 'Arctic', icon: Snowflake },
  { label: 'Windmills', icon: Fan },
];

const Categories = () => {
  return (
    <div className="categories-container">
      <div className="categories-list">
        {categories.map((item, index) => (
          <div key={index} className="category-item">
            <item.icon size={24} strokeWidth={1.5} className="category-icon" />
            <span className="category-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
