const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', index: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
  type: { 
    type: String, 
    enum: ['Credit', 'Debit'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['Booking', 'Payout', 'Subscription', 'Refund', 'Fee'], 
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled'], 
    default: 'Completed' 
  },
  description: { type: String },
  metadata: {
    bookingCode: String,
    propertyName: String,
    guestName: String,
    payoutDate: Date,
    planName: String
  },
  displayId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

// Pre-save hook to generate displayId
const { generateCustomId } = require('../utils/idGenerator');
transactionSchema.pre('save', async function() {
  if (!this.displayId) {
    this.displayId = generateCustomId('TX');
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
