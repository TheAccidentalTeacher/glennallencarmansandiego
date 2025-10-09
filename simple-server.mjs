import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory session storage (will be replaced with persistent storage later)
const gameSessions = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from content directory
app.use('/content', express.static(path.join(__dirname, 'content')));

// Serve static files from public directory  
app.use('/public', express.static(path.join(__dirname, 'public')));

// Legacy image path compatibility - map /images/villains to actual location
app.use('/images/villains', express.static(path.join(__dirname, 'content', 'villains', 'images')));

// Serve placeholder and other images from public
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

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
function getDifficultyNumber(difficulty) {
  if (typeof difficulty === 'number') return difficulty;
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return 1;
    case 'intermediate': return 2;
    case 'advanced': return 3;
    case 'expert': return 4;
    case 'master': return 5;
    default: return 2; // Default to intermediate
  }
}

function extractVillainName(nameOrId) {
  if (!nameOrId) return 'Unknown Villain';
  // If it's an ID like "dr-altiplano-isabella-santos", convert to display name
  if (nameOrId.includes('-')) {
    return nameOrId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  return nameOrId;
}

function extractCountryFromAnswer(rounds) {
  if (!rounds || rounds.length === 0) return 'Unknown';
  
  // Look for country hints in the last few rounds
  for (let i = rounds.length - 1; i >= 0; i--) {
    const round = rounds[i];
    if (round.answer?.name) {
      const answer = round.answer.name;
      // Common country detection patterns
      if (answer.includes('Peru') || answer.includes('Chile') || answer.includes('Andes')) return 'Peru/Chile';
      if (answer.includes('India') || answer.includes('Monsoon')) return 'India';
      if (answer.includes('Costa Rica') || answer.includes('Monteverde')) return 'Costa Rica';
      if (answer.includes('Iran') || answer.includes('Qanat')) return 'Iran';
      if (answer.includes('Ghana') || answer.includes('Sahel')) return 'Ghana';
      if (answer.includes('Alaska') || answer.includes('Sourdough')) return 'Alaska, USA';
      if (answer.includes('Egypt') || answer.includes('Sahara')) return 'Egypt';
      // Add more patterns as needed
    }
  }
  return 'Global';
}

function readAllCaseFiles() {
  const casesDir = path.join(__dirname, 'content', 'cases');
  if (!fs.existsSync(casesDir)) return [];
  const files = fs.readdirSync(casesDir).filter(f => f.endsWith('.json'));
  const cases = [];
  
  // Define villain order based on our weekly progression (01-12, then 13-14 finale)
  const villainOrder = {
    'dr-altiplano-isabella-santos': 1,      // Week 1 - 01-dr-altiplano-isabella-santos
    'professor-sahara-amira-hassan': 2,     // Week 2 - 02-professor-sahara-amira-hassan
    'professor-tectonic-jin-wei-ming': 3,   // Week 3 - 03-professor-tectonic-seismic-specialist
    'dr-meridian-elena-fossat': 4,          // Week 4 - 04-dr-meridian-elena-fossat
    'dr-sahel-kwame-asante': 5,             // Week 5 - 05-dr-sahel-kwame-asante
    'dr-monsoon-kiran-patel': 6,            // Week 6 - 06-dr-monsoon-kiran-patel
    'dr-coral-maya-sari': 7,                // Week 7 - 07-dr-coral-maya-sari
    'dr-qanat': 8,                          // Week 8 - 08-dr-qanat-master-of-disguise
    'professor-atlas': 9,                   // Week 9 - 09-professor-atlas-viktor-kowalski
    'dr-pacific': 10,                       // Week 10 - 10-dr-pacific-james-tauranga
    'dr-watershed-sarah-blackfoot': 11,     // Week 11 - 11-dr-watershed-sarah-blackfoot
    'dr-canopy-carlos-mendoza': 12,         // Week 12 - 12-dr-canopy-carlos-mendoza
    'sourdough-pete': 13                    // Week 13-14 - 13-14-sourdough-pete-alaska
  };
  
  for (const file of files) {
    try {
      const full = path.join(casesDir, file);
      const raw = fs.readFileSync(full, 'utf8');
      const obj = JSON.parse(raw);
      if (!obj || !obj.id || !obj.title || !Array.isArray(obj.rounds) || obj.rounds.length === 0) {
        console.warn(`⚠️ Case file missing required fields: ${file}`);
        continue;
      }
      
      // Map the actual case structure to the expected API interface
      const mappedCase = {
        id: obj.id,
        title: obj.title,
        description: obj.briefing?.narrativeHtml?.replace(/<[^>]*>/g, '').substring(0, 200) + '...' || 'No description available',
        difficultyLevel: getDifficultyNumber(obj.difficulty),
        villainId: obj.villainId || 'unknown',
        villainName: extractVillainName(obj.suspects?.[0]?.name || obj.villainId),
        targetLocationId: obj.rounds?.[0]?.answer?.name || 'unknown',
        locationName: obj.rounds?.[obj.rounds.length - 1]?.answer?.name || 'Unknown Location',
        locationCountry: extractCountryFromAnswer(obj.rounds),
        estimatedDurationMinutes: obj.durationMinutes || null,
        createdBy: 'Carmen Sandiego System',
        isActive: true,
        createdAt: '2025-09-30T00:00:00Z',
        updatedAt: '2025-09-30T00:00:00Z',
        villainOrder: villainOrder[obj.villainId] || 999 // Unknown villains go to end
      };
      
      cases.push(mappedCase);
    } catch (e) {
      console.error('Failed to parse case json:', file, e.message);
    }
  }
  
  // Sort cases by villain order (weekly progression)
  cases.sort((a, b) => a.villainOrder - b.villainOrder);
  
  return cases;
}

// Session Management Functions
function createSession(caseId) {
  const caseData = readCaseById(caseId);
  if (!caseData) return null;
  
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const session = {
    id: sessionId,
    caseId: caseId,
    caseData: caseData,
    currentRound: 0,
    maxRounds: caseData.rounds.length,
    revealedClues: [],
    guesses: [],
    score: 0,
    status: 'active', // active, completed, paused
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  gameSessions.set(sessionId, session);
  return session;
}

function getSession(sessionId) {
  return gameSessions.get(sessionId) || null;
}

function updateSession(sessionId, updates) {
  const session = gameSessions.get(sessionId);
  if (!session) return null;
  
  const updatedSession = {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  gameSessions.set(sessionId, updatedSession);
  return updatedSession;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

function calculateScore(distanceKm, baseScore = 100) {
  // Score decreases with distance, minimum 10 points
  const maxDistance = 20000; // Maximum possible distance on Earth
  const score = Math.max(10, Math.round(baseScore * (1 - distanceKm / maxDistance)));
  return score;
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

// Content API compatibility endpoint
app.get('/api/content/cases', (req, res) => {
  try {
    const list = readAllCaseFiles();
    console.log(`📋 Serving ${list.length} cases via content API`);
    // Return in the format expected by the frontend ApiResponse interface
    res.json({ 
      success: true, 
      data: { 
        cases: list 
      }
    });
  } catch (error) {
    console.error('Error reading cases from filesystem:', error);
    res.status(500).json({ 
      success: false, 
      error: {
        code: 'FILE_READ_ERROR',
        message: 'Failed to read cases'
      }
    });
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

// Individual case content endpoint (for case preview)
app.get('/api/content/cases/:id.json', (req, res) => {
  try {
    const { id } = req.params;
    const obj = readCaseById(id);
    if (!obj) return res.status(404).json({ success: false, error: 'Case not found' });
    console.log(`📖 Serving case JSON: ${obj.title}`);
    res.json(obj); // Return the case data directly for preview
  } catch (error) {
    console.error('Error reading case JSON by id:', error);
    res.status(500).json({ success: false, error: 'Failed to read case' });
  }
});

// Session Management API Endpoints

// Create a new game session
app.post('/api/sessions', (req, res) => {
  try {
    const { caseId } = req.body;
    if (!caseId) {
      return res.status(400).json({ success: false, error: 'caseId is required' });
    }
    
    const session = createSession(caseId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }
    
    console.log(`🎮 Created new game session: ${session.id} for case: ${caseId}`);
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ success: false, error: 'Failed to create session' });
  }
});

// Get session details
app.get('/api/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ success: false, error: 'Failed to get session' });
  }
});

// Reveal next clue in current round
app.post('/api/sessions/:sessionId/reveal', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    if (session.currentRound >= session.maxRounds) {
      return res.status(400).json({ success: false, error: 'No more rounds available' });
    }
    
    const currentRound = session.caseData.rounds[session.currentRound];
    const updatedSession = updateSession(sessionId, {
      revealedClues: [...session.revealedClues, {
        roundIndex: session.currentRound,
        clueHtml: currentRound.clueHtml,
        image: currentRound.image,
        revealedAt: new Date().toISOString()
      }]
    });
    
    console.log(`🔍 Revealed clue for session ${sessionId}, round ${session.currentRound + 1}`);
    res.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error('Error revealing clue:', error);
    res.status(500).json({ success: false, error: 'Failed to reveal clue' });
  }
});

// Submit a guess for current round
app.post('/api/sessions/:sessionId/guess', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { lat, lng, label } = req.body;
    
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, error: 'lat and lng are required' });
    }
    
    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    if (session.currentRound >= session.maxRounds) {
      return res.status(400).json({ success: false, error: 'No active round for guessing' });
    }
    
    const currentRound = session.caseData.rounds[session.currentRound];
    const correctAnswer = currentRound.answer;
    
    // Calculate distance and score
    const distance = calculateDistance(lat, lng, correctAnswer.lat, correctAnswer.lng);
    const roundScore = calculateScore(distance, currentRound.scoring?.base || 100);
    
    const guess = {
      roundIndex: session.currentRound,
      guess: { lat, lng, label: label || 'Unknown Location' },
      correct: correctAnswer,
      distance: Math.round(distance),
      score: roundScore,
      submittedAt: new Date().toISOString()
    };
    
    const updatedSession = updateSession(sessionId, {
      guesses: [...session.guesses, guess],
      score: session.score + roundScore
    });
    
    console.log(`📍 Guess submitted for session ${sessionId}: ${distance.toFixed(0)}km away, ${roundScore} points`);
    res.json({ success: true, session: updatedSession, guess });
  } catch (error) {
    console.error('Error submitting guess:', error);
    res.status(500).json({ success: false, error: 'Failed to submit guess' });
  }
});

