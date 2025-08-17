import { Request } from 'express';

// User interfaces
export interface IUser {
  id: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isAdmin: boolean;
  emailQuota: number;
  usedQuota: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IUserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isAdmin: boolean;
  emailQuota: number;
  usedQuota: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Email interfaces
export interface IEmail {
  id: string;
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: IAttachment[];
  isRead: boolean;
  isStarred: boolean;
  isSpam: boolean;
  isTrash: boolean;
  labels: string[];
  folder: string;
  receivedAt: Date;
  sentAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IAttachment {
  filename: string;
  contentType: string;
  size: number;
  path: string;
  checksum: string;
}

export interface IEmailAccount {
  id: string;
  userId: string;
  email: string;
  password: string;
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  isActive: boolean;
  lastSync?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive';

// Request interfaces
export interface IAuthRequest extends Request {
  user?: IUser;
}

export interface IEmailQuery {
  page?: number;
  limit?: number;
  folder?: string;
  isRead?: boolean;
  isStarred?: boolean;
  isSpam?: boolean;
  search?: string;
  labels?: string[];
  hasAttachments?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response interfaces
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IPaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IEmailStats {
  totalEmails: number;
  unreadEmails: number;
  spamEmails: number;
  sentEmails: number;
  starredEmails: number;
  storageUsed: number;
  storageLimit: number;
  storageUsagePercentage: number;
}

// JWT payload interface
export interface IJwtPayload {
  userId: string;
  email: string;
  username: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

// Validation interfaces
export interface IRegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ISendEmailRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface IUpdateEmailRequest {
  isRead?: boolean;
  isStarred?: boolean;
  folder?: string;
  labels?: string[];
}

// File upload interface
export interface IUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}
