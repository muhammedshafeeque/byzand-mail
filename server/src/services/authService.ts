import { IUser, IUserResponse, IRegisterRequest, ILoginRequest } from '../types/index.js';
import { generateToken } from '../utils/index.js';
import { EMAIL_QUOTA } from '../constants/index.js';
import { User, IUser as IUserModel } from '../models/User.js';
import bcrypt from 'bcryptjs';

export class AuthService {
  // Register new user
  static async registerUser(userData: IRegisterRequest): Promise<{ user: IUserResponse; token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }]
    });
    
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user (password will be hashed by pre-save hook)
    const user = new User({
      email: userData.email,
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isActive: true,
      isAdmin: false,
      emailQuota: EMAIL_QUOTA.DEFAULT_QUOTA,
      usedQuota: 0
    });

    await user.save();

    // Generate token
    const token = generateToken(user);
    const userResponse = this.toUserResponse(user);
    return { user: userResponse, token };
  }

  // Login user
  static async loginUser(loginData: ILoginRequest): Promise<{ user: IUserResponse; token: string }> {
    // Find user
    const user = await User.findOne({ email: loginData.email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(loginData.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user);
    const userResponse = this.toUserResponse(user);
    return { user: userResponse, token };
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  // Update user profile
  static async updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUserResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user fields
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.username) user.username = updateData.username;
    
    await user.save();
    
    const userResponse = this.toUserResponse(user);
    return userResponse;
  }

  // Change user password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 12);
    
    await user.save();
    
    return { message: 'Password changed successfully' };
  }

  // Deactivate user
  static async deactivateUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    user.updatedAt = new Date();
    await user.save();
  }

  // Activate user
  static async activateUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = true;
    user.updatedAt = new Date();
    await user.save();
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<IUserResponse[]> {
    const users = await User.find({ isActive: true }).select('-password');
    
    return users.map(user => this.toUserResponse(user));
  }

  // Update user quota
  static async updateUserQuota(userId: string, newQuota: number): Promise<{ message: string }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (newQuota < user.usedQuota) {
      throw new Error('New quota cannot be less than used quota');
    }

    // Update quota
    user.usedQuota = newQuota;
    
    await user.save();
    
    return { message: 'Quota updated successfully' };
  }

  // Check if user has admin privileges
  static async isAdmin(userId: string): Promise<boolean> {
    const user = await User.findById(userId);
    return user?.isAdmin || false;
  }

  // Get user statistics
  static async getUserStats(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    return {
      totalUsers,
      activeUsers,
      userQuota: user.emailQuota,
      usedQuota: user.usedQuota,
      quotaUsagePercentage: (user.usedQuota / user.emailQuota) * 100
    };
  }

  // Convert user document to response format
  private static toUserResponse(user: IUser): IUserResponse {
    return {
      id: (user._id as any).toString(),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      emailQuota: user.emailQuota,
      usedQuota: user.usedQuota,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date()
    };
  }
}
