import express from 'express';
import {
    createBill,
    getAllBills,
    getBillById,
    updateBill,
    deleteBill,
    getBillsByCustomer,
    updateBillStatus,
    generateBillPDF
} from '../controllers/bill.js';
import fs from 'fs';
import Bill from '../models/bill.js';

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

// Xuất và gửi hóa đơn qua email
routerBill.post('/:id/export-pdf', async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('items.product', 'name price');

        if (!bill) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy hóa đơn'
            });
        }

        const pdfPath = await generateBillPDF(bill);

        // Send the PDF file
        res.download(pdfPath, `hoadon_${bill._id}.pdf`, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            // Delete the temporary file after sending
            fs.unlink(pdfPath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting temporary file:', unlinkErr);
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default routerBill; 