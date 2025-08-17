import { IAttachment, ISendEmailRequest, IUpdateEmailRequest, IEmailQuery, IEmailStats } from '../types/index.js';
import { generateMessageId, parseRecipients, detectSpam, calculateStorageUsed } from '../utils/index.js';
import { EMAIL_FOLDERS, PAGINATION } from '../constants/index.js';
import { AuthService } from './authService.js';
import { Email, IEmail as IEmailModel } from '../models/Email.js';
import { IUser as IUserModel } from '../models/User.js';

export class EmailService {
  // Send email
  static async sendEmail(userId: string, emailData: ISendEmailRequest, attachments: IAttachment[] = []): Promise<{ messageId: string; sentAt: Date }> {
    const user = await AuthService.getUserById(userId) as unknown as IUserModel;
    if (!user) {
      throw new Error('User not found');
    }

    // Check quota
    const emailSize = (emailData.text?.length || 0) + (emailData.html?.length || 0);
    const attachmentSize = attachments.reduce((sum, att) => sum + att.size, 0);
    const totalSize = emailSize + attachmentSize;

    if (!user.hasQuota(totalSize)) {
      throw new Error('Email quota exceeded');
    }

    // Parse recipients
    const recipients = parseRecipients(emailData.to);
    const ccRecipients = emailData.cc ? parseRecipients(emailData.cc) : [];
    const bccRecipients = emailData.bcc ? parseRecipients(emailData.bcc) : [];

    // Create email
    const email = new Email({
      messageId: generateMessageId(),
      from: user.email,
      to: recipients,
      cc: ccRecipients,
      bcc: bccRecipients,
      subject: emailData.subject,
      ...(emailData.text && { text: emailData.text }),
      ...(emailData.html && { html: emailData.html }),
      attachments,
      isRead: false,
      isStarred: false,
      isSpam: false,
      isTrash: false,
      labels: [],
      folder: EMAIL_FOLDERS.SENT,
      receivedAt: new Date(),
      sentAt: new Date(),
      userId: user._id
    });

    // Detect spam
    const spamResult = detectSpam(email as any);
    email.isSpam = spamResult.isSpam;

    await email.save();

    // Update user quota
    user.updateQuota(totalSize);
    await user.save();

    return {
      messageId: email.messageId,
      sentAt: email.sentAt!
    };
  }

