// User types
export interface User {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isAdmin: boolean;
  emailQuota: number;
  usedQuota: number;
  createdAt: string;
  updatedAt: string;
}

// Email types
export interface Email {
  _id: string;
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
  isRead: boolean;
  isStarred: boolean;
  isSpam: boolean;
  isTrash: boolean;
  labels: string[];
  folder: string;
  receivedAt: string;
  sentAt?: string;
  userId: string;
  threadId?: string;
  spamScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  filename: string;
  contentType: string;
  size: number;
  path: string;
  checksum: string;
}

export interface EmailStats {
  totalEmails: number;
  unreadEmails: number;
  spamEmails: number;
  sentEmails: number;
  starredEmails: number;
  storageUsed: number;
  storageLimit: number;
  storageUsagePercentage: number;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SendEmailRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface UpdateEmailRequest {
  isRead?: boolean;
  isStarred?: boolean;
  folder?: string;
  labels?: string[];
}