// Advance to next round
app.post('/api/sessions/:sessionId/advance', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    if (session.currentRound >= session.maxRounds - 1) {
      // Game completed
      const updatedSession = updateSession(sessionId, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      console.log(`🏁 Game session completed: ${sessionId}`);
      res.json({ success: true, session: updatedSession, completed: true });
    } else {
      // Advance to next round
      const updatedSession = updateSession(sessionId, {
        currentRound: session.currentRound + 1
      });
      console.log(`➡️ Advanced session ${sessionId} to round ${session.currentRound + 2}`);
      res.json({ success: true, session: updatedSession });
    }
  } catch (error) {
    console.error('Error advancing round:', error);
    res.status(500).json({ success: false, error: 'Failed to advance round' });
  }
});

// Get session summary/results
app.get('/api/sessions/:sessionId/summary', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    const summary = {
      sessionId: session.id,
      caseTitle: session.caseData.title,
      totalScore: session.score,
      roundCount: session.guesses.length,
      averageDistance: session.guesses.length > 0 
        ? Math.round(session.guesses.reduce((sum, g) => sum + g.distance, 0) / session.guesses.length)
        : 0,
      status: session.status,
      duration: session.completedAt 
        ? Math.round((new Date(session.completedAt) - new Date(session.startedAt)) / 1000 / 60)
        : Math.round((new Date() - new Date(session.startedAt)) / 1000 / 60),
      guesses: session.guesses,
      completedAt: session.completedAt
    };
    
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error getting session summary:', error);
    res.status(500).json({ success: false, error: 'Failed to get session summary' });
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