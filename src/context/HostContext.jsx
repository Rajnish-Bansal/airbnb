import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const HostContext = createContext();

const initialListingData = {
  id: null,
  step: 1, // Track current step
  category: '',
  type: '',
  placeType: 'entire',
  location: '',
  guests: 4,
  bedrooms: 1,
  bathrooms: 1,
  beds: 1,
  isMultiUnit: false,
  unitCount: 1,
  amenities: [],
  title: '',
  description: '',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  houseRules: {
    smoking: false,
    events: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  },
  cancellationPolicy: {
    fullRefundDays: 1,
    fullRefundUnit: 'days',
    partialRefundDays: 0,
    partialRefundUnit: 'days',
    partialRefundPercent: 50,
  },
  minStay: 1,
  maxStay: 365,
  instantBooking: false,
  sharedSpaces: {
    privateBathroom: true,
    sharedKitchen: true,
    sharedLivingRoom: true,
    otherSpaces: '',
  },
  hostPresence: {
    hostPresent: false,
    roommatesPresent: false,
    accessHours: '24/7',
  },
  guestRequirements: {
    verifiedID: true,
    positiveReviews: false,
  },
  price: '',
  weekendPrice: '',
  roomCategory: '',
  rooms: [],
  photos: [],
  address: {
    apt: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  },
  coordinates: {
    lat: 28.6139,
    lng: 77.2090
  },
  notification: null
};

// Helper to get initial listings from localStorage or fallback to mock data
const getInitialListings = () => {
  try {
    const saved = localStorage.getItem('host_listings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Filter out null/undefined or invalid objects to prevent excessive crashes
        const validListings = parsed.map(l => {
           // Ensure basic fields exist
           if (!l || typeof l !== 'object') return null;
           
           // Sanitize photos: if they were files, they are now empty objects. 
           // If they were objects with url, keep them if url is string.
           // Ideally we should have uploaded them, but for now we'll just try to salvage what we can or empty the array.
           let sanitizedPhotos = [];
           if (Array.isArray(l.photos)) {
             sanitizedPhotos = l.photos.filter(p => {
               if (typeof p === 'string') return true;
               if (p && typeof p === 'object' && p.url && typeof p.url === 'string') return true;
               return false;
             });
           }

           // Normalize types for UI consistency
           let type = l.type;
           if (type === 'Apartment') type = 'Apartment/Flat';
           if (type === 'Villa') type = 'Villa (Luxury)';
           if (type === 'Home' || type === 'Cabin') type = 'House (Standard)';

           return {
             ...l,
             type,
             photos: sanitizedPhotos,
             // Ensure ID exists
             id: l.id || Date.now() + Math.random(),
             // Ensure status exists
             status: l.status || 'In Progress',
             rating: l.rating || (l.id === 1700001 ? 4.8 : l.id === 1700002 ? 4.9 : l.id === 1700003 ? 4.7 : 0),
             reviewsCount: l.reviewsCount || (l.id === 1700001 ? 12 : l.id === 1700002 ? 24 : l.id === 1700003 ? 8 : 0)
           };
        }).filter(Boolean);

        if (validListings.length > 0) {
           return validListings;
        }
      }
    }
  } catch (err) {
    console.error("Error parsing host listings from localStorage:", err);
    // Continue to fallback
  }
  
  return [
    {
      id: 1700001,
      hostId: 1,
      title: "Cozy Apartment in Connaught Place",
      type: "Apartment/Flat",
      location: "New Delhi, India",
      price: 4500,
      status: "Active",
      rating: 4.8,
      reviewsCount: 12,
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"]
    },
    {
      id: 1700002,
      hostId: 1,
      title: "Mountain Retreat in Manali",
      type: "House (Standard)",
      location: "Manali, Himachal Pradesh",
      price: 8500,
      status: "Active",
      rating: 4.9,
      reviewsCount: 24,
      createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      photos: ["https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"]
    },
    {
      id: 1700003,
      hostId: 1,
      title: "Heritage Havel in Jaipur",
      type: "House (Standard)",
      location: "Jaipur, Rajasthan",
      price: 15000,
      status: "Active",
      rating: 4.7,
      reviewsCount: 8,
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      photos: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"]
    },
    {
      id: 1700004,
      hostId: 1,
      title: "Luxury Seaside Villa",
      type: "Villa (Luxury)", // Changed from Hotel
      location: "Goa, India",
      price: 12000,
      status: "Payment Required",
      createdAt: new Date().toISOString(),
      photos: ["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"]
    }
  ];
};


