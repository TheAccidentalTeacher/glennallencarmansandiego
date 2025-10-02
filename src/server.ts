import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
// Note: testConnection removed for MVP file-based deployment

// Import route handlers
import authRoutes from './api/routes/auth';
import gameRoutes from './api/routes/game';
import contentRoutes from './api/routes/content';
import contentFsRoutes from './api/routes/contentFs';
import imageRoutes from './api/routes/images';
import locationRoutes from './api/routes/locations';
import sessionRoutes from './api/routes/sessions';
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
  // Railway typically provides PORT, but default to 8080 if missing
  PORT = 8080;
}

// Add explicit logs for Railway debugging
console.log(`🔍 PORT env var: "${process.env.PORT}"`);
console.log(`🔍 Parsed PORT: ${PORT}`);
console.log(`🔍 NODE_ENV: "${process.env.NODE_ENV}"`);
console.log(`🔍 Railway specific env vars:`);
console.log(`   - RAILWAY_ENVIRONMENT: "${process.env.RAILWAY_ENVIRONMENT}"`);
console.log(`   - RAILWAY_SERVICE_NAME: "${process.env.RAILWAY_SERVICE_NAME}"`);
console.log(`   - RAILWAY_PROJECT_NAME: "${process.env.RAILWAY_PROJECT_NAME}"`);
console.log(`   - RAILWAY_REPLICA_ID: "${process.env.RAILWAY_REPLICA_ID}"`);

const isProduction = process.env.NODE_ENV === 'production';

// Ensure the app is serving on the correct port for Railway
console.log(`🚀 Starting server on port ${PORT}${rawPort && !Number.isFinite(Number.parseInt(rawPort, 10)) ? ' (PORT env malformed, defaulted)' : ''}`);
console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Is Production: ${isProduction}`);

// Instant liveness probe (no deps, no middleware)
app.get('/healthz', (req, res) => {
  console.log(`🏥 /healthz called from ${req.ip} at ${new Date().toISOString()}`);
  res.status(200).json({ status: 'ok' });
});

// Security and middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:"],
      scriptSrc: ["'self'"],
    },
  },
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Request logging middleware for Railway debugging
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 ${timestamp} ${req.method} ${req.url} from ${req.ip}`);
  
  // Log health check requests specifically
  if (req.url === '/health' || req.url === '/healthz') {
    console.log(`🏥 Health check request: ${req.method} ${req.url}`);
    console.log(`🏥 User-Agent: ${req.get('User-Agent')}`);
    console.log(`🏥 Headers: ${JSON.stringify(req.headers, null, 2)}`);
  }
  
  next();
});

app.use(morgan('combined')); // Keep detailed access logs

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

// Health check endpoint - simplified for Railway deployment
app.get('/health', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`🏥 /health called from ${req.ip} at ${timestamp}`);
  console.log(`🏥 Health check headers:`, req.headers);
  
  try {
    // For Railway deployment: simple health check without database dependency
    // The MVP uses file-based content, so database connection is not critical
    const healthData = {
      status: 'ok',
      timestamp,
      environment: process.env.NODE_ENV || 'development',
      contentMode: 'filesystem',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      port: PORT,
      railway: {
        environment: process.env.RAILWAY_ENVIRONMENT,
        service: process.env.RAILWAY_SERVICE_NAME,
        replica: process.env.RAILWAY_REPLICA_ID
      }
    };
    
    console.log(`🏥 Health check response:`, healthData);
    res.json(healthData);
  } catch (error) {
    console.error(`💥 Health check error:`, error);
    res.status(500).json({
      status: 'error',
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error'
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
app.use('/api/sessions', sessionRoutes);

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
console.log('⏱️  Starting server initialization...');
console.log(`⏱️  Current working directory: ${process.cwd()}`);
console.log(`⏱️  Node.js version: ${process.version}`);
console.log(`⏱️  Platform: ${process.platform} ${process.arch}`);
const startTime = Date.now();

const server = app.listen(PORT, '0.0.0.0', () => {
  const initTime = Date.now() - startTime;
  console.log(`⏱️  Server initialized in ${initTime}ms`);
  console.log(`🚀 Sourdough Pete API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🔗 Alternative health check: http://0.0.0.0:${PORT}/healthz`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'not set'}`);
  console.log(`💾 Database URL: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
  
  // MVP mode: Skip database connection test for faster startup
  console.log('📂 MVP mode: Using file-based content serving');
  
  // Set up WebSocket server for real-time communication
  try {
    setupWebSocket(server);
  } catch (error) {
    console.error('⚠️  WebSocket setup failed:', error);
    console.log('📈 Server continuing without WebSocket support');
  }
  
  console.log('✅ Server startup complete');
  console.log('🎯 Railway health check should succeed now');
});

// Handle server errors
server.on('error', (error: any) => {
  console.error('💥 Server error:', error);
  console.error('💥 Error code:', error.code);
  console.error('💥 Error syscall:', error.syscall);
  console.error('💥 Error address:', error.address);
  console.error('💥 Error port:', error.port);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else if (error.code === 'EACCES') {
    console.error(`❌ Permission denied to bind to port ${PORT}`);
  }
});

server.on('listening', () => {
  const addr = server.address();
  console.log(`🎧 Server listening on:`, addr);
  console.log(`🌍 Server accessible at: http://0.0.0.0:${PORT}`);
});

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