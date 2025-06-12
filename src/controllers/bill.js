import Bill from '../models/bill.js';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

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

// Tạo PDF hóa đơn
const generateBillPDF = async (bill) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const fileName = `hoadon_${bill._id}.pdf`;
            const filePath = path.join('temp', fileName);

            // Tạo thư mục temp nếu chưa tồn tại
            if (!fs.existsSync('temp')) {
                fs.mkdirSync('temp');
            }

            // Tạo stream để lưu file
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Thêm nội dung vào PDF
            doc.fontSize(20).text('HÓA ĐƠN BÁN HÀNG', { align: 'center' });
            doc.moveDown();

            // Thông tin hóa đơn
            doc.fontSize(12).text(`Mã hóa đơn: ${bill._id}`);
            doc.text(`Ngày tạo: ${new Date(bill.createdAt).toLocaleDateString('vi-VN')}`);
            doc.text(`Trạng thái: ${bill.status}`);
            doc.moveDown();

            // Thông tin khách hàng
            doc.text('THÔNG TIN KHÁCH HÀNG');
            doc.text(`Tên: ${bill.customer.name}`);
            doc.text(`Email: ${bill.customer.email}`);
            doc.moveDown();

            // Chi tiết sản phẩm
            doc.text('CHI TIẾT SẢN PHẨM');
            doc.moveDown();

            // Header của bảng
            doc.text('Sản phẩm', 50, doc.y, { width: 200 });
            doc.text('Số lượng', 250, doc.y, { width: 100 });
            doc.text('Đơn giá', 350, doc.y, { width: 100 });
            doc.text('Thành tiền', 450, doc.y, { width: 100 });
            doc.moveDown();

            // Chi tiết từng sản phẩm
            let total = 0;
            bill.items.forEach(item => {
                const itemTotal = item.quantity * item.product.price;
                total += itemTotal;

                doc.text(item.product.name, 50, doc.y, { width: 200 });
                doc.text(item.quantity.toString(), 250, doc.y, { width: 100 });
                doc.text(item.product.price.toLocaleString('vi-VN') + 'đ', 350, doc.y, { width: 100 });
                doc.text(itemTotal.toLocaleString('vi-VN') + 'đ', 450, doc.y, { width: 100 });
                doc.moveDown();
            });

            // Tổng tiền
            doc.moveDown();
            doc.text(`Tổng tiền: ${total.toLocaleString('vi-VN')}đ`, { align: 'right' });

            // Kết thúc PDF
            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};

// Gửi email với file PDF đính kèm
const sendBillEmail = async (email, filePath, billId) => {
    try {
        // Cấu hình transporter (thay thế bằng thông tin email của bạn)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Nội dung email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Hóa đơn #${billId} - TechTrend`,
            text: 'Cảm ơn bạn đã mua hàng tại TechTrend. Vui lòng xem hóa đơn đính kèm.',
            attachments: [{
                filename: `hoadon_${billId}.pdf`,
                path: filePath
            }]
        };

        // Gửi email
        await transporter.sendMail(mailOptions);

        // Xóa file PDF tạm sau khi gửi
        fs.unlinkSync(filePath);

        return true;
    } catch (error) {
        throw error;
    }
};

// Xuất và gửi hóa đơn qua email
export const exportAndSendBill = async (req, res) => {
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

        // Tạo PDF
        const pdfPath = await generateBillPDF(bill);

        // Gửi email
        await sendBillEmail(bill.customer.email, pdfPath, bill._id);

        res.status(200).json({
            success: true,
            message: 'Đã gửi hóa đơn qua email thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 