import { Request, Response } from 'express';
import { EmailService } from '../services/emailService.js';
import { validateEmailData, sendSuccessResponse, sendErrorResponse, getPaginationParams, getSearchParams } from '../helpers/index.js';
import { MESSAGES, HTTP_STATUS } from '../constants/index.js';
import { IEmailQuery } from '../types/index.js';

export class EmailController {
  // Get emails with filters and pagination
  static async getEmails(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const searchParams = getSearchParams(req);
      const paginationParams = getPaginationParams(req);

      const query: IEmailQuery = {
        page: paginationParams.page,
        limit: paginationParams.limit,
        search: searchParams.search,
        folder: searchParams.folder,
        ...(searchParams.isRead !== undefined && { isRead: searchParams.isRead }),
        ...(searchParams.isStarred !== undefined && { isStarred: searchParams.isStarred }),
        ...(searchParams.isSpam !== undefined && { isSpam: searchParams.isSpam }),
        ...(searchParams.labels && { labels: searchParams.labels })
      };

      const result = await EmailService.getEmails(userId, query);

      return sendSuccessResponse(res, result);
    } catch (error) {
      console.error('Get emails error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to fetch emails',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get single email
  static async getEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      if (!id) {
        return sendErrorResponse(res, 'Email ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      const email = await EmailService.getEmailById(userId, id);

      if (!email) {
        return sendErrorResponse(res, MESSAGES.ERROR.EMAIL_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return sendSuccessResponse(res, { email });
    } catch (error) {
      console.error('Get email error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to fetch email',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Send email
  static async sendEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const emailData = req.body;
      const files = (req.files as any[]) || [];

      // Validate email data
      const validation = validateEmailData(emailData);
      if (!validation.success) {
        return sendErrorResponse(res, validation.error!, HTTP_STATUS.BAD_REQUEST);
      }

      // Process attachments
      const attachments = files.map(file => ({
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        path: file.path,
        checksum: file.filename
      }));

      const result = await EmailService.sendEmail(userId, emailData, attachments);

      return sendSuccessResponse(
        res,
        result,
        MESSAGES.SUCCESS.EMAIL_SENT
      );
    } catch (error) {
      console.error('Send email error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to send email',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Update email
  static async updateEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      if (!id) {
        return sendErrorResponse(res, 'Email ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      const updateData = req.body;

      const email = await EmailService.updateEmail(userId, id, updateData);

      return sendSuccessResponse(
        res,
        { email },
        MESSAGES.SUCCESS.EMAIL_UPDATED
      );
    } catch (error) {
      console.error('Update email error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to update email',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Delete email (move to trash)
  static async deleteEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      if (!id) {
        return sendErrorResponse(res, 'Email ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      await EmailService.deleteEmail(userId, id);

      return sendSuccessResponse(
        res,
        {},
        MESSAGES.SUCCESS.EMAIL_DELETED
      );
    } catch (error) {
      console.error('Delete email error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to delete email',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Permanently delete email
  static async permanentlyDeleteEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      if (!id) {
        return sendErrorResponse(res, 'Email ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      await EmailService.permanentlyDeleteEmail(userId, id);

      return sendSuccessResponse(
        res,
        {},
        'Email permanently deleted'
      );
    } catch (error) {
      console.error('Permanently delete email error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to permanently delete email',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Get email statistics
  static async getEmailStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const stats = await EmailService.getEmailStats(userId);

      return sendSuccessResponse(res, stats);
    } catch (error) {
      console.error('Get email stats error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to get email statistics',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Mark email as spam/not spam
  static async markAsSpam(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      if (!id) {
        return sendErrorResponse(res, 'Email ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      const { isSpam } = req.body;

      if (typeof isSpam !== 'boolean') {
        return sendErrorResponse(res, 'isSpam must be a boolean value', HTTP_STATUS.BAD_REQUEST);
      }

      const email = await EmailService.markAsSpam(userId, id, isSpam);

      return sendSuccessResponse(
        res,
        { email },
        `Email marked as ${isSpam ? 'spam' : 'not spam'}`
      );
    } catch (error) {
      console.error('Mark as spam error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to mark email as spam',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Update email labels
  static async updateEmailLabels(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      if (!id) {
        return sendErrorResponse(res, 'Email ID is required', HTTP_STATUS.BAD_REQUEST);
      }
      const { labels } = req.body;

      if (!Array.isArray(labels)) {
        return sendErrorResponse(res, 'Labels must be an array', HTTP_STATUS.BAD_REQUEST);
      }

      const email = await EmailService.updateEmailLabels(userId, id, labels);

      return sendSuccessResponse(
        res,
        { email },
        'Email labels updated'
      );
    } catch (error) {
      console.error('Update email labels error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to update email labels',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Get emails by folder
  static async getEmailsByFolder(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { folder } = req.params;
      if (!folder) {
        return sendErrorResponse(res, 'Folder is required', HTTP_STATUS.BAD_REQUEST);
      }

      const emails = await EmailService.getEmailsByFolder(userId, folder);

      return sendSuccessResponse(res, { emails });
    } catch (error) {
      console.error('Get emails by folder error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to get emails by folder',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Search emails
  static async searchEmails(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return sendErrorResponse(res, 'Search query is required', HTTP_STATUS.BAD_REQUEST);
      }

      const emails = await EmailService.searchEmails(userId, q);

      return sendSuccessResponse(res, { emails });
    } catch (error) {
      console.error('Search emails error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to search emails',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Get email attachments
  static async getEmailAttachments(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { emailId } = req.params;
      if (!emailId) {
        return sendErrorResponse(res, 'Email ID is required', HTTP_STATUS.BAD_REQUEST);
      }

      const attachments = await EmailService.getEmailAttachments(userId, emailId);

      return sendSuccessResponse(res, { attachments });
    } catch (error) {
      console.error('Get email attachments error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to get email attachments',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Bulk update emails
  static async bulkUpdateEmails(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { emailIds, updateData } = req.body;

      if (!Array.isArray(emailIds) || emailIds.length === 0) {
        return sendErrorResponse(res, 'Email IDs array is required', HTTP_STATUS.BAD_REQUEST);
      }

      await EmailService.bulkUpdateEmails(userId, emailIds, updateData);

      return sendSuccessResponse(
        res,
        {},
        `${emailIds.length} emails updated successfully`
      );
    } catch (error) {
      console.error('Bulk update emails error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to bulk update emails',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // Bulk delete emails
  static async bulkDeleteEmails(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { emailIds } = req.body;

      if (!Array.isArray(emailIds) || emailIds.length === 0) {
        return sendErrorResponse(res, 'Email IDs array is required', HTTP_STATUS.BAD_REQUEST);
      }

      await EmailService.bulkDeleteEmails(userId, emailIds);

      return sendSuccessResponse(
        res,
        {},
        `${emailIds.length} emails moved to trash`
      );
    } catch (error) {
      console.error('Bulk delete emails error:', error);
      return sendErrorResponse(
        res,
        error instanceof Error ? error.message : 'Failed to bulk delete emails',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }
}
