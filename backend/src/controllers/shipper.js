import Shipper from '../models/Shipper.js';
import Order from '../models/Order.js';
import OrderTracking from '../models/OrderTracking.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { sendShipperNotification } from '../utils/shipperNotification.js';

// Cấu hình multer cho upload ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/shipper/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh (JPEG, JPG, PNG, GIF)'));
    }
  }
});

// Middleware upload
const uploadMiddleware = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]);

// Middleware upload cho delivery
const deliveryUploadMiddleware = upload.fields([
  { name: 'pickupImages', maxCount: 10 },
  { name: 'deliveryImages', maxCount: 10 }
]);

// Đăng ký shipper
const registerShipper = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullName,
      phone,
      address,
      idCard,
      licensePlate,
      vehicleType
    } = req.body;

    // Kiểm tra shipper đã tồn tại
    const existingShipper = await Shipper.findOne({
      $or: [{ email }, { username }, { idCard }]
    });

    if (existingShipper) {
      return res.status(400).json({
        success: false,
        message: 'Shipper đã tồn tại với email, username hoặc CMND này'
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo shipper mới
    const shipper = new Shipper({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      address,
      idCard,
      licensePlate,
      vehicleType
    });

    await shipper.save();

    // No email needed for account creation - shipper will be notified when approved

    // Tạo JWT token
    const token = jwt.sign(
      { shipperId: shipper._id, role: 'shipper' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký shipper thành công',
      data: {
        shipper: {
          id: shipper._id,
          username: shipper.username,
          email: shipper.email,
          fullName: shipper.fullName,
          phone: shipper.phone,
          status: shipper.status
        },
        token
      }
    });
  } catch (error) {
    console.error('Register shipper error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký shipper',
      error: error.message
    });
  }
};

// Đăng nhập shipper
const loginShipper = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm shipper
    const shipper = await Shipper.findOne({ email }).select('+password');
    if (!shipper) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra trạng thái shipper
    if (shipper.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản shipper đã bị khóa hoặc chưa được kích hoạt'
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, shipper.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Cập nhật thời gian hoạt động cuối
    shipper.lastActiveAt = new Date();
    await shipper.save();

    // Tạo JWT token
    const token = jwt.sign(
      { shipperId: shipper._id, role: 'shipper' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        shipper: {
          id: shipper._id,
          username: shipper.username,
          email: shipper.email,
          fullName: shipper.fullName,
          phone: shipper.phone,
          status: shipper.status,
          isOnline: shipper.isOnline
        },
        token
      }
    });
  } catch (error) {
    console.error('Login shipper error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
};

// Lấy thông tin shipper
const getShipperProfile = async (req, res) => {
  try {
    const shipper = await Shipper.findById(req.shipperId);
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    res.json({
      success: true,
      data: {
        shipper: {
          id: shipper._id,
          username: shipper.username,
          email: shipper.email,
          fullName: shipper.fullName,
          phone: shipper.phone,
          address: shipper.address,
          idCard: shipper.idCard,
          licensePlate: shipper.licensePlate,
          vehicleType: shipper.vehicleType,
          status: shipper.status,
          isOnline: shipper.isOnline,
          rating: shipper.rating,
          totalDeliveries: shipper.totalDeliveries,
          avatar: shipper.avatar,
          documents: shipper.documents
        }
      }
    });
  } catch (error) {
    console.error('Get shipper profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin shipper',
      error: error.message
    });
  }
};

// Cập nhật thông tin shipper
const updateShipperProfile = async (req, res) => {
  try {
    const { fullName, phone, address, currentLocation } = req.body;
    
    const shipper = await Shipper.findById(req.shipperId);
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    // Cập nhật thông tin
    if (fullName) shipper.fullName = fullName;
    if (phone) shipper.phone = phone;
    if (address) shipper.address = address;
    if (currentLocation) {
      shipper.currentLocation = currentLocation;
    }

    await shipper.save();

    // No email needed for profile updates

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        shipper: {
          id: shipper._id,
          username: shipper.username,
          email: shipper.email,
          fullName: shipper.fullName,
          phone: shipper.phone,
          address: shipper.address,
          currentLocation: shipper.currentLocation
        }
      }
    });
  } catch (error) {
    console.error('Update shipper profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật thông tin',
      error: error.message
    });
  }
};

