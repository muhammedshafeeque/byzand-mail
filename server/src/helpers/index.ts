import { Request, Response, NextFunction } from 'express';
import { IAuthRequest, IApiResponse } from '../types/index.js';
import { MESSAGES, HTTP_STATUS } from '../constants/index.js';
import { verifyToken, validateRequiredFields, validateEmail, validatePassword } from '../utils/index.js';
import { JWT_CONFIG } from '../configs/index.js';

// Authentication helper
export const authenticateUser = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return sendErrorResponse(res, 'Access token required', HTTP_STATUS.UNAUTHORIZED);
    }
    
    const decoded = verifyToken(token) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return sendErrorResponse(res, 'Invalid or expired token', HTTP_STATUS.UNAUTHORIZED);
  }
};

// Validation helpers
export const validateRegistrationData = (data: any): IApiResponse => {
  const requiredFields = ['email', 'username', 'password', 'firstName', 'lastName'];
  const validation = validateRequiredFields(data, requiredFields);

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(', ')
    };
  }

  if (!validateEmail(data.email)) {
    return {
      success: false,
      error: 'Invalid email format'
    };
  }

  if (!validatePassword(data.password)) {
    return {
      success: false,
      error: 'Password must be at least 8 characters long'
    };
  }

  if (data.username.length < 3) {
    return {
      success: false,
      error: 'Username must be at least 3 characters long'
    };
  }

  return { success: true };
};

export const validateLoginData = (data: any): IApiResponse => {
  const requiredFields = ['email', 'password'];
  const validation = validateRequiredFields(data, requiredFields);

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(', ')
    };
  }

  if (!validateEmail(data.email)) {
    return {
      success: false,
      error: 'Invalid email format'
    };
  }

  return { success: true };
};

export const validateEmailData = (data: any): IApiResponse => {
  const requiredFields = ['to', 'subject'];
  const validation = validateRequiredFields(data, requiredFields);

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(', ')
    };
  }

  if (!data.text && !data.html) {
    return {
      success: false,
      error: 'Email content (text or html) is required'
    };
  }

  // Validate recipients
  const recipients = Array.isArray(data.to) ? data.to : [data.to];
  for (const recipient of recipients) {
    if (!validateEmail(recipient)) {
      return {
        success: false,
        error: `Invalid recipient email: ${recipient}`
      };
    }
  }

  return { success: true };
};

// Response helpers
export const sendSuccessResponse = <T>(res: Response, data: T, message?: string, statusCode: number = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

export const sendErrorResponse = (res: Response, error: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  return res.status(statusCode).json({
    success: false,
    error
  });
};

export const sendValidationError = (res: Response, errors: string[]) => {
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    error: errors.join(', ')
  });
};

// Error handling helpers
export const handleAsyncError = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return sendErrorResponse(res, 'Validation failed', HTTP_STATUS.BAD_REQUEST);
  }

  if (error.name === 'JsonWebTokenError') {
    return sendErrorResponse(res, MESSAGES.ERROR.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
  }

  if (error.name === 'TokenExpiredError') {
    return sendErrorResponse(res, 'Token expired', HTTP_STATUS.UNAUTHORIZED);
  }

  // Handle multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return sendErrorResponse(res, MESSAGES.ERROR.FILE_TOO_LARGE, HTTP_STATUS.BAD_REQUEST);
  }

  if (error.message === 'File type not allowed') {
    return sendErrorResponse(res, MESSAGES.ERROR.FILE_TYPE_NOT_ALLOWED, HTTP_STATUS.BAD_REQUEST);
  }

  // Default error
  return sendErrorResponse(res, 
    process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  );
};

// Pagination helper
export const getPaginationParams = (req: Request) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Search helper
export const getSearchParams = (req: Request) => {
  return {
    search: req.query.search as string,
    folder: req.query.folder as string || 'inbox',
    isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
    isStarred: req.query.isStarred === 'true' ? true : req.query.isStarred === 'false' ? false : undefined,
    isSpam: req.query.isSpam === 'true' ? true : req.query.isSpam === 'false' ? false : undefined,
    labels: req.query.labels ? (req.query.labels as string).split(',') : undefined
  };
};

// File upload helper
export const validateUploadedFiles = (files: any[], maxFiles: number, allowedTypes: string[], maxSize: number) => {
  const errors: string[] = [];

  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
  }

  for (const file of files) {
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`File type not allowed: ${file.originalname}`);
    }

    if (file.size > maxSize) {
      errors.push(`File too large: ${file.originalname}`);
    }
  }

  return errors;
};

// Rate limiting helper
export const createRateLimitKey = (req: Request): string => {
  return `${req.ip}-${req.path}`;
};

// Logging helper
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
};

// Security helper
export const sanitizeUserData = (user: any) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

// Email helper
export const formatEmailAddress = (email: string, name?: string): string => {
  if (name) {
    return `${name} <${email}>`;
  }
  return email;
};

// Date helper
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};
