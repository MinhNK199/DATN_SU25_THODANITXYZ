import { Router } from 'express';
import { protect, checkAdmin } from '../middlewares/authMiddleware.js';
import { 
  getDashboardStats, 
  getTotalProductQuantityByName,
  getRevenueDetailed,
  getCustomersDetailed,
  getProductsDetailed
} from '../controllers/admin.js';

const router = Router();

// Tất cả routes đều cần authentication và admin role
router.use(protect);
router.use(checkAdmin(['admin', 'superadmin']));

// Dashboard routes
router.get('/dashboard', getDashboardStats);

// Detailed stats routes
router.get('/revenue-detailed', getRevenueDetailed);
router.get('/customers-detailed', getCustomersDetailed);
router.get('/products-detailed', getProductsDetailed);

export default router;
