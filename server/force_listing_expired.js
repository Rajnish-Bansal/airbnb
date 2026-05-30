const mongoose = require('mongoose');
const Listing = require('./models/Listing');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Past date (e.g. 2 months ago)
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 2);

    // Let's use updateOne to completely bypass the timestamps hooks
    const result = await Listing.updateOne(
      { title: "Seashore Heritage Villa" },
      { $set: { createdAt: pastDate } }
    );

    console.log('Update result:', result);

    const updated = await Listing.findOne({ title: "Seashore Heritage Villa" }).select('createdAt');
    console.log('Updated createdAt is now:', updated.createdAt);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
