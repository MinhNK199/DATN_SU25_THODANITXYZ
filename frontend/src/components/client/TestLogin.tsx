import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TestLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', response.data.user.role);
        toast.success('Đăng nhập thành công!');
        console.log('Login successful:', response.data);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    toast.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Current token:', token);
    console.log('Current user:', user);
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        toast.success(`Token: ${token ? 'Có' : 'Không'}, User: ${userData.name} (${userData.role})`);
      } catch (error) {
        toast.info(`Token: ${token ? 'Có' : 'Không'}, User: ${user ? 'Có' : 'Không'}`);
      }
    } else {
      toast.info(`Token: ${token ? 'Có' : 'Không'}, User: ${user ? 'Có' : 'Không'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Test Login</h1>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={checkToken}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Kiểm tra Token
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>

          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Test Accounts:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Customer:</strong> customer@test.com / 123456</p>
              <p><strong>Admin:</strong> admin@test.com / 123456</p>
              <p><strong>Super Admin:</strong> admindatn@gmail.com / 123456</p>
            </div>
            <div className="mt-3 text-xs text-gray-600">
              <p><strong>Lưu ý:</strong> Chỉ Customer mới được thêm sản phẩm vào giỏ hàng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLogin; 