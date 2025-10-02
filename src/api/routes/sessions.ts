import { Router, type Request, type Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Generate UUID without ES Module import issues
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// In-memory session storage (in production, this would be in a database)
const gameSessions = new Map<string, any>();

// Session interface matching the frontend
interface GameSession {
  id: string;
  caseId: string;
  caseData: any;
  currentRound: number;
  maxRounds: number;
  revealedClues: any[];
  guesses: any[];
  score: number;
  status: string;
  startedAt: string;
  updatedAt: string;
}

// Load case data helper
async function loadCaseData(caseId: string): Promise<any> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Use same path resolution as contentFs
    const possiblePaths = [
      path.resolve(process.cwd(), 'content', 'cases'),
      path.resolve(__dirname, '../../content', 'cases'),
      path.resolve(__dirname, '../../../content', 'cases'),
      path.resolve(__dirname, './content', 'cases'),
    ];
    
    let casesDir = '';
    for (const dir of possiblePaths) {
      if (fs.existsSync(dir)) {
        casesDir = dir;
        break;
      }
    }
    
    const filePath = path.join(casesDir, `${caseId}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
    
    throw new Error('Case not found');
  } catch (error) {
    throw new AppError(`Failed to load case ${caseId}`, 404);
  }
}

// POST /api/sessions - Create new game session
router.post('/',
  asyncHandler(async (req: Request, res: Response) => {
    const { caseId, maxRounds = 5 } = req.body;
    
    if (!caseId) {
      throw new AppError('caseId is required', 400);
    }
    
    // Load case data
    const caseData = await loadCaseData(caseId);
    
    // Create new session
    const session: GameSession = {
      id: generateUUID(),
      caseId,
      caseData,
      currentRound: 1,
      maxRounds: Math.min(maxRounds, caseData.rounds?.length || 5),
      revealedClues: [],
      guesses: [],
      score: 0,
      status: 'active',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store session
    gameSessions.set(session.id, session);
    
    console.log(`📋 Created game session: ${session.id} for case: ${caseId}`);
    
    res.json({
      success: true,
      data: session
    });
  })
);

// GET /api/sessions/:id - Get session details
router.get('/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const session = gameSessions.get(id);
    
    if (!session) {
      throw new AppError('Session not found', 404);
    }
    
    res.json({
      success: true,
      data: session
    });
  })
);

// POST /api/sessions/:id/guess - Submit a location guess
router.post('/:id/guess',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { latitude, longitude, locationName } = req.body;
    
    const session = gameSessions.get(id);
    if (!session) {
      throw new AppError('Session not found', 404);
    }
    
    // Add guess to session
    const guess: any = {
      id: generateUUID(),
      round: session.currentRound,
      latitude,
      longitude,
      locationName,
      timestamp: new Date().toISOString()
    };
    
    session.guesses.push(guess);
    session.updatedAt = new Date().toISOString();
    
    // Calculate score (simple distance-based scoring)
    const currentRound = session.caseData.rounds?.[session.currentRound - 1];
    if (currentRound?.answer) {
      const distance = calculateDistance(
        latitude, longitude,
        currentRound.answer.lat, currentRound.answer.lng
      );
      
      // Simple scoring: closer = more points (max 1000 points)
      const points = Math.max(0, 1000 - Math.floor(distance / 10));
      guess.score = points;
      session.score += points;
    }
    
    console.log(`🎯 Guess submitted for session ${id}: ${locationName} (${latitude}, ${longitude})`);
    
    res.json({
      success: true,
      data: {
        guess,
        session
      }
    });
  })
);

// POST /api/sessions/:id/reveal - Reveal next clue
router.post('/:id/reveal',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const session = gameSessions.get(id);
    
    if (!session) {
      throw new AppError('Session not found', 404);
    }
    
    const currentRound = session.caseData.rounds?.[session.currentRound - 1];
    if (!currentRound) {
      throw new AppError('No more rounds available', 400);
    }
    
    // Add current round's clue to revealed clues if not already revealed
    if (!session.revealedClues.find((c: any) => c.round === session.currentRound)) {
      session.revealedClues.push({
        round: session.currentRound,
        clue: currentRound.clueHtml,
        image: currentRound.image,
        timestamp: new Date().toISOString()
      });
    }
    
    session.updatedAt = new Date().toISOString();
    
    console.log(`💡 Revealed clue for session ${id}, round ${session.currentRound}`);
    
    res.json({
      success: true,
      data: session
    });
  })
);

// POST /api/sessions/:id/advance - Advance to next round
router.post('/:id/advance',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const session = gameSessions.get(id);
    
    if (!session) {
      throw new AppError('Session not found', 404);
    }
    
    if (session.currentRound >= session.maxRounds) {
      session.status = 'completed';
    } else {
      session.currentRound++;
    }
    
    session.updatedAt = new Date().toISOString();
    
    console.log(`⏭️ Advanced session ${id} to round ${session.currentRound}`);
    
    res.json({
      success: true,
      data: session
    });
  })
);

// DELETE /api/sessions/:id - End session
router.delete('/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (gameSessions.has(id)) {
      gameSessions.delete(id);
      console.log(`🗑️ Deleted session ${id}`);
    }
    
    res.json({
      success: true,
      message: 'Session ended'
    });
  })
);

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

export default router;