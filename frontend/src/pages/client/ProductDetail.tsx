import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaHeart, FaShare, FaTruck, FaShieldAlt, FaClock, FaCheck, FaMinus, FaPlus, FaShoppingCart, FaEye } from 'react-icons/fa';
import ProductCard from '../../components/client/ProductCard';
import { useCart } from '../../contexts/CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/product/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        // Ưu tiên chọn màu/size đầu tiên nếu có
        let colorList = [];
        if (Array.isArray(data.variants)) {
          colorList = data.variants.map((v: any) => v.color).filter((c: any) => !!c);
        }
        if (colorList.length > 0) setSelectedColor(colorList[0]);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Fetch sản phẩm liên quan (nếu có API, nếu không thì bỏ qua)
  useEffect(() => {
    if (!id) return;
    fetch(`/api/product/${id}/related`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setRelatedProducts(data);
        else if (Array.isArray(data?.products)) setRelatedProducts(data.products);
        else setRelatedProducts([]);
      })
      .catch(() => setRelatedProducts([]));
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product || !product.originalPrice || !product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      brand: typeof product.brand === 'object' ? product.brand.name : product.brand,
      color: selectedColor,
      size: selectedSize,
    });
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải sản phẩm...</div>;
  if (error || !product) return <div className="text-center py-20 text-red-500">{error || 'Không tìm thấy sản phẩm'}</div>;

  const colorList = Array.isArray(product?.variants) && product.variants.length > 0
    ? product.variants.map((v: any) => v.color).filter((c: any) => !!c)
    : (Array.isArray(product?.colors)
        ? product.colors.map((c: any) => typeof c === 'string' ? c : (c?.color || ''))
        : []);

  // Tạo mapping từ mã màu sang tên màu (nếu có)
  const colorNameMap: Record<string, string> = (Array.isArray(product?.variants) && product.variants.length > 0)
    ? product.variants.reduce((acc: any, v: any) => {
        if (v.color) acc[v.color] = v.name || v.colorName || v.color;
        return acc;
      }, {})
    : {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="text-gray-700 hover:text-blue-600">Trang chủ</a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <a href="#" className="text-gray-700 hover:text-blue-600">
                    {typeof product.category === 'object' ? product.category.name : product.category}
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="w-full h-96 flex items-center justify-center bg-white">
                <img
                  src={product.images && product.images[selectedImage]}
                  alt={product.name}
                  className="w-4/5 h-4/5 object-contain mx-auto my-auto"
                />
              </div>
              {/* Product Labels */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    MỚI
                  </span>
                )}
                <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{calculateDiscount()}%
                </span>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {(product.images || []).map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                    selectedImage === index
                      ? 'border-blue-500 scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-4/5 h-4/5 object-contain mx-auto my-auto"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {typeof product.brand === 'object' ? product.brand.name : product.brand}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`w-5 h-5 ${
                      index < Math.floor(product.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">{product.rating}</span>
              </div>
              <span className="text-gray-500">({product.reviewCount} đánh giá)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-red-600">
                {product.salePrice ? formatPrice(product.salePrice) : formatPrice(product.price)}
              </span>
              {product.salePrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              {product.salePrice && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                  Tiết kiệm {formatPrice(product.price - product.salePrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <FaCheck className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">
                Còn {product.stock} sản phẩm trong kho
              </span>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Màu sắc</h3>
              <div className="flex space-x-3 items-center">
                {colorList.length > 0 ? (
                  <>
                    {colorList.map((color: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                          selectedColor === color
                            ? 'border-blue-500 scale-110'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    <span className="ml-4 text-base font-semibold text-blue-700 min-w-[80px]">
                      {selectedColor ? `Đã chọn: ${colorNameMap[selectedColor] || selectedColor}` : ''}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500 italic">Không có</span>
                )}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dung lượng</h3>
              <div className="flex space-x-3">
                {(product.sizes && product.sizes.length > 0) ? (
                  product.sizes.map((size: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                        selectedSize === size
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <span className="text-gray-500 italic">Không có</span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Số lượng</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <FaMinus className="w-3 h-3" />
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <FaPlus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FaShoppingCart className="w-5 h-5" />
                <span>Thêm vào giỏ hàng</span>
              </button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 text-red-500'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FaHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
                <FaShare className="w-5 h-5" />
              </button>
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tính năng nổi bật</h3>
              <ul className="space-y-2">
                {(product.features || []).map((feature: string, index: number) => (
                  <li key={index} className="flex items-center space-x-2">
                    <FaCheck className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipping Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FaTruck className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">Miễn phí vận chuyển</h4>
                  <p className="text-blue-700 text-sm">Giao hàng trong 2-3 ngày làm việc</p>
                </div>
              </div>
            </div>

            {/* Warranty Info */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FaShieldAlt className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">Bảo hành chính hãng</h4>
                  <p className="text-green-700 text-sm">Bảo hành 12 tháng toàn quốc</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Mô tả' },
                { id: 'specifications', label: 'Thông số kỹ thuật' },
                { id: 'reviews', label: 'Đánh giá' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h2 className="text-2xl font-bold text-blue-800 tracking-wide">Bảng thông số kỹ thuật</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-base font-medium text-gray-800">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-100 to-purple-100">
                        <th className="py-4 px-6 text-left font-semibold text-blue-900 w-56 text-lg">Thông số</th>
                        <th className="py-4 px-6 text-center font-semibold text-blue-900 text-lg">{product.name || ''}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Thương hiệu */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Thương hiệu</td>
                        <td className="py-3 px-6 text-center">{typeof product.brand === 'object' ? product.brand?.name : product.brand || ''}</td>
                      </tr>
                      {/* Màn hình */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Màn hình</td>
                        <td className="py-3 px-6 text-center">{product.specifications?.screen || ''}</td>
                      </tr>
                      {/* Chip xử lý */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Chip xử lý</td>
                        <td className="py-3 px-6 text-center">{product.specifications?.processor || ''}</td>
                      </tr>
                      {/* RAM */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">RAM</td>
                        <td className="py-3 px-6 text-center">{product.specifications?.ram || ''}</td>
                      </tr>
                      {/* Bộ nhớ */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Bộ nhớ</td>
                        <td className="py-3 px-6 text-center">{product.specifications?.storage || ''}</td>
                      </tr>
                      {/* Pin */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Pin</td>
                        <td className="py-3 px-6 text-center">{product.specifications?.battery || ''}</td>
                      </tr>
                      {/* Camera */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Camera</td>
                        <td className="py-3 px-6 text-center">{product.specifications?.camera || ''}</td>
                      </tr>
                      {/* Hệ điều hành */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Hệ điều hành</td>
                        <td className="py-3 px-6 text-center">{product.specifications?.os || ''}</td>
                      </tr>
                      {/* Trọng lượng */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Trọng lượng</td>
                        <td className="py-3 px-6 text-center">{product.specifications?.weight || ''}</td>
                      </tr>
                      {/* Kích thước */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Kích thước</td>
                        <td className="py-3 px-6 text-center">{product.specifications?.dimensions || ''}</td>
                      </tr>
                      {/* Tính năng */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Tính năng</td>
                        <td className="py-3 px-6 text-center">{product.features && product.features.length > 0 ? product.features.join(', ') : ''}</td>
                      </tr>
                      {/* Ưu điểm */}
                      <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Ưu điểm</td>
                        <td className="py-3 px-6 text-center text-green-700">{product.pros && product.pros.length > 0 ? product.pros.join(', ') : ''}</td>
                      </tr>
                      {/* Nhược điểm */}
                      <tr className="hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-6 bg-gray-50 font-medium text-gray-700">Nhược điểm</td>
                        <td className="py-3 px-6 text-center text-red-600">{product.cons && product.cons.length > 0 ? product.cons.join(', ') : ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Đánh giá từ khách hàng ({product.reviewCount})
                  </h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Viết đánh giá
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(product.reviews || []).map((review: any) => (
                    <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {review.user.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.user}</h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, index) => (
                                <FaStar
                                  key={index}
                                  className={`w-4 h-4 ${
                                    index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(relatedProducts) && relatedProducts.map((product: any) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 