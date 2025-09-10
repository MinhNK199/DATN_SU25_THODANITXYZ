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
  getShipperStats
} from '../controllers/adminShipper.js';
import { protect, checkAdmin } from '../middlewares/authMiddleware.js';

// Tất cả routes đều yêu cầu admin
router.use(protect);
router.use(checkAdmin(['manage_shipper']));

// Routes
router.get('/', getAllShippers);
router.get('/stats', getShipperStats);
router.get('/:id', getShipperById);
router.post('/', createShipper);
router.put('/:id', updateShipper);
router.put('/:id/status', updateShipperStatus);
router.delete('/:id', deleteShipper);
router.post('/assign-order', assignOrderToShipper);

export default router;