export const HostProvider = ({ children }) => {
  const { user } = useAuth();
  const [listingData, setListingData] = useState(initialListingData);
  const [allListings, setListings] = useState(getInitialListings);

  const filteredListings = user 
    ? allListings
        .filter(l => (l.hostId || 1) === user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  // Persist listings to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('host_listings', JSON.stringify(allListings));
  }, [allListings]);
  
  const updateListingData = (updates) => {
    setListingData(prev => ({ ...prev, ...updates }));
  };

  const loadListingForEdit = (listing) => {
    setListingData({
      ...initialListingData, // Reset first to ensure structure
      ...listing,
      notification: null
    });
  };

  const publishListing = () => {
    if (listingData.id) {
       // Update existing - status becomes Pending for approval
       const updatedListing = { ...listingData, status: 'Pending' };
       setListings(prev => prev.map(l => l.id === listingData.id ? updatedListing : l));
       return updatedListing;
    } else {
       // Create new - status becomes Pending for approval
       const newListing = {
         ...listingData,
         id: Date.now(),
         status: 'Pending', 
         createdAt: new Date().toISOString(),
         hostId: user?.id
       };
       setListings(prev => [...prev, newListing]);
       return newListing;
    }
  };

  const approveListing = (id) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Payment Required' } : l));
  };

  const rejectListing = (id) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
  };

  const saveDraft = (currentStep) => {
    // Requirements removed so user can save anytime
    const dataToSave = {
      ...listingData,
      step: currentStep || listingData.step || 1
    };

    if (listingData.id) {
       // Update existing draft
       setListings(prev => prev.map(l => l.id === listingData.id ? dataToSave : l));
    } else {
       // Create new draft
       const newId = Date.now();
       const newListing = {
         ...dataToSave,
         id: newId,
         status: 'In Progress',
         createdAt: new Date().toISOString(),
         hostId: user?.id
       };
       setListingData(prev => ({ ...prev, id: newId, step: dataToSave.step }));
       setListings(prev => [...prev, newListing]);
    }
  };

  const updateListingStatus = (id, newStatus) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const deleteListing = (id) => {
    // Confirmation handled by UI modal
    console.log("Deleting listing with ID:", id);
    setListings(prev => prev.filter(l => l.id != id));
  };

  const extendSubscription = (id) => {
    setListings(prev => prev.map(l => {
      if (l.id === id) {
         const now = new Date();
         const created = new Date(l.createdAt || now);
         const currentExpiry = new Date(created);
         currentExpiry.setFullYear(created.getFullYear() + 1);

         let newCreatedAt;
         if (currentExpiry > now) {
            // If still active, extend from current expiry
            newCreatedAt = currentExpiry.toISOString();
         } else {
            // If expired, start fresh from now
            newCreatedAt = now.toISOString();
         }
         
         return { ...l, createdAt: newCreatedAt, status: 'Active' };
      }
      return l;
    }));
  };

  const resetListingData = () => {
    setListingData(initialListingData);
  };

  return (
    <HostContext.Provider value={{ 
      listingData, 
      updateListingData, 
      listings: filteredListings, 
      publishListing, 
      saveDraft,
      updateListingStatus,
      loadListingForEdit,
      deleteListing,
      resetListingData,
      approveListing,
      rejectListing,
      extendSubscription
    }}>
      {children}
    </HostContext.Provider>
  );
};

export const useHost = () => useContext(HostContext);
