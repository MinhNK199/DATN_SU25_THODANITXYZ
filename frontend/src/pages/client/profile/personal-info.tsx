import React, { useState, useEffect } from 'react';
import { Camera, Save, Eye, EyeOff, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  avatar?: string;
  role: string;
}

const PersonalInfo = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const [sensitiveField, setSensitiveField] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    email: ''
  });

  // Load user data from localStorage or API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setFormData({
            name: userData.name || '',
            phone: userData.phone || '',
            gender: userData.gender || '',
            dateOfBirth: userData.dateOfBirth || '',
            email: userData.email || ''
          });
        } else {
          // ✅ Fetch from API với endpoint đúng: /auth/me
          const response = await axiosInstance.get('/auth/me');
          if (response.data) {
            const userData = response.data.user || response.data;
            setUser(userData);
            setFormData({
              name: userData.name || '',
              phone: userData.phone || '',
              gender: userData.gender || '',
              dateOfBirth: userData.dateOfBirth || '',
              email: userData.email || ''
            });
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // ✅ Update với endpoint đúng: /auth/users/:id
      const response = await axiosInstance.put(`/auth/users/${user?._id}`, {
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth
      });

      if (response.data) {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSensitiveUpdate = (field: string) => {
    setSensitiveField(field);
    setShowSensitiveModal(true);
  };

  const handleSensitiveSubmit = async () => {
    try {
      setIsLoading(true);
      
      // ✅ Endpoint để update email/phone với xác thực password
      const response = await axiosInstance.put('/auth/update-sensitive', {
        field: sensitiveField,
        value: formData[sensitiveField as keyof typeof formData],
        password: password
      });

      if (response.data) {
        const updatedUser = { ...user, [sensitiveField]: formData[sensitiveField as keyof typeof formData] };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setShowSensitiveModal(false);
        setPassword('');
        toast.success('Cập nhật thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('avatar', file);

      // ✅ Upload avatar endpoint
      const response = await axiosInstance.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const updatedUser = { ...user, avatar: response.data.avatar };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Cập nhật ảnh đại diện thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
        <p className="text-gray-600 mt-1">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center space-x-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div className="relative">
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/80x80?text=Avatar';
            }}
          />
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg cursor-pointer">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'Chưa có tên'}</h3>
          <p className="text-gray-600">{user?.email}</p>
          <p className="text-sm text-gray-500 mt-1">
            Vai trò: {user?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Thông tin chi tiết</h2>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Nhập họ và tên"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="flex">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-500"
              />
              <button
                onClick={() => handleSensitiveUpdate('email')}
                className="px-3 py-2 bg-yellow-500 text-white rounded-r-md hover:bg-yellow-600 transition-colors text-sm"
                title="Cần xác thực mật khẩu để thay đổi email"
              >
                Thay đổi
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <div className="flex">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Nhập số điện thoại"
              />
              {!isEditing && (
                <button
                  onClick={() => handleSensitiveUpdate('phone')}
                  className="px-3 py-2 bg-yellow-500 text-white rounded-r-md hover:bg-yellow-600 transition-colors text-sm"
                  title="Cần xác thực mật khẩu để thay đổi số điện thoại"
                >
                  Thay đổi
                </button>
              )}
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày sinh
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => {
                setIsEditing(false);
                // Reset form data
                setFormData({
                  name: user?.name || '',
                  phone: user?.phone || '',
                  gender: user?.gender || '',
                  dateOfBirth: user?.dateOfBirth || '',
                  email: user?.email || ''
                });
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Sensitive Info Modal */}
      {showSensitiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Xác thực thay đổi</h3>
              <button
                onClick={() => {
                  setShowSensitiveModal(false);
                  setPassword('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Để thay đổi {sensitiveField === 'email' ? 'email' : 'số điện thoại'}, vui lòng nhập mật khẩu của bạn.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="Nhập mật khẩu của bạn"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSensitiveModal(false);
                  setPassword('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSensitiveSubmit}
                disabled={!password || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <span>Xác nhận</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;