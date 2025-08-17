// Email folders
export const EMAIL_FOLDERS = {
  INBOX: 'inbox',
  SENT: 'sent',
  DRAFTS: 'drafts',
  TRASH: 'trash',
  SPAM: 'spam',
  ARCHIVE: 'archive'
} as const;

// Email status
export const EMAIL_STATUS = {
  READ: 'read',
  UNREAD: 'unread',
  STARRED: 'starred',
  UNSTARRED: 'unstarred',
  SPAM: 'spam',
  NOT_SPAM: 'not_spam'
} as const;

// File upload constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed'
  ],
  MAX_FILES: 10
} as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
} as const;

// JWT constants
export const JWT = {
  EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;

// Email quota constants
export const EMAIL_QUOTA = {
  DEFAULT_QUOTA: 1024 * 1024 * 1024, // 1GB
  MAX_QUOTA: 10 * 1024 * 1024 * 1024 // 10GB
} as const;

// Rate limiting constants
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Response messages
export const MESSAGES = {
  SUCCESS: {
    USER_REGISTERED: 'User registered successfully',
    USER_LOGGED_IN: 'Login successful',
    EMAIL_SENT: 'Email sent successfully',
    EMAIL_UPDATED: 'Email updated successfully',
    EMAIL_DELETED: 'Email moved to trash',
    PROFILE_UPDATED: 'Profile updated successfully'
  },
  ERROR: {
    VALIDATION_FAILED: 'Validation failed',
    USER_EXISTS: 'User already exists',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    EMAIL_NOT_FOUND: 'Email not found',
    UNAUTHORIZED: 'Unauthorized access',
    TOKEN_REQUIRED: 'Access token required',
    TOKEN_INVALID: 'Invalid or expired token',
    FILE_TOO_LARGE: 'File too large',
    FILE_TYPE_NOT_ALLOWED: 'File type not allowed',
    QUOTA_EXCEEDED: 'Email quota exceeded'
  }
} as const;

// Spam detection constants
export const SPAM_DETECTION = {
  THRESHOLD: 0.7,
  KEYWORDS: [
    'free money',
    'lottery winner',
    'urgent action required',
    'click here',
    'limited time offer',
    'act now',
    'exclusive deal',
    'guaranteed income'
  ]
} as const;
