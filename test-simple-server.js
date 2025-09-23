// Minimal server test for Railway
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

console.log('Starting minimal test server...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

app.get('/', (req, res) => {
  res.send('Hello World! Server is working!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Minimal server is working' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal test server running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down');
  server.close(() => process.exit(0));
});