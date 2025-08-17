import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailAccount extends Document {
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
  testImapConnection(): Promise<boolean>;
  testSmtpConnection(): Promise<boolean>;
  updateLastSync(): void;
}

const emailAccountSchema = new Schema<IEmailAccount>({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true
  },
  imapHost: {
    type: String,
    required: true,
    trim: true
  },
  imapPort: {
    type: Number,
    required: true,
    min: 1,
    max: 65535
  },
  imapSecure: {
    type: Boolean,
    default: false
  },
  smtpHost: {
    type: String,
    required: true,
    trim: true
  },
  smtpPort: {
    type: Number,
    required: true,
    min: 1,
    max: 65535
  },
  smtpSecure: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSync: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).password;
      return ret;
    }
  }
});

// Indexes for better query performance
emailAccountSchema.index({ userId: 1 });
emailAccountSchema.index({ userId: 1, email: 1 });
emailAccountSchema.index({ userId: 1, isActive: 1 });

// Virtual for connection string
emailAccountSchema.virtual('imapConnectionString').get(function() {
  const protocol = this.imapSecure ? 'imaps' : 'imap';
  return `${protocol}://${this.imapHost}:${this.imapPort}`;
});

emailAccountSchema.virtual('smtpConnectionString').get(function() {
  const protocol = this.smtpSecure ? 'smtps' : 'smtp';
  return `${protocol}://${this.smtpHost}:${this.smtpPort}`;
});

// Method to test IMAP connection
emailAccountSchema.methods.testImapConnection = async function(): Promise<boolean> {
  try {
    // This would be implemented with actual IMAP connection testing
    // For now, we'll return true as a placeholder
    return true;
  } catch (error) {
    return false;
  }
};

// Method to test SMTP connection
emailAccountSchema.methods.testSmtpConnection = async function(): Promise<boolean> {
  try {
    // This would be implemented with actual SMTP connection testing
    // For now, we'll return true as a placeholder
    return true;
  } catch (error) {
    return false;
  }
};

// Method to update last sync
emailAccountSchema.methods.updateLastSync = function(): void {
  this.lastSync = new Date();
};

export const EmailAccount = mongoose.model<IEmailAccount>('EmailAccount', emailAccountSchema);
