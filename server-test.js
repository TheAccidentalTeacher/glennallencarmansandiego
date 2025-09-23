// Minimal test server for Railway debugging
const express = require('express');
const path = require('path');

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

console.log('🚀 Starting minimal test server...');
console.log('📊 Environment:', process.env.NODE_ENV);
console.log('🔗 Port:', PORT);
console.log('💾 Database URL:', process.env.DATABASE_URL ? 'configured' : 'not configured');

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../')));

// Catch-all route - use regex instead of * wildcard
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  server.close(() => process.exit(0));
});