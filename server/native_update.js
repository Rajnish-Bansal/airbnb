const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 2 months ago
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 2);

    const db = mongoose.connection.db;
    const collection = db.collection('listings');

    const result = await collection.updateOne(
      { title: "Seashore Heritage Villa" },
      { $set: { createdAt: pastDate } }
    );

    console.log('Native Update Result:', result);

    const doc = await collection.findOne({ title: "Seashore Heritage Villa" });
    console.log('Listing createdAt in DB is now:', doc.createdAt);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
