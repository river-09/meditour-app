import 'dotenv/config';

console.log('Environment loaded:');
console.log('DAILY_API_KEY:', process.env.DAILY_API_KEY ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { clerkMiddleware, requireAuth } from '@clerk/express';

import connectDB from './config/database.js';

// Import all routes
import patientRoutes from './routes/patientRoutes.js';
import reviewRequestRoutes from './routes/reviewRequestRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';

const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(clerkMiddleware());
app.use('/uploads', express.static('uploads'));

// Debug logging
console.log('=== Clerk Environment Debug ===');
console.log('CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY ? 'Present' : 'Missing');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Present' : 'Missing');

// Add comprehensive request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log('Headers:', {
    authorization: req.headers.authorization ? 'Present' : 'Missing',
    'content-type': req.headers['content-type']
  });
  next();
});

// Test routes for debugging
app.get('/test', (req, res) => {
  console.log('✅ GET test route hit');
  res.json({ message: 'GET test working!', timestamp: new Date() });
});

app.post('/test', (req, res) => {
  console.log('✅ POST test route hit');
  res.json({ 
    message: 'POST test working!', 
    timestamp: new Date(),
    body: req.body 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Protected routes with authentication
app.use('/api/review-requests', requireAuth(), reviewRequestRoutes);
app.use('/api/patient', requireAuth(), patientRoutes);
app.use('/api/doctor', requireAuth(), doctorRoutes);
app.use('/api/appointments', requireAuth(), appointmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  if (err.status === 401) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler - should be last
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// Connect to database and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ MedTour server running on port ${PORT}`);
    console.log('📋 Registered protected routes:');
    console.log('  - /api/review-requests (requires auth)');
    console.log('  - /api/patient (requires auth)');
    console.log('  - /api/doctor (requires auth)');
    console.log('  - /api/appointments (requires auth)');
    console.log('📋 Public test routes:');
    console.log('  - GET /test');
    console.log('  - POST /test');
    console.log('  - /health');
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
