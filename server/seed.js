require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/Listing');

// We need a way to get the data from the frontend mock file.
// Since mockListings.js uses ES modules and imports images, we'll recreate a clean version for seeding.

const seedData = [
  { 
    location: 'Goa, India', 
    distance: '500 km away', 
    price: 12500, 
    rating: 4.85, 
    reviewsCount: 124,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop',
    description: "Relax in this stunning beachfront villa with private pool access and panoramic ocean views. Perfect for a tropical getaway.",
    host: { name: "Rohan", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop" },
    amenities: ["WiFi", "Pool", "Air Conditioning", "Kitchen"],
    maxGuests: 6,
    propertyType: "Villa",
    instantBook: true,
    coordinates: { lat: 15.2993, lng: 74.1240 },
    availableFrom: "2025-01-01",
    availableTo: "2026-12-31"
  },
  { 
    location: 'Manali, India', 
    distance: '320 km away', 
    price: 8500, 
    rating: 4.92, 
    reviewsCount: 86,
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1000&auto=format&fit=crop',
    description: "Cozy wooden cottage nestled in the Himalayas. Experience snow-capped peaks and warm fireside evenings.",
    host: { name: "Priya", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop" },
    amenities: ["WiFi", "Parking"],
    maxGuests: 4,
    propertyType: "Cottage",
    instantBook: false,
    coordinates: { lat: 32.2396, lng: 77.1887 },
    availableFrom: "2025-01-01",
    availableTo: "2026-12-31"
  },
  { 
    location: 'Kerala, India', 
    distance: '1,200 km away', 
    price: 15400, 
    rating: 4.96, 
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=1000&auto=format&fit=crop',
    description: "Traditional houseboat stay on the serene backwaters of Alleppey. Includes full board meals and sunset cruise.",
    host: { name: "Anand", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" },
    amenities: ["Air Conditioning", "Kitchen"],
    maxGuests: 2,
    propertyType: "Boat",
    instantBook: true,
    coordinates: { lat: 9.4981, lng: 76.3388 },
    availableFrom: "2025-01-01",
    availableTo: "2026-12-31"
  },
  { 
    location: 'Jaipur, Rajasthan', 
    distance: '260 km away', 
    price: 6500, 
    rating: 4.88, 
    reviewsCount: 156,
    image: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=1000&auto=format&fit=crop',
    description: "Heritage haveli room in the heart of the Pink City. Walk to Hawa Mahal and City Palace.",
    host: { name: "Vikram", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop" },
    amenities: ["WiFi", "Air Conditioning"],
    maxGuests: 3,
    propertyType: "House",
    instantBook: false,
    coordinates: { lat: 26.9124, lng: 75.7873 },
    availableFrom: "2025-01-01",
    availableTo: "2026-12-31"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    await Listing.deleteMany({});
    console.log('🗑️  Old listings cleared.');

    await Listing.insertMany(seedData);
    console.log('🌱 Data seeded successfully!');

    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
