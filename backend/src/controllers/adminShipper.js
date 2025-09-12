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

export {
  getAllShippers,
  getShipperById,
  createShipper,
  updateShipper,
  updateShipperStatus,
  deleteShipper,
  assignOrderToShipper,
  getShipperStats
};
