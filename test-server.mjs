// Simple API server with MongoDB for Carmen Sandiego game
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local in project directory
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images from content directory
app.use('/images', express.static(path.join(__dirname, 'content', 'villains', 'images')));
app.use('/content', express.static(path.join(__dirname, 'content')));

// MongoDB connection
let client = null;
let db = null;

async function connectMongoDB() {
  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI not configured. Skipping DB connection for test server.');
    return null;
  }
  if (!client) {
    try {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db('carmen-sandiego');
      console.log('✅ MongoDB connected successfully');
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed (continuing without DB):', err.message);
      db = null;
    }
  }
  return db;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Carmen Sandiego API is running!' });
});

// Root route - show available endpoints
app.get('/', async (req, res) => {
  let dbStatus = 'Not configured';
  try {
    const database = await connectMongoDB();
    if (database) {
      const villainCount = await database.collection('villains').countDocuments();
      dbStatus = `Connected (${villainCount} villains loaded)`;
    }
  } catch (error) {
    dbStatus = 'Connection error';
  }

  res.json({
    message: '🎮 Carmen Sandiego Game API',
    status: 'Running',
    database: dbStatus,
    endpoints: {
      health: '/health',
      villains: '/api/villains',
      villainsImages: '/api/images/villains',
      locations: '/api/locations', 
      cases: '/api/cases',
      locationById: '/api/locations/:id'
    },
    instructions: 'Use the endpoints above to access game data'
  });
});

// Serve the game test HTML page
app.get('/game', (req, res) => {
  const htmlPath = path.join(__dirname, 'game-test.html');
  res.sendFile(htmlPath);
});

// Get all villains
app.get('/api/villains', async (req, res) => {
  try {
    const database = await connectMongoDB();
    if (!database) return res.json([]); // DB optional in teacher-led MVP
    const villains = await database.collection('villains').find({}).toArray();
    res.json(villains);
  } catch (error) {
    console.error('Error fetching villains:', error);
    res.status(200).json([]);
  }
});

// Get villains for image management (read from content files, not MongoDB)
app.get('/api/images/villains', async (req, res) => {
  try {
    const villainsDir = path.join(__dirname, 'content', 'villains', 'images');
    const villainFolders = fs.readdirSync(villainsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Map folder names to villain IDs that the frontend expects
    const folderToId = {
      '00-sourdough-pete-alaska': 'sourdough-pete',
      '01-dr-meridian-elena-fossat': 'dr-meridian',
      '02-professor-sahara-amira-hassan': 'professor-sahara',
      '03-dr-mirage-amara-benali': 'dr-mirage',
      '04-professor-tectonic-jin-wei-ming': 'professor-tectonic',
      '05-dr-cordillera-isabella-mendoza': 'dr-cordillera',
      '06-dr-monsoon-kiran-patel': 'dr-monsoon',
      '07-dr-coral-maya-sari': 'dr-coral',
      '08-dr-qanat-reza-mehrabi': 'dr-qanat',
      '09-professor-atlas-viktor-kowalski': 'professor-atlas',
      '10-dr-pacific-james-tauranga': 'dr-pacific',
      '11-dr-watershed-sarah-blackfoot': 'dr-watershed',
      '12-dr-canopy-carlos-mendoza': 'dr-canopy'
    };
    
  const villainIds = villainFolders.map(folder => folderToId[folder]).filter(id => id);
    
    console.log(`📁 Found ${villainFolders.length} villain folders, mapped to ${villainIds.length} IDs:`, villainIds);
    
    res.json({
      success: true,
      villains: villainIds
    });
  } catch (error) {
    console.error('Error reading villain content folders:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load villain content' 
    });
  }
});

