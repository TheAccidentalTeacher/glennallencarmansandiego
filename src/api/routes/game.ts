import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { GameSessionController } from '../../services/gameSessionController';
import { query } from '../../services/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticateToken, requireTeacher } from '../middleware/auth';
import type { Request, Response } from 'express';

const router = Router();

// Start a game session (teachers only)
router.post('/sessions/:sessionId/start',
  authenticateToken,
  requireTeacher,
  [param('sessionId').isString().notEmpty().withMessage('Session ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { sessionId } = req.params;

    const gameState = await GameSessionController.startGameSession(sessionId, {
      maxRounds: 3,
      cluesPerRound: 5,
      roundDurationMinutes: 15,
      timeBetweenRounds: 2,
      autoAdvanceRounds: false,
      allowLateJoins: true,
    });

    res.json({
      success: true,
      message: 'Game session started',
      data: { gameState },
    });
  })
);

// Get current game state
router.get('/sessions/:sessionId/state',
  authenticateToken,
  [param('sessionId').isString().notEmpty().withMessage('Session ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { sessionId } = req.params;
    const gameState = await GameSessionController.getGameState(sessionId);

    res.json({
      success: true,
      data: { gameState },
    });
  })
);

// Get clue analysis data for current round
router.get('/sessions/:sessionId/clue-analysis',
  authenticateToken,
  [param('sessionId').isString().notEmpty().withMessage('Session ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { sessionId } = req.params;
    const gameState = await GameSessionController.getGameState(sessionId);
    
    // Get target location from the case
    const caseResult = await query(
      'SELECT c.target_location_id, l.* FROM game_sessions gs ' +
      'JOIN cases c ON gs.case_id = c.id ' +
      'JOIN locations l ON c.target_location_id = l.id ' +
      'WHERE gs.id = $1',
      [sessionId]
    );

    if (caseResult.rows.length === 0) {
      throw new AppError('Target location not found for session', 404);
    }

    const targetLocationRow = caseResult.rows[0];
    const targetLocation = {
      id: targetLocationRow.id,
      name: targetLocationRow.name,
      country: targetLocationRow.country,
      latitude: parseFloat(targetLocationRow.latitude),
      longitude: parseFloat(targetLocationRow.longitude),
      region: targetLocationRow.region,
      difficultyLevel: targetLocationRow.difficulty_level
    };

    res.json({
      success: true,
      data: {
        targetLocation,
        revealedClues: gameState.clueState.revealedClues,
        roundNumber: gameState.currentRound
      }
    });
  })
);

// Reveal next clue
router.post('/sessions/:sessionId/clues/reveal',
  authenticateToken,
  requireTeacher,
  [param('sessionId').isString().notEmpty().withMessage('Session ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { sessionId } = req.params;
    const clueResult = await GameSessionController.revealNextClue(sessionId);

    res.json({
      success: true,
      data: { clueResult },
    });
  })
);

// Submit a warrant/guess
router.post('/sessions/:sessionId/warrants',
  authenticateToken,
  [
    param('sessionId').isString().notEmpty().withMessage('Session ID is required'),
    body('locationId').isString().notEmpty().withMessage('Location ID is required'),
    body('reasoning').optional().isString().trim(),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { sessionId } = req.params;
    const { locationId, reasoning } = req.body;
    const userId = req.user!.userId;

    // Submit warrant using enhanced scoring system
    const result = await GameSessionController.submitEnhancedWarrant(
      sessionId,
      userId,
      locationId,
      reasoning
    );

    res.json({
      success: true,
      data: { result },
    });
  })
);

// Advance to next round (teachers only)
router.post('/sessions/:sessionId/rounds/advance',
  authenticateToken,
  requireTeacher,
  [param('sessionId').isString().notEmpty().withMessage('Session ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { sessionId } = req.params;
    const gameState = await GameSessionController.advanceToNextRound(sessionId);

    res.json({
      success: true,
      data: { gameState },
    });
  })
);

// Complete/end game (teachers only)
router.post('/sessions/:sessionId/complete',
  authenticateToken,
  requireTeacher,
  [param('sessionId').isString().notEmpty().withMessage('Session ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { sessionId } = req.params;
    const finalState = await GameSessionController.completeGame(sessionId);

    res.json({
      success: true,
      message: 'Game completed',
      data: { finalState },
    });
  })
);

// Get session analytics (teachers only)
router.get('/sessions/:sessionId/analytics',
  authenticateToken,
  requireTeacher,
  [param('sessionId').isString().notEmpty().withMessage('Session ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { sessionId } = req.params;
    const analytics = await GameSessionController.getSessionAnalytics(sessionId);

    res.json({
      success: true,
      data: { analytics },
    });
  })
);

// Pause game (teachers only)
router.post('/sessions/:sessionId/pause',
  authenticateToken,
  requireTeacher,
  [param('sessionId').isString().notEmpty().withMessage('Session ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { sessionId } = req.params;
    const gameState = await GameSessionController.pauseGame(sessionId);

    res.json({
      success: true,
      message: 'Game paused',
      data: { gameState },
    });
  })
);

// Resume game (teachers only)
router.post('/sessions/:sessionId/resume',
  authenticateToken,
  requireTeacher,
  [param('sessionId').isString().notEmpty().withMessage('Session ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { sessionId } = req.params;
    const gameState = await GameSessionController.resumeGame(sessionId);

    res.json({
      success: true,
      message: 'Game resumed',
      data: { gameState },
    });
  })
);

export default router;