  // Get emails with filters and pagination
  static async getEmails(userId: string, query: IEmailQuery): Promise<{ emails: IEmailModel[]; pagination: any }> {
    // Build filter object
    const filter: any = { userId };
    
    if (query.folder) {
      filter.folder = query.folder;
    }
    
    if (query.isRead !== undefined) {
      filter.isRead = query.isRead;
    }
    
    if (query.isStarred !== undefined) {
      filter.isStarred = query.isStarred;
    }
    
    if (query.isSpam !== undefined) {
      filter.isSpam = query.isSpam;
    }
    
    if (query.labels && query.labels.length > 0) {
      filter.labels = { $in: query.labels };
    }
    
    if (query.hasAttachments !== undefined) {
      if (query.hasAttachments) {
        filter['attachments.0'] = { $exists: true };
      } else {
        filter['attachments.0'] = { $exists: false };
      }
    }

    // Build sort object
    const sortBy = query.sortBy || 'receivedAt';
    const sortOrder = query.sortOrder || 'desc';
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Apply pagination
    const page = query.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(query.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    // Build search query
    let searchFilter = filter;
    if (query.search) {
      searchFilter = {
        ...filter,
        $text: { $search: query.search }
      };
    }

    // Execute query
    const [emails, total] = await Promise.all([
      Email.find(searchFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Email.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      emails,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  // Get single email
  static async getEmailById(userId: string, emailId: string): Promise<IEmailModel | null> {
    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) {
      return null;
    }

    // Mark as read if not already
    if (!email.isRead) {
      email.markAsRead();
      await email.save();
    }

    return email;
  }

  // Update email
  static async updateEmail(userId: string, emailId: string, updateData: IUpdateEmailRequest): Promise<IEmailModel> {
    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) {
      throw new Error('Email not found');
    }

    // Update email fields
    if (updateData.isRead !== undefined) {
      if (updateData.isRead) {
        email.markAsRead();
      } else {
        email.markAsUnread();
      }
    }
    if (updateData.isStarred !== undefined) {
      if (updateData.isStarred) {
        email.isStarred = true;
      } else {
        email.isStarred = false;
      }
    }
    if (updateData.folder) {
      email.moveToFolder(updateData.folder as any);
    }
    if (updateData.labels) {
      email.labels = updateData.labels;
    }
    

    await email.save();
    return email;
  }

  // Delete email (move to trash)
  static async deleteEmail(userId: string, emailId: string): Promise<void> {
    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) {
      throw new Error('Email not found');
    }

    email.moveToFolder(EMAIL_FOLDERS.TRASH);
    await email.save();
  }

  // Permanently delete email
  static async permanentlyDeleteEmail(userId: string, emailId: string): Promise<void> {
    const result = await Email.deleteOne({ _id: emailId, userId });
    if (result.deletedCount === 0) {
      throw new Error('Email not found');
    }
  }

  // Get email statistics
  static async getEmailStats(userId: string): Promise<IEmailStats> {
    const [
      totalEmails,
      unreadEmails,
      spamEmails,
      sentEmails,
      starredEmails,
      user
    ] = await Promise.all([
      Email.countDocuments({ userId }),
      Email.countDocuments({ userId, isRead: false }),
      Email.countDocuments({ userId, isSpam: true }),
      Email.countDocuments({ userId, folder: EMAIL_FOLDERS.SENT }),
      Email.countDocuments({ userId, isStarred: true }),
      AuthService.getUserById(userId)
    ]);

    // Calculate storage used
    const userEmails = await Email.find({ userId }).lean();
    const storageUsed = calculateStorageUsed(userEmails as any);

    const storageLimit = user?.emailQuota || 0;

    return {
      totalEmails,
      unreadEmails,
      spamEmails,
      sentEmails,
      starredEmails,
      storageUsed,
      storageLimit,
      storageUsagePercentage: storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0
    };
  }

  // Mark email as spam/not spam
  static async markAsSpam(userId: string, emailId: string, isSpam: boolean): Promise<IEmailModel> {
    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) {
      throw new Error('Email not found');
    }

    email.setSpamScore(isSpam ? 0.8 : 0.0);
    await email.save();

    return email;
  }

  // Add/remove labels
  static async updateEmailLabels(userId: string, emailId: string, labels: string[]): Promise<IEmailModel> {
    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) {
      throw new Error('Email not found');
    }

    email.labels = labels;
    await email.save();

    return email;
  }

  // Get emails by folder
  static async getEmailsByFolder(userId: string, folder: string): Promise<IEmailModel[]> {
    return await Email.find({ userId, folder }).sort({ receivedAt: -1 }).lean();
  }

  // Search emails
  static async searchEmails(userId: string, searchTerm: string): Promise<IEmailModel[]> {
    return await Email.find({
      userId,
      $text: { $search: searchTerm }
    }).sort({ receivedAt: -1 }).lean();
  }

  // Get email attachments
  static async getEmailAttachments(userId: string, emailId: string): Promise<IAttachment[]> {
    const email = await Email.findOne({ _id: emailId, userId });
    if (!email) {
      throw new Error('Email not found');
    }

    return email.attachments || [];
  }

  // Bulk operations
  static async bulkUpdateEmails(userId: string, emailIds: string[], updateData: IUpdateEmailRequest): Promise<void> {
    const updateOperations = emailIds.map(emailId => 
      this.updateEmail(userId, emailId, updateData).catch(error => {
        console.error(`Failed to update email ${emailId}:`, error);
      })
    );
    
    await Promise.all(updateOperations);
  }

  static async bulkDeleteEmails(userId: string, emailIds: string[]): Promise<void> {
    const deleteOperations = emailIds.map(emailId => 
      this.deleteEmail(userId, emailId).catch(error => {
        console.error(`Failed to delete email ${emailId}:`, error);
      })
    );
    
    await Promise.all(deleteOperations);
  }
}
