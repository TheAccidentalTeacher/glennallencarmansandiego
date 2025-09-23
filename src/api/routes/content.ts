import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { CaseService } from '../../services/contentService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticateToken, requireTeacher } from '../middleware/auth';
import type { Request, Response } from 'express';

const router = Router();

// Get all cases (public endpoint for game selection)
router.get('/cases',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const cases = await CaseService.listCases(undefined, limit, offset);

    res.json({
      success: true,
      data: { cases },
    });
  })
);

// Get cases created by authenticated user (teachers only)
router.get('/my-cases',
  authenticateToken,
  requireTeacher,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const cases = await CaseService.listCases(userId, limit, offset);

    res.json({
      success: true,
      data: { cases },
    });
  })
);

// Get case clues
router.get('/cases/:caseId/clues',
  [param('caseId').isString().notEmpty().withMessage('Case ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { caseId } = req.params;
    const clues = await CaseService.getCaseClues(caseId);

    res.json({
      success: true,
      data: { clues },
    });
  })
);

// Create a new case (teachers/admins only)
router.post('/cases',
  authenticateToken,
  requireTeacher,
  [
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters'),
    body('difficultyLevel').isInt({ min: 1, max: 5 }).withMessage('Difficulty level must be 1-5'),
    body('villainId').isString().notEmpty().withMessage('Villain ID is required'),
    body('targetLocationId').isString().notEmpty().withMessage('Target location ID is required'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const userId = req.user!.userId;
    const caseData = { ...req.body, createdBy: userId };
    const createdCase = await CaseService.createCase(caseData);

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: { case: createdCase },
    });
  })
);

// Update a case (teachers/admins only)
router.put('/cases/:caseId',
  authenticateToken,
  requireTeacher,
  [
    param('caseId').isString().notEmpty().withMessage('Case ID is required'),
    body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    body('description').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters'),
    body('difficultyLevel').optional().isInt({ min: 1, max: 5 }).withMessage('Difficulty level must be 1-5'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { caseId } = req.params;
    const updates = req.body;

    const updatedCase = await CaseService.updateCase(caseId, updates);
    if (!updatedCase) {
      throw new AppError('Case not found', 404);
    }

    res.json({
      success: true,
      message: 'Case updated successfully',
      data: { case: updatedCase },
    });
  })
);

// Delete a case (teachers/admins only)
router.delete('/cases/:caseId',
  authenticateToken,
  requireTeacher,
  [param('caseId').isString().notEmpty().withMessage('Case ID is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { caseId } = req.params;
    const deleted = await CaseService.deleteCase(caseId);

    if (!deleted) {
      throw new AppError('Case not found', 404);
    }

    res.json({
      success: true,
      message: 'Case deleted successfully',
    });
  })
);

export default router;