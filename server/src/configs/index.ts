import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Server configuration
export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3003,
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || 'localhost'
} as const;

// Database configuration
export const DATABASE_CONFIG = {
  URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/email-client',
  OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
} as const;

// JWT configuration
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ALGORITHM: 'HS256'
} as const;

// Email server configuration
export const EMAIL_CONFIG = {
  HOST: process.env.EMAIL_HOST || 'localhost',
  PORT: parseInt(process.env.EMAIL_PORT || '587'),
  SECURE: process.env.EMAIL_SECURE === 'true',
  USER: process.env.EMAIL_USER || '',
  PASS: process.env.EMAIL_PASS || '',
  FROM: process.env.EMAIL_FROM || 'noreply@emailclient.com'
} as const;

// File upload configuration
export const UPLOAD_CONFIG = {
  PATH: process.env.UPLOAD_PATH || './uploads',
  MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_TYPES: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv', 'application/zip', 'application/x-zip-compressed'
  ],
  MAX_FILES: 10
} as const;

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
} as const;

// CORS configuration
export const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mail.byzand.online', 'https://byzand.online'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Security configuration
export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: 12,
  PASSWORD_MIN_LENGTH: 8,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
} as const;

// Logging configuration
export const LOGGING_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FORMAT: process.env.NODE_ENV === 'production' ? 'json' : 'dev'
} as const;
