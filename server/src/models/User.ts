import mongoose, { Document, Schema } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';

export interface IUser extends Document {
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
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  hasQuota(requiredBytes: number): boolean;
  updateQuota(usedBytes: number): void;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  emailQuota: {
    type: Number,
    default: 1073741824, // 1GB in bytes
    min: 0
  },
  usedQuota: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await genSalt(12);
    this.password = await hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for quota usage percentage
userSchema.virtual('quotaUsagePercentage').get(function() {
  return this.emailQuota > 0 ? (this.usedQuota / this.emailQuota) * 100 : 0;
});

// Method to check if user has enough quota
userSchema.methods.hasQuota = function(requiredBytes: number): boolean {
  return (this.usedQuota + requiredBytes) <= this.emailQuota;
};

// Method to update used quota
userSchema.methods.updateQuota = function(bytes: number): void {
  this.usedQuota = Math.max(0, this.usedQuota + bytes);
};

export const User = mongoose.model<IUser>('User', userSchema);
