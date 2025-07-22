import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaHeart, FaShare, FaTruck, FaShieldAlt, FaClock, FaCheck, FaMinus, FaPlus, FaShoppingCart, FaEye } from 'react-icons/fa';
import ProductCard from '../../components/client/ProductCard';
import { useCart } from '../../contexts/CartContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Modal } from 'antd'; // Added Modal import

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [categories, setCategories] = useState([
    { _id: '1', name: 'Laptop', slug: 'laptop' },
    { _id: '2', name: 'Điện thoại', slug: 'dien-thoai' },
    { _id: '3', name: 'Tablet', slug: 'tablet' },
    { _id: '4', name: 'Phụ kiện', slug: 'phu-kien' },
    { _id: '5', name: 'Âm thanh', slug: 'am-thanh' },
    { _id: '6', name: 'Đồng hồ', slug: 'dong-ho' },
  ]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState([0, 50000000]);
  const [filterInStock, setFilterInStock] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false); // Added state for variant modal
  const [showVariantConfirmModal, setShowVariantConfirmModal] = useState(false);
  const [confirmedVariantId, setConfirmedVariantId] = useState<string | undefined>(undefined);

  // Xác định danh mục hiện tại (đặt lên trên trước khi dùng ở useEffect)
  const currentCategorySlug = typeof product?.category === 'object' ? product.category?.slug : product?.category || '';

  useEffect(() => {
    // Check if ID is valid
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

        // Ưu tiên chọn màu/size đầu tiên nếu có
        if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
          const firstVariant = data.variants[0];
          if (firstVariant.color) setSelectedColor(firstVariant.color);
          if (firstVariant.size) setSelectedSize(firstVariant.size);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Không tìm thấy sản phẩm');
        setLoading(false);
      });
  }, [id]);

  // Fetch sản phẩm liên quan
  useEffect(() => {
    // Check if ID is valid
    if (!id || id === 'undefined' || id === 'null' || !product) {
      return;
    }

    const fetchRelated = async () => {
      try {
        // Ưu tiên API nếu có hỗ trợ filter
        let url = `http://localhost:8000/api/product/${id}/related`;
        // Nếu API không hỗ trợ, fallback lấy tất cả sản phẩm cùng danh mục
        const res = await axios.get(url);
        let data = Array.isArray(res.data) ? res.data : (res.data.products || []);
        // Lọc cùng danh mục, cùng tầm giá (±20%), loại trừ sản phẩm hiện tại
        const price = product.salePrice || product.price;
        const minPrice = price * 0.8;
        const maxPrice = price * 1.2;
        data = data.filter((p: any) =>
          p._id !== product._id &&
          ((typeof p.category === 'object' ? p.category._id : p.category) === (typeof product.category === 'object' ? product.category._id : product.category)) &&
          (p.price >= minPrice && p.price <= maxPrice)
        );
        // Giới hạn tối đa 8 sản phẩm liên quan
        setRelatedProducts(data.slice(0, 8));
      } catch (err) {
        setRelatedProducts([]);
      }
    };
    fetchRelated();
  }, [id, product]);

  // Fetch categories & brands từ API thực
  useEffect(() => {
    axios.get('http://localhost:8000/api/category')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
    axios.get('http://localhost:8000/api/brand')
      .then(res => setBrands(res.data))
      .catch(() => setBrands([]));
  }, []);

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

  // Xác định các thuộc tính động từ dữ liệu variant
  const variantAttributes = React.useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    // Lấy tất cả key khác _id, isActive, images, price, salePrice, stock, specifications, createdAt, updatedAt
    const exclude = ['_id', 'isActive', 'images', 'price', 'salePrice', 'stock', 'specifications', 'createdAt', 'updatedAt'];
    const keys = Object.keys(product.variants[0]).filter(k => !exclude.includes(k));
    return keys;
  }, [product]);

  const [selectedAttrs, setSelectedAttrs] = useState<{ [key: string]: string }>({});
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);

  // Lọc các lựa chọn hợp lệ cho từng thuộc tính dựa trên các lựa chọn trước đó (mô hình cha-con)
  const getValidOptions = (attr: string) => {
    if (!product?.variants) return [];
    // Lấy các variant thỏa mãn các lựa chọn trước attr
    const attrIndex = variantAttributes.indexOf(attr);
    const prevAttrs = variantAttributes.slice(0, attrIndex);
    let filtered = product.variants;
    for (const key of prevAttrs) {
      if (selectedAttrs[key]) {
        filtered = filtered.filter(v => v[key] === selectedAttrs[key]);
      }
    }
    return Array.from(new Set(filtered.map(v => v[attr]).filter(Boolean)));
  };

  // Khi chọn thuộc tính, cập nhật selectedAttrs và reset các thuộc tính con phía sau
  const handleAttrChange = (attr: string, value: string) => {
    const attrIndex = variantAttributes.indexOf(attr);
    const newSelected = { ...selectedAttrs };
    newSelected[attr] = value;
    // Reset các thuộc tính con phía sau
    for (let i = attrIndex + 1; i < variantAttributes.length; i++) {
      delete newSelected[variantAttributes[i]];
    }
    setSelectedAttrs(newSelected);
  };

  // Khi đã chọn đủ thuộc tính, xác định variantId hợp lệ
  useEffect(() => {
    if (!product?.variants) return;
    if (variantAttributes.every(attr => selectedAttrs[attr])) {
      const found = product.variants.find(v => variantAttributes.every(attr => v[attr] === selectedAttrs[attr]));
      setSelectedVariantId(found?._id);
    } else {
      setSelectedVariantId(undefined);
    }
  }, [selectedAttrs, product, variantAttributes]);

  // Khi bấm thêm vào giỏ hàng, truyền variantId nếu có
  const handleAddToCart = () => {
    if (!product) return;
    if (variantAttributes.length > 0 && !selectedVariantId) {
      toast.error('Vui lòng chọn đầy đủ các thuộc tính biến thể!');
      return;
    }
    try {
      addToCart(product._id, quantity, selectedVariantId);
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

  // Hàm fetch sản phẩm theo filter
  const fetchFilteredProducts = async () => {
    let url = 'http://localhost:8000/api/product?';
    if (filterCategory) url += `category=${filterCategory}&`;
    if (filterBrand) url += `brand=${filterBrand}&`;
    if (filterPriceRange[0]) url += `minPrice=${filterPriceRange[0]}&`;
    if (filterPriceRange[1]) url += `maxPrice=${filterPriceRange[1]}&`;
    if (filterInStock) url += 'inStock=true&';
    url += 'pageSize=2';
    try {
      const res = await axios.get(url);
      setFilteredProducts(res.data.products || []);
    } catch {
      setFilteredProducts([]);
    }
  };

  // Khi chọn danh mục hoặc thương hiệu thì fetch sản phẩm
  useEffect(() => {
    if (selectedBrand || currentCategorySlug) {
      fetchFilteredProducts();
    } else {
      setFilteredProducts([]);
    }
  }, [selectedBrand, currentCategorySlug]);

  // Thêm hàm lấy variant đã chọn
  const selectedVariant = React.useMemo(() => {
    if (!confirmedVariantId || !product?.variants) return null;
    return product.variants.find((v: any) => v._id === confirmedVariantId) || null;
  }, [confirmedVariantId, product]);

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

  const colorList = Array.isArray(product?.variants) && product.variants.length > 0
    ? product.variants.map((v: any) => v.color).filter((c: any) => !!c)
    : (Array.isArray(product?.colors)
      ? product.colors.map((c: any) => typeof c === 'string' ? c : (c?.color || ''))
      : []);

  const sizeList = Array.isArray(product?.variants) && product.variants.length > 0
    ? product.variants.map((v: any) => v.size).filter((s: any) => !!s)
    : (Array.isArray(product?.sizes) ? product.sizes : []);

  // Tạo mapping từ mã màu sang tên màu (nếu có)
  const colorNameMap: Record<string, string> = (Array.isArray(product?.variants) && product.variants.length > 0)
    ? product.variants.reduce((acc: any, v: any) => {
      if (v.color) acc[v.color] = v.name || v.colorName || v.color;
      return acc;
    }, {})
    : {};

  // Thêm logic lấy kích thước/cân nặng từ biến thể đầu tiên nếu ngoài cùng là 0/null
  const mainVariant = product.variants && product.variants.length > 0 ? product.variants[0] : {};
  const length = product.dimensions?.length || mainVariant.length || 0;
  const width = product.dimensions?.width || mainVariant.width || 0;
  const height = product.dimensions?.height || mainVariant.height || 0;
  const weight = product.weight || mainVariant.weight || 0;

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

        {/* Main Section with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar: Sản phẩm liên quan cùng danh mục, cùng tầm giá */}
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

          {/* Main Product Section */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-6">
              {/* Left: Image Gallery (nhỏ lại) */}
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
              {/* Right: Product Info (sát bên ảnh) */}
              <div className="flex flex-col gap-6 justify-start">
                {/* Brand */}
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {typeof product.brand === 'object' ? product.brand.name : product.brand}
                  </span>
                </div>
                {/* Name */}
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                {/* Rating */}
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
                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    {selectedVariant && selectedVariant.salePrice && selectedVariant.salePrice < selectedVariant.price ? (
                      <>
                        <span className="text-3xl font-bold text-red-600">
                          {formatPrice(selectedVariant.salePrice)}
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                          {formatPrice(selectedVariant.price)}
                        </span>
                      </>
                    ) : selectedVariant ? (
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(selectedVariant.price)}
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
                  {(selectedVariant && selectedVariant.salePrice && selectedVariant.salePrice < selectedVariant.price) ? (
                    <span className="text-green-600 font-semibold">
                      Tiết kiệm {formatPrice(selectedVariant.price - selectedVariant.salePrice)}
                    </span>
                  ) : (product.salePrice && product.salePrice < product.price) ? (
                    <span className="text-green-600 font-semibold">
                      Tiết kiệm {formatPrice(product.price - product.salePrice)}
                    </span>
                  ) : null}
                </div>
                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${(selectedVariant ? selectedVariant.stock : product.stock) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className={`font-medium ${(selectedVariant ? selectedVariant.stock : product.stock) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(selectedVariant ? selectedVariant.stock : product.stock) > 0 ? `Còn ${(selectedVariant ? selectedVariant.stock : product.stock)} sản phẩm` : 'Hết hàng'}
                  </span>
                </div>
                {/* Danh sách chọn loại sản phẩm tuần tự */}
                {product?.variants && product.variants.length > 0 && variantAttributes.length > 0 && (
                  <div className="mt-4 flex gap-3">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base shadow-lg"
                      onClick={() => setShowVariantModal(true)}
                      type="button"
                    >
                      Chọn loại sản phẩm
                    </button>
                    {confirmedVariantId && (
                      <button
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold text-base shadow-lg"
                        onClick={() => setShowVariantConfirmModal(true)}
                        type="button"
                      >
                        Xem thông tin biến thể
                      </button>
                    )}
                  </div>
                )}
                {/* Quantity */}
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
                      disabled={quantity >= ((selectedVariant ? selectedVariant.stock : product.stock) || 999)}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    onClick={() => {
                      if (confirmedVariantId || variantAttributes.length === 0) {
                        // Đã xác nhận biến thể hoặc không có biến thể
                        addToCart(product._id, quantity, confirmedVariantId);
                      } else {
                        // Chưa chọn biến thể, mở modal
                        setShowVariantModal(true);
                      }
                    }}
                    disabled={product.stock <= 0}
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
                {/* Info: Shipping, Warranty, Return */}
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

        {/* Tabs Section */}
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
                {(selectedVariant && selectedVariant.specifications) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedVariant.specifications).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : selectedVariant ? (
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

        {/* Related Products */}
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
      {/* Modal xác nhận biến thể đã chọn đã bị loại bỏ */}
      {/* Modal chọn loại sản phẩm */}
      <Modal
        open={showVariantModal}
        onCancel={() => setShowVariantModal(false)}
        footer={null}
        title={`Chọn loại sản phẩm cho ${product.name}`}
        bodyStyle={{ maxHeight: 480, overflowY: 'auto', padding: 0 }}
        style={{ top: 40, right: 0, marginLeft: 'auto', marginRight: 0, width: 480, minWidth: 380 }}
        modalRender={undefined}
      >
        <div className="mb-2 text-sm text-gray-500">Vui lòng chọn lần lượt các thuộc tính để xác định loại sản phẩm</div>
        {variantAttributes.map((attr, idx) => (
          <div key={attr} className="mb-3">
            <div className="font-medium text-gray-700 mb-1 capitalize">{attr}:</div>
            <div className="flex flex-wrap gap-2">
              {getValidOptions(attr).map((option: string) => {
                let isDisabled = false;
                if (idx < variantAttributes.length - 1) {
                  const tempSelected = { ...selectedAttrs, [attr]: option };
                  const nextAttr = variantAttributes[idx + 1];
                  const nextOptions = product.variants.filter(v =>
                    variantAttributes.slice(0, idx + 1).every(a => tempSelected[a] ? v[a] === tempSelected[a] : true)
                  ).map(v => v[nextAttr]).filter(Boolean);
                  if (nextOptions.length === 0) isDisabled = true;
                }
                return (
                  <button
                    key={option}
                    type="button"
                    className={`px-4 py-2 rounded-lg border font-medium transition-colors
                      ${selectedAttrs[attr] === option ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}
                      ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    disabled={isDisabled}
                    onClick={() => handleAttrChange(attr, option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {/* Hiển thị thông tin loại sản phẩm đã chọn nếu đủ thuộc tính */}
        {selectedVariantId && (
          <div className="flex justify-center mt-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-base"
              onClick={() => {
                setShowVariantModal(false);
                setConfirmedVariantId(selectedVariantId);
                setShowVariantConfirmModal(true);
              }}
            >
              Xác nhận
            </button>
          </div>
        )}
      </Modal>
      {/* Modal thông tin biến thể */}
      <Modal
        open={showVariantConfirmModal}
        onCancel={() => setShowVariantConfirmModal(false)}
        footer={null}
        title="Thông tin loại sản phẩm đã chọn"
        centered
        width={400}
      >
        {confirmedVariantId && (
          <div className="flex flex-col items-center justify-center">
            <img
              src={product.variants.find(v => v._id === confirmedVariantId)?.images?.[0] || '/placeholder-image.jpg'}
              alt="variant"
              className="w-32 h-32 object-contain rounded-xl border-2 shadow-lg mb-3 bg-white"
              style={{ background: '#f5f5f5' }}
            />
            <div className="font-semibold text-lg mb-1 text-center">{product.variants.find(v => v._id === confirmedVariantId)?.name || 'Loại sản phẩm đã chọn'}</div>
            <div className="mb-1 text-center">Giá: <span className="text-red-600 font-semibold">{formatPrice(product.variants.find(v => v._id === confirmedVariantId)?.salePrice || product.variants.find(v => v._id === confirmedVariantId)?.price)}</span></div>
            <div className="mb-1 text-center">Số lượng còn lại: <span className="font-semibold">{product.variants.find(v => v._id === confirmedVariantId)?.stock}</span></div>
            <button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-base"
              onClick={() => setShowVariantConfirmModal(false)}
            >
              Đóng
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductDetail; 