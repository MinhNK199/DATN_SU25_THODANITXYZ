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

// Lấy hiệu suất chi tiết của shipper
const getShipperPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting performance for shipper ID:', id);

    const shipper = await Shipper.findById(id).select('-password');
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy shipper'
      });
    }

    // Thống kê đơn hàng theo trạng thái
    const orderStats = await Order.aggregate([
      { $match: { shipper: shipper._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Sử dụng logic giống API admin orders để lấy đơn hàng của shipper
    console.log('🔍 Finding orders for shipper:', shipper._id);
    const allOrders = await Order.find({ shipper: shipper._id })
      .populate("user", "id name email phone")
      .populate("shipper", "fullName phone email vehicleType")
      .populate('orderTracking', 'status deliveryTime pickupTime pickupImages deliveryImages notes failureReason')
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 });
    console.log('🔍 Found orders:', allOrders.length);

    // Thống kê theo tháng (6 tháng gần nhất)
    const monthlyStats = await Order.aggregate([
      { 
        $match: { 
          shipper: shipper._id,
          createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered_success'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Function xử lý trạng thái đơn hàng
    const getOrderStatusInfo = (status) => {
      const statusMap = {
        'draft': { label: 'Nháp', color: 'default' },
        'pending': { label: 'Chờ xác nhận', color: 'orange' },
        'confirmed': { label: 'Đã xác nhận', color: 'blue' },
        'processing': { label: 'Đang xử lý', color: 'cyan' },
        'assigned': { label: 'Đã phân công', color: 'purple' },
        'picked_up': { label: 'Đã lấy hàng', color: 'geekblue' },
        'shipped': { label: 'Đang giao hàng', color: 'blue' },
        'in_transit': { label: 'Đang giao', color: 'blue' },
        'arrived': { label: 'Đã đến nơi', color: 'lime' },
        'delivered_success': { label: 'Giao thành công', color: 'green' },
        'delivered_failed': { label: 'Giao thất bại', color: 'red' },
        'partially_delivered': { label: 'Giao một phần', color: 'orange' },
        'returned': { label: 'Hoàn hàng', color: 'volcano' },
        'on_hold': { label: 'Tạm dừng', color: 'gold' },
        'completed': { label: 'Hoàn thành', color: 'green' },
        'cancelled': { label: 'Đã hủy', color: 'red' },
        'refund_requested': { label: 'Yêu cầu hoàn tiền', color: 'magenta' },
        'refunded': { label: 'Đã hoàn tiền', color: 'purple' },
        'payment_failed': { label: 'Thanh toán thất bại', color: 'red' }
      };
      return statusMap[status] || { label: status, color: 'default' };
    };

    // Xử lý payment status giống API admin orders
    console.log('🔍 Processing orders...');
    const processedOrders = allOrders.map(order => {
      try {
        const orderObj = order.toObject();

        // Xử lý hiển thị payment status
        if (["momo", "vnpay", "credit-card", "BANKING"].includes(order.paymentMethod)) {
          if (order.isPaid && order.paymentStatus === "paid") {
            orderObj.displayPaymentStatus = `Đã thanh toán ${order.paymentMethod.toUpperCase()}`;
          } else if (order.paymentStatus === "failed") {
            orderObj.displayPaymentStatus = "Thanh toán thất bại";
          } else if (order.paymentStatus === "awaiting_payment" || order.paymentStatus === "pending") {
            orderObj.displayPaymentStatus = "Chưa thanh toán";
          } else {
            orderObj.displayPaymentStatus = "Chưa thanh toán";
          }
        } else if (order.paymentMethod === "COD") {
          orderObj.displayPaymentStatus = order.isPaid
            ? "Đã thanh toán COD"
            : "Chưa thanh toán COD";
        }

        // Thêm thông tin trạng thái
        const statusInfo = getOrderStatusInfo(order.status);
        orderObj.statusInfo = statusInfo;

        return orderObj;
      } catch (error) {
        console.error('🔍 Error processing order:', order._id, error);
        return order.toObject();
      }
    });
    console.log('🔍 Processed orders:', processedOrders.length);

    // Phân loại đơn hàng đơn giản
    const currentOrders = processedOrders.filter(order => ['assigned', 'picked_up', 'in_transit'].includes(order.status));
    const deliveredOrders = processedOrders.filter(order => order.status === 'delivered_success');
    const recentOrders = processedOrders.slice(0, 10);

    // Thống kê theo ngày trong tuần
    const weeklyStats = await Order.aggregate([
      { $match: { shipper: shipper._id } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Tính toán đơn giản
    const totalOrders = processedOrders.length;
    const deliveredCount = processedOrders.filter(order => order.status === 'delivered_success').length;
    const successRate = totalOrders > 0 ? (deliveredCount / totalOrders * 100).toFixed(2) : 0;

    // Debug log chi tiết
    console.log('🔍 Shipper orders:', allOrders.length);
    console.log('🔍 Current orders:', currentOrders.length);
    console.log('🔍 Delivered orders:', deliveredCount);
    
    // Debug sample order data
    if (allOrders.length > 0) {
      const sampleOrder = allOrders[0];
      console.log('🔍 Sample order data:');
      console.log('- Order number:', sampleOrder.orderNumber);
      console.log('- Total amount:', sampleOrder.totalAmount);
      console.log('- Shipping address:', sampleOrder.shippingAddress);
      console.log('- Order tracking:', sampleOrder.orderTracking);
      console.log('- Order items:', sampleOrder.orderItems?.length || 0);
      if (sampleOrder.orderTracking) {
        console.log('- Pickup images:', sampleOrder.orderTracking.pickupImages?.length || 0);
        console.log('- Delivery images:', sampleOrder.orderTracking.deliveryImages?.length || 0);
      }
    }

    console.log('🔍 Sending response...');
    console.log('🔍 Total orders:', totalOrders);
    console.log('🔍 Delivered count:', deliveredCount);
    console.log('🔍 Success rate:', successRate);
    console.log('🔍 Sample order totalPrice before response:', processedOrders[0]?.totalPrice);
    console.log('🔍 Sample order details:', {
      orderNumber: processedOrders[0]?.orderNumber,
      totalPrice: processedOrders[0]?.totalPrice,
      totalAmount: processedOrders[0]?.totalAmount,
      status: processedOrders[0]?.status,
      paymentMethod: processedOrders[0]?.paymentMethod,
      isPaid: processedOrders[0]?.isPaid
    });
    
    res.json({
      success: true,
      data: {
        shipper: {
          id: shipper._id,
          fullName: shipper.fullName,
          phone: shipper.phone,
          email: shipper.email,
          status: shipper.status,
          isOnline: shipper.isOnline,
          rating: shipper.rating,
          totalDeliveries: shipper.totalDeliveries,
          createdAt: shipper.createdAt
        },
        orderStats,
        monthlyStats,
        weeklyStats,
        currentOrders,
        deliveredOrders,
        recentOrders,
        successRate: parseFloat(successRate),
        totalOrders,
        currentOrdersCount: currentOrders.length,
        deliveredOrdersCount: deliveredCount,
        allOrders: processedOrders
      }
    });
    console.log('🔍 Response sent successfully');
  } catch (error) {
    console.error('Get shipper performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy hiệu suất shipper',
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
  getShipperPerformance
};
