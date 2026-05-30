const mongoose = require('mongoose');
require('dotenv').config({ path: 'server/.env' });

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    const Listing = require('./server/models/Listing');
    
    // Dates in June to block
    const d1 = new Date('2026-06-15T12:00:00Z');
    const d2 = new Date('2026-06-16T12:00:00Z');
    const d3 = new Date('2026-06-17T12:00:00Z');

    const listing = await Listing.findById('69dffdb2716a9db904a4373d');
    if (listing) {
      listing.blockedDates.push(d1, d2, d3);
      await listing.save();
      console.log('Successfully added June blocked dates for testing:');
      console.log(d1.toISOString());
      console.log(d2.toISOString());
      console.log(d3.toISOString());
    } else {
      console.log('Listing not found');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
