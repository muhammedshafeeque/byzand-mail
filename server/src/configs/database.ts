import mongoose from 'mongoose';
import { DATABASE_CONFIG } from './index.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(DATABASE_CONFIG.URI, DATABASE_CONFIG.OPTIONS);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ MongoDB disconnection failed:', error);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB connection established');
});

mongoose.connection.on('error', (error) => {
  console.error('🔴 MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 MongoDB connection disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
