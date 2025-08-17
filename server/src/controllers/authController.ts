import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { validateRegistrationData, validateLoginData, sendSuccessResponse, sendErrorResponse } from '../helpers/index.js';
import { MESSAGES, HTTP_STATUS } from '../constants/index.js';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response) {
    try {
      // Validate registration data
      const validation = validateRegistrationData(req.body);
      if (!validation.success) {
        return sendErrorResponse(res, validation.error!, HTTP_STATUS.BAD_REQUEST);
      }

      // Register user
      const result = await AuthService.registerUser(req.body);

      return sendSuccessResponse(
        res,
        result,
        MESSAGES.SUCCESS.USER_REGISTERED,
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      console.error('Registration error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Registration failed',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Login user
  static async login(req: Request, res: Response) {
    try {
      // Validate login data
      const validation = validateLoginData(req.body);
      if (!validation.success) {
        return sendErrorResponse(res, validation.error!, HTTP_STATUS.BAD_REQUEST);
      }

      // Login user
      const result = await AuthService.loginUser(req.body);

      return sendSuccessResponse(
        res,
        result,
        MESSAGES.SUCCESS.USER_LOGGED_IN
      );
    } catch (error) {
      console.error('Login error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Login failed',
        HTTP_STATUS.UNAUTHORIZED
      );
    }
  }

  // Get user profile
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await AuthService.getUserById(userId);

      if (!user) {
        return sendErrorResponse(res, MESSAGES.ERROR.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Remove password from response
      const { password, ...userResponse } = user;

      return sendSuccessResponse(res, { user: userResponse });
    } catch (error) {
      console.error('Get profile error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to get profile',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Update user profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const updateData = req.body;

      // Remove sensitive fields from update data
      delete updateData.password;
      delete updateData.id;
      delete updateData.email; // Prevent email change through this endpoint

      const updatedUser = await AuthService.updateUserProfile(userId, updateData);

      return sendSuccessResponse(
        res,
        { user: updatedUser },
        MESSAGES.SUCCESS.PROFILE_UPDATED
      );
    } catch (error) {
      console.error('Update profile error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to update profile',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return sendErrorResponse(res, 'Current password and new password are required', HTTP_STATUS.BAD_REQUEST);
      }

      await AuthService.changePassword(userId, currentPassword, newPassword);

      return sendSuccessResponse(
        res,
        {},
        'Password changed successfully'
      );
    } catch (error) {
      console.error('Change password error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to change password',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Get user statistics (admin only)
  static async getUserStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const stats = AuthService.getUserStats(userId);

      return sendSuccessResponse(res, stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to get user statistics',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get all users (admin only)
  static async getAllUsers(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      
      // Check if user is admin
      if (!AuthService.isAdmin(userId)) {
        return sendErrorResponse(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
      }

      const users = AuthService.getAllUsers();

      return sendSuccessResponse(res, { users });
    } catch (error) {
      console.error('Get all users error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to get users',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Update user quota (admin only)
  static async updateUserQuota(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const { userId, newQuota } = req.body;

      // Check if user is admin
      if (!(await AuthService.isAdmin(adminId))) {
        return sendErrorResponse(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
      }

      if (!userId || !newQuota) {
        return sendErrorResponse(res, 'User ID and new quota are required', HTTP_STATUS.BAD_REQUEST);
      }

      await AuthService.updateUserQuota(userId, newQuota);

      return sendSuccessResponse(
        res,
        {},
        'User quota updated successfully'
      );
    } catch (error) {
      console.error('Update user quota error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to update user quota',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Deactivate user (admin only)
  static async deactivateUser(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const { userId } = req.params;

      // Check if user is admin
      if (!(await AuthService.isAdmin(adminId))) {
        return sendErrorResponse(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
      }

      if (!userId) {
        return sendErrorResponse(res, 'User ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      await AuthService.deactivateUser(userId);

      return sendSuccessResponse(
        res,
        {},
        'User deactivated successfully'
      );
    } catch (error) {
      console.error('Deactivate user error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to deactivate user',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Activate user (admin only)
  static async activateUser(req: Request, res: Response) {
    try {
      const adminId = (req as any).user.id;
      const { userId } = req.params;

      // Check if user is admin
      if (!(await AuthService.isAdmin(adminId))) {
        return sendErrorResponse(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
      }

      if (!userId) {
        return sendErrorResponse(res, 'User ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      await AuthService.activateUser(userId);

      return sendSuccessResponse(
        res,
        {},
        'User activated successfully'
      );
    } catch (error) {
      console.error('Activate user error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to activate user',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }
}
