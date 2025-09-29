import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Carmen Sandiego API is running!' });
});

// Root route - show available endpoints
app.get('/', (req, res) => {
  res.json({
    message: '🎮 Carmen Sandiego Game API',
    status: 'Running',
    database: 'File-based (no MongoDB required)',
    endpoints: {
      health: '/health',
      cases: '/api/cases',
      casesById: '/api/cases/:id'
    },
    instructions: 'Use /api/cases to see all available cases'
  });
});

// Filesystem-based cases API
function readAllCaseFiles() {
  const casesDir = path.join(__dirname, 'content', 'cases');
  if (!fs.existsSync(casesDir)) return [];
  const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
  const cases = [];
  for (const file of files) {
    try {
      const full = path.join(casesDir, file);
      const raw = fs.readFileSync(full, 'utf8');
      const obj = JSON.parse(raw);
      if (!obj || !obj.id || !obj.title || !Array.isArray(obj.rounds) || obj.rounds.length === 0) {
        console.warn(`⚠️ Case file missing required fields: ${file}`);
        continue;
      }
      cases.push({ id: obj.id, title: obj.title, difficulty: obj.difficulty || null, rounds: obj.rounds.length });
    } catch (e) {
      console.error('Failed to parse case json:', file, e.message);
    }
  }
  return cases;
}

function readCaseById(id) {
  const casesDir = path.join(__dirname, 'content', 'cases');
  if (!fs.existsSync(casesDir)) return null;
  const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(casesDir, file), 'utf8');
      const obj = JSON.parse(raw);
      if (obj && obj.id === id) return obj;
    } catch (e) {
      console.error('Failed reading case file', file, e.message);
    }
  }
  return null;
}

// List cases
app.get('/api/cases', (req, res) => {
  try {
    const list = readAllCaseFiles();
    console.log(`📋 Serving ${list.length} cases`);
    res.json({ success: true, count: list.length, cases: list });
  } catch (error) {
    console.error('Error reading cases from filesystem:', error);
    res.status(500).json({ success: false, error: 'Failed to read cases' });
  }
});

// Get a specific case by id
app.get('/api/cases/:id', (req, res) => {
  try {
    const { id } = req.params;
    const obj = readCaseById(id);
    if (!obj) return res.status(404).json({ success: false, error: 'Case not found' });
    console.log(`📖 Serving case: ${obj.title}`);
    res.json({ success: true, case: obj });
  } catch (error) {
    console.error('Error reading case by id:', error);
    res.status(500).json({ success: false, error: 'Failed to read case' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Carmen Sandiego API server running on http://localhost:${PORT}`);
  console.log(`📁 Reading cases from: ${path.join(__dirname, 'content', 'cases')}`);
  console.log('\n📡 Available endpoints:');
  console.log(`   GET http://localhost:${PORT}/health`);
  console.log(`   GET http://localhost:${PORT}/api/cases`);
  console.log(`   GET http://localhost:${PORT}/api/cases/:id`);
  console.log('\n✅ Server is running. Use Ctrl+C to stop.');
});