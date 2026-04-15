require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const Listing = require('./models/Listing');
const User = require('./models/User');
const { uploadFromBuffer } = require('./services/cloudinary');

const HOST_EMAIL = 'rajnishbansal0906@gmail.com';

const IMAGE_ASSETS = [
  { match: ['goa'], file: 'goa.png' },
  { match: ['rishikesh'], file: 'shimla.png' },
  { match: ['mumbai', 'marine drive'], file: 'mumbai.png' },
  { match: ['udaipur', 'lake pichola'], file: 'udaipur.png' },
  { match: ['bangalore', 'indiranagar'], file: 'pondicherry.png' },
  { match: ['manali', 'cedar cabin'], file: 'manali.png' },
];

const getLocalImagePath = (listing) => {
  const haystack = `${listing.title || ''} ${listing.location || ''}`.toLowerCase();
  const asset = IMAGE_ASSETS.find(({ match }) => match.some(term => haystack.includes(term)));
  const fileName = asset?.file || 'host_hero.png';
  return path.join(__dirname, '../src/assets', fileName);
};

const uploadPhotos = async (listing, index) => {
  const uploadedPhotos = [];

  const localImagePath = getLocalImagePath(listing);
  const folder = `hostify/listings/seed-${index + 1}`;
  const buffer = await fs.readFile(localImagePath);
  const result = await uploadFromBuffer(buffer, folder);

  uploadedPhotos.push({
    id: result.public_id,
    url: result.secure_url,
    category: 'cover',
  });

  return uploadedPhotos;
};

const loadDummyListings = async () => {
  const module = await import('../src/constants/mockData.js');
  return module.DUMMY_LISTINGS || [];
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    const dummyListings = await loadDummyListings();
    if (!dummyListings.length) {
      throw new Error('No dummy listings found to seed');
    }

    let hostUser = await User.findOne({ email: HOST_EMAIL });
    if (!hostUser) {
      hostUser = await User.create({
        email: HOST_EMAIL,
        name: 'Rajnish Bansal',
        role: 'Host',
        status: 'Active',
        isPhoneVerified: true,
      });
      console.log(`✅ Created host user: ${hostUser.email}`);
    } else if (hostUser.role !== 'Host') {
      hostUser.role = 'Host';
      await hostUser.save();
      console.log(`✅ Promoted existing user to Host: ${hostUser.email}`);
    } else {
      console.log(`✅ Host found: ${hostUser.name || HOST_EMAIL} (ID: ${hostUser._id})`);
    }

    await Listing.deleteMany({});
    console.log('🗑️  Old listings cleared.');

    const createdListings = [];
    for (let i = 0; i < dummyListings.length; i += 1) {
      const item = dummyListings[i];
      const uploadedPhotos = await uploadPhotos(item, i);
      const coverPhoto = uploadedPhotos[0];

      const doc = await Listing.create({
        hostId: hostUser._id,
        title: item.title,
        location: item.location,
        distance: item.distance,
        price: item.price,
        rating: item.rating,
        reviewsCount: item.reviewsCount,
        image: coverPhoto?.url || item.image || item.photos?.[0] || '',
        photos: uploadedPhotos.length
          ? uploadedPhotos
          : (item.photos || []).map((url, photoIndex) => ({
              id: `seed-${i + 1}-${photoIndex + 1}`,
              url,
              category: photoIndex === 0 ? 'cover' : 'other',
            })),
        description: item.description,
        host: item.host || {
          name: hostUser.name || 'Hostify Host',
          image: 'https://i.pravatar.cc/150?u=hostify',
        },
        amenities: item.amenities || [],
        maxGuests: item.maxGuests || 2,
        propertyType: item.propertyType || 'Stay',
        instantBook: Boolean(item.instantBook),
        coordinates: item.coordinates || { lat: 20.5937, lng: 78.9629 },
        location_geo: {
          type: 'Point',
          coordinates: [
            item.coordinates?.lng || 78.9629,
            item.coordinates?.lat || 20.5937,
          ],
        },
      });

      createdListings.push(doc);
      console.log(`✅ Seeded: ${doc.title} -> ${doc.location}`);
    }

    console.log(`🌱 Data seeded successfully! (${createdListings.length} listings)`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
