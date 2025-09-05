import express from 'express';
import { createMomoPayment, momoWebhook, checkMomoPaymentStatus, testMomoWebhook } from '../controllers/paymentMomo.js';

const router = express.Router();

router.post('/create', createMomoPayment);
router.post('/webhook', momoWebhook);
router.get('/status/:orderId', checkMomoPaymentStatus);
router.post('/test-webhook', testMomoWebhook); // Chỉ dùng cho development

export default router;