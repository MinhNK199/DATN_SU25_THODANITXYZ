import express from 'express';
import { createVnpayPayment, vnpayCallback, checkVnpayStatus } from '../controllers/paymentVnpay.js';

const router = express.Router();

router.post('/create', createVnpayPayment);
router.get('/callback', vnpayCallback);
router.get('/status/:orderId', checkVnpayStatus);

export default router;