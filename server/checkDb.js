require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/Listing');

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Listing.countDocuments();
    console.log(`Database connects successfully to ${process.env.MONGODB_URI}`);
    console.log(`Number of listings in DB: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
