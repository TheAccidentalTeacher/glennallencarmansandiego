import jwt from 'jsonwebtoken';
import type { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'teacher' | 'admin';
}

export class AuthService {
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: JWT_EXPIRES_IN as string,
      issuer: 'sourdough-pete',
      subject: user.id,
    } as jwt.SignOptions);
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  static generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      type: 'refresh',
    };

    return jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: '7d',
      issuer: 'sourdough-pete',
      subject: user.id,
    } as jwt.SignOptions);
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  static generatePasswordResetToken(userId: string): string {
    const payload = {
      userId,
      type: 'password_reset',
    };

    return jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: '1h',
      issuer: 'sourdough-pete',
      subject: userId,
    } as jwt.SignOptions);
  }

  static verifyPasswordResetToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as any;
      if (decoded.type !== 'password_reset') {
        return null;
      }
      return { userId: decoded.userId };
    } catch (error) {
      console.error('Password reset token verification failed:', error);
      return null;
    }
  }
}