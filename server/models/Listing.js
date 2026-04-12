const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  location: { type: String, required: true },
  distance: { type: String },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  image: { type: String },
  photos: [
    {
      id: { type: String },
      url: { type: String, required: true },
      category: { type: String }
    }
  ],
  description: { type: String },
  host: {
    name: { type: String },
    image: { type: String }
  },
  amenities: [{ type: String }],
  maxGuests: { type: Number },
  propertyType: { type: String },
  instantBook: { type: Boolean, default: false },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  location_geo: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  },
  reviews: [
    {
      user: { type: String },
      date: { type: String },
      rating: { type: Number },
      comment: { type: String },
      avatar: { type: String },
      ratings: {
        cleanliness: { type: Number, default: 5 },
        accuracy: { type: Number, default: 5 },
        communication: { type: Number, default: 5 },
        location: { type: Number, default: 5 },
        checkin: { type: Number, default: 5 },
        value: { type: Number, default: 5 }
      }
    }
  ],
  availableFrom: { type: Date },
  availableTo: { type: Date },
  icalUrl: { type: String, default: '' },
  weekendPrice: { type: Number },
  discounts: {
    weekly: { type: Number, default: 0 },   // Percentage
    monthly: { type: Number, default: 0 }   // Percentage
  }
}, { timestamps: true });

// Index for search optimization
listingSchema.index({ location: 'text', description: 'text' });
listingSchema.index({ location_geo: '2dsphere' });

module.exports = mongoose.model('Listing', listingSchema);
