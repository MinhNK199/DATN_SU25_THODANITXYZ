import Bill from '../models/bill.js';

// Create a new bill
export const createBill = async (req, res) => {
    try {
        const bill = new Bill(req.body);
        await bill.save();
        res.status(201).json({
            success: true,
            data: bill
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all bills
export const getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find()
            .populate('customer', 'name email')
            .populate('items.product', 'name price');
        res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single bill by ID
export const getBillById = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('items.product', 'name price');

        if (!bill) {
            return res.status(404).json({
                success: false,
                error: 'Bill not found'
            });
        }

        res.status(200).json({
            success: true,
            data: bill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update bill
export const updateBill = async (req, res) => {
    try {
        const bill = await Bill.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!bill) {
            return res.status(404).json({
                success: false,
                error: 'Bill not found'
            });
        }

        res.status(200).json({
            success: true,
            data: bill
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete bill
export const deleteBill = async (req, res) => {
    try {
        const bill = await Bill.findByIdAndDelete(req.params.id);

        if (!bill) {
            return res.status(404).json({
                success: false,
                error: 'Bill not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get bills by customer
export const getBillsByCustomer = async (req, res) => {
    try {
        const bills = await Bill.find({ customer: req.params.customerId })
            .populate('customer', 'name email')
            .populate('items.product', 'name price');

        res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update bill status
export const updateBillStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const bill = await Bill.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!bill) {
            return res.status(404).json({
                success: false,
                error: 'Bill not found'
            });
        }

        res.status(200).json({
            success: true,
            data: bill
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 