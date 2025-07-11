import express from 'express';
import { createMomoPayment, momoWebhook } from '../controllers/paymentMomo.js';

const router = express.Router();

router.post('/create', createMomoPayment);
router.post('/webhook', momoWebhook);

export default router; 