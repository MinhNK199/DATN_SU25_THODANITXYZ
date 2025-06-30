import express from 'express';
import {
    createBill,
    getAllBills,
    getBillById,
    updateBill,
    deleteBill,
    getBillsByCustomer,
    updateBillStatus,
    exportBillPDF,
    exportAndSendBill
} from '../controllers/bill.js';
import { protect } from '../middlewares/authMiddleware.js';

const routerBill = express.Router();

// Create a new bill
routerBill.post('/', createBill);

// Get all bills (cần authentication)
routerBill.get('/', protect, getAllBills);

// Get bills by customer (cần authentication)
routerBill.get('/customer/:customerId', protect, getBillsByCustomer);

// Get single bill (cần authentication)
routerBill.get('/:id', protect, getBillById);

// Update bill (cần authentication)
routerBill.put('/:id', protect, updateBill);

// Update bill status (cần authentication)
routerBill.patch('/:id/status', protect, updateBillStatus);

// Delete bill (cần authentication)
routerBill.delete('/:id', protect, deleteBill);

// Xuất PDF hóa đơn (tải về máy) - cần authentication
routerBill.get('/:id/pdf', protect, exportBillPDF);

// Gửi hóa đơn qua email - cần authentication
routerBill.post('/:id/export', protect, exportAndSendBill);

export default routerBill;