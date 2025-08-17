import { Router } from 'express';
import { EmailController } from '../controllers/emailController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// All email routes require authentication
router.use(authenticateToken);

// Email management routes
router.get('/', EmailController.getEmails);
router.get('/stats', EmailController.getEmailStats);
router.get('/search', EmailController.searchEmails);
router.get('/folder/:folder', EmailController.getEmailsByFolder);

// Single email routes
router.get('/:id', EmailController.getEmail);
router.patch('/:id', EmailController.updateEmail);
router.delete('/:id', EmailController.deleteEmail);
router.delete('/:id/permanent', EmailController.permanentlyDeleteEmail);

// Email actions
router.post('/:id/spam', EmailController.markAsSpam);
router.put('/:id/labels', EmailController.updateEmailLabels);
router.get('/:emailId/attachments', EmailController.getEmailAttachments);

// Send email (with file upload)
router.post('/send', upload.array('attachments', 10), EmailController.sendEmail);

// Bulk operations
router.patch('/bulk/update', EmailController.bulkUpdateEmails);
router.delete('/bulk/delete', EmailController.bulkDeleteEmails);

export default router;
