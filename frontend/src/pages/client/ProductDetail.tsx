import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaShare, FaTruck, FaShieldAlt, FaClock, FaCheck, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import ProductCard from '../../components/client/ProductCard';
import { useCart } from '../../contexts/CartContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Modal, Button, Input, Select, Badge, Tag, Popover } from 'antd';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  // Removed unused state variables
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [filterText, setFilterText] = useState('');
  const [filterSize, setFilterSize] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      setError('ID sản phẩm không hợp lệ');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('Fetching product with ID:', id);

    axios.get(`http://localhost:8000/api/product/${id}`)
      .then(response => {
        const data = response.data;
        console.log('Product data received:', data);
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Không tìm thấy sản phẩm');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null' || !product) {
      return;
    }

    const fetchRelated = async () => {
      try {
        let url = `http://localhost:8000/api/product/${id}/related`;
        const res = await axios.get(url);
        let data = Array.isArray(res.data) ? res.data : (res.data.products || []);
        const price = product.salePrice || product.price;
        const minPrice = price * 0.8;
        const maxPrice = price * 1.2;
        data = data.filter((p: any) =>
          p._id !== product._id &&
          ((typeof p.category === 'object' ? p.category._id : p.category) === (typeof product.category === 'object' ? product.category._id : product.category)) &&
          (p.price >= minPrice && p.price <= maxPrice)
        );
        setRelatedProducts(data.slice(0, 8));
      } catch (err) {
        setRelatedProducts([]);
      }
    };
    fetchRelated();
  }, [id, product]);

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

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      toast.error('Vui lòng chọn loại sản phẩm!');
      setShowVariantModal(true);
      return;
    }
    try {
      await addToCart(product._id, quantity);
      toast.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 999)) {
      setQuantity(newQuantity);
    }
  };

  const openVariantModal = () => {
    setShowVariantModal(true);
    setSelectedVariantId(undefined);
  };

  const closeVariantModal = () => {
    setShowVariantModal(false);
  };

  const handleVariantSelect = () => {
    if (!selectedVariantId) {
      toast.error("Vui lòng chọn một loại sản phẩm!");
      return;
    }
    const validVariant = product.variants?.find((v: any) => v._id === selectedVariantId);
    if (!validVariant) {
      toast.error("Loại sản phẩm không hợp lệ hoặc không tồn tại!");
      return;
    }
    if (validVariant.stock <= 0) {
      toast.error("Loại sản phẩm đã hết hàng!");
      return;
    }
    closeVariantModal();
  };

  type Variant = {
    _id: string;
    name?: string;
    size?: string;
    price: number;
    salePrice?: number;
    stock: number;
    sku?: string;
    weight?: number;
    isActive?: boolean;
    images?: string[];
    specifications?: Record<string, any>;
  };

  const sizeList = Array.from(new Set((product?.variants || []).map((v: Variant) => v.size).filter(Boolean)));

  const filteredVariants = (product?.variants || []).filter((variant: any) => {
    const matchText = filterText ? (variant.name || '').toLowerCase().includes(filterText.toLowerCase()) : true;
    const matchSize = filterSize ? variant.size === filterSize : true;
    return matchText && matchSize;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Quay lại
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
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

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 w-full bg-white rounded-2xl shadow-lg p-6 mb-8 lg:mb-0 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm liên quan</h2>
            {relatedProducts && relatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {relatedProducts.slice(0, 3).map((relatedProduct) => {
                  const mappedProduct = {
                    _id: relatedProduct._id || relatedProduct.id,
                    name: relatedProduct.name,
                    price: relatedProduct.salePrice || relatedProduct.price,
                    originalPrice: relatedProduct.salePrice ? relatedProduct.price : undefined,
                    image: relatedProduct.images && relatedProduct.images.length > 0 ? relatedProduct.images[0] : '',
                    brand: typeof relatedProduct.brand === 'object' ? relatedProduct.brand?.name : relatedProduct.brand,
                    rating: relatedProduct.averageRating || 0,
                    reviewCount: relatedProduct.numReviews || 0,
                    discount: relatedProduct.salePrice ? Math.round(100 - (relatedProduct.salePrice / relatedProduct.price) * 100) : undefined,
                    isNew: relatedProduct.isFeatured || false,
                    isHot: relatedProduct.isActive || false,
                    stock: relatedProduct.stock || 0,
                    variants: relatedProduct.variants || [],
                  };
                  return <ProductCard key={mappedProduct._id} product={mappedProduct} />;
                })}
              </div>
            ) : (
              <div className="text-gray-500">Không có sản phẩm liên quan.</div>
            )}
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col items-center md:max-w-xs w-full mx-auto">
                <div className="relative w-full flex justify-center">
                  <img
                    src={product.images && product.images[selectedImage]}
                    alt={product.name}
                    className="w-full max-w-md h-[420px] object-contain rounded-2xl border bg-gray-50"
                    style={{ background: '#f5f5f5' }}
                  />
                  {product.salePrice && product.salePrice < product.price && (
                    <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-1 rounded-full text-base font-bold shadow-lg">
                      -{Math.round(100 - (product.salePrice / product.price) * 100)}%
                    </span>
                  )}
                  {product.isNew && (
                    <span className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                      MỚI
                    </span>
                  )}
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 mt-4 justify-center">
                    {product.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`rounded-lg border-2 p-1 transition-all duration-200 ${selectedImage === index
                          ? 'border-blue-500 scale-110 bg-white'
                          : 'border-gray-200 hover:border-gray-400 bg-white'} w-20 h-20 flex items-center justify-center`}
                        style={{ boxShadow: selectedImage === index ? '0 2px 8px #b3c6ff' : undefined }}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-16 h-16 object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-6 justify-start">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {typeof product.brand === 'object' ? product.brand.name : product.brand}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={`w-5 h-5 ${index < Math.floor(product.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({product.reviewCount || 0} đánh giá)</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    {selectedVariantId && product.variants?.find((v: Variant) => v._id === selectedVariantId)?.salePrice && product.variants?.find((v: Variant) => v._id === selectedVariantId)?.salePrice < product.variants?.find((v: Variant) => v._id === selectedVariantId)?.price ? (
                      <>
                        <span className="text-3xl font-bold text-red-600">
                          {formatPrice(product.variants.find((v: Variant) => v._id === selectedVariantId)?.salePrice || 0)}
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                          {formatPrice(product.variants.find((v: Variant) => v._id === selectedVariantId)?.price || 0)}
                        </span>
                      </>
                    ) : selectedVariantId ? (
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(product.variants.find((v: Variant) => v._id === selectedVariantId)?.price || 0)}
                      </span>
                    ) : product.salePrice && product.salePrice < product.price ? (
                      <>
                        <span className="text-3xl font-bold text-red-600">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  {(selectedVariantId && product.variants?.find((v: Variant) => v._id === selectedVariantId)?.salePrice && product.variants?.find((v: Variant) => v._id === selectedVariantId)?.salePrice < product.variants?.find((v: Variant) => v._id === selectedVariantId)?.price) ? (
                    <span className="text-green-600 font-semibold">
                      Tiết kiệm {formatPrice(product.variants.find((v: Variant) => v._id === selectedVariantId)?.price - product.variants.find((v: Variant) => v._id === selectedVariantId)?.salePrice || 0)}
                    </span>
                  ) : (product.salePrice && product.salePrice < product.price) ? (
                    <span className="text-green-600 font-semibold">
                      Tiết kiệm {formatPrice(product.price - product.salePrice)}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${(selectedVariantId ? product.variants.find((v: Variant) => v._id === selectedVariantId)?.stock : product.stock) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className={`font-medium ${(selectedVariantId ? product.variants.find((v: Variant) => v._id === selectedVariantId)?.stock : product.stock) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(selectedVariantId ? product.variants.find((v: Variant) => v._id === selectedVariantId)?.stock : product.stock) > 0 ? `Còn ${(selectedVariantId ? product.variants.find((v: Variant) => v._id === selectedVariantId)?.stock : product.stock)} sản phẩm` : 'Hết hàng'}
                  </span>
                </div>
                {product?.variants && product.variants.length > 0 && (
                  <div className="mt-4 flex gap-3">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base shadow-lg"
                      onClick={openVariantModal}
                      type="button"
                    >
                      Chọn loại sản phẩm
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Số lượng:</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <span className="w-16 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= ((selectedVariantId ? product.variants.find((v: Variant) => v._id === selectedVariantId)?.stock : product.stock) || 999)}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0 || (product.variants && product.variants.length > 0 && !selectedVariantId)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FaShoppingCart className="w-5 h-5" />
                    <span>{product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}</span>
                  </button>
                  <div className="flex gap-2">
                    <button className="flex-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <FaHeart className="w-5 h-5 text-gray-600" />
                      <span className="hidden md:inline">Yêu thích</span>
                    </button>
                    <button className="flex-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                      <FaShare className="w-5 h-5 text-gray-600" />
                      <span className="hidden md:inline">Chia sẻ</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 mt-4">
                  <div className="flex items-center space-x-3">
                    <FaTruck className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Miễn phí vận chuyển</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaShieldAlt className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Bảo hành chính hãng</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaClock className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Giao hàng nhanh</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCheck className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Đổi trả dễ dàng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow p-6">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Mô tả' },
                { id: 'specifications', label: 'Thông số kỹ thuật' },
                { id: 'reviews', label: 'Đánh giá' },
                { id: 'questions', label: 'Hỏi đáp' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="py-4">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                </p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="space-y-4">
                {(selectedVariantId && product.variants?.find((v: Variant) => v._id === selectedVariantId)?.specifications) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.variants.find((v: Variant) => v._id === selectedVariantId)?.specifications || {}).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : selectedVariantId ? (
                  <p className="text-gray-500">Biến thể này chưa có thông số kỹ thuật.</p>
                ) : product.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa có thông số kỹ thuật.</p>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Tính năng đánh giá sẽ được phát triển sau.</p>
              </div>
            )}
            {activeTab === 'questions' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Tính năng hỏi đáp sẽ được phát triển sau.</p>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const mappedProduct = {
                  _id: relatedProduct._id || relatedProduct.id,
                  name: relatedProduct.name,
                  price: relatedProduct.salePrice || relatedProduct.price,
                  originalPrice: relatedProduct.salePrice ? relatedProduct.price : undefined,
                  image: relatedProduct.images && relatedProduct.images.length > 0 ? relatedProduct.images[0] : '',
                  brand: typeof relatedProduct.brand === 'object' ? relatedProduct.brand?.name : relatedProduct.brand,
                  rating: relatedProduct.averageRating || 0,
                  reviewCount: relatedProduct.numReviews || 0,
                  discount: relatedProduct.salePrice ? Math.round(100 - (relatedProduct.salePrice / relatedProduct.price) * 100) : undefined,
                  isNew: relatedProduct.isFeatured || false,
                  isHot: relatedProduct.isActive || false,
                  stock: relatedProduct.stock || 0,
                  variants: relatedProduct.variants || [],
                };
                return <ProductCard key={mappedProduct._id} product={mappedProduct} />;
              })}
            </div>
          </div>
        )}
      </div>

      <Modal
        open={showVariantModal}
        onCancel={closeVariantModal}
        footer={null}
        title={`Chọn loại sản phẩm cho ${product.name}`}
        styles={{ body: { maxHeight: 480, overflowY: 'auto', padding: 0 } }}
        style={{ top: 40, right: 0, marginLeft: 'auto', marginRight: 0, width: 480, minWidth: 380 }}
      >
        <div style={{ display: 'flex', gap: 8, padding: 16, paddingBottom: 0 }}>
          <Input
            placeholder="Tìm theo tên loại sản phẩm..."
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            style={{ width: 180 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo kích thước"
            value={filterSize}
            onChange={setFilterSize}
            allowClear
            style={{ width: 120 }}
            options={sizeList.map(size => ({ label: size, value: size }))}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, paddingTop: 8 }}>
          {filteredVariants.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>Không có loại sản phẩm phù hợp.</div>}
          {filteredVariants.map((variant: Variant) => (
            <Popover
              key={variant._id}
              content={(
                <div style={{ minWidth: 300 }}>
                  <div className="font-semibold mb-1 text-base">{variant.name || `${variant.size || ''}`}</div>
                  <div className="mb-2">
                    <img
                      src={variant.images && variant.images[0] ? variant.images[0] : '/placeholder.svg'}
                      alt="variant-large"
                      style={{ width: 120, height: 120, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee', marginBottom: 8 }}
                    />
                  </div>
                  <div className="mb-1">Giá: <span className="text-red-600 font-semibold">{formatPrice(variant.salePrice && variant.salePrice < variant.price ? variant.salePrice : variant.price)}</span></div>
                  <div className="mb-1">Tồn kho: <span className="font-semibold">{variant.stock}</span></div>
                  <div className="mb-1">SKU: <span className="font-mono">{variant.sku || 'N/A'}</span></div>
                  <div className="mb-1">Kích thước: <span>{variant.size || 'N/A'}</span></div>
                  <div className="mb-1">Cân nặng: <span>{variant.weight ? `${variant.weight}g` : 'N/A'}</span></div>
                  <div className="mb-1">Trạng thái: <span className={variant.isActive ? 'text-green-600' : 'text-red-600'}>{variant.isActive ? 'Hoạt động' : 'Ẩn'}</span></div>
                  {variant.images && variant.images.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {variant.images.map((img: string, idx: number) => (
                        <img key={idx} src={img} alt="variant-img" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover', border: '1px solid #eee' }} />
                      ))}
                    </div>
                  )}
                  {variant.specifications && Object.keys(variant.specifications).length > 0 && (
                    <div className="mt-2">
                      <div className="font-medium mb-1">Thông số loại sản phẩm:</div>
                      <table className="w-full text-xs">
                        <tbody>
                          {Object.entries(variant.specifications).map(([key, value]: [string, any]) => (
                            <tr key={key}>
                              <td className="pr-2 text-gray-600">{key}</td>
                              <td className="text-gray-800">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) as React.ReactNode}
              placement="right"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: 14,
                  background: variant.stock === 0 ? '#f8d7da' : variant.stock <= 5 ? '#fffbe6' : '#fff',
                  boxShadow: '0 2px 8px #f0f1f2',
                  marginBottom: 4,
                  position: 'relative',
                  transition: 'box-shadow 0.2s',
                  cursor: variant.stock > 0 ? 'pointer' : 'not-allowed',
                }}
                className={variant.stock > 0 ? 'hover:shadow-lg transition-shadow' : ''}
                onClick={() => variant.stock > 0 && setSelectedVariantId(variant._id)}
              >
                <Badge.Ribbon
                  text={variant.stock === 0 ? 'Hết hàng' : variant.stock <= 5 ? 'Sắp hết hàng' : ''}
                  color={variant.stock === 0 ? 'red' : 'orange'}
                  style={{ display: variant.stock > 5 ? 'none' : undefined }}
                >
                  <img
                    src={variant.images && variant.images[0] ? variant.images[0] : '/placeholder.svg'}
                    alt="variant"
                    style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }}
                  />
                </Badge.Ribbon>
                <div style={{ flex: 1 }}>
                  <div className="font-semibold text-base mb-1">{variant.name || `${variant.size || ''}`}</div>
                  <div className="mb-1">
                    {variant.salePrice && variant.salePrice < variant.price ? (
                      <>
                        <span className="text-red-600 font-semibold">{formatPrice(variant.salePrice)}</span>
                        <span className="text-gray-400 line-through ml-2">{formatPrice(variant.price)}</span>
                      </>
                    ) : (
                      <span>{formatPrice(variant.price)}</span>
                    )}
                  </div>
                  <div className="text-gray-600 text-sm mb-1">Tồn kho: {variant.stock}</div>
                  {variant.size && (
                    <Tag color="blue" style={{ marginLeft: 0 }}>{variant.size}</Tag>
                  )}
                </div>
                <Button
                  type="primary"
                  disabled={variant.stock <= 0}
                  onClick={() => variant.stock > 0 && setSelectedVariantId(variant._id)}
                  style={{ minWidth: 120, fontWeight: 600 }}
                >
                  Chọn
                </Button>
              </div>
            </Popover>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <Button
            type="primary"
            disabled={!selectedVariantId}
            onClick={handleVariantSelect}
            style={{ minWidth: 120 }}
          >
            Xác nhận
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;