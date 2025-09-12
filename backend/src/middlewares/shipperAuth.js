import jwt from 'jsonwebtoken';
import Shipper from '../models/Shipper.js';

const shipperAuth = async (req, res, next) => {
  try {
    console.log('🔐 ShipperAuth middleware hit!');
    console.log('🔐 Authorization header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('🔐 Extracted token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('🔐 Decoded token:', { role: decoded.role, shipperId: decoded.shipperId });
    
    if (decoded.role !== 'shipper') {
      console.log('❌ Invalid role:', decoded.role);
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ cho shipper'
      });
    }

    const shipper = await Shipper.findById(decoded.shipperId);
    if (!shipper) {
      return res.status(401).json({
        success: false,
        message: 'Shipper không tồn tại'
      });
    }

    if (shipper.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản shipper đã bị khóa'
      });
    }

    req.shipperId = shipper._id;
    req.shipper = shipper;
    console.log('✅ ShipperAuth success! Shipper ID:', shipper._id);
    next();
  } catch (error) {
    console.error('Shipper auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
      error: error.message
    });
  }
};

export default shipperAuth;
