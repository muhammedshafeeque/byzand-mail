import { Request, Response, NextFunction } from 'express';
import { IAuthRequest } from '../types/index.js';
import { authenticateUser } from '../helpers/index.js';

// Authentication middleware
export const authenticateToken = (req: IAuthRequest, res: Response, next: NextFunction) => {
  return authenticateUser(req, res, next);
};

// Admin authorization middleware
export const requireAdmin = (req: IAuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

// Optional authentication middleware (for public routes that can work with or without auth)
export const optionalAuth = (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Try to authenticate, but don't fail if token is invalid
      authenticateUser(req, res, () => {
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    // Continue without authentication
    next();
  }
};
