import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order } from '../../interfaces/Order';
import { OrderTracking } from '../../interfaces/Shipper';
import { shipperApi } from '../../services/shipperApi';

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderTracking, setOrderTracking] = useState<OrderTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pickupImages, setPickupImages] = useState<File[]>([]);
  const [deliveryImages, setDeliveryImages] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState<'pickup' | 'start' | 'arrived' | 'complete'>('pickup');
  const [failureReason, setFailureReason] = useState('');
  const [failureImages, setFailureImages] = useState<File[]>([]);
  const [isReportingFailure, setIsReportingFailure] = useState(false);
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const [returnStartImages, setReturnStartImages] = useState<File[]>([]);
  const [returnNotes, setReturnNotes] = useState('');
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      console.log('🔍 Fetching order detail for ID:', orderId);
      
      // Dùng fetch trực tiếp thay vì shipperApi
      const token = localStorage.getItem('shipperToken');
      if (!token) {
        console.error('❌ No shipper token found');
        return;
      }

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
      
      let orders = [];
      if (responseData && responseData.data && responseData.data.orders) {
        orders = responseData.data.orders;
      }
      
      const foundOrder = orders.find((o: any) => o._id === orderId);
      console.log('🎯 Found order:', foundOrder);
      
      if (foundOrder) {
        setOrder(foundOrder);
        setOrderTracking(foundOrder.orderTracking || null);
      } else {
        console.log('❌ Order not found with ID:', orderId);
      }
    } catch (error) {
      console.error('❌ Error fetching order detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 1: Upload ảnh lấy hàng từ shop
  const handlePickupImages = async () => {
    if (!orderId || pickupImages.length === 0) {
      alert('Vui lòng chọn ảnh lấy hàng từ shop');
      return;
    }
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('shipperToken');
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }

      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('notes', notes);
      
      pickupImages.forEach((file) => {
        formData.append('pickupImages', file);
      });

      console.log('📷 Uploading pickup images for order:', orderId);

      console.log('🔐 Sending request with token:', token);
      console.log('🔗 URL:', `http://localhost:8000/api/shipper/orders/${orderId}/pickup-images`);

      const response = await fetch(`http://localhost:8000/api/shipper/orders/${orderId}/pickup-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Upload ảnh lấy hàng thành công!');
        setCurrentStep('start');
        await fetchOrderDetail(); // Refresh order data
      } else {
        throw new Error(result.message || 'Upload ảnh thất bại');
      }
    } catch (error: any) {
      console.error('Error uploading pickup images:', error);
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsProcessing(false);
    }
  };

  // Bước 2: Bắt đầu giao hàng
  const handleStartDelivery = async () => {
    if (!orderId) return;
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('shipperToken');
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/shipper/orders/${orderId}/start-transit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, notes })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Bắt đầu giao hàng thành công!');
        setCurrentStep('arrived');
        await fetchOrderDetail();
      } else {
        throw new Error(result.message || 'Bắt đầu giao hàng thất bại');
      }
    } catch (error: any) {
      console.error('Error starting delivery:', error);
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsProcessing(false);
    }
  };

  // Bước 3: Đã đến điểm giao
  const handleArrived = async () => {
    if (!orderId) return;
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('shipperToken');
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/shipper/orders/${orderId}/arrived`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, notes })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Đã đến điểm giao hàng!');
        setCurrentStep('complete');
        await fetchOrderDetail();
      } else {
        throw new Error(result.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (error: any) {
      console.error('Error updating arrived status:', error);
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsProcessing(false);
    }
  };

  // Báo cáo giao hàng thất bại
  const handleReportFailure = async () => {
    if (!orderId || !failureReason.trim()) {
      alert('Vui lòng nhập lý do giao hàng thất bại');
      return;
    }
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('shipperToken');
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }

      // Tạo FormData cho multipart/form-data
      const formData = new FormData();
      formData.append('failureReason', failureReason);
      formData.append('notes', notes || '');
      
      // Thêm ảnh bằng chứng nếu có
      failureImages.forEach((file) => {
        formData.append('failureImages', file);
      });

      console.log('❌ Reporting delivery failure for order:', orderId);
      console.log('📝 Failure reason:', failureReason);

      const response = await fetch(`http://localhost:8000/api/shipper/orders/${orderId}/report-failure`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log('📦 Response data:', result);
      } else {
        const text = await response.text();
        console.log('📄 Response text:', text);
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
      }
      
      if (response.ok) {
        alert('✅ Đã báo cáo giao hàng thất bại!');
        navigate('/shipper/dashboard');
      } else {
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error reporting failure:', error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Bước 4: Hoàn thành giao hàng
  const handleConfirmDelivery = async () => {
    if (!orderId || deliveryImages.length === 0) {
      alert('Vui lòng chọn ảnh giao hàng cho khách');
      return;
    }
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('shipperToken');
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }

      // Tạo FormData cho multipart/form-data
      const formData = new FormData();
      formData.append('notes', notes || 'Giao hàng thành công');
      
      // Thêm ảnh giao hàng
      deliveryImages.forEach((file) => {
        formData.append('deliveryImages', file);
      });

      console.log('✅ Confirming delivery for order:', orderId);
      console.log('📝 Notes:', notes);
      console.log('📷 Delivery images count:', deliveryImages.length);

      const response = await fetch(`http://localhost:8000/api/shipper/orders/${orderId}/confirm-delivery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log('📦 Response data:', result);
      } else {
        const text = await response.text();
        console.log('📄 Response text:', text);
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
      }
      
      if (response.ok) {
        alert('🎉 Giao hàng thành công! Hoàn thành đơn hàng!');
        navigate('/shipper/dashboard');
      } else {
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error confirming delivery:', error);
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsProcessing(false);
    }
  };

  // Bắt đầu hoàn trả hàng
  const handleStartReturn = async () => {
    if (!orderId) return;
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('shipperToken');
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }

      // Tạo FormData để hỗ trợ upload ảnh
      const formData = new FormData();
      formData.append('notes', returnNotes || 'Bắt đầu hoàn trả hàng về shop');
      
      // Thêm ảnh bắt đầu hoàn trả nếu có
      returnStartImages.forEach((file) => {
        formData.append('returnStartImages', file);
      });

      const response = await fetch(`http://localhost:8000/api/shipper/orders/${orderId}/start-return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Đã bắt đầu hoàn trả hàng!');
        setIsReturning(true);
        fetchOrderDetail(); // Refresh order data
      } else {
        throw new Error(result.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error starting return:', error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Hoàn thành hoàn trả hàng
  const handleCompleteReturn = async () => {
    if (!orderId || returnImages.length === 0) {
      alert('Vui lòng chọn ảnh bằng chứng hoàn trả');
      return;
    }
    
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('shipperToken');
      if (!token) {
        alert('Vui lòng đăng nhập lại');
        return;
      }

      const formData = new FormData();
      formData.append('notes', returnNotes || 'Hoàn trả hàng thành công');
      
      // Thêm ảnh hoàn trả
      returnImages.forEach((file) => {
        formData.append('returnImages', file);
      });

      const response = await fetch(`http://localhost:8000/api/shipper/orders/${orderId}/complete-return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ Hoàn trả hàng thành công! Chờ admin xác nhận.');
        navigate('/shipper/dashboard');
      } else {
        throw new Error(result.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('Error completing return:', error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pickup' | 'delivery' | 'return' | 'returnStart' | 'failure') => {
    const files = Array.from(e.target.files || []);
    if (type === 'pickup') {
      setPickupImages(files);
    } else if (type === 'delivery') {
      setDeliveryImages(files);
    } else if (type === 'return') {
      setReturnImages(files);
    } else if (type === 'returnStart') {
      setReturnStartImages(files);
    } else if (type === 'failure') {
      setFailureImages(files);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng</h2>
          <button
            onClick={() => navigate('/shipper/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      // OrderTracking statuses
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'arrived':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'returning':
        return 'bg-orange-100 text-orange-800';
      case 'returned':
        return 'bg-orange-100 text-orange-800';
      case 'return_pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'return_confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'return_processing':
        return 'bg-purple-100 text-purple-800';
      case 'return_completed':
        return 'bg-green-100 text-green-800';
      // Order statuses
      case 'delivered_failed':
        return 'bg-red-100 text-red-800';
      case 'delivered_success':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      // OrderTracking statuses
      case 'assigned':
        return 'Đã phân công';
      case 'picked_up':
        return 'Đã nhận hàng';
      case 'in_transit':
        return 'Đang giao hàng';
      case 'arrived':
        return 'Đã đến điểm giao';
      case 'delivered':
        return 'Đã giao hàng';
      case 'failed':
        return 'Giao hàng thất bại';
      case 'returning':
        return 'Đang hoàn trả về shop';
      case 'returned':
        return 'Đã hoàn trả về shop';
      case 'return_pending':
        return 'Chờ admin xác nhận hoàn trả';
      case 'return_confirmed':
        return 'Admin đã xác nhận nhận hàng';
      case 'return_processing':
        return 'Đang xử lý hoàn trả';
      case 'return_completed':
        return 'Hoàn tất xử lý hoàn trả';
      // Order statuses
      case 'delivered_failed':
        return 'Giao hàng thất bại';
      case 'delivered_success':
        return 'Giao hàng thành công';
      case 'processing':
        return 'Đang xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Chi tiết đơn hàng #{order._id.slice(-8)}
              </h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              {/* Debug info */}
              <div className="text-xs text-gray-500 mt-1">
                Order: {order.status} | Tracking: {orderTracking?.status || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Thông tin đơn hàng</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Khách hàng</label>
                <p className="mt-1 text-sm text-gray-900">{order.user?.fullName}</p>
                <p className="text-sm text-gray-500">{order.user?.phone}</p>
                <p className="text-sm text-gray-500">{order.user?.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Địa chỉ giao hàng</label>
                <p className="mt-1 text-sm text-gray-900">
                  {order.shippingAddress?.address}, {order.shippingAddress?.city}
                </p>
                <p className="text-sm text-gray-500">Mã bưu chính: {order.shippingAddress?.postalCode}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tổng tiền</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {order.totalPrice?.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
                <p className="mt-1 text-sm text-gray-900">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Sản phẩm</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Giá: {item.price?.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Steps */}
        {(order.status === 'assigned' || order.status === 'processing' || order.status === 'picked_up' || order.status === 'shipped' || order.status === 'in_transit' || order.status === 'arrived') && (
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">🚚 Quy trình giao hàng</h2>
              
              {/* Progress Steps */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className={`flex items-center ${order.status === 'assigned' || order.status === 'processing' ? 'text-blue-600 font-medium' : 'text-green-600'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${order.status === 'assigned' || order.status === 'processing' ? 'bg-blue-100' : 'bg-green-100'}`}>
                      {order.status === 'assigned' || order.status === 'processing' ? '1' : '✓'}
                    </span>
                    📷 Lấy hàng từ shop
                  </div>
                  <div className={`flex items-center ${order.status === 'picked_up' ? 'text-blue-600 font-medium' : (order.status === 'in_transit' || order.status === 'arrived' || order.status === 'delivered_success') ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${order.status === 'picked_up' ? 'bg-blue-100' : (order.status === 'in_transit' || order.status === 'arrived' || order.status === 'delivered_success') ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {order.status === 'picked_up' ? '2' : (order.status === 'in_transit' || order.status === 'arrived' || order.status === 'delivered_success') ? '✓' : '2'}
                    </span>
                    🚚 Bắt đầu giao
                  </div>
                  <div className={`flex items-center ${order.status === 'in_transit' ? 'text-blue-600 font-medium' : (order.status === 'arrived' || order.status === 'delivered_success') ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${order.status === 'in_transit' ? 'bg-blue-100' : (order.status === 'arrived' || order.status === 'delivered_success') ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {order.status === 'in_transit' ? '3' : (order.status === 'arrived' || order.status === 'delivered_success') ? '✓' : '3'}
                    </span>
                    📍 Đến điểm giao
                  </div>
                  <div className={`flex items-center ${order.status === 'arrived' ? 'text-blue-600 font-medium' : order.status === 'delivered_success' ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${order.status === 'arrived' ? 'bg-blue-100' : order.status === 'delivered_success' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {order.status === 'arrived' ? '4' : order.status === 'delivered_success' ? '✓' : '4'}
                    </span>
                    ✅ Giao thành công
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Upload pickup images */}
            {(order.status === 'assigned' || order.status === 'processing') && (
              <div className="px-6 py-4 space-y-4 border-l-4 border-blue-500 bg-blue-50">
                <h3 className="text-lg font-medium text-blue-900">📷 Bước 1: Upload ảnh lấy hàng từ shop</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ảnh chứng minh đã lấy hàng từ shop *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'pickup')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {pickupImages.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">✓ Đã chọn {pickupImages.length} ảnh</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ghi chú về việc lấy hàng..."
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handlePickupImages}
                    disabled={isProcessing || pickupImages.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Đang upload...' : '📷 Upload ảnh lấy hàng'}
                  </button>
                  
                </div>
              </div>
            )}

            {/* Step 2: Start delivery */}
            {order.status === 'picked_up' && (
              <div className="px-6 py-4 space-y-4 border-l-4 border-orange-500 bg-orange-50">
                <h3 className="text-lg font-medium text-orange-900">🚚 Bước 2: Bắt đầu giao hàng</h3>
                <p className="text-sm text-gray-700">Bấm nút bên dưới khi bạn đã rời shop và bắt đầu di chuyển đến địa chỉ giao hàng.</p>
                
                <button
                  onClick={handleStartDelivery}
                  disabled={isProcessing}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Đang xử lý...' : '🚚 Bắt đầu giao hàng'}
                </button>
              </div>
            )}

            {/* Step 3: Arrived at destination */}
            {order.status === 'in_transit' && (
              <div className="px-6 py-4 space-y-4 border-l-4 border-purple-500 bg-purple-50">
                <h3 className="text-lg font-medium text-purple-900">📍 Bước 3: Đã đến điểm giao</h3>
                <p className="text-sm text-gray-700">Bấm nút bên dưới khi bạn đã đến địa chỉ giao hàng và sẵn sàng giao cho khách.</p>
                
                <button
                  onClick={handleArrived}
                  disabled={isProcessing}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Đang xử lý...' : '📍 Đã đến điểm giao'}
                </button>
              </div>
            )}

            {/* Step 4: Complete delivery */}
            {order.status === 'arrived' && (
              <div className="px-6 py-4 space-y-4 border-l-4 border-green-500 bg-green-50">
                <h3 className="text-lg font-medium text-green-900">✅ Bước 4: Hoàn thành giao hàng</h3>
                
                {/* COD Payment Notice */}
                {order.paymentMethod === 'COD' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className="text-yellow-400 text-xl">💰</span>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-yellow-800">
                          Thanh toán COD - Tổng tiền: {order.totalPrice?.toLocaleString('vi-VN')} VNĐ
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Vui lòng thu tiền từ khách hàng trước khi xác nhận giao hàng thành công.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload ảnh giao hàng cho khách *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'delivery')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {deliveryImages.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">✓ Đã chọn {deliveryImages.length} ảnh</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú giao hàng</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder={order.paymentMethod === 'COD' ? 'Ghi chú về việc giao hàng và thu tiền COD...' : 'Ghi chú về việc giao hàng...'}
                  />
                </div>

                {/* Form báo cáo thất bại */}
                {isReportingFailure && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <h4 className="text-sm font-medium text-red-800 mb-3">⚠️ Báo cáo giao hàng thất bại</h4>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-red-700 mb-2">Lý do thất bại *</label>
                      <textarea
                        value={failureReason}
                        onChange={(e) => setFailureReason(e.target.value)}
                        rows={3}
                        className="block w-full border-red-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Vui lòng mô tả lý do giao hàng thất bại (bắt buộc)..."
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-red-700 mb-2">Upload ảnh bằng chứng</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'failure')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      />
                      {failureImages.length > 0 && (
                        <p className="text-sm text-red-600 mt-1">✓ Đã chọn {failureImages.length} ảnh</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">* Chụp ảnh bằng chứng giao hàng thất bại (tùy chọn)</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleReportFailure}
                        disabled={isProcessing || !failureReason.trim()}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Đang xử lý...' : '❌ Xác nhận giao thất bại'}
                      </button>
                      <button
                        onClick={() => {
                          setIsReportingFailure(false);
                          setFailureReason('');
                          setFailureImages([]);
                        }}
                        disabled={isProcessing}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={handleConfirmDelivery}
                    disabled={isProcessing || deliveryImages.length === 0}
                    className={`px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                      order.paymentMethod === 'COD' 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isProcessing ? 'Đang xử lý...' : 
                     order.paymentMethod === 'COD' ? '💰 Giao hàng & Thu tiền COD' : '✅ Giao hàng thành công'}
                  </button>
                  
                  <button
                    onClick={() => setIsReportingFailure(true)}
                    disabled={isProcessing || isReportingFailure}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ❌ Giao thất bại
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

              {/* Return Process for Failed Delivery */}
              {order && ['delivered_failed', 'return_pending'].includes(order.status) && (
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <h2 className="text-lg font-medium text-red-900">🔄 Hoàn trả hàng về shop</h2>
              <p className="text-sm text-red-700 mt-1">
                Đơn hàng giao thất bại - Cần hoàn trả hàng về shop
              </p>
            </div>
            
            <div className="px-6 py-4">
              {/* Shop Address */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-blue-500 text-xl">🏪</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">
                      Địa chỉ hoàn trả (Shop)
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      📍 241 Phúc Diễn, Xuân Phương, Nam Từ Liêm, Hà Nội
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      * Đây là địa chỉ cố định để hoàn trả hàng
                    </p>
                  </div>
                </div>
              </div>

              {/* Return Process */}
              {!isReturning && order.status === 'delivered_failed' && (
                <div>
                  <h3 className="text-lg font-medium text-orange-900 mb-4">🚚 Bắt đầu hoàn trả</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload ảnh bắt đầu hoàn trả</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'returnStart')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    {returnStartImages.length > 0 && (
                      <p className="text-sm text-orange-600 mt-1">✓ Đã chọn {returnStartImages.length} ảnh</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">* Chụp ảnh hàng hóa trước khi bắt đầu hoàn trả</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú hoàn trả</label>
                    <textarea
                      value={returnNotes}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      rows={2}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Ghi chú về việc hoàn trả hàng về shop..."
                    />
                  </div>
                  
                  <button
                    onClick={handleStartReturn}
                    disabled={isProcessing}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Đang xử lý...' : '🚚 Bắt đầu hoàn trả'}
                  </button>
                </div>
              )}

              {/* Complete Return Process */}
              {(isReturning || ['returned', 'return_pending'].includes(order.status)) && (
                <div>
                  <h3 className="text-lg font-medium text-green-900 mb-4">✅ Hoàn thành hoàn trả</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload ảnh hoàn trả *</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'return')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {returnImages.length > 0 && (
                      <p className="text-sm text-green-600 mt-1">✓ Đã chọn {returnImages.length} ảnh</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú hoàn trả</label>
                    <textarea
                      value={returnNotes}
                      onChange={(e) => setReturnNotes(e.target.value)}
                      rows={2}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Ghi chú về việc hoàn trả hàng thành công..."
                    />
                  </div>
                  
                  <button
                    onClick={handleCompleteReturn}
                    disabled={isProcessing || returnImages.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Đang xử lý...' : '✅ Hoàn trả thành công'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Tracking Info */}
        {orderTracking && (
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Thông tin tracking</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderTracking.pickupTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Thời gian nhận hàng</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(orderTracking.pickupTime).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
                {orderTracking.deliveryFailureTime && (
                  <div>
                    <label className="block text-sm font-medium text-red-700">Thời gian giao thất bại</label>
                    <p className="mt-1 text-sm text-red-900">
                      {new Date(orderTracking.deliveryFailureTime).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
                {orderTracking.deliveryTime && !orderTracking.deliveryFailureTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Thời gian giao hàng</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(orderTracking.deliveryTime).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
                {orderTracking.deliveryFailureReason && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-red-700">Lý do giao thất bại</label>
                    <p className="mt-1 text-sm text-red-900">{orderTracking.deliveryFailureReason}</p>
                  </div>
                )}
                {orderTracking.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                    <p className="mt-1 text-sm text-gray-900">{orderTracking.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/shipper/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
