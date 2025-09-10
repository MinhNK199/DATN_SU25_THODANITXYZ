import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShipper } from '../../contexts/ShipperContext';
import { shipperApi } from '../../services/shipperApi';
import { Order } from '../../interfaces/Order';
import { OrderTracking } from '../../interfaces/Shipper';

const ShipperDashboard: React.FC = () => {
  const { state, logout, updateOnlineStatus } = useShipper();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Redirect về trang login chính thay vì shipper login
    navigate('/login');
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(state.shipper?.isOnline || false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('🔍 Fetching assigned orders...');
      
      // Đảm bảo token được set
      const token = localStorage.getItem('shipperToken');
      const shipperData = localStorage.getItem('shipper');
      
      console.log('🔑 Token exists:', !!token);
      console.log('👤 Shipper data:', shipperData);
      
      if (shipperData) {
        const shipper = JSON.parse(shipperData);
        console.log('🆔 Shipper ID:', shipper.id);
        console.log('📧 Shipper email:', shipper.email);
      }
      
      if (!token) {
        console.error('❌ No shipper token found');
        return;
      }
      
      // Dùng fetch trực tiếp thay vì shipperApi vì axiosInstance có vấn đề
      const response = await fetch('http://localhost:8000/api/shipper/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('📦 Orders response:', responseData);
      console.log('📦 Response structure:', JSON.stringify(responseData, null, 2));
      
      // API trả về: {success: true, data: {orders: [...], total: X}}
      let orders = [];
      if (responseData && responseData.data && responseData.data.orders) {
        orders = responseData.data.orders;
      } else if (responseData && responseData.orders) {
        orders = responseData.orders;
      } else if (Array.isArray(responseData)) {
        orders = responseData;
      }
      
      setOrders(orders);
      console.log('✅ Orders loaded:', orders.length);
      
      if (orders.length > 0) {
        console.log('🎉 Found orders:', orders);
      }
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      console.error('❌ Error response:', error.response?.data);
      alert('Lỗi tải đơn hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOnlineStatus = async () => {
    try {
      const token = localStorage.getItem('shipperToken');
      if (!token) {
        alert('Vui lòng đăng nhập lại.');
        return;
      }
      
      const newStatus = !onlineStatus;
      
      const response = await fetch('/api/shipper/online-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isOnline: newStatus })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setOnlineStatus(newStatus);
      } else {
        throw new Error(result.message || 'Cập nhật trạng thái thất bại');
      }
      
    } catch (error: any) {
      console.error('Error updating online status:', error);
      alert('Lỗi cập nhật trạng thái: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'Đã phân công';
      case 'picked_up':
        return 'Đã nhận hàng';
      case 'in_transit':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'failed':
        return 'Giao hàng thất bại';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Shipper Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <button
                  onClick={handleToggleOnlineStatus}
                  className={`px-4 py-2 rounded-full text-sm font-bold cursor-pointer hover:shadow-md transition-all duration-200 ${
                    onlineStatus
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title="Click để thay đổi trạng thái"
                >
                  {onlineStatus ? '🟢 Online' : '🔴 Offline'}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Xin chào, {state.shipper?.fullName}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tổng đơn hàng</dt>
                    <dd className="text-lg font-medium text-gray-900">{state.shipper?.totalDeliveries || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Đang xử lý</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {orders.filter(order => ['assigned', 'picked_up', 'in_transit'].includes(order.status)).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Đã hoàn thành</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {orders.filter(order => order.status === 'delivered_success').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Đánh giá</dt>
                    <dd className="text-lg font-medium text-gray-900">{state.shipper?.rating || 0}/5</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Đơn hàng được phân công</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Danh sách các đơn hàng bạn cần giao
                </p>
              </div>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <li className="px-4 py-5 sm:px-6">
                <div className="text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="mt-2">Chưa có đơn hàng nào được phân công</p>
                </div>
              </li>
            ) : (
              orders.map((order) => (
                <li key={order._id} className="px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Đơn hàng #{order._id.slice(-8)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Khách hàng:</span> {order.user?.fullName}
                        </div>
                        <div>
                          <span className="font-medium">SĐT:</span> {order.user?.phone}
                        </div>
                        <div>
                          <span className="font-medium">Tổng tiền:</span> {order.totalPrice?.toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="font-medium">Địa chỉ giao:</span> {order.shippingAddress?.address}, {order.shippingAddress?.city}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          console.log('🔍 Navigating to order detail:', order._id);
                          console.log('📦 Order object:', order);
                          navigate(`/shipper/order/${order._id}`);
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Xem chi tiết
                      </button>
                      {(order.status === 'assigned' || order.status === 'processing') && (
                        <button 
                          onClick={() => navigate(`/shipper/order/${order._id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Bắt đầu giao
                        </button>
                      )}
                      {order.status === 'picked_up' && (
                        <button 
                          onClick={() => navigate(`/shipper/order/${order._id}`)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Xác nhận giao hàng
                        </button>
                      )}
                      {order.status === 'in_transit' && (
                        <button 
                          onClick={() => navigate(`/shipper/order/${order._id}`)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Cập nhật vị trí
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default ShipperDashboard;
