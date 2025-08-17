import { Request, Response, NextFunction } from 'express';
import { IAuthRequest } from '../types/index.js';
import { authenticateUser } from '../helpers/index.js';
import { sendErrorResponse } from '../utils/index.js';
import { HTTP_STATUS } from '../constants/index.js';

// Authentication middleware
export const authenticateToken = (req: IAuthRequest, res: Response, next: NextFunction) => {
  return authenticateUser(req, res, next);
};

// Admin authorization middleware
export const requireAdmin = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.isAdmin) {
    return sendErrorResponse(res, 'Admin access required', HTTP_STATUS.FORBIDDEN);
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
