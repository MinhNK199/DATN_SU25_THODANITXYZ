import React, { useState, useEffect } from 'react';
import { FaUsers, FaBox, FaFileInvoiceDollar, FaStar, FaChartLine, FaTruck, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
  Area, AreaChart, PieChart, Pie, Cell, RadialBarChart, RadialBar, ComposedChart
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalVariants: number;
  totalCategories: number;
  totalBrands: number;
  totalRatings: number;
  recentOrders: any[];
  lowStockProducts: any[];
  topProducts: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalVariants: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalRatings: 0,
    recentOrders: [],
    lowStockProducts: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [revenueStats, setRevenueStats] = useState<{ daily: any[]; weekly: any[]; monthly: any[] }>({ daily: [], weekly: [], monthly: [] });
  const [totalProductQuantity, setTotalProductQuantity] = useState<number>(0);
  const [selectedChartType, setSelectedChartType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    fetchDashboardData();
    fetchRevenueStats();
    fetchTotalProductQuantity();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch dashboard stats
      const statsResponse = await axios.get('http://localhost:8000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/order/admin/revenue-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
      setRevenueStats({
        daily: (res.data.daily || []).reverse(),
          weekly: (res.data.weekly || []).reverse(),
        monthly: (res.data.monthly || []).reverse(),
      });
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
    }
  };

  const fetchTotalProductQuantity = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/product/total-product-quantity-by-name');
      if (res.data.success) {
        setTotalProductQuantity(res.data.totalProductQuantityByName || 0);
      } else {
        // Fallback nếu API không có success flag
        setTotalProductQuantity(res.data.totalProductQuantityByName || 0);
      }
    } catch (error) {
      console.error('Error fetching total product quantity:', error);
      // Set default value nếu có lỗi
      setTotalProductQuantity(0);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (d: any) => {
    if (!d) return '';
    if (d._id?.day) {
      // daily
      return `${d._id.day}/${d._id.month}`;
    }
    if (d._id?.month) {
      // monthly
      return `${d._id.month}/${d._id.year}`;
    }
    return '';
  };

  // Hàm lấy dữ liệu biểu đồ theo loại được chọn
  const getChartData = () => {
    const data = revenueStats[selectedChartType] || [];
    return data.map(item => {
      let name = '';
      if (selectedChartType === 'daily') {
        name = `${item._id.day}/${item._id.month}`;
      } else if (selectedChartType === 'weekly') {
        name = `Tuần ${item._id.week}/${item._id.year}`;
      } else if (selectedChartType === 'monthly') {
        name = `${item._id.month}/${item._id.year}`;
      }
      return {
        ...item,
        name
      };
    });
  };

  // Hàm lấy tiêu đề biểu đồ
  const getChartTitle = () => {
    switch (selectedChartType) {
      case 'daily':
        return 'Doanh thu theo ngày (30 ngày gần nhất)';
      case 'weekly':
        return 'Doanh thu theo tuần (12 tuần gần nhất)';
      case 'monthly':
        return 'Doanh thu theo tháng (12 tháng gần nhất)';
      default:
        return 'Doanh thu';
    }
  };

  // Hàm lấy màu sắc cho biểu đồ
  const getChartColors = () => {
    switch (selectedChartType) {
      case 'daily':
        return { revenue: '#8884d8', orders: '#82ca9d' };
      case 'weekly':
        return { revenue: '#ff6b6b', orders: '#4ecdc4' };
      case 'monthly':
        return { revenue: '#45b7d1', orders: '#96ceb4' };
      default:
        return { revenue: '#8884d8', orders: '#82ca9d' };
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thống kê</h1>
          <p className="text-gray-600 mt-2">Tổng quan hệ thống quản lý</p>
        </div>

        {/* Biểu đồ doanh thu với dropdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
              {getChartTitle()}
            </h3>
            
            {/* Dropdown chọn loại biểu đồ */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Xem theo:</label>
              <select
                value={selectedChartType}
                onChange={(e) => setSelectedChartType(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="daily">Theo ngày</option>
                <option value="weekly">Theo tuần</option>
                <option value="monthly">Theo tháng</option>
              </select>
            </div>
          </div>

          {/* Biểu đồ lớn với animation */}
          <div className="h-96 relative">
            <ResponsiveContainer width="100%" height="100%">
              {selectedChartType === 'daily' ? (
                <AreaChart data={getChartData()}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getChartColors().revenue} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={getChartColors().revenue} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getChartColors().orders} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={getChartColors().orders} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#666' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency} 
                    tick={{ fontSize: 12, fill: '#666' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [
                      name === 'totalRevenue' ? formatCurrency(value as number) : value,
                      name === 'totalRevenue' ? 'Doanh thu' : 'Số đơn'
                    ]}
                    labelFormatter={(label) => `Ngày: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke={getChartColors().revenue}
                    fill="url(#revenueGradient)"
                    name="Doanh thu"
                    strokeWidth={3}
                    dot={{ fill: getChartColors().revenue, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: getChartColors().revenue, strokeWidth: 2 }}
                    animationBegin={0}
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="orderCount"
                    stroke={getChartColors().orders}
                    fill="url(#ordersGradient)"
                    name="Số đơn"
                    strokeWidth={3}
                    dot={{ fill: getChartColors().orders, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: getChartColors().orders, strokeWidth: 2 }}
                    animationBegin={200}
                    animationDuration={1500}
                  />
                </AreaChart>
              ) : (
                <ComposedChart data={getChartData()}>
                  <defs>
                    <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getChartColors().revenue} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={getChartColors().revenue} stopOpacity={0.4}/>
                    </linearGradient>
                    <linearGradient id="ordersBarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getChartColors().orders} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={getChartColors().orders} stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#666' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={formatCurrency} 
                    tick={{ fontSize: 12, fill: '#666' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: '#666' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [
                      name === 'totalRevenue' ? formatCurrency(value as number) : value,
                      name === 'totalRevenue' ? 'Doanh thu' : 'Số đơn'
                    ]}
                    labelFormatter={(label) => `${selectedChartType === 'weekly' ? 'Tuần' : 'Tháng'}: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="totalRevenue" 
                    fill="url(#revenueBarGradient)" 
                    name="Doanh thu"
                    radius={[6, 6, 0, 0]}
                    animationBegin={0}
                    animationDuration={1500}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="orderCount" 
                    fill="url(#ordersBarGradient)" 
                    name="Số đơn"
                    radius={[6, 6, 0, 0]}
                    animationBegin={300}
                    animationDuration={1500}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Thống kê tóm tắt */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getChartColors().revenue }}></div>
                <span className="text-sm font-medium text-gray-600">Tổng doanh thu</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatCurrency(getChartData().reduce((sum, item) => sum + (item.totalRevenue || 0), 0))}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getChartColors().orders }}></div>
                <span className="text-sm font-medium text-gray-600">Tổng đơn hàng</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {getChartData().reduce((sum, item) => sum + (item.orderCount || 0), 0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-gray-400"></div>
                <span className="text-sm font-medium text-gray-600">Trung bình/đơn</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {(() => {
                  const totalRevenue = getChartData().reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
                  const totalOrders = getChartData().reduce((sum, item) => sum + (item.orderCount || 0), 0);
                  return totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '0 ₫';
                })()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Products (custom quantity) */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">{totalProductQuantity}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaBox className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaFileInvoiceDollar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaChartLine className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Variants */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Biến thể</h3>
              <FaBox className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.totalVariants}</p>
            <p className="text-sm text-gray-600">Tổng số biến thể sản phẩm</p>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Danh mục</h3>
              <FaBox className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.totalCategories}</p>
            <p className="text-sm text-gray-600">Tổng số danh mục</p>
          </div>

          {/* Brands */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thương hiệu</h3>
              <FaBox className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.totalBrands}</p>
            <p className="text-sm text-gray-600">Tổng số thương hiệu</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h3>
              <FaTruck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status === 'completed' ? 'Hoàn thành' :
                         order.status === 'pending' ? 'Đang xử lý' : 'Hủy'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có đơn hàng nào</p>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sản phẩm sắp hết hàng</h3>
              <FaExclamationTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="space-y-4">
              {stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">{product.stock}</p>
                      <p className="text-sm text-gray-600">còn lại</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <FaCheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">Tất cả sản phẩm đều có đủ hàng</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Sản phẩm bán chạy</h3>
            <FaStar className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FaBox className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">Đã bán: {product.soldCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                      <div className="flex items-center">
                        <FaStar className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-full py-4">Chưa có dữ liệu sản phẩm bán chạy</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