// Cập nhật trạng thái online/offline
const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline, currentLocation } = req.body;
    
    const shipper = await Shipper.findById(req.shipperId);
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    shipper.isOnline = isOnline;
    if (currentLocation) {
      shipper.currentLocation = currentLocation;
    }
    shipper.lastActiveAt = new Date();

    await shipper.save();

    // No email needed for online/offline status changes

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: {
        isOnline: shipper.isOnline,
        currentLocation: shipper.currentLocation
      }
    });
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái',
      error: error.message
    });
  }
};

// Lấy danh sách đơn hàng được phân công
const getAssignedOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { shipper: req.shipperId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'fullName phone email')
      .populate('orderTracking')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get assigned orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// Bắt đầu giao hàng (nhận hàng từ shop)
const startDelivery = async (req, res) => {
  try {
    const { orderId, notes } = req.body;
    const files = req.files;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    console.log('🔍 Debug shipper permission:');
    console.log('Order shipper ID:', order.shipper?.toString());
    console.log('Request shipper ID:', req.shipperId?.toString());
    console.log('Match:', order.shipper?.toString() === req.shipperId?.toString());

    if (order.shipper && order.shipper.toString() !== req.shipperId?.toString()) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền xử lý đơn hàng này. Order shipper: ${order.shipper}, Your ID: ${req.shipperId}`
      });
    }

    // Tạo hoặc cập nhật order tracking
    let orderTracking = await OrderTracking.findOne({ orderId });
    if (!orderTracking) {
      orderTracking = new OrderTracking({
        orderId,
        shipperId: req.shipperId,
        status: 'picked_up'
      });
    } else {
      orderTracking.status = 'picked_up';
    }

    // Lưu ảnh nhận hàng
    if (files && files.pickupImages) {
      const pickupImages = files.pickupImages.map(file => ({
        url: file.path,
        description: 'Ảnh nhận hàng từ shop'
      }));
      orderTracking.pickupImages = pickupImages;
    }

    orderTracking.pickupTime = new Date();
    orderTracking.notes = notes || '';
    
    // Đặt thời gian tự động xác nhận (7 ngày sau)
    orderTracking.autoConfirmAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await orderTracking.save();

    // Cập nhật trạng thái đơn hàng
    order.status = 'shipped';
    order.orderTracking = orderTracking._id;
    order.autoConfirmAt = orderTracking.autoConfirmAt;
    order.statusHistory.push({
      status: 'shipped',
      note: 'Shipper đã nhận hàng và bắt đầu giao',
      date: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Bắt đầu giao hàng thành công',
      data: { orderTracking }
    });
  } catch (error) {
    console.error('Start delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi bắt đầu giao hàng',
      error: error.message
    });
  }
};

// Cập nhật vị trí
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    
    const shipper = await Shipper.findById(req.shipperId);
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    shipper.currentLocation = { latitude, longitude, address };
    await shipper.save();

    res.json({
      success: true,
      message: 'Cập nhật vị trí thành công'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật vị trí',
      error: error.message
    });
  }
};

// Xác nhận giao hàng thành công
const confirmDelivery = async (req, res) => {
  try {
    console.log('✅ Confirm delivery controller started');
    const { orderId } = req.params; // Lấy từ URL params
    const { deliveryProof, customerSignature, notes } = req.body;
    const files = req.files;

    console.log('✅ Order ID:', orderId);
    console.log('✅ Files:', files);
    console.log('✅ Body:', req.body);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Debug permission check
    console.log('🔐 Permission check in confirmDelivery:', {
      orderShipper: order.shipper,
      orderShipperString: order.shipper?.toString(),
      requestShipper: req.shipperId,
      requestShipperString: req.shipperId?.toString(),
      areEqual: order.shipper?.toString() === req.shipperId?.toString()
    });

    if (order.shipper?.toString() !== req.shipperId?.toString()) {
      console.log('❌ Permission denied in confirmDelivery');
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xử lý đơn hàng này'
      });
    }
    
    console.log('✅ Permission granted in confirmDelivery');

    const orderTracking = await OrderTracking.findOne({ orderId });
    if (!orderTracking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tracking đơn hàng'
      });
    }

    // Lưu ảnh giao hàng
    if (files && files.deliveryImages) {
      const deliveryImages = files.deliveryImages.map(file => ({
        url: file.path,
        description: 'Ảnh giao hàng thành công'
      }));
      orderTracking.deliveryImages = deliveryImages;
    }

    orderTracking.status = 'delivered';
    orderTracking.deliveryTime = new Date();
    orderTracking.deliveryProof = deliveryProof;
    orderTracking.customerSignature = customerSignature;
    orderTracking.notes = notes || orderTracking.notes;

    await orderTracking.save();

    // Cập nhật trạng thái đơn hàng
    order.status = 'delivered_success';
    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.autoConfirmAt = null; // Xóa thời gian tự động xác nhận
    
    // Nếu là đơn hàng COD, cập nhật trạng thái thanh toán
    if (order.paymentMethod === 'COD') {
      order.isPaid = true;
      order.paidAt = new Date();
      order.statusHistory.push({
        status: 'delivered_success',
        note: 'Giao hàng thành công - Đã thu tiền COD',
        date: new Date()
      });
    } else {
      order.statusHistory.push({
        status: 'delivered_success',
        note: 'Giao hàng thành công',
        date: new Date()
      });
    }

    await order.save();

    // Cập nhật thống kê shipper
    const shipper = await Shipper.findById(req.shipperId);
    shipper.totalDeliveries += 1;
    await shipper.save();

    // Emit WebSocket events for realtime updates
    const io = req.app.get('io');
    if (io) {
      // Emit to all connected clients
      io.emit('order_status_updated', {
        orderId: order._id,
        status: order.status,
        updates: {
          isDelivered: order.isDelivered,
          deliveredAt: order.deliveredAt
        }
      });

      // Emit payment update for COD orders
      if (order.paymentMethod === 'COD') {
        io.emit('order_payment_updated', {
          orderId: order._id,
          isPaid: order.isPaid,
          paidAt: order.paidAt,
          status: order.status,
          statusHistory: order.statusHistory
        });
      }
    }

    res.json({
      success: true,
      message: 'Xác nhận giao hàng thành công',
      data: { orderTracking }
    });
  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác nhận giao hàng',
      error: error.message
    });
  }
};

// Bước 1: Upload ảnh lấy hàng từ shop
const uploadPickupImages = async (req, res) => {
  try {
    console.log('📷 Upload pickup images controller started');
    console.log('🔐 Auth check - Shipper ID:', req.shipperId);
    
    if (!req.shipperId) {
      return res.status(401).json({
        success: false,
        message: 'Không có thông tin shipper - vui lòng đăng nhập lại'
      });
    }

    const { orderId } = req.params;
    const { notes } = req.body;
    const files = req.files;

    console.log('📷 Upload pickup images for order:', orderId);
    console.log('📂 Files received:', files);
    console.log('📝 Notes:', notes);
    console.log('🆔 Shipper ID:', req.shipperId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.shipper && order.shipper.toString() !== req.shipperId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xử lý đơn hàng này'
      });
    }

    // Tạo hoặc cập nhật OrderTracking
    let orderTracking = await OrderTracking.findOne({ orderId });
    if (!orderTracking) {
      orderTracking = new OrderTracking({
        orderId,
        shipperId: req.shipperId,
        status: 'picked_up'
      });
    }

    // Lưu ảnh lấy hàng
    if (files && files.pickupImages) {
      const pickupImages = files.pickupImages.map(file => ({
        url: file.path,
        description: 'Ảnh nhận hàng từ shop'
      }));
      orderTracking.pickupImages = pickupImages;
    }

    orderTracking.status = 'picked_up';
    orderTracking.pickupTime = new Date();
    orderTracking.notes = notes || '';
    
    await orderTracking.save();

    // Cập nhật trạng thái đơn hàng
    order.status = 'picked_up';
    order.orderTracking = orderTracking._id;
    order.statusHistory.push({
      status: 'picked_up',
      note: 'Shipper đã nhận hàng từ shop',
      date: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Upload ảnh lấy hàng thành công',
      data: { orderTracking }
    });
  } catch (error) {
    console.error('❌ Upload pickup images error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload ảnh',
      error: error.message,
      details: error.stack
    });
  }
};

// Bước 2: Bắt đầu giao hàng (di chuyển)
const startTransit = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes } = req.body;

    console.log('🚚 Start transit for order:', orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.shipper && order.shipper.toString() !== req.shipperId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xử lý đơn hàng này'
      });
    }

    const orderTracking = await OrderTracking.findOne({ orderId });
    if (!orderTracking) {
      return res.status(404).json({
        success: false,
        message: 'Chưa có thông tin lấy hàng'
      });
    }

    orderTracking.status = 'in_transit';
    orderTracking.transitStartTime = new Date();
    if (notes) orderTracking.notes = notes;
    
    await orderTracking.save();

    // Cập nhật trạng thái đơn hàng
    order.status = 'in_transit';
    order.statusHistory.push({
      status: 'in_transit',
      note: 'Shipper đang giao hàng',
      date: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Bắt đầu giao hàng thành công',
      data: { orderTracking }
    });
  } catch (error) {
    console.error('Start transit error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi bắt đầu giao hàng',
      error: error.message
    });
  }
};

// Bước 3: Đã đến điểm giao hàng
const arrivedAtDestination = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes } = req.body;

    console.log('📍 Arrived at destination for order:', orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.shipper && order.shipper.toString() !== req.shipperId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xử lý đơn hàng này'
      });
    }

    const orderTracking = await OrderTracking.findOne({ orderId });
    if (!orderTracking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin giao hàng'
      });
    }

    orderTracking.status = 'arrived';
    orderTracking.arrivedTime = new Date();
    if (notes) orderTracking.notes = notes;
    
    await orderTracking.save();

    // Cập nhật trạng thái đơn hàng
    order.status = 'arrived';
    order.statusHistory.push({
      status: 'arrived',
      note: 'Shipper đã đến điểm giao hàng',
      date: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Đã cập nhật trạng thái đến điểm giao',
      data: { orderTracking }
    });
  } catch (error) {
    console.error('Arrived at destination error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái',
      error: error.message
    });
  }
};

// Hoàn thành giao hàng (Demo)
const completeDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes } = req.body;
    const files = req.files;

    console.log('🎯 Complete delivery for order:', orderId);
    console.log('🆔 Shipper ID:', req.shipperId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    console.log('🔍 Order shipper ID:', order.shipper?.toString());
    console.log('🔍 Request shipper ID:', req.shipperId?.toString());

    if (order.shipper && order.shipper.toString() !== req.shipperId?.toString()) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền xử lý đơn hàng này. Order shipper: ${order.shipper}, Your ID: ${req.shipperId}`
      });
    }

    let orderTracking = await OrderTracking.findOne({ orderId });
    if (!orderTracking) {
      // Tạo mới nếu chưa có
      orderTracking = new OrderTracking({
        orderId,
        shipperId: req.shipperId,
        status: 'delivered'
      });
    }

    // Lưu ảnh giao hàng nếu có
    if (files && files.deliveryImages) {
      const deliveryImages = files.deliveryImages.map(file => ({
        url: file.path,
        description: 'Ảnh giao hàng thành công (Demo)'
      }));
      orderTracking.deliveryImages = deliveryImages;
    }

    orderTracking.status = 'delivered';
    orderTracking.deliveryTime = new Date();
    orderTracking.notes = notes || 'Demo: Giao hàng thành công!';

    await orderTracking.save();

    // Cập nhật trạng thái đơn hàng
    order.status = 'delivered_success';
    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.autoConfirmAt = null;
    order.orderTracking = orderTracking._id;
    
    // Nếu là đơn hàng COD, cập nhật trạng thái thanh toán
    if (order.paymentMethod === 'COD') {
      order.isPaid = true;
      order.paidAt = new Date();
      order.statusHistory.push({
        status: 'delivered_success',
        note: 'Demo: Giao hàng thành công - Đã thu tiền COD!',
        date: new Date()
      });
    } else {
      order.statusHistory.push({
        status: 'delivered_success',
        note: 'Demo: Giao hàng thành công!',
        date: new Date()
      });
    }

    await order.save();

    // Cập nhật thống kê shipper
    const shipper = await Shipper.findById(req.shipperId);
    if (shipper) {
      shipper.totalDeliveries += 1;
      await shipper.save();
    }

    // Send email notification to shipper about successful delivery
    try {
      await sendShipperNotification(shipper.email, 'delivery_completed', {
        shipperName: shipper.fullName,
        orderId: order._id,
        customerName: order.shippingAddress?.fullName || 'Khách hàng',
        deliveryAddress: `${order.shippingAddress?.address}, ${order.shippingAddress?.ward}, ${order.shippingAddress?.district}, ${order.shippingAddress?.province}`,
        deliveryTime: new Date().toLocaleString('vi-VN'),
        totalPrice: order.totalPrice?.toLocaleString('vi-VN') + ' VNĐ'
      });
      console.log(`✅ Delivery completed email sent to shipper: ${shipper.email}`);
    } catch (emailError) {
      console.error('Failed to send delivery completed email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: '🎯 Demo: Hoàn thành giao hàng thành công!',
      data: { orderTracking, order }
    });
  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hoàn thành giao hàng',
      error: error.message
    });
  }
};

