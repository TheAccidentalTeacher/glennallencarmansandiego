import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { testConnection } from './services/database';

// __dirname is automatically available in CommonJS

// Import route handlers
import authRoutes from './api/routes/auth';
import gameRoutes from './api/routes/game';
import contentRoutes from './api/routes/content';
import { errorHandler, notFound } from './api/middleware/errorHandler';
import { setupWebSocket } from './api/websocket/gameSocket';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Ensure the app is serving on the correct port for Railway
console.log(`🚀 Starting server on port ${PORT}`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Is Production: ${isProduction}`);

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS configuration for development and production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  const buildPath = path.join(__dirname, './');
  console.log(`📁 Serving static files from: ${buildPath}`);
  app.use(express.static(buildPath, {
    maxAge: '1d',
    etag: true
  }));
}

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/content', contentRoutes);

// In production, serve React app for all non-API routes
if (process.env.NODE_ENV === 'production') {
  app.get(/^(?!\/api).*$/, (_req, res) => {
    const indexPath = path.join(__dirname, './index.html');
    console.log(`📄 Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  });
}

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Sourdough Pete API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'not set'}`);
  console.log(`💾 Database URL: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
  
  // Test database connection on startup
  try {
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✅ Database connection successful');
    } else {
      console.log('❌ Database connection failed');
    }
  } catch (error) {
    console.error('💥 Database connection error:', error);
  }
});

// Set up WebSocket server for real-time communication
setupWebSocket(server);

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;