// Get images for a specific villain
app.get('/api/images/villains/:villainId', async (req, res) => {
  try {
    const { villainId } = req.params; // can be folder name or slug id
    const baseDir = path.join(__dirname, 'content', 'villains', 'images');
    const folderToId = {
      '00-sourdough-pete-alaska': 'sourdough-pete',
      '01-dr-meridian-elena-fossat': 'dr-meridian',
      '02-professor-sahara-amira-hassan': 'professor-sahara',
      '03-dr-mirage-amara-benali': 'dr-mirage',
      '04-professor-tectonic-jin-wei-ming': 'professor-tectonic',
      '05-dr-cordillera-isabella-mendoza': 'dr-cordillera',
      '06-dr-monsoon-kiran-patel': 'dr-monsoon',
      '07-dr-coral-maya-sari': 'dr-coral',
      '08-dr-qanat-reza-mehrabi': 'dr-qanat',
      '09-professor-atlas-viktor-kowalski': 'professor-atlas',
      '10-dr-pacific-james-tauranga': 'dr-pacific',
      '11-dr-watershed-sarah-blackfoot': 'dr-watershed',
      '12-dr-canopy-carlos-mendoza': 'dr-canopy'
    };
    // invert mapping
    const idToFolder = Object.fromEntries(Object.entries(folderToId).map(([k,v]) => [v,k]));
    const folderCandidate = fs.existsSync(path.join(baseDir, villainId)) ? villainId : idToFolder[villainId];
    if (!folderCandidate) {
      return res.status(404).json({ success: false, error: 'Villain not found' });
    }
    const villainImageDir = path.join(baseDir, folderCandidate);
    const imageFiles = fs.readdirSync(villainImageDir)
      .filter(file => file.match(/\.(png|jpg|jpeg|gif)$/i))
      .map(file => `/images/${folderCandidate}/${file}`);
    console.log(`🖼️ Found ${imageFiles.length} images for ${villainId} (folder ${folderCandidate})`);
    res.json({ success: true, villainId, folder: folderCandidate, images: imageFiles });
  } catch (error) {
    console.error('Error reading villain images:', error);
    res.status(500).json({ success: false, error: 'Failed to load villain images' });
  }
});

// Get all locations
app.get('/api/locations', async (req, res) => {
  try {
    const database = await connectMongoDB();
    if (!database) return res.json([]);
    const locations = await database.collection('locations').find({}).toArray();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(200).json([]);
  }
});

// Filesystem-based cases API (MVP)
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
      // minimal validation
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
app.get('/api/cases', async (req, res) => {
  try {
    const list = readAllCaseFiles();
    res.json({ success: true, count: list.length, cases: list });
  } catch (error) {
    console.error('Error reading cases from filesystem:', error);
    res.status(500).json({ success: false, error: 'Failed to read cases' });
  }
});

// Get a specific case by id
app.get('/api/cases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const obj = readCaseById(id);
    if (!obj) return res.status(404).json({ success: false, error: 'Case not found' });
    // basic validation details in response for teacher-led MVP
    const errors = [];
    if (!obj.briefing) errors.push('Missing briefing');
    if (!Array.isArray(obj.rounds) || obj.rounds.length === 0) errors.push('No rounds provided');
    else {
      obj.rounds.forEach((r, idx) => {
        if (!r.answer || typeof r.answer.lat !== 'number' || typeof r.answer.lng !== 'number') {
          errors.push(`Round ${idx + 1} missing valid answer.lat/lng`);
        }
      });
    }
    res.json({ success: true, case: obj, validation: { errors } });
  } catch (error) {
    console.error('Error reading case by id:', error);
    res.status(500).json({ success: false, error: 'Failed to read case' });
  }
});

// Get location by ID
app.get('/api/locations/:id', async (req, res) => {
  try {
    const database = await connectMongoDB();
    const location = await database.collection('locations').findOne({ _id: req.params.id });
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Carmen Sandiego API server running on http://localhost:${PORT}`);
  console.log(`🗄️ MongoDB: ${MONGODB_URI ? 'Configured (optional)' : 'Not configured'}`);
  
  // Test endpoints
  console.log('\n📡 Available endpoints:');
  console.log(`   GET http://localhost:${PORT}/health`);
  console.log(`   GET http://localhost:${PORT}/api/villains`);
  console.log(`   GET http://localhost:${PORT}/api/locations`);
  console.log(`   GET http://localhost:${PORT}/api/cases`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔌 Closing MongoDB connection...');
  if (client) {
    await client.close();
  }
  process.exit(0);
});