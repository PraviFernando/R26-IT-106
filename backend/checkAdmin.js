require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/pericare';

mongoose.connect(MONGODB_URL)
  .then(async () => {
    console.log('Connected to DB');
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      console.log('Existing Admins:');
      admins.forEach(a => console.log(`- Email: ${a.email} | Username: ${a.username}`));
    } else {
      console.log('No admins found. Creating one...');
      const hashed = await bcrypt.hash('admin123', 12);
      const newAdmin = await User.create({
        username: 'admin',
        email: 'admin@pericare.com',
        password: hashed,
        role: 'admin'
      });
      console.log(`Created new admin: Email: ${newAdmin.email}, Password: admin123`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
