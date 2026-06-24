const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to DB.');
    const users = await User.find({}, 'name email role password');
    console.log(`Found ${users.length} users in DB:`);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) [role: ${u.role}] (password length: ${u.password ? u.password.length : 'none'})`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error connecting/querying DB:', err);
    process.exit(1);
  }
};

check();
