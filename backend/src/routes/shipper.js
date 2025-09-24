import express from 'express';
const router = express.Router();
import {
  registerShipper,
  loginShipper,
  getShipperProfile,
  updateShipperProfile,
  updateOnlineStatus,
  getAssignedOrders,
  startDelivery,
  uploadPickupImages,
  startTransit,
  arrivedAtDestination,
  updateLocation,
  confirmDelivery,
  completeDelivery,
  reportDeliveryFailure,
  startReturn,
  completeReturn,
  getFailedOrders,
  updateShipperStatus,
  uploadMiddleware,
  deliveryUploadMiddleware
} from '../controllers/shipper.js';
import shipperAuth from '../middlewares/shipperAuth.js';

// Public routes
router.post('/register', uploadMiddleware, registerShipper);
router.post('/login', loginShipper);

// Protected routes
router.use(shipperAuth);

router.get('/profile', getShipperProfile);
router.put('/profile', uploadMiddleware, updateShipperProfile);
router.put('/online-status', updateOnlineStatus);
router.get('/orders', getAssignedOrders);

// Detailed delivery flow
router.post('/orders/:orderId/pickup-images', deliveryUploadMiddleware, uploadPickupImages);
router.post('/orders/:orderId/start-transit', startTransit);
router.post('/orders/:orderId/arrived', arrivedAtDestination);
router.post('/orders/:orderId/confirm-delivery', deliveryUploadMiddleware, confirmDelivery);

// Legacy routes (keep for backward compatibility)
router.post('/orders/:orderId/start-delivery', deliveryUploadMiddleware, startDelivery);
router.post('/orders/:orderId/complete-delivery', deliveryUploadMiddleware, completeDelivery);

router.put('/location', updateLocation);

// Delivery failure and return routes
router.post('/orders/:orderId/report-failure', deliveryUploadMiddleware, reportDeliveryFailure);
router.get('/failed-orders', getFailedOrders);
router.post('/orders/:orderId/start-return', deliveryUploadMiddleware, startReturn);
router.post('/orders/:orderId/complete-return', deliveryUploadMiddleware, completeReturn);

// Admin routes (no auth middleware for now, will be handled by admin routes)
router.put('/:shipperId/status', updateShipperStatus);

export default router;