// Báo cáo giao hàng thất bại
const reportDeliveryFailure = async (req, res) => {
  try {
    const { orderId, failureReason, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.shipper.toString() !== req.shipperId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xử lý đơn hàng này'
      });
    }

    const orderTracking = await OrderTracking.findOne({ orderId });
    if (!orderTracking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tracking đơn hàng'
      });
    }

    orderTracking.status = 'failed';
    orderTracking.failureReason = failureReason;
    orderTracking.notes = notes || orderTracking.notes;

    await orderTracking.save();

    // Cập nhật trạng thái đơn hàng
    order.status = 'delivered_failed';
    order.retryDeliveryCount += 1;
    order.statusHistory.push({
      status: 'delivered_failed',
      note: `Giao hàng thất bại: ${failureReason}`,
      date: new Date()
    });

    await order.save();

    // Send email notification to shipper about delivery failure
    try {
      const shipper = await Shipper.findById(req.shipperId);
      if (shipper) {
        await sendShipperNotification(shipper.email, 'delivery_failed', {
          shipperName: shipper.fullName,
          orderId: order._id,
          customerName: order.shippingAddress?.fullName || 'Khách hàng',
          deliveryAddress: `${order.shippingAddress?.address}, ${order.shippingAddress?.ward}, ${order.shippingAddress?.district}, ${order.shippingAddress?.province}`,
          failureReason: failureReason,
          retryCount: order.retryDeliveryCount,
          notes: notes || 'Không có ghi chú'
        });
        console.log(`✅ Delivery failure email sent to shipper: ${shipper.email}`);
      }
    } catch (emailError) {
      console.error('Failed to send delivery failure email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Báo cáo giao hàng thất bại thành công',
      data: { orderTracking }
    });
  } catch (error) {
    console.error('Report delivery failure error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi báo cáo giao hàng thất bại',
      error: error.message
    });
  }
};

// Cập nhật trạng thái shipper (Admin only)
const updateShipperStatus = async (req, res) => {
  try {
    const { shipperId } = req.params;
    const { status, reason } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    // Find shipper
    const shipper = await Shipper.findById(shipperId);
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    const oldStatus = shipper.status;
    shipper.status = status;
    await shipper.save();

    // Send email notification
    try {
      await sendShipperNotification(shipper.email, 'status_updated', {
        shipperName: shipper.fullName,
        newStatus: status,
        reason: reason || 'Trạng thái tài khoản đã được cập nhật bởi admin'
      });
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái shipper thành công',
      data: {
        shipperId: shipper._id,
        oldStatus,
        newStatus: status
      }
    });
  } catch (error) {
    console.error('Update shipper status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái shipper',
      error: error.message
    });
  }
};

export {
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
  updateShipperStatus,
  uploadMiddleware,
  deliveryUploadMiddleware
};
