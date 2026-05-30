const mongoose = require('mongoose');
const Listing = require('./models/Listing');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fetch the first listing from the database
    const listing = await Listing.findOne({ isDeleted: { $ne: true } });
    if (!listing) {
      console.log('No listing found.');
      process.exit(0);
    }

    // Set createdAt to 2 months ago
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 2);

    listing.createdAt = pastDate;
    await listing.save();

    console.log(`Updated listing '${listing.title}' to have createdAt = 2 months ago (${pastDate.toISOString()}).`);
    console.log('This listing will now appear as expired and inactive.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
