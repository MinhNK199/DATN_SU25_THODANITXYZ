import express from 'express';
const router = express.Router();
import {
  getAllShippers,
  getShipperById,
  createShipper,
  updateShipper,
  updateShipperStatus,
  deleteShipper,
  assignOrderToShipper,
  getOnlineShippers,
  getShipperStats,
  confirmReturnReceived,
  startReturnProcessing,
  completeReturnProcessing,
  getReturnOrders
} from '../controllers/adminShipper.js';
import { protect, checkAdmin } from '../middlewares/authMiddleware.js';

// Tất cả routes đều yêu cầu admin
router.use(protect);
router.use(checkAdmin(['manage_shipper']));

// Routes
router.get('/', getAllShippers);
router.get('/online', getOnlineShippers);
router.get('/stats', getShipperStats);
router.get('/:id', getShipperById);
router.post('/', createShipper);
router.put('/:id', updateShipper);
router.put('/:id/status', updateShipperStatus);
router.delete('/:id', deleteShipper);
router.post('/assign-order', assignOrderToShipper);

// Return management routes
router.get('/returns', getReturnOrders);
router.post('/returns/:orderId/confirm', confirmReturnReceived);
router.post('/returns/:orderId/start-processing', startReturnProcessing);
router.post('/returns/:orderId/complete-processing', completeReturnProcessing);

export default router;
