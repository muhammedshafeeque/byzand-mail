import { hash, compare } from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { JWT_CONFIG, SECURITY_CONFIG } from '../configs/index.js';
import { IUser, IJwtPayload, IEmail } from '../types/index.js';
import { SPAM_DETECTION } from '../constants/index.js';

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, SECURITY_CONFIG.BCRYPT_ROUNDS);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await compare(password, hashedPassword);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH;
};

// JWT utilities
export const generateToken = (user: IUser): string => {
  const payload = {
    userId: (user._id as any).toString(),
    email: user.email,
    username: user.username,
    isAdmin: user.isAdmin
  };
  
  const options: SignOptions = {
    expiresIn: JWT_CONFIG.EXPIRES_IN as any
  };
  
  return jwt.sign(payload, JWT_CONFIG.SECRET, options);
};

export const verifyToken = (token: string): IJwtPayload | null => {
  try {
    return jwt.verify(token, JWT_CONFIG.SECRET) as IJwtPayload;
  } catch (error) {
    return null;
  }
};

// Email utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateMessageId = (): string => {
  return `<${uuidv4()}@emailclient.com>`;
};

export const parseRecipients = (recipients: string | string[]): string[] => {
  if (Array.isArray(recipients)) {
    return recipients;
  }
  return recipients.split(',').map(email => email.trim());
};

export const detectSpam = (email: IEmail): { isSpam: boolean; score: number; reasons: string[] } => {
  let score = 0;
  const reasons: string[] = [];
  const content = `${email.subject} ${email.text || ''} ${email.html || ''}`.toLowerCase();

  // Check for spam keywords
  SPAM_DETECTION.KEYWORDS.forEach(keyword => {
    if (content.includes(keyword.toLowerCase())) {
      score += 0.1;
      reasons.push(`Contains spam keyword: ${keyword}`);
    }
  });

  // Check for excessive capital letters
  const capitalRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capitalRatio > 0.3) {
    score += 0.2;
    reasons.push('Excessive capital letters');
  }

  // Check for suspicious sender patterns
  if (email.from.includes('noreply') || email.from.includes('no-reply')) {
    score += 0.1;
    reasons.push('Suspicious sender pattern');
  }

  // Check for multiple recipients (potential spam)
  if (email.to.length > 10) {
    score += 0.2;
    reasons.push('Multiple recipients');
  }

  return {
    isSpam: score >= SPAM_DETECTION.THRESHOLD,
    score: Math.min(score, 1),
    reasons
  };
};

// File utilities
export const generateUniqueFilename = (originalname: string): string => {
  const extension = originalname.split('.').pop();
  const uniqueId = uuidv4();
  return `${uniqueId}.${extension}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFileType = (mimetype: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimetype);
};

export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

// Pagination utilities
export const calculatePagination = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;
  
  return {
    page,
    limit,
    total,
    totalPages,
    skip,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

// Search utilities
export const createSearchFilter = (search: string, fields: string[]) => {
  const searchRegex = new RegExp(search, 'i');
  return {
    $or: fields.map(field => ({ [field]: searchRegex }))
  };
};

// Validation utilities
export const validateRequiredFields = (data: any, requiredFields: string[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Date utilities
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

// Response utilities
export const createSuccessResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    message
  };
};

export const createErrorResponse = (error: string, statusCode: number = 500) => {
  return {
    success: false,
    error,
    statusCode
  };
};

// Storage utilities
export const calculateStorageUsed = (emails: IEmail[]): number => {
  return emails.reduce((total, email) => {
    const textSize = email.text?.length || 0;
    const htmlSize = email.html?.length || 0;
    const attachmentSize = email.attachments?.reduce((sum, att) => sum + att.size, 0) || 0;
    return total + textSize + htmlSize + attachmentSize;
  }, 0);
};

export const checkQuota = (user: IUser, requiredBytes: number): boolean => {
  return (user.usedQuota + requiredBytes) <= user.emailQuota;
};

// Email folder utilities
export const isValidFolder = (folder: string): boolean => {
  const validFolders = ['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive'];
  return validFolders.includes(folder.toLowerCase());
};

// UUID utilities
export const generateId = (): string => {
  return uuidv4();
};

// Array utilities
export const removeDuplicates = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};
