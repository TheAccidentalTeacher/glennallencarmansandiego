import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { testConnection } from './services/database';

// Import route handlers
import authRoutes from './api/routes/auth';
import gameRoutes from './api/routes/game';
import contentRoutes from './api/routes/content';
import contentFsRoutes from './api/routes/contentFs';
import imageRoutes from './api/routes/images';
import locationRoutes from './api/routes/locations';
import { errorHandler, notFound } from './api/middleware/errorHandler';
import { setupWebSocket } from './api/websocket/gameSocket';

const app = express();

// Sanitize env values (trim and remove wrapping quotes)
const cleanEnv = (v?: string): string | undefined => {
  if (!v) return undefined;
  let s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s;
};

const rawPort = cleanEnv(process.env.PORT);
let PORT = Number.parseInt(rawPort || '', 10);
if (!Number.isFinite(PORT)) {
  // Default to common platform port if env is missing/malformed
  PORT = 8080;
}
const isProduction = process.env.NODE_ENV === 'production';

// Ensure the app is serving on the correct port for Railway
console.log(`🚀 Starting server on port ${PORT}${rawPort && !Number.isFinite(Number.parseInt(rawPort, 10)) ? ' (PORT env malformed, defaulted)' : ''}`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Is Production: ${isProduction}`);

// Instant liveness probe (no deps, no middleware)
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS configuration for development and production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
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

// Serve static files only in production (development uses Vite dev server)
if (isProduction) {
  const buildPath = path.join(__dirname, './');
  console.log(`📁 Serving static files from: ${buildPath}`);
  app.use(express.static(buildPath));
} else {
  console.log(`🔧 Development mode: Static files served by Vite dev server`);
}

// Serve villain images from content directory (both dev and prod)
const villainImagesPath = path.join(__dirname, '../content/villains/images');
console.log(`🖼️  Serving villain images from: ${villainImagesPath}`);
app.use('/images/villains', express.static(villainImagesPath));

// Health check endpoint (fast, DB check timeboxed)
const withTimeout = async <T>(p: Promise<T>, ms: number, fallback: T): Promise<T> => {
  return Promise.race([
    p.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]) as Promise<T>;
};

app.get('/health', async (_req, res) => {
  try {
    // Limit DB check to 1200ms so healthcheck responds quickly
    const dbConnected = await withTimeout<boolean>(testConnection(), 1200, false);
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'unknown',
      environment: process.env.NODE_ENV || 'development',
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
// Allow switching to filesystem-backed content endpoints for Teacher-led MVP
// Auto-detect if we should use file-based content by checking for content directory
const detectFileBasedContent = (): boolean => {
  // Explicit env var takes precedence
  if (String(process.env.USE_FS_CONTENT || '').toLowerCase() === 'true') {
    return true;
  }
  
  // For production deployment, default to file-based content
  // This ensures Railway works without requiring specific env configuration
  if (process.env.NODE_ENV === 'production') {
    console.log('📂 Production environment detected, defaulting to file-based content');
    return true;
  }
  
  // Check if content directory exists
  const contentDirs = [
    path.join(__dirname, '../content/cases'),
    path.join(__dirname, './content/cases'),
    path.join(process.cwd(), 'content/cases')
  ];
  
  for (const dir of contentDirs) {
    if (fs.existsSync(dir)) {
      console.log(`📂 Found content directory at ${dir}, using file-based serving`);
      return true;
    }
  }
  
  return false;
};

const useFsContent = detectFileBasedContent();
if (useFsContent) {
  console.log('📚 Using filesystem-backed content routes');
  app.use('/api/content', contentFsRoutes);
} else {
  console.log('💾 Using database-backed content routes');
  app.use('/api/content', contentRoutes);
}
// Forward /api/cases to /api/content/cases for frontend compatibility
app.use('/api/cases', (req, _res, next) => {
  req.url = req.url.replace('/api/cases', '/api/content/cases');
  next();
}, useFsContent ? contentFsRoutes : contentRoutes);

app.use('/api/images', imageRoutes);
app.use('/api/locations', locationRoutes);

// Serve React app for all non-API routes (catch-all) - only in production
if (isProduction) {
  app.get(/^(?!\/api|\/images).*$/, (_req, res) => {
    const indexPath = path.join(__dirname, './index.html');
    console.log(`📄 Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath);
  });
} else {
  // In development, API-only server (frontend served by Vite)
  app.get('/', (_req, res) => {
    res.json({
      message: '🎮 Sourdough Pete API Server (Development)',
      status: 'running',
      mode: 'development',
      frontend: 'Run `npm run dev` to start Vite dev server on port 5173',
      api: 'API endpoints available at /api/*'
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
  // Don't exit immediately; allow platform to decide restarts
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately
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