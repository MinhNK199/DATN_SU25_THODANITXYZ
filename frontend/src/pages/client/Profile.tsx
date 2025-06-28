import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaShoppingBag, FaHeart, FaCog, FaSignOutAlt, FaCreditCard, FaTruck, FaCheckCircle } from 'react-icons/fa';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '+84 123 456 789',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  });

  const [addresses] = useState([
    {
      id: 1,
      type: 'Nhà riêng',
      name: 'Nguyễn Văn A',
      phone: '+84 123 456 789',
      address: '123 Đường ABC, Căn 4B',
      city: 'TP. Hồ Chí Minh',
      state: 'Quận 1',
      zip: '70000',
      isDefault: true
    },
    {
      id: 2,
      type: 'Văn phòng',
      name: 'Nguyễn Văn A',
      phone: '+84 123 456 789',
      address: '456 Đường XYZ, Tầng 2',
      city: 'TP. Hồ Chí Minh',
      state: 'Quận 3',
      zip: '70000',
      isDefault: false
    }
  ]);

  const [orders] = useState([
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Đã giao',
      total: 1199,
      items: [
        { name: 'iPhone 15 Pro Max', quantity: 1, price: 1199 }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'Đang giao',
      total: 2499,
      items: [
        { name: 'MacBook Pro 16" M3 Max', quantity: 1, price: 2499 }
      ]
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'Đang xử lý',
      total: 498,
      items: [
        { name: 'AirPods Pro 2nd Generation', quantity: 2, price: 249 }
      ]
    }
  ]);

  const [wishlist] = useState([
    {
      id: '1',
      name: 'Samsung Galaxy S24 Ultra',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
    },
    {
      id: '2',
      name: 'iPad Pro 12.9" M2 Chip',
      price: 1099,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1011&q=80'
    }
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã giao':
        return 'text-green-600 bg-green-100';
      case 'Đang giao':
        return 'text-blue-600 bg-blue-100';
      case 'Đang xử lý':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'profile', label: 'Hồ sơ', icon: FaUser },
    { id: 'orders', label: 'Đơn hàng', icon: FaShoppingBag },
    { id: 'wishlist', label: 'Yêu thích', icon: FaHeart },
    { id: 'addresses', label: 'Địa chỉ', icon: FaMapMarkerAlt },
    { id: 'settings', label: 'Cài đặt', icon: FaCog }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
            <p className="text-gray-600">Quản lý hồ sơ, đơn hàng và tùy chọn của bạn</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                {/* Profile Summary */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <img
                      src={profileData.avatar}
                      alt="Hồ sơ"
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                    />
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      <FaEdit className="w-3 h-3" />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{profileData.name}</h3>
                  <p className="text-gray-600 text-sm">{profileData.email}</p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Logout */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <FaSignOutAlt className="w-5 h-5" />
                    <span className="font-medium">Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin hồ sơ</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {isEditing ? <FaTimes className="w-4 h-4" /> : <FaEdit className="w-4 h-4" />}
                      <span>{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
                    </button>
                  </div>

                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaSave className="w-4 h-4" />
                          <span>Lưu thay đổi</span>
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng</h2>
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                            <p className="text-gray-600">Đặt hàng ngày {order.date}</p>
                          </div>
                          <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name} x{item.quantity}</span>
                              <span>{formatPrice(item.price)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                          <button className="text-blue-600 hover:text-blue-700 font-medium">
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Danh sách yêu thích</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-lg font-bold text-gray-900 mb-4">{formatPrice(item.price)}</p>
                        <div className="flex space-x-2">
                          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Thêm vào giỏ
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Địa chỉ giao hàng</h2>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Thêm địa chỉ mới
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                              {address.type}
                            </span>
                            {address.isDefault && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <FaEdit className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">{address.name}</p>
                          <p className="text-gray-600">{address.phone}</p>
                          <p className="text-gray-600">{address.address}</p>
                          <p className="text-gray-600">{address.city}, {address.state} {address.zip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt tài khoản</h2>
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tùy chọn thông báo</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          <span>Thông báo email cho đơn hàng</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          <span>Email khuyến mãi</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" />
                          <span>Thông báo SMS</span>
                        </label>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt quyền riêng tư</h3>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          <span>Chia sẻ lịch sử mua hàng để gợi ý</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" />
                          <span>Cho phép phân tích bên thứ ba</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Lưu cài đặt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 