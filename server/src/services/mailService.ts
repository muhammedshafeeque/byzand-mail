import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../configs/index.js';

// Create transporter for sending emails
const createTransporter = () => {
  const config: any = {
    host: EMAIL_CONFIG.HOST,
    port: EMAIL_CONFIG.PORT,
    secure: EMAIL_CONFIG.SECURE, // true for 465, false for other ports
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  };

  // Only add auth if username and password are provided
  if (EMAIL_CONFIG.USER && EMAIL_CONFIG.PASS) {
    config.auth = {
      user: EMAIL_CONFIG.USER,
      pass: EMAIL_CONFIG.PASS,
    };
  }

  return nodemailer.createTransport(config);
};

export class MailService {
  // Send email via SMTP
  static async sendEmail(emailData: {
    from: string;
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      path: string;
      contentType: string;
    }>;
  }) {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: emailData.from,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        cc: emailData.cc ? (Array.isArray(emailData.cc) ? emailData.cc.join(', ') : emailData.cc) : undefined,
        bcc: emailData.bcc ? (Array.isArray(emailData.bcc) ? emailData.bcc.join(', ') : emailData.bcc) : undefined,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        attachments: emailData.attachments?.map(att => ({
          filename: att.filename,
          path: att.path,
          contentType: att.contentType
        }))
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test SMTP connection
  static async testConnection() {
    try {
      const transporter = createTransporter();
      await transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }

  // Get SMTP configuration info
  static getConfig() {
    return {
      host: EMAIL_CONFIG.HOST,
      port: EMAIL_CONFIG.PORT,
      secure: EMAIL_CONFIG.SECURE,
      user: EMAIL_CONFIG.USER,
      from: EMAIL_CONFIG.FROM
    };
  }
}

