import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const TestProductAPI = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/product');
      setProducts(response.data);
      toast.success(`Lấy được ${response.data.length} sản phẩm`);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Lỗi khi lấy danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetail = async (productId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/product/${productId}`);
      setSelectedProduct(response.data);
      toast.success('Lấy thông tin sản phẩm thành công');
    } catch (error) {
      console.error('Error fetching product detail:', error);
      toast.error('Lỗi khi lấy thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (productId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/product/${productId}/related`);
      toast.success(`Lấy được ${response.data.length} sản phẩm liên quan`);
      console.log('Related products:', response.data);
    } catch (error) {
      console.error('Error fetching related products:', error);
      toast.error('Lỗi khi lấy sản phẩm liên quan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Test Product API</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Lấy danh sách sản phẩm
        </button>
        
        <button
          onClick={() => {
            if (products.length > 0) {
              fetchProductDetail(products[0]._id);
            } else {
              toast.error('Vui lòng lấy danh sách sản phẩm trước');
            }
          }}
          disabled={loading || products.length === 0}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Product Detail
        </button>
        
        <button
          onClick={() => {
            if (products.length > 0) {
              fetchRelatedProducts(products[0]._id);
            } else {
              toast.error('Vui lòng lấy danh sách sản phẩm trước');
            }
          }}
          disabled={loading || products.length === 0}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Related Products
        </button>
      </div>

      {/* Products List */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm ({products.length})</h2>
        <div className="max-h-60 overflow-y-auto">
          {products.map((product: any) => (
            <div key={product._id} className="p-2 border-b hover:bg-gray-50 cursor-pointer" onClick={() => fetchProductDetail(product._id)}>
              <div className="flex items-center space-x-4">
                <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    Brand: {typeof product.brand === 'object' ? product.brand.name : product.brand}
                  </div>
                  <div className="text-sm text-gray-500">Stock: {product.stock}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${product.price}</div>
                  <div className="text-xs text-gray-500">ID: {product._id}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Product Detail */}
      {selectedProduct && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Chi tiết sản phẩm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img src={selectedProduct.images?.[0]} alt={selectedProduct.name} className="w-full h-64 object-cover rounded" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{selectedProduct.name}</h3>
              <p className="text-gray-600 mb-2">{selectedProduct.description}</p>
              <div className="space-y-2">
                <div><strong>Brand:</strong> {typeof selectedProduct.brand === 'object' ? selectedProduct.brand.name : selectedProduct.brand}</div>
                <div><strong>Price:</strong> ${selectedProduct.price}</div>
                <div><strong>Stock:</strong> {selectedProduct.stock}</div>
                <div><strong>Category:</strong> {typeof selectedProduct.category === 'object' ? selectedProduct.category.name : selectedProduct.category}</div>
                <div><strong>Images:</strong> {selectedProduct.images?.length || 0} ảnh</div>
                <div><strong>Variants:</strong> {selectedProduct.variants?.length || 0} biến thể</div>
              </div>
            </div>
          </div>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(selectedProduct, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestProductAPI; 