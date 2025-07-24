import express from 'express';
import { createVnpayPayment } from '../controllers/paymentVnpay.js';

const router = express.Router();

router.post('/create', createVnpayPayment);

export default router;