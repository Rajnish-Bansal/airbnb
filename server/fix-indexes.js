require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    const User = mongoose.model('User', new mongoose.Schema({}));
    
    console.log('Dropping email_1 index...');
    try {
      await User.collection.dropIndex('email_1');
      console.log('✅ email_1 index dropped.');
    } catch (err) {
      if (err.codeName === 'IndexNotFound' || err.code === 27) {
        console.log('ℹ️ email_1 index not found, skipping drop.');
      } else {
        throw err;
      }
    }

    console.log('Dropping phone_1 index...');
    try {
      await User.collection.dropIndex('phone_1');
      console.log('✅ phone_1 index dropped.');
    } catch (err) {
      if (err.codeName === 'IndexNotFound' || err.code === 27) {
        console.log('ℹ️ phone_1 index not found, skipping drop.');
      } else {
        throw err;
      }
    }

    console.log('\nProcessing complete. Restart the server to recreate indices.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fixing indexes:', err);
    process.exit(1);
  }
}

fixIndexes();
