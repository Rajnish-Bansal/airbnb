const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/users/profile
 * @desc  Get current user profile
 * @access Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route PUT /api/users/profile
 * @desc  Update user profile
 * @access Private
 */

router.put('/profile', authenticateToken, async (req, res) => {
  const { name, email, phone, bio, avatar, password } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (password) user.password = password;

    await user.save();
    
    // Return updated user (without password)
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email or phone already in use' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route POST /api/users/wishlist/:listingId
 * @desc  Toggle a listing in the user's wishlist
 * @access Private
 */
router.post('/wishlist/:listingId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { listingId } = req.params;
    const wishlistIndex = user.wishlist.findIndex(id => id.toString() === listingId);

    if (wishlistIndex > -1) {
      // Remove from wishlist
      user.wishlist.splice(wishlistIndex, 1);
    } else {
      // Add to wishlist
      user.wishlist.push(listingId);
    }

    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route GET /api/users/wishlist
 * @desc  Get the user's full wishlist with populated properties
 * @access Private
 */
router.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
