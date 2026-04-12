require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/Listing');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB...');

    const listings = await Listing.find({ 
      coordinates: { $exists: true },
      location_geo: { $exists: false } 
    });

    console.log(`Found ${listings.length} listings to migrate.`);

    for (const listing of listings) {
      if (listing.coordinates && listing.coordinates.lat && listing.coordinates.lng) {
        listing.location_geo = {
          type: 'Point',
          coordinates: [listing.coordinates.lng, listing.coordinates.lat] // [lng, lat]
        };
        await listing.save();
        console.log(`Migrated: ${listing.location}`);
      }
    }

    console.log('✅ Migration complete!');
    process.exit();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
