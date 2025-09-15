import { Router } from 'express';
import { sendContactEmail } from '../controllers/contact.js';

const router = Router();

// Route gửi email liên hệ (không cần authentication)
router.post('/send', sendContactEmail);

export default router;
