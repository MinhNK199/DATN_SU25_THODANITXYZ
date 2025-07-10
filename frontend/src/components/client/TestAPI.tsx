import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const TestAPI = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [productAvailability, setProductAvailability] = useState(null);

  const API_BASE_URL = 'http://localhost:8000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const testCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/category`);
      setCategories(response.data);
      toast.success('Lấy danh sách categories thành công');
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Lỗi khi lấy categories');
    } finally {
      setLoading(false);
    }
  };

  const testBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/brand`);
      setBrands(response.data);
      toast.success('Lấy danh sách brands thành công');
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Lỗi khi lấy brands');
    } finally {
      setLoading(false);
    }
  };

  const testProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/product`);
      setProducts(response.data);
      toast.success('Lấy danh sách products thành công');
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Lỗi khi lấy products');
    } finally {
      setLoading(false);
    }
  };

  const testCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để test cart');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders()
      });
      setCart(response.data);
      toast.success('Lấy giỏ hàng thành công');
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        toast.error('Token không hợp lệ hoặc đã hết hạn');
      } else {
        toast.error('Lỗi khi lấy giỏ hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  const testAddToCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
        return;
      }

      if (!selectedProduct) {
        toast.error('Vui lòng chọn sản phẩm');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/cart`, {
        productId: selectedProduct,
        quantity: quantity
      }, {
        headers: getAuthHeaders()
      });

      setCart(response.data);
      toast.success('Thêm vào giỏ hàng thành công');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Lỗi khi thêm vào giỏ hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  const testProductAvailability = async () => {
    try {
      setLoading(true);
      if (!selectedProduct) {
        toast.error('Vui lòng chọn sản phẩm');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/cart/product-availability/${selectedProduct}`);
      setProductAvailability(response.data);
      toast.success('Lấy thông tin số lượng có sẵn thành công');
    } catch (error) {
      console.error('Error getting product availability:', error);
      toast.error('Lỗi khi lấy thông tin số lượng');
    } finally {
      setLoading(false);
    }
  };

  const testCleanup = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để test cleanup');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/cleanup`, {
        headers: getAuthHeaders()
      });
      toast.success(`Cleanup thành công: ${response.data.expiredReservations} reservations đã được xóa`);
    } catch (error) {
      console.error('Error running cleanup:', error);
      toast.error('Lỗi khi chạy cleanup');
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    return {
      user: userStr ? JSON.parse(userStr) : null,
      token: token ? 'Có token' : 'Không có token',
      role: userRole || 'Không có role'
    };
  };

  const userInfo = getUserInfo();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test API - Quản lý kho theo thời gian thực</h1>
      
      {/* User Info */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Thông tin người dùng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <strong>Token:</strong> {userInfo.token}
          </div>
          <div>
            <strong>Role:</strong> {userInfo.role}
          </div>
          <div>
            <strong>User:</strong> {userInfo.user ? `${userInfo.user.name} (${userInfo.user.email})` : 'Chưa đăng nhập'}
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={testCategories}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Categories
        </button>
        <button
          onClick={testBrands}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Brands
        </button>
        <button
          onClick={testProducts}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Products
        </button>
        <button
          onClick={testCart}
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test Cart
        </button>
      </div>

      {/* Cart Operations */}
      <div className="bg-yellow-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Giỏ hàng & Quản lý kho</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Chọn sản phẩm:</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Chọn sản phẩm...</option>
              {products.map((product: any) => (
                <option key={product._id} value={product._id}>
                  {product.name} (Stock: {product.stock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Số lượng:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={testProductAvailability}
            disabled={loading || !selectedProduct}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            Kiểm tra số lượng có sẵn
          </button>
          <button
            onClick={testAddToCart}
            disabled={loading || !selectedProduct}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Thêm vào giỏ hàng
          </button>
          <button
            onClick={testCleanup}
            disabled={loading}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Chạy Cleanup
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Categories ({categories.length})</h3>
          <div className="max-h-40 overflow-y-auto">
            {categories.map((category: any) => (
              <div key={category._id} className="p-2 border-b">
                <strong>{category.name}</strong> - {category.description}
              </div>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Brands ({brands.length})</h3>
          <div className="max-h-40 overflow-y-auto">
            {brands.map((brand: any) => (
              <div key={brand._id} className="p-2 border-b">
                <strong>{brand.name}</strong> - {brand.description}
              </div>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Products ({products.length})</h3>
          <div className="max-h-40 overflow-y-auto">
            {products.slice(0, 5).map((product: any) => (
              <div key={product._id} className="p-2 border-b">
                <strong>{product.name}</strong> - Stock: {product.stock} - ${product.price}
              </div>
            ))}
            {products.length > 5 && <div className="text-gray-500">... và {products.length - 5} sản phẩm khác</div>}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Cart</h3>
          {cart ? (
            <div>
              <p><strong>Total Items:</strong> {cart.totalItems}</p>
              <p><strong>Total Price:</strong> ${cart.totalPrice}</p>
              <div className="max-h-40 overflow-y-auto">
                {cart.items?.map((item: any) => (
                  <div key={item._id} className="p-2 border-b">
                    <strong>{item.product?.name}</strong> - Qty: {item.quantity} - ${item.price}
                    {item.product?.availableStock !== undefined && (
                      <span className="text-sm text-gray-500 ml-2">
                        (Available: {item.product.availableStock})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Chưa có giỏ hàng</p>
          )}
        </div>

        {/* Product Availability */}
        {productAvailability && (
          <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
            <h3 className="text-lg font-semibold mb-2">Thông tin số lượng có sẵn</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <strong>Product ID:</strong> {productAvailability.productId}
              </div>
              <div>
                <strong>Tổng kho:</strong> {productAvailability.totalStock}
              </div>
              <div>
                <strong>Đã đặt trước:</strong> {productAvailability.reservedQuantity}
              </div>
              <div>
                <strong>Có sẵn:</strong> {productAvailability.availableStock}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAPI; 