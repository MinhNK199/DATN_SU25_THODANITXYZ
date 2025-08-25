import express from 'express';
import { createCreditCardPayment, checkCreditCardStatus } from '../controllers/paymentCreditCard.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ Routes cho credit card payment
router.post('/create', protect, createCreditCardPayment);
router.get('/status/:orderId', protect, checkCreditCardStatus);

export default router;
