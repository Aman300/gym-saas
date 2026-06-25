const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const User = require('./models/User');

// Seed default Super Admin user
const seedSuperAdmin = async () => {
  try {
    const superadmin = await User.findOne({ role: 'superadmin' });
    if (!superadmin) {
      await User.create({
        name: 'System Admin',
        email: 'superadmin@gym.com',
        password: 'superadmin123',
        role: 'superadmin',
      });
      console.log('Seeded default superadmin user successfully (superadmin@gym.com / superadmin123)');
    }
  } catch (error) {
    console.error('Error seeding superadmin user:', error);
  }
};

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gym-saas');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedSuperAdmin();
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Register API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/members', require('./routes/members'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/superadmin', require('./routes/superadmin'));

// API Healthy route
app.get('/', (req, res) => {
  res.json({ message: 'Gym Management System SaaS API is running smoothly' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
