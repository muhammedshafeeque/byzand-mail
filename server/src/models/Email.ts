import mongoose, { Schema, Document } from 'mongoose';
import { EmailFolder } from '../types/index.js';

export interface IEmail extends Document {
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
  folder: EmailFolder;
  receivedAt: Date;
  sentAt?: Date;
  userId: string;
  threadId?: string;
  spamScore: number;
  markAsRead(): void;
  markAsUnread(): void;
  toggleStar(): void;
  moveToFolder(folder: EmailFolder): void;
  addLabel(label: string): void;
  removeLabel(label: string): void;
  setSpamScore(score: number): void;
}

export interface IAttachment {
  filename: string;
  contentType: string;
  size: number;
  path: string;
  checksum: string;
}

const attachmentSchema = new Schema<IAttachment>({
  filename: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  path: {
    type: String,
    required: true
  },
  checksum: {
    type: String,
    required: true
  }
});

const emailSchema = new Schema<IEmail>({
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  from: {
    type: String,
    required: true,
    trim: true
  },
  to: [{
    type: String,
    required: true,
    trim: true
  }],
  cc: [{
    type: String,
    trim: true
  }],
  bcc: [{
    type: String,
    trim: true
  }],
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  text: {
    type: String,
    trim: true
  },
  html: {
    type: String,
    trim: true
  },
  attachments: [attachmentSchema],
  isRead: {
    type: Boolean,
    default: false
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  isSpam: {
    type: Boolean,
    default: false
  },
  isTrash: {
    type: Boolean,
    default: false
  },
  labels: [{
    type: String,
    trim: true
  }],
  folder: {
    type: String,
    enum: ['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive'],
    default: 'inbox'
  },
  receivedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  sentAt: {
    type: Date
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  threadId: {
    type: String
  },
  spamScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
emailSchema.index({ userId: 1, folder: 1 });
emailSchema.index({ userId: 1, isRead: 1 });
emailSchema.index({ userId: 1, isStarred: 1 });
emailSchema.index({ userId: 1, isSpam: 1 });
emailSchema.index({ userId: 1, receivedAt: -1 });
emailSchema.index({ userId: 1, labels: 1 });
emailSchema.index({ userId: 1, from: 1 });
emailSchema.index({ userId: 1, to: 1 });
emailSchema.index({ userId: 1, subject: 'text', text: 'text', html: 'text' });
emailSchema.index({ messageId: 1 });
emailSchema.index({ threadId: 1 });

// Virtual for email size
emailSchema.virtual('size').get(function(this: any) {
  let size = 0;
  
  // Base email size
  size += this.subject?.length || 0;
  size += this.text?.length || 0;
  size += this.html?.length || 0;
  size += this.from?.length || 0;
  size += (this.to?.join('').length || 0);
  size += (this.cc?.join('').length || 0);
  size += (this.bcc?.join('').length || 0);
  
  // Attachments size
  if (this.attachments) {
    size += this.attachments.reduce((total: any, attachment: any) => total + attachment.size, 0);
  }
  
  return size;
});

// Virtual for has attachments
emailSchema.virtual('hasAttachments').get(function(this: any) {
  return this.attachments && this.attachments.length > 0;
});

// Virtual for attachment count
emailSchema.virtual('attachmentCount').get(function(this: any) {
  return this.attachments ? this.attachments.length : 0;
});

// Virtual for total attachment size
emailSchema.virtual('totalAttachmentSize').get(function(this: any) {
  if (!this.attachments) return 0;
  return this.attachments.reduce((total: any, attachment: any) => total + attachment.size, 0);
});

// Method to mark as read
emailSchema.methods.markAsRead = function(this: any): void {
  this.isRead = true;
};

// Method to mark as unread
emailSchema.methods.markAsUnread = function(this: any): void {
  this.isRead = false;
};

// Method to toggle star
emailSchema.methods.toggleStar = function(this: any): void {
  this.isStarred = !this.isStarred;
};

// Method to move to folder
emailSchema.methods.moveToFolder = function(this: any, folder: EmailFolder): void {
  this.folder = folder;
  if (folder === 'trash') {
    this.isTrash = true;
  } else if (folder === 'spam') {
    this.isSpam = true;
  } else {
    this.isTrash = false;
    this.isSpam = false;
  }
};

// Method to add label
emailSchema.methods.addLabel = function(this: any, label: string): void {
  if (!this.labels.includes(label)) {
    this.labels.push(label);
  }
};

// Method to remove label
emailSchema.methods.removeLabel = function(this: any, label: string): void {
  this.labels = this.labels.filter((l: any) => l !== label);
};

// Method to set spam score
emailSchema.methods.setSpamScore = function(this: any, score: number): void {
  this.spamScore = Math.max(0, Math.min(1, score));
  this.isSpam = score >= 0.7; // Threshold for spam detection
};

export const Email = mongoose.model<IEmail>('Email', emailSchema);
