const mongoose = require('mongoose');
require('dotenv').config({ path: 'server/.env' });

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    const Listing = require('./server/models/Listing');
    
    // Add tomorrow and the day after to the blockedDates array
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 2);

    const listing = await Listing.findById('69dffdb2716a9db904a4373d');
    if (listing) {
      listing.blockedDates = [tomorrow, nextDay];
      await listing.save();
      console.log('Successfully added blocked dates for testing:');
      console.log(tomorrow.toISOString());
      console.log(nextDay.toISOString());
    } else {
      console.log('Listing not found');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
