import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Create custom marker icons
const createCustomIcon = (price, isHovered = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin ${isHovered ? 'hovered' : ''}">
        <div class="marker-price">₹${price.toLocaleString()}</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Component to handle map updates
const MapUpdater = ({ listings }) => {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0) return;

    // Calculate bounds of all listings
    const bounds = L.latLngBounds(
      listings.map(l => [l.coordinates.lat, l.coordinates.lng])
    );

    // Fit map to show all markers with padding
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: listings.length === 1 ? 12 : 10, // Zoom closer if single property
      animate: true,
      duration: 1
    });
  }, [listings, map]);

  return null;
};

const MapView = ({ listings }) => {
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [closeTimeout, setCloseTimeout] = useState(null);

  // Calculate center of all listings
  const center = listings.length > 0
    ? {
        lat: listings.reduce((sum, l) => sum + l.coordinates.lat, 0) / listings.length,
        lng: listings.reduce((sum, l) => sum + l.coordinates.lng, 0) / listings.length,
      }
    : { lat: 20.5937, lng: 78.9629 }; // Center of India as fallback

  const handleMouseOver = (listingId, marker) => {
    // Clear any pending close timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setHoveredMarkerId(listingId);
    marker.target.openPopup();
  };

  const handleMouseOut = (marker) => {
    // Delay closing to allow user to move mouse to popup
    const timeout = setTimeout(() => {
      setHoveredMarkerId(null);
      marker.target.closePopup();
    }, 200); // 200ms delay
    setCloseTimeout(timeout);
  };

  return (
    <div className="map-view-container">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={5}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Auto-zoom component */}
        <MapUpdater listings={listings} />
        
        {listings.map(listing => (
          <Marker
            key={listing.id}
            position={[listing.coordinates.lat, listing.coordinates.lng]}
            icon={createCustomIcon(listing.price, hoveredMarkerId === listing.id)}
            eventHandlers={{
              mouseover: (e) => handleMouseOver(listing.id, e),
              mouseout: (e) => handleMouseOut(e)
            }}
          >
            <Popup 
              className="custom-popup" 
              closeButton={false}
              autoPan={false}
            >
              <Link 
                to={`/rooms/${listing.id}`} 
                className="map-popup-link"
                onMouseEnter={() => {
                  // Keep popup open when hovering over it
                  if (closeTimeout) {
                    clearTimeout(closeTimeout);
                    setCloseTimeout(null);
                  }
                }}
              >
                <div className="map-popup-content">
                  <img src={listing.image} alt={listing.location} className="popup-image" />
                  <div className="popup-info">
                    <h4>{listing.location}</h4>
                    <div className="popup-rating">
                      <Star size={12} fill="#222" />
                      <span>{listing.rating}</span>
                      <span className="reviews-count">({listing.reviewsCount})</span>
                    </div>
                    <p className="popup-price">₹{listing.price.toLocaleString()} / night</p>
                  </div>
                </div>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
