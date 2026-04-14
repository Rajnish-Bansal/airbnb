const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  dates: { type: String, required: true }, // e.g. "Dec 12 - Dec 18"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  guests: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 }
  },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Confirmed', 'Pending Approval', 'Cancelled'], 
    default: 'Confirmed' 
  },
  code: { type: String, unique: true },
  payoutStatus: { 
    type: String, 
    enum: ['Pending', 'Released', 'Requested'], 
    default: 'Pending' 
  },
  payoutDate: { type: Date },
  processingFee: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save hook to generate code (BOOK-XXXXX)
const { generateCustomId } = require('../utils/idGenerator');
bookingSchema.pre('save', async function() {
  if (!this.code) {
    this.code = generateCustomId('BOOK');
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
