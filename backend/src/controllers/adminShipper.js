import Shipper from '../models/Shipper.js';
import Order from '../models/Order.js';
import OrderTracking from '../models/OrderTracking.js';
import bcrypt from 'bcryptjs';

// Lấy danh sách tất cả shipper
const getAllShippers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const query = {};
    
    // Lọc theo trạng thái
    if (status) {
      query.status = status;
    }

    // Tìm kiếm theo tên, email, phone
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const shippers = await Shipper.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Shipper.countDocuments(query);

    res.json({
      success: true,
      data: {
        shippers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all shippers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách shipper',
      error: error.message
    });
  }
};

// Lấy thông tin chi tiết shipper
const getShipperById = async (req, res) => {
  try {
    const { id } = req.params;

    const shipper = await Shipper.findById(id).select('-password');
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    // Lấy thống kê đơn hàng của shipper
    const orderStats = await Order.aggregate([
      { $match: { shipper: shipper._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Lấy đơn hàng gần đây
    const recentOrders = await Order.find({ shipper: shipper._id })
      .populate('user', 'fullName phone email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        shipper,
        orderStats,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get shipper by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin shipper',
      error: error.message
    });
  }
};

// Tạo shipper mới (admin)
const createShipper = async (req, res) => {
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
      vehicleType,
      status: 'active'
    });

    await shipper.save();

    res.status(201).json({
      success: true,
      message: 'Tạo shipper thành công',
      data: {
        shipper: {
          id: shipper._id,
          username: shipper.username,
          email: shipper.email,
          fullName: shipper.fullName,
          phone: shipper.phone,
          status: shipper.status
        }
      }
    });
  } catch (error) {
    console.error('Create shipper error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo shipper',
      error: error.message
    });
  }
};

// Cập nhật thông tin shipper
const updateShipper = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Không cho phép cập nhật mật khẩu qua API này
    delete updateData.password;

    const shipper = await Shipper.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật shipper thành công',
      data: { shipper }
    });
  } catch (error) {
    console.error('Update shipper error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật shipper',
      error: error.message
    });
  }
};

// Cập nhật trạng thái shipper
const updateShipperStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const shipper = await Shipper.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');

    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái shipper thành công',
      data: { shipper }
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

// Xóa shipper
const deleteShipper = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra shipper có đơn hàng đang xử lý không
    const activeOrders = await Order.find({
      shipper: id,
      status: { $in: ['shipped', 'processing'] }
    });

    if (activeOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa shipper đang có đơn hàng đang xử lý'
      });
    }

    const shipper = await Shipper.findByIdAndDelete(id);
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    res.json({
      success: true,
      message: 'Xóa shipper thành công'
    });
  } catch (error) {
    console.error('Delete shipper error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa shipper',
      error: error.message
    });
  }
};

// Phân công đơn hàng cho shipper
const assignOrderToShipper = async (req, res) => {
  try {
    const { orderId, shipperId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    const shipper = await Shipper.findById(shipperId);
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    if (shipper.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Shipper không ở trạng thái hoạt động'
      });
    }

    if (!shipper.isOnline) {
      return res.status(400).json({
        success: false,
        message: 'Shipper hiện đang offline, không thể phân công đơn hàng'
      });
    }

    // Cập nhật đơn hàng
    order.shipper = shipperId;
    order.status = 'assigned';
    order.statusHistory.push({
      status: 'assigned',
      note: `Đã phân công cho shipper: ${shipper.fullName}`,
      date: new Date()
    });

    await order.save();

    // Tạo order tracking
    const orderTracking = new OrderTracking({
      orderId,
      shipperId,
      status: 'assigned'
    });

    await orderTracking.save();

    // Emit WebSocket events for realtime updates
    const io = req.app.get('io');
    if (io) {
      // Emit order assignment event
      io.emit('order_assigned', {
        orderId: order._id,
        shipper: {
          _id: shipper._id,
          fullName: shipper.fullName,
          phone: shipper.phone,
          email: shipper.email
        },
        status: order.status,
        statusHistory: order.statusHistory
      });
      console.log('📡 Emitted order assignment event');
    }

    // Send notification email to shipper about new order assignment
    try {
      const { sendShipperNotification } = await import('../utils/shipperNotification.js');
      await sendShipperNotification(shipper.email, 'order_assigned', {
        shipperName: shipper.fullName,
        orderId: order._id,
        customerName: order.shippingAddress?.fullName || 'Khách hàng',
        customerPhone: order.shippingAddress?.phone || 'N/A',
        deliveryAddress: `${order.shippingAddress?.address}, ${order.shippingAddress?.ward}, ${order.shippingAddress?.district}, ${order.shippingAddress?.province}`,
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'), // 24 hours from now
        notes: order.notes || 'Không có ghi chú'
      });
      console.log(`✅ Order assignment email sent to shipper: ${shipper.email}`);
    } catch (emailError) {
      console.error('Failed to send order assignment email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Phân công đơn hàng thành công',
      data: { order, orderTracking }
    });
  } catch (error) {
    console.error('Assign order to shipper error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi phân công đơn hàng',
      error: error.message
    });
  }
};

// Lấy danh sách shipper online
const getOnlineShippers = async (req, res) => {
  try {
    const onlineShippers = await Shipper.find({ 
      status: 'active', 
      isOnline: true 
    }).select('_id fullName phone email vehicleType rating totalDeliveries avatar currentLocation');
    
    res.json({
      success: true,
      data: onlineShippers
    });
  } catch (error) {
    console.error('Get online shippers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách shipper online',
      error: error.message
    });
  }
};

