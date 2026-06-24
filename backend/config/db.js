const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  try {
    let connectionUri = process.env.MONGODB_URI;
    let usingMemoryDB = false;

    // Check if we need to fall back or use memory server
    if (!connectionUri || connectionUri.includes('127.0.0.1') || connectionUri.includes('localhost')) {
      try {
        console.log('Attempting to connect to local MongoDB...');
        const conn = await mongoose.connect(connectionUri || 'mongodb://127.0.0.1:27017/skillsphere', {
          serverSelectionTimeoutMS: 2000 // 2 seconds timeout for local checks
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
      } catch (localErr) {
        console.log('Local MongoDB not running. Initializing In-Memory MongoDB Server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        connectionUri = mongoServer.getUri();
        usingMemoryDB = true;
        
        const conn = await mongoose.connect(connectionUri);
        console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
      }
    } else {
      const conn = await mongoose.connect(connectionUri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }

    // Auto-seed if using memory DB
    if (usingMemoryDB) {
      const User = require('../models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('In-memory database is empty. Auto-seeding...');
        const seedData = require('../seedData');
        await seedData(true);
      }
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
