const mongoose = require('mongoose');
const Listing = require('./models/Listing');
const { generateCustomId } = require('./utils/idGenerator');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const listings = await Listing.find();
    console.log(`Checking ${listings.length} listings for missing propertyId or listingId.`);

    for (const listing of listings) {
      let needsSave = false;
      if (!listing.propertyId) {
        listing.propertyId = generateCustomId('PROP');
        needsSave = true;
      }
      if (!listing.listingId) {
        listing.listingId = generateCustomId('LIST');
        needsSave = true;
      }
      if (!listing.customId) {
        listing.customId = listing.listingId;
        needsSave = true;
      }

      if (needsSave) {
        await listing.save();
        console.log(`Updated listing '${listing.title}' with Listing ID: ${listing.listingId} and Property ID: ${listing.propertyId}`);
      }
    }

    console.log('Migration complete.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
