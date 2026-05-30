const mongoose = require('mongoose');
const Listing = require('./models/Listing');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const listings = await Listing.find({ isDeleted: { $ne: true } });
    console.log(`Found ${listings.length} active/undeleted listings.`);

    if (listings.length === 0) {
      console.log('No listings to update.');
      process.exit(0);
    }

    // Convert some to Inactive and some to Payment Required
    // For example, if we have N listings:
    // We can mark the 1st one as 'Inactive', 
    // the 2nd one as 'Payment Required' or 'Pending'.
    // The user requested: "convert some to inactive and some to payment pending"
    // Let's change the first one to 'Inactive', second to 'Payment Required'.

    if (listings.length >= 1) {
      listings[0].status = 'Inactive';
      await listings[0].save();
      console.log(`Updated listing ${listings[0]._id} (${listings[0].title}) status to 'Inactive'.`);
    }

    if (listings.length >= 2) {
      listings[1].status = 'Payment Required';
      await listings[1].save();
      console.log(`Updated listing ${listings[1]._id} (${listings[1].title}) status to 'Payment Required'.`);
    }

    if (listings.length >= 3) {
      listings[2].status = 'Pending';
      await listings[2].save();
      console.log(`Updated listing ${listings[2]._id} (${listings[2].title}) status to 'Pending'.`);
    }

    console.log('Statuses updated successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
