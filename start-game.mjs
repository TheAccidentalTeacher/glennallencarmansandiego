#!/usr/bin/env node

// Simple script to start BOTH servers for Carmen Sandiego game
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎮 Starting Carmen Sandiego Game...\n');

// Start the backend API server
console.log('🚀 Starting backend API server on http://localhost:3001...');
const backend = spawn('node', ['test-server.mjs'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
});

// Wait a moment for backend to start, then start frontend
setTimeout(() => {
  console.log('🎯 Starting React frontend on http://localhost:5173...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    console.log(`[FRONTEND] ${data.toString().trim()}`);
  });

  frontend.stderr.on('data', (data) => {
    console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
  });

  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

  setTimeout(() => {
    console.log('\n✅ READY! Open your browser and go to:');
    console.log('🌐 http://localhost:5173');
    console.log('\n(Press Ctrl+C to stop both servers)');
  }, 3000);

}, 2000);