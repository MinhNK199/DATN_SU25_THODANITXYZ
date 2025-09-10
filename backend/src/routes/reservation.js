import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  reserveProduct,
  releaseReservation,
  checkStock,
  getUserReservations,
  cleanupExpiredReservations
} from '../controllers/reservation.js';

const router = express.Router();

// ===== RESERVATION ROUTES =====

// Reserve product (đặt trước sản phẩm)
router.post('/reserve', protect, reserveProduct);

// Release reservation (hủy đặt trước)
router.post('/release', protect, releaseReservation);

// Check stock availability
router.post('/check-stock', protect, checkStock);

// Get user's active reservations
router.get('/user-reservations', protect, getUserReservations);

// Cleanup expired reservations (admin only)
router.post('/cleanup', protect, cleanupExpiredReservations);

export default router;
