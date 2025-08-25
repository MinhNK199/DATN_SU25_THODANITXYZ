import express from 'express';
import { createVnpayPayment, vnpayCallback, checkVnpayStatus, testVnpaySignature } from '../controllers/paymentVnpay.js';

const router = express.Router();

router.post('/create', createVnpayPayment);
router.get('/callback', vnpayCallback);
router.get('/status/:orderId', checkVnpayStatus);
router.post('/test-signature', testVnpaySignature);

export default router;