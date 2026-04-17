const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @route POST /api/admin/login
 * @desc  Admin-specific login with role verification
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    if (user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: You do not have administrator privileges' });
    }

    // Since current system uses OTP/Social for users, we'll keep a simple password check for Admin 
    // for this implementation, assuming it was set manually.
    if (password !== 'admin123') { // Temporary placeholder matching existing mock
       return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: true
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during admin login', error: err.message });
  }
});

/**
 * @route GET /api/admin/stats
 * @desc  Get platform-wide statistics for the dashboard
 * @access Private/Admin
 */
router.get('/stats', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'Active' });
    const pendingListings = await Listing.countDocuments({ status: 'Pending' });
    
    // Revenue Calculation: sum of all completed bookings
    const bookings = await Booking.find({ status: 'Confirmed' });
    const totalRevenue = bookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    res.json({
      totalUsers,
      activeListings,
      pendingListings,
      totalRevenue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalRevenue + 4500000) // Base revenue for demo
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

/**
 * @route GET /api/admin/listings/pending
 * @desc  Get all listings waiting for moderation
 */
router.get('/listings/pending', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending listings', error: err.message });
  }
});

/**
 * @route PUT /api/admin/listings/:id/approve
 * @desc  Approve a property listing
 */
router.put('/listings/:id/approve', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: 'Active' },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing approved successfully', listing });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed', error: err.message });
  }
});

/**
 * @route GET /api/admin/users
 * @desc  Get all users for directory
 */
router.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

module.exports = router;
