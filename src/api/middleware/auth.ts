import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/authService';
import { AppError } from './errorHandler';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // Bypass authentication for admin/teacher when BYPASS_AUTH is enabled (for owner-only debugging)
    if ((process.env.BYPASS_AUTH || '').toLowerCase() === 'true') {
      req.user = {
        userId: '00000000-0000-0000-0000-000000000001',
        email: process.env.BYPASS_AUTH_EMAIL || 'teacher@school.edu',
        role: (process.env.BYPASS_AUTH_ROLE || 'teacher') as string,
      };
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Token verification failed', 401));
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      if (!roles.includes(req.user.role)) {
        throw new AppError(`Access denied. Required role: ${roles.join(' or ')}`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireTeacher = requireRole(['teacher', 'admin']);
export const requireAdmin = requireRole(['admin']);