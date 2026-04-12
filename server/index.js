require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Listing = require('./models/Listing');
const User = require('./models/User');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const bookingRoutes = require('./routes/bookings');
const { syncAllCalendars } = require('./services/syncService');
const payoutRoutes = require('./routes/payouts');
const analyticsRoutes = require('./routes/analytics');
const conversationRoutes = require('./routes/conversations');

const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/host/payouts', payoutRoutes);
app.use('/api/host/analytics', analyticsRoutes);
app.use('/api/conversations', conversationRoutes);

const { scrapeAirbnb } = require('./services/scraper');

// 1. Listings
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await Listing.find();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listings', error: err.message });
  }
});

app.post('/api/listings/import-airbnb', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'URL is required' });

  try {
    console.log(`[API] Starting import for: ${url}`);
    const data = await scrapeAirbnb(url);
    res.json(data);
  } catch (err) {
    console.error('[API] Import failed:', err.message);
    res.status(500).json({ message: 'Failed to import listing', error: err.message });
  }
});

app.post('/api/listings/sync', async (req, res) => {
  try {
    await syncAllCalendars();
    res.json({ message: 'Synchronization triggered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Sync failed', error: err.message });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listing', error: err.message });
  }
});

app.put('/api/listings/:id/pricing', async (req, res) => {
  const { weekendPrice, discounts } = req.body;
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { weekendPrice, discounts },
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Error updating pricing', error: err.message });
  }
});

// 2. Search & Filter
app.get('/api/search', async (req, res) => {
  const { location, guests, type, lat, lng } = req.query;
  const query = {};
  
  if (location && !lat) query.location = new RegExp(location, 'i');
  if (guests) query.maxGuests = { $gte: parseInt(guests) };
  if (type) query.propertyType = type;

  // Spatial search if coordinates provided
  if (lat && lng) {
    query.location_geo = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: 50000 // 50km radius
      }
    };
  }

  try {
    const listings = await Listing.find(query);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

// 3. Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// --- Socket.io Events ---
io.on('connection', (socket) => {
  console.log(`[Socket] New client connected: ${socket.id}`);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`[Socket] User joined conversation: ${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    // data: { conversationId, senderId, text, timestamp }
    try {
      // 1. Persist to Message model
      const newMessage = new Message({
        conversationId: data.conversationId,
        sender: data.senderId,
        text: data.text,
        timestamp: data.timestamp
      });
      await newMessage.save();

      // 2. Update last message in Conversation
      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: data.text,
        updatedAt: new Date()
      });

      // 3. Emit to clients in the room
      io.to(data.conversationId).emit('receive_message', data);
      console.log(`[Socket] Message saved & emitted in ${data.conversationId}: ${data.text}`);
    } catch (err) {
      console.error('[Socket] Error saving message:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Client disconnected');
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server + Real-time Messaging running on http://0.0.0.0:${PORT}`);
});
