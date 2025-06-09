import express from 'express';
import {
    createBill,
    getAllBills,
    getBillById,
    updateBill,
    deleteBill,
    getBillsByCustomer,
    updateBillStatus
} from '../controllers/bill.js';

const routerBill = express.Router();

// Create a new bill
routerBill.post('/', createBill);

// Get all bills
routerBill.get('/', getAllBills);

// Get bills by customer
routerBill.get('/customer/:customerId', getBillsByCustomer);

// Get single bill
routerBill.get('/:id', getBillById);

// Update bill
routerBill.put('/:id', updateBill);

// Update bill status
routerBill.patch('/:id/status', updateBillStatus);

// Delete bill
routerBill.delete('/:id', deleteBill);

export default routerBill; 