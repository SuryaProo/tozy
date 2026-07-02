/**
 * makeAdmin.js — promotes a user to admin role
 * Usage: node src/seed/makeAdmin.js your@email.com
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

// Auto-fix DB name in URI
if (process.env.MONGODB_URI && !/\.mongodb\.net:[0-9]+\/[^?]/.test(process.env.MONGODB_URI) && !/\.mongodb\.net\/[^?]/.test(process.env.MONGODB_URI)) {
  process.env.MONGODB_URI = process.env.MONGODB_URI
    .replace(/\.mongodb\.net(:\d+)?(,\S+?)*\/(\?|$)/, (m) => m.replace(/\/(\?|$)/, '/tozycozy$1'));
}

const run = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node src/seed/makeAdmin.js your@email.com');
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    console.error('   Register first on the website, then run this script.');
    await mongoose.disconnect();
    process.exit(1);
  }

  user.role = 'admin';
  await user.save();

  console.log(`✅ ${user.name || user.email} is now an admin!`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => { console.error('❌', err.message); process.exit(1); });
