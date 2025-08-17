import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Dynamic import for Express
const expressModule = await import('express');
const express = (expressModule as any).default || expressModule;

// Import configurations
import { 
  SERVER_CONFIG, 
  CORS_CONFIG, 
  RATE_LIMIT_CONFIG 
} from './src/configs/index.js';
import { connectDatabase } from './src/configs/database.js';

// Import middleware
import { errorHandler, logRequest } from './src/helpers/index.js';
import { handleUploadError } from './src/middleware/upload.js';

// Import routes
import authRoutes from './src/routes/auth.js';
import emailRoutes from './src/routes/emails.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors(CORS_CONFIG));

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(logRequest);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Email Client Server is running',
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.NODE_ENV,
    version: '1.0.0'
  });
});

// Mail service test endpoint
app.get('/mail-test', async (_req: Request, res: Response) => {
  try {
    const { MailService } = await import('./src/services/mailService.js');
    const config = MailService.getConfig();
    const isConnected = await MailService.testConnection();
    
    res.json({
      success: true,
      message: 'Mail service test completed',
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.user,
        from: config.from
      },
      connected: isConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Mail service test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// API info endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Email Client API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      emails: '/api/emails'
    },
    documentation: {
      health: '/health',
      api: '/api'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Upload error handling
app.use(handleUploadError);

// 404 handler
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: _req.originalUrl
  });
});

// Catch-all handler for client-side routing
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    app.listen(SERVER_CONFIG.PORT, () => {
      console.log('🚀 Email Client Server Started Successfully!');
      console.log('=' .repeat(60));
      console.log(`📧 Server: http://localhost:${SERVER_CONFIG.PORT}`);
      console.log(`🔗 Health: http://localhost:${SERVER_CONFIG.PORT}/health`);
      console.log(`📚 API Info: http://localhost:${SERVER_CONFIG.PORT}/api`);
      console.log(`🌍 Environment: ${SERVER_CONFIG.NODE_ENV}`);
      console.log('=' .repeat(60));
      
      console.log('\n📋 Available Features:');
      console.log('✅ User Authentication (Register/Login/Profile)');
      console.log('✅ Email Management (Send/Receive/Organize)');
      console.log('✅ File Attachments Support');
      console.log('✅ Email Search and Filtering');
      console.log('✅ Email Statistics and Analytics');
      console.log('✅ Spam Detection and Filtering');
      console.log('✅ Rate Limiting and Security');
      console.log('✅ JWT Token Authentication');
      console.log('✅ Email Labeling and Starring');
      console.log('✅ Folder Organization (Inbox/Sent/Trash/Spam)');
      console.log('✅ Bulk Email Operations');
      console.log('✅ Admin User Management');
      
      console.log('\n🏗️ Architecture Layers:');
      console.log('📁 Routes: Request routing and validation');
      console.log('🎮 Controllers: Request handling and response formatting');
      console.log('🔧 Services: Business logic and data operations');
      console.log('🛠️ Helpers: Common utility functions');
      console.log('⚙️ Utils: Core utility functions');
      console.log('⚙️ Configs: Configuration management');
      console.log('📋 Constants: Application constants');
      console.log('📤 Uploads: File upload handling');
      console.log('🔒 Middleware: Authentication and security');
      
      console.log('\n🔧 Next Steps:');
      console.log('1. Copy env.example to .env and configure settings');
      console.log('2. Set up MongoDB for production use');
      console.log('3. Configure your email server settings');
      console.log('4. Test the API endpoints');
      console.log('5. Deploy to production');
      
      console.log('\n🎉 Email Client Backend is Ready!');
      console.log('=' .repeat(60));
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();