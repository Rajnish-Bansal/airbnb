const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route POST /api/bookings
 * @desc  Create a new booking with overlap check
 * @access Private
 */
router.post('/', authenticateToken, async (req, res) => {
  const { listingId, startDate, endDate, guests, totalPrice } = req.body;

  try {
    // 1. Basic validation
    if (!listingId || !startDate || !endDate || !totalPrice) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // 2. Overlap Check (Atomic logic)
    // Overlap condition: (StartA < EndB) AND (EndA > StartB)
    const existingBooking = await Booking.findOne({
      listing: listingId,
      status: 'Confirmed',
      $or: [
        {
          startDate: { $lt: end },
          endDate: { $gt: start }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ 
        message: 'These dates are already booked. Please choose different dates.' 
      });
    }

    // 3. Create Booking
    const payoutDate = new Date(start);
    payoutDate.setHours(payoutDate.getHours() + 24);

    const newBooking = new Booking({
      user: req.user.id,
      listing: listingId,
      dates: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      startDate: start,
      endDate: end,
      guests,
      totalPrice,
      status: 'Confirmed', 
      code: 'RES-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      payoutDate: payoutDate,
      processingFee: totalPrice * 0.03 // Default 3% estimate
    });

    await newBooking.save();
    res.status(201).json(newBooking);

  } catch (err) {
    console.error('[Booking Error]:', err);
    res.status(500).json({ message: 'Server error during booking', error: err.message });
  }
});

/**
 * @route GET /api/bookings/my-trips
 * @desc  Get bookings for current guest
 * @access Private
 */
router.get('/my-trips', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('listing')
      .sort({ startDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trips', error: err.message });
  }
});

module.exports = router;
