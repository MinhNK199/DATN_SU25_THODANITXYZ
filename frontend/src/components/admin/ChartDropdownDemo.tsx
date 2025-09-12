import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

// Component demo để test dropdown biểu đồ
const ChartDropdownDemo: React.FC = () => {
  const [selectedChartType, setSelectedChartType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Dữ liệu demo
  const demoData = {
    daily: [
      { _id: { day: 1, month: 1, year: 2024 }, totalRevenue: 1500000, orderCount: 25 },
      { _id: { day: 2, month: 1, year: 2024 }, totalRevenue: 2000000, orderCount: 30 },
      { _id: { day: 3, month: 1, year: 2024 }, totalRevenue: 1800000, orderCount: 28 },
    ],
    weekly: [
      { _id: { week: 1, year: 2024 }, totalRevenue: 10500000, orderCount: 175 },
      { _id: { week: 2, year: 2024 }, totalRevenue: 12000000, orderCount: 200 },
      { _id: { week: 3, year: 2024 }, totalRevenue: 9500000, orderCount: 160 },
    ],
    monthly: [
      { _id: { month: 1, year: 2024 }, totalRevenue: 45000000, orderCount: 750 },
      { _id: { month: 2, year: 2024 }, totalRevenue: 52000000, orderCount: 850 },
      { _id: { month: 3, year: 2024 }, totalRevenue: 48000000, orderCount: 800 },
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getChartData = () => {
    const data = demoData[selectedChartType] || [];
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Demo Chart Dropdown</h1>
        
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

          {/* Biểu đồ lớn */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {selectedChartType === 'daily' ? (
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'totalRevenue' ? formatCurrency(value as number) : value,
                      name === 'totalRevenue' ? 'Doanh thu' : 'Số đơn'
                    ]}
                    labelFormatter={(label) => `Ngày: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    stroke={getChartColors().revenue} 
                    name="Doanh thu"
                    strokeWidth={3}
                    dot={{ fill: getChartColors().revenue, strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orderCount" 
                    stroke={getChartColors().orders} 
                    name="Số đơn"
                    strokeWidth={3}
                    dot={{ fill: getChartColors().orders, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'totalRevenue' ? formatCurrency(value as number) : value,
                      name === 'totalRevenue' ? 'Doanh thu' : 'Số đơn'
                    ]}
                    labelFormatter={(label) => `${selectedChartType === 'weekly' ? 'Tuần' : 'Tháng'}: ${label}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="totalRevenue" 
                    fill={getChartColors().revenue} 
                    name="Doanh thu"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="orderCount" 
                    fill={getChartColors().orders} 
                    name="Số đơn"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
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

        {/* Hướng dẫn sử dụng */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Hướng dẫn sử dụng</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• <strong>Dropdown:</strong> Chọn "Theo ngày", "Theo tuần", hoặc "Theo tháng" để xem biểu đồ tương ứng</li>
            <li>• <strong>Biểu đồ lớn:</strong> Hiển thị với kích thước 400px chiều cao để dễ quan sát</li>
            <li>• <strong>Màu sắc:</strong> Mỗi loại biểu đồ có màu sắc riêng biệt</li>
            <li>• <strong>Thống kê tóm tắt:</strong> Hiển thị tổng doanh thu, tổng đơn hàng và trung bình/đơn</li>
            <li>• <strong>Tooltip:</strong> Hover vào biểu đồ để xem chi tiết từng điểm dữ liệu</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChartDropdownDemo;