// Lấy thống kê shipper
const getShipperStats = async (req, res) => {
  try {
    const totalShippers = await Shipper.countDocuments();
    const activeShippers = await Shipper.countDocuments({ status: 'active' });
    const onlineShippers = await Shipper.countDocuments({ isOnline: true });
    const suspendedShippers = await Shipper.countDocuments({ status: 'suspended' });

    // Thống kê đơn hàng theo shipper
    const orderStats = await Order.aggregate([
      { $match: { shipper: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top shipper theo số đơn hàng giao thành công
    const topShippers = await Order.aggregate([
      { $match: { status: 'delivered_success' } },
      {
        $group: {
          _id: '$shipper',
          totalDeliveries: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'shippers',
          localField: '_id',
          foreignField: '_id',
          as: 'shipperInfo'
        }
      },
      { $unwind: '$shipperInfo' },
      {
        $project: {
          shipperName: '$shipperInfo.fullName',
          shipperPhone: '$shipperInfo.phone',
          totalDeliveries: 1
        }
      },
      { $sort: { totalDeliveries: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalShippers,
        activeShippers,
        onlineShippers,
        suspendedShippers,
        orderStats,
        topShippers
      }
    });
  } catch (error) {
    console.error('Get shipper stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê shipper',
      error: error.message
    });
  }
};

// Xác nhận nhận hoàn trả từ shipper
const confirmReturnReceived = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.status !== 'return_pending') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa ở trạng thái chờ xác nhận hoàn trả'
      });
    }

    const orderTracking = await OrderTracking.findOne({ orderId });
    if (!orderTracking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin tracking đơn hàng'
      });
    }

    // Cập nhật tracking
    orderTracking.status = 'return_confirmed';
    await orderTracking.save();

    // Cập nhật trạng thái đơn hàng
    order.status = 'return_confirmed';
    order.statusHistory.push({
      status: 'return_confirmed',
      note: notes || 'Admin đã xác nhận nhận hoàn trả',
      date: new Date()
    });

    await order.save();

    // Emit WebSocket events for realtime updates
    const io = req.app.get('io');
    if (io) {
      io.emit('return_confirmed', {
        orderId: order._id,
        status: 'return_confirmed',
        statusHistory: order.statusHistory
      });
    }

    res.json({
      success: true,
      message: 'Đã xác nhận nhận hoàn trả thành công',
      data: { order, orderTracking }
    });
  } catch (error) {
    console.error('Confirm return received error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác nhận hoàn trả',
      error: error.message
    });
  }
};

// Bắt đầu xử lý hoàn trả
const startReturnProcessing = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes, processingType } = req.body; // processingType: 'refund', 'exchange', 'restock'

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.status !== 'return_confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng chưa được xác nhận nhận hoàn trả'
      });
    }

    const orderTracking = await OrderTracking.findOne({ orderId });
    if (orderTracking) {
      orderTracking.status = 'return_processing';
      orderTracking.returnProcessingType = processingType;
      orderTracking.returnProcessingStartTime = new Date();
      await orderTracking.save();
    }

    // Cập nhật trạng thái đơn hàng
    order.status = 'return_processing';
    order.statusHistory.push({
      status: 'return_processing',
      note: notes || `Đang xử lý hoàn trả - Loại: ${processingType}`,
      date: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Đã bắt đầu xử lý hoàn trả',
      data: { order, orderTracking }
    });
  } catch (error) {
    console.error('Start return processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi bắt đầu xử lý hoàn trả',
      error: error.message
    });
  }
};

// Hoàn tất xử lý hoàn trả
const completeReturnProcessing = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes, refundAmount, completionDetails } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.status !== 'return_processing') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng không ở trạng thái đang xử lý hoàn trả'
      });
    }

    const orderTracking = await OrderTracking.findOne({ orderId });
    if (orderTracking) {
      orderTracking.status = 'return_completed';
      orderTracking.returnProcessingEndTime = new Date();
      orderTracking.returnCompletionDetails = completionDetails;
      await orderTracking.save();
    }

    // Cập nhật trạng thái đơn hàng
    order.status = 'return_completed';
    if (refundAmount) {
      order.refundAmount = refundAmount;
    }
    order.statusHistory.push({
      status: 'return_completed',
      note: notes || 'Đã hoàn tất xử lý hoàn trả',
      date: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Đã hoàn tất xử lý hoàn trả',
      data: { order, orderTracking }
    });
  } catch (error) {
    console.error('Complete return processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hoàn tất xử lý hoàn trả',
      error: error.message
    });
  }
};

// Lấy danh sách đơn hàng cần xác nhận hoàn trả
const getReturnOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Lọc theo trạng thái hoàn trả
    let query = {};
    if (status) {
      query.status = status;
    } else {
      // Mặc định lấy tất cả đơn hàng liên quan đến hoàn trả
      query.status = { 
        $in: ['return_pending', 'return_confirmed', 'return_processing', 'return_completed'] 
      };
    }

    const orders = await Order.find(query)
      .populate('user', 'fullName phone email')
      .populate('shipper', 'fullName phone email')
      .populate('orderTracking')
      .sort({ updatedAt: -1 })
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
    console.error('Get return orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đơn hàng hoàn trả',
      error: error.message
    });
  }
};

export {
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
};
