import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Middleware to require JWT authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = authService.verifyAccessToken(token);
    
    // Attach user info to request
    req.userId = payload.userId;
    req.userEmail = payload.email;
    
    next();
  } catch (error: any) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware to require verified email
 */
export function requireVerifiedEmail(req: Request, res: Response, next: NextFunction) {
  // This should be called after requireAuth
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if email is verified
  const db = require('../db').default;
  const stmt = db.prepare('SELECT email_verified FROM users WHERE id = ?');
  const user = stmt.get(req.userId) as { email_verified: number } | undefined;

  if (!user || user.email_verified !== 1) {
    return res.status(403).json({ 
      error: 'Email not verified',
      message: 'Please verify your email address to continue'
    });
  }

  next();
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = authService.verifyAccessToken(token);
      req.userId = payload.userId;
      req.userEmail = payload.email;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  
  next();
}
