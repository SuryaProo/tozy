const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from .env (MONGODB_URI).
 * Paste your Atlas connection string into .env — nothing here needs editing.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('\n❌ MONGODB_URI is missing in your .env file.');
    console.error('   Add it like: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tozycozy\n');
    process.exit(1);
  }

  // Warn if the URI has no database name before the "?" (Atlas's copy-paste string
  // often looks like ".../?retryWrites=..." with the db name missing entirely —
  // this silently connects to a database called "test" instead of "tozycozy").
  const hasDbName = /\.mongodb\.net\/[^/?]+/.test(uri) || /\/\/[^/]+\/[^/?]+/.test(uri.replace('mongodb+srv://', '').replace('mongodb://', ''));
  if (!hasDbName) {
    console.warn('\n⚠️  Your MONGODB_URI has no database name before the "?" — you will connect to the default "test" database.');
    console.warn('   Add /tozycozy right before the "?", e.g.:');
    console.warn('   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/tozycozy?retryWrites=true&w=majority\n');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    if (conn.connection.name === 'test') {
      console.warn('⚠️  You are connected to the "test" database — see warning above to fix this.');
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected.');
  });
};

module.exports = connectDB;
