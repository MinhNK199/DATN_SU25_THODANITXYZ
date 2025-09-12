import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Rating from '../models/Rating.js';
import Conversation from '../models/Conversation.js';

// Lấy thống kê tổng quan cho admin dashboard
export const getDashboardStats = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xem thống kê dashboard'
      });
    }

    // Lấy thống kê cơ bản
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      totalBrands,
      totalRatings,
      totalConversations
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),
      Brand.countDocuments(),
      Rating.countDocuments(),
      Conversation.countDocuments()
    ]);

    // Tính tổng doanh thu từ các đơn hàng đã hoàn thành
    const revenueResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Tính tổng số biến thể sản phẩm
    const variantResult = await Product.aggregate([
      { $project: { variantCount: { $size: '$variants' } } },
      { $group: { _id: null, totalVariants: { $sum: '$variantCount' } } }
    ]);
    const totalVariants = variantResult.length > 0 ? variantResult[0].totalVariants : 0;

    // Lấy đơn hàng gần đây (5 đơn mới nhất)
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber totalPrice status createdAt');

    // Lấy sản phẩm sắp hết hàng (stock <= 10)
    const lowStockProducts = await Product.find({
      $or: [
        { stock: { $lte: 10, $gt: 0 } },
        { 'variants.stock': { $lte: 10, $gt: 0 } }
      ]
    })
    .populate('category', 'name')
    .populate('brand', 'name')
    .select('name sku stock variants')
    .limit(10);

    // Lấy sản phẩm bán chạy (top 5 theo số lượng đánh giá)
    const topProducts = await Product.find({ isActive: true })
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ numReviews: -1, averageRating: -1 })
      .limit(5)
      .select('name averageRating numReviews price salePrice images');

    // Tính doanh thu cho từng sản phẩm bán chạy
    const topProductsWithRevenue = await Promise.all(
      topProducts.map(async (product) => {
        const orderItems = await Order.aggregate([
          { $unwind: '$orderItems' },
          { $match: { 'orderItems.product': product._id, status: 'completed' } },
          { $group: { 
            _id: null, 
            soldCount: { $sum: '$orderItems.quantity' },
            revenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } }
          }}
        ]);

        return {
          ...product.toObject(),
          soldCount: orderItems.length > 0 ? orderItems[0].soldCount : 0,
          revenue: orderItems.length > 0 ? orderItems[0].revenue : 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalVariants,
        totalCategories,
        totalBrands,
        totalRatings,
        totalConversations,
        recentOrders: recentOrders.map(order => ({
          orderNumber: order.orderNumber,
          customerName: order.user?.name || 'N/A',
          totalAmount: order.totalPrice,
          status: order.status,
          createdAt: order.createdAt
        })),
        lowStockProducts: lowStockProducts.map(product => ({
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          category: product.category?.name || 'N/A',
          brand: product.brand?.name || 'N/A'
        })),
        topProducts: topProductsWithRevenue
      }
    });

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard'
    });
  }
};

// Lấy tổng số lượng sản phẩm theo tên (API đã có nhưng cần sửa)
export const getTotalProductQuantityByName = async (req, res) => {
  try {
    const result = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalQuantity: { $sum: '$stock' } } }
    ]);

    const totalProductQuantityByName = result.length > 0 ? result[0].totalQuantity : 0;

    res.json({
      success: true,
      totalProductQuantityByName
    });
  } catch (error) {
    console.error('Error getting total product quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tổng số lượng sản phẩm'
    });
  }
};

