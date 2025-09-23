import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { UserService } from '../../services/userService';
import { AuthService } from '../../services/authService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import type { Request, Response } from 'express';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').trim().isLength({ min: 2, max: 50 }).withMessage('Display name must be 2-50 characters'),
  body('role').isIn(['teacher', 'admin']).withMessage('Role must be teacher or admin'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Register new user
router.post('/register', registerValidation, asyncHandler(async (req: Request, res: Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { email, password, displayName, role } = req.body;

  // Check if user already exists
  const existingUser = await UserService.findByEmail(email);
  if (existingUser) {
    throw new AppError('User already exists with this email', 409);
  }

  // Create new user
  const user = await UserService.createUser({
    email,
    password,
    displayName,
    role,
  });

  // Generate tokens
  const accessToken = AuthService.generateToken(user);
  const refreshToken = AuthService.generateRefreshToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
}));

// Login user
router.post('/login', loginValidation, asyncHandler(async (req: Request, res: Response) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { email, password } = req.body;

  // Validate user credentials
  const user = await UserService.validatePassword(email, password);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const accessToken = AuthService.generateToken(user);
  const refreshToken = AuthService.generateRefreshToken(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    },
  });
}));

// Get current user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  
  const user = await UserService.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
}));

// Update user profile
router.put('/profile', 
  authenticateToken,
  [
    body('displayName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Display name must be 2-50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const userId = (req as any).user.userId;
    const { displayName, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await UserService.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Email already in use by another account', 409);
      }
    }

    const updatedUser = await UserService.updateUser(userId, { displayName, email });
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          role: updatedUser.role,
          updatedAt: updatedUser.updatedAt,
        },
      },
    });
  })
);

// Change password
router.put('/password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get user to verify current password
    const user = await UserService.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Validate current password
    const isCurrentPasswordValid = await UserService.validatePassword(user.email, currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    await UserService.updateUser(userId, { password: newPassword });

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  })
);

// Logout (client-side token removal, could also implement token blacklisting)
router.post('/logout', authenticateToken, asyncHandler(async (_req: Request, res: Response) => {
  // In a more sophisticated implementation, you might want to blacklist the token
  // For now, we'll just acknowledge the logout request
  res.json({
    success: true,
    message: 'Logout successful',
  });
}));

// Refresh token
router.post('/refresh', 
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = AuthService.verifyToken(refreshToken);
    if (!decoded) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Get user
    const user = await UserService.findById(decoded.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new tokens
    const newAccessToken = AuthService.generateToken(user);
    const newRefreshToken = AuthService.generateRefreshToken(user);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      },
    });
  })
);

export default router;