// Thống kê doanh thu chi tiết
export const getRevenueDetailed = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xem thống kê doanh thu chi tiết'
      });
    }

    // Tổng doanh thu
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Doanh thu kỳ trước để tính growth
    const lastMonthRevenue = await Order.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { 
            $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const lastMonthTotal = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;
    const growth = lastMonthTotal > 0 ? ((totalRevenue - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Doanh thu theo ngày (30 ngày gần nhất)
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$createdAt' },
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Doanh thu theo phương thức thanh toán
    const revenueByPaymentMethod = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          value: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } }
    ]);

    // Doanh thu theo danh mục
    const revenueByCategory = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          value: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } },
          count: { $sum: '$orderItems.quantity' }
        }
      },
      { $sort: { value: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalRevenue,
        growth: Math.round(growth * 100) / 100,
        daily: dailyRevenue.map(item => ({
          ...item,
          name: `${item._id.day}/${item._id.month}`
        })),
        weekly: [],
        monthly: [],
        byPaymentMethod: revenueByPaymentMethod.map(item => ({
          name: item._id,
          value: item.value,
          count: item.count
        })),
        byCategory: revenueByCategory.map(item => ({
          name: item._id,
          value: item.value,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error getting detailed revenue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê doanh thu chi tiết'
    });
  }
};

// Thống kê khách hàng chi tiết
export const getCustomersDetailed = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xem thống kê khách hàng chi tiết'
      });
    }

    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const newCustomers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Khách hàng hoạt động (có đơn hàng trong 30 ngày)
    const activeCustomers = await User.countDocuments({
      role: 'customer',
      _id: {
        $in: await Order.distinct('user', {
          status: 'completed',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
      }
    });

    // Tỷ lệ giữ chân khách hàng
    const customersWithOrders = await User.countDocuments({
      role: 'customer',
      _id: { $in: await Order.distinct('user', { status: 'completed' }) }
    });
    const retention = totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0;

    // Khách hàng theo phân khúc
    const customersBySegment = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalSpent: { $sum: '$orders.totalPrice' },
          orderCount: { $size: '$orders' }
        }
      },
      {
        $bucket: {
          groupBy: '$totalSpent',
          boundaries: [0, 1000000, 5000000, 10000000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            avgSpent: { $avg: '$totalSpent' }
          }
        }
      }
    ]);

    // Khách hàng theo khu vực (giả lập)
    const customersByLocation = [
      { name: 'Hà Nội', customers: Math.floor(totalCustomers * 0.3) },
      { name: 'TP.HCM', customers: Math.floor(totalCustomers * 0.4) },
      { name: 'Đà Nẵng', customers: Math.floor(totalCustomers * 0.1) },
      { name: 'Khác', customers: Math.floor(totalCustomers * 0.2) }
    ];

    res.json({
      success: true,
      data: {
        total: totalCustomers,
        new: newCustomers,
        active: activeCustomers,
        growth: 0, // Có thể tính toán dựa trên dữ liệu lịch sử
        bySegment: customersBySegment.map(segment => ({
          name: segment._id,
          customers: segment.count,
          avgSpent: Math.round(segment.avgSpent || 0)
        })),
        byLocation: customersByLocation,
        retention: Math.round(retention * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error getting detailed customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê khách hàng chi tiết'
    });
  }
};

// Thống kê sản phẩm chi tiết
export const getProductsDetailed = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xem thống kê sản phẩm chi tiết'
      });
    }

    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    // Sản phẩm sắp hết hàng
    const lowStockProducts = await Product.find({
      $or: [
        { stock: { $lte: 10, $gt: 0 } },
        { 'variants.stock': { $lte: 10, $gt: 0 } }
      ]
    }).limit(10);

    // Sản phẩm bán chạy
    const topSellingProducts = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'orderItems.product',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalSold: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: {
                  $sum: {
                    $map: {
                      input: '$$order.orderItems',
                      as: 'item',
                      in: {
                        $cond: [
                          { $eq: ['$$item.product', '$_id'] },
                          '$$item.quantity',
                          0
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          totalRevenue: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: {
                  $sum: {
                    $map: {
                      input: '$$order.orderItems',
                      as: 'item',
                      in: {
                        $cond: [
                          { $eq: ['$$item.product', '$_id'] },
                          { $multiply: ['$$item.quantity', '$$item.price'] },
                          0
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          sold: '$totalSold',
          revenue: '$totalRevenue',
          rating: '$averageRating',
          images: 1
        }
      }
    ]);

    // Sản phẩm theo danh mục
    const productsByCategory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          value: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } }
    ]);

    // Sản phẩm theo thương hiệu
    const productsByBrand = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brandInfo'
        }
      },
      { $unwind: '$brandInfo' },
      {
        $group: {
          _id: '$brandInfo.name',
          value: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalProducts,
        active: activeProducts,
        outOfStock: outOfStockProducts,
        topSelling: topSellingProducts,
        byCategory: productsByCategory,
        byBrand: productsByBrand,
        lowStock: lowStockProducts.map(product => ({
          name: product.name,
          sku: product.sku,
          stock: product.stock,
          category: product.category?.name || 'N/A'
        }))
      }
    });
  } catch (error) {
    console.error('Error getting detailed product stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê sản phẩm chi tiết'
    });
  }
};
