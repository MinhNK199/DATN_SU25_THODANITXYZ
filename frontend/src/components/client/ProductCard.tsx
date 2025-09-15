import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaShoppingCart,
  FaEye,
  FaStar,
  FaBalanceScale,
  FaCheck,
} from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import { useCompare } from "../../contexts/CompareContext";
import cartApi from "../../services/cartApi";
import { toast } from "react-hot-toast";
import wishlistApi from "../../services/wishlistApi";
import { Modal, Button, Popover, Input, Select, Tag, Badge } from 'antd';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    originalPrice?: number;
    image?: string;
    images?: string[];
    brand:
    | {
      _id?: string;
      name: string;
    }
    | string
    | null;
    category?: {
      _id?: string;
      name: string;
    } | string | null;
    rating?: number;
    reviewCount?: number;
    averageRating?: number;
    numReviews?: number;
    discount?: number;
    isNew?: boolean;
    isHot?: boolean;
    stock: number;
    variants?: Array<{
      _id?: string;
      name?: string;
      price: number;
      salePrice?: number;
      stock: number;
      images?: string[];
      sku?: string;
      size?: string | number;
      weight?: number;
      isActive?: boolean;
      specifications?: Record<string, string>;
    }>;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableStock, setAvailableStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const { addToCart } = useCart();
  const { addToCompare, isInCompare, canAddToCompare } = useCompare();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: number}>({});
  const [filterText, setFilterText] = useState('');
  const [filterSize, setFilterSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setStockLoading(true);
        const availability = await cartApi.getProductAvailability(product._id);
        setAvailableStock(availability.availableStock);
      } catch (error) {
        console.error("Error fetching product availability:", error);
        setAvailableStock(getTotalStock(product));
      } finally {
        setStockLoading(false);
      }
    };

    fetchAvailability();
  }, [product._id, product.stock]);

  const openVariantModal = () => {
    setShowVariantModal(true);
    setSelectedVariantId(undefined);
    setSelectedVariants({});
    setQuantity(1);
  };

  const closeVariantModal = () => {
    setShowVariantModal(false);
  };

  const handleVariantSelect = async () => {
    const selectedVariantIds = Object.keys(selectedVariants);
    if (selectedVariantIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một loại sản phẩm!");
      return;
    }

    setIsLoading(true);
    try {
      let totalAdded = 0;
      for (const variantId of selectedVariantIds) {
        const quantity = selectedVariants[variantId];
        const validVariant = product.variants?.find(v => v._id === variantId);
        if (!validVariant) {
          toast.error(`Loại sản phẩm ${variantId} không hợp lệ!`);
          continue;
        }
        if (validVariant.stock <= 0) {
          toast.error(`Loại sản phẩm ${validVariant.name || variantId} đã hết hàng!`);
          continue;
        }
        if (quantity > validVariant.stock) {
          toast.error(`Loại sản phẩm ${validVariant.name || variantId} chỉ còn ${validVariant.stock} sản phẩm trong kho!`);
          continue;
        }

        await addToCart(product._id, quantity, variantId);
        totalAdded += quantity;
      }
      
      if (totalAdded > 0) {
        toast.success(`Đã thêm ${totalAdded} sản phẩm vào giỏ hàng!`);
        closeVariantModal();
      }
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantToggle = (variantId: string, variant: any) => {
    if (variant.stock <= 0) return;
    
    setSelectedVariants(prev => {
      const newSelected = { ...prev };
      if (newSelected[variantId]) {
        delete newSelected[variantId];
      } else {
        newSelected[variantId] = 1;
      }
      return newSelected;
    });
  };

  const handleVariantQuantityChange = (variantId: string, newQuantity: number) => {
    const variant = product.variants?.find(v => v._id === variantId);
    if (!variant) return;
    
    const maxStock = variant.stock;
    const validQuantity = Math.min(Math.max(1, newQuantity), maxStock);
    
    setSelectedVariants(prev => ({
      ...prev,
      [variantId]: validQuantity
    }));
  };

  const getTotalPrice = () => {
    return Object.entries(selectedVariants).reduce((total, [variantId, quantity]) => {
      const variant = product.variants?.find(v => v._id === variantId);
      if (!variant) return total;
      const price = variant.salePrice && variant.salePrice > 0 ? variant.salePrice : variant.price;
      return total + (price * quantity);
    }, 0);
  };

  const getTotalQuantity = () => {
    return Object.values(selectedVariants).reduce((total, quantity) => total + quantity, 0);
  };

  const handleProductClick = () => {
    if (product.name.toLowerCase().includes('iphone 15')) {
      navigate(`/products?search=iPhone 15&brand=Apple`);
    } else {
      navigate(`/product/${product._id}`);
    }
  };

  const handleAddToCart = async () => {
    // Nếu có variants, hiển thị modal chọn variant
    if (product.variants && product.variants.length > 0) {
      openVariantModal();
    } else {
      // Nếu không có variants, thêm trực tiếp vào giỏ hàng
      setIsLoading(true);
      try {
        await addToCart(product._id, 1);
        toast.success("Đã thêm vào giỏ hàng!");
      } catch (error: any) {
        console.error("Error adding to cart:", error);
        toast.error(error.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng!");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sizeList = Array.from(new Set((product.variants || []).map((v: any) => v.size).filter(Boolean)));

  const filteredVariants = (product.variants || []).filter((variant: any) => {
    const matchText = filterText ? (variant.name || '').toLowerCase().includes(filterText.toLowerCase()) : true;
    const matchSize = filterSize ? variant.size === filterSize : true;
    return matchText && matchSize;
  });

  useEffect(() => {
    setSelectedVariantId(undefined); // Reset khi filter thay đổi
  }, [filterText, filterSize]);

  useEffect(() => {
    const checkIsFavorite = async () => {
      try {
        const res = await wishlistApi.getFavorites();
        const isFav = res.data.favorites.some(
          (item: any) => item._id === product._id
        );
        setIsFavorite(isFav);
      } catch (err) {
        console.error("Lỗi khi kiểm tra yêu thích", err);
      }
    };
    checkIsFavorite();
  }, [product._id]);

  const handleAddFavorite = async () => {
    try {
      if (isFavorite) {
        await wishlistApi.removeFromWishlist(product._id);
        setIsFavorite(false);
        toast.success("Đã xóa khỏi yêu thích");
      } else {
        await wishlistApi.addToWishlist(product._id);
        setIsFavorite(true);
        toast.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      console.error("Lỗi xử lý yêu thích:", error);
      toast.error("Có lỗi xảy ra khi xử lý yêu thích");
    }
  };

  const handleCompare = () => {
    if (isInCompare(product._id)) {
      toast.error("Sản phẩm này đã có trong danh sách so sánh");
      return;
    }
    
    if (!canAddToCompare) {
      toast.error("Bạn chỉ có thể so sánh tối đa 4 sản phẩm");
      return;
    }

    // Convert ProductCard format to Product interface format
    const productForCompare = {
      _id: product._id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      salePrice: product.salePrice,
      images: product.images || (product.image ? [product.image] : []),
      additionalImages: product.additionalImages || [],
      thumbnails: product.thumbnails || [],
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      variants: product.variants || [],
      specifications: product.specifications || {},
      features: product.features || [],
      averageRating: product.averageRating || product.rating || 0,
      numReviews: product.numReviews || product.reviewCount || 0,
      isActive: product.isActive !== undefined ? product.isActive : true,
      isFeatured: product.isFeatured || product.isNew || false,
      tags: product.tags || [],
      sku: product.sku,
      weight: product.weight,
      dimensions: product.dimensions,
      warranty: product.warranty,
      meta: product.meta,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    addToCompare(productForCompare);
    toast.success("Đã thêm vào danh sách so sánh");
  };

  const getTotalStock = (product: any) => {
    let total = product.stock || 0;
    if (product.variants && product.variants.length > 0) {
      for (const v of product.variants) {
        total += v.stock || 0;
      }
    }
    return total;
  };

  const getStockStatus = () => {
    if (stockLoading) {
      return <span className="text-gray-500 text-sm">Đang kiểm tra...</span>;
    }
    if (availableStock === null) {
      return <span className="text-gray-500 text-sm">Còn hàng</span>;
    }
    if (availableStock === 0) {
      return <span className="text-red-500 text-sm font-medium">Hết hàng</span>;
    }
    if (availableStock <= 5) {
      return (
        <span className="text-orange-500 text-sm font-medium">Chỉ còn ít</span>
      );
    }
    return <span className="text-green-500 text-sm">Còn hàng</span>;
  };

  const isOutOfStock = availableStock === 0;

  // Logic mới: Giá hiện tại trong DB là giá sale, cần tính giá gốc
  const getDisplayPrices = () => {
    if (product.variants && product.variants.length > 0) {
      // Nếu có variants, lấy variant có giá thấp nhất
      const minVariant = product.variants.reduce((min, current) => {
        const currentPrice = current.salePrice && current.salePrice > 0 ? current.salePrice : current.price;
        const minPrice = min.salePrice && min.salePrice > 0 ? min.salePrice : min.price;
        return currentPrice < minPrice ? current : min;
      });
      
      const salePrice = minVariant.salePrice && minVariant.salePrice > 0 ? minVariant.salePrice : minVariant.price;
      const originalPrice = minVariant.salePrice && minVariant.salePrice > 0 ? minVariant.price : null;
      
      return { salePrice, originalPrice };
    } else {
      // Nếu không có variants, sử dụng giá sản phẩm chính
      const salePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      const originalPrice = product.salePrice && product.salePrice > 0 ? product.price : null;
      
      return { salePrice, originalPrice };
    }
  };

  const { salePrice, originalPrice } = getDisplayPrices();

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 p-3">
      <div className="relative overflow-hidden">
        <div 
          onClick={handleProductClick}
          className="cursor-pointer"
        >
          <img
            src={product.image || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg')}
            alt={product.name}
            className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300 bg-gray-50"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>

        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Mới
            </span>
          )}
          {product.isHot && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Hot
            </span>
          )}
          {product.discount && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>



        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={isLoading || isOutOfStock}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${isOutOfStock
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              <FaShoppingCart className="w-3 h-3" />
              <span>
                {isLoading
                  ? "Đang thêm..."
                  : isOutOfStock
                    ? "Hết hàng"
                      : "Thêm vào giỏ hàng"}
              </span>
            </button>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleAddFavorite}
                className={`w-8 h-8 rounded-md transition-colors flex items-center justify-center ${isFavorite
                  ? "text-red-500 bg-red-100 hover:bg-red-200"
                  : "text-gray-600 bg-white hover:bg-red-500 hover:text-white"
                  }`}
              >
                <FaHeart className="w-4 h-4" />
              </button>
              <Link
                to={`/product/${product._id}`}
                className="w-8 h-8 bg-white text-gray-600 hover:bg-blue-500 hover:text-white rounded-md transition-colors flex items-center justify-center"
              >
                <FaEye className="w-4 h-4" />
              </Link>
              <button
                onClick={handleCompare}
                disabled={!canAddToCompare && !isInCompare(product._id)}
                className={`w-8 h-8 rounded-md transition-colors flex items-center justify-center ${
                  isInCompare(product._id)
                    ? "text-green-500 bg-green-100 hover:bg-green-200"
                    : canAddToCompare
                    ? "text-gray-600 bg-white hover:bg-green-500 hover:text-white"
                    : "text-gray-400 bg-gray-100 cursor-not-allowed"
                }`}
                title={
                  isInCompare(product._id)
                    ? "Đã có trong danh sách so sánh"
                    : canAddToCompare
                    ? "Thêm vào so sánh"
                    : "Đã đạt giới hạn so sánh (4 sản phẩm)"
                }
              >
                <FaBalanceScale className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-0">
        <div className="text-sm text-blue-600 font-medium mb-1">
          {product.category && typeof product.category === "object"
            ? product.category.name
            : product.category || "Không rõ danh mục"}
        </div>

        <h3 
          onClick={handleProductClick}
          className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
        >
          {product.name}
        </h3>

        <div className="flex items-center space-x-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.averageRating || product.rating || 0)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
                  }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({product.numReviews || product.reviewCount || 0} đánh giá)
          </span>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          {originalPrice ? (
            // Có giá sale: hiển thị giá gốc (gạch ngang, nhỏ, mờ) và giá sale (to, đậm, đỏ)
            <>
              <span className="text-2xl font-bold text-red-600">
                {formatPrice(salePrice)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            </>
          ) : (
            // Không có giá sale: hiển thị giá gốc như hiện tại
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(salePrice)}
            </span>
          )}
        </div>

        <div className="mb-3">{getStockStatus()}</div>

        <div className="space-y-1 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Miễn phí vận chuyển cho đơn hàng từ 10Tr đồng
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Bảo hành chính hãng
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Giao hàng nhanh
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${isOutOfStock
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          <FaShoppingCart className="w-4 h-4 flex-shrink-0" />
          <span>
            {isLoading
              ? "Đang thêm..."
              : isOutOfStock
                ? "Hết hàng"
                : "Thêm vào giỏ hàng"}
          </span>
        </button>
      </div>

      <Modal
        open={showVariantModal}
        onCancel={closeVariantModal}
        footer={null}
        title={`Chọn loại sản phẩm cho ${product.name}`}
        styles={{ body: { maxHeight: 480, overflowY: 'auto', padding: 0 } }}
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
          {filteredVariants.length > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '8px'
            }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  border: Object.keys(selectedVariants).length === filteredVariants.filter(v => v.stock > 0).length ? '2px solid #3b82f6' : '2px solid #d1d5db',
                  borderRadius: '4px',
                  background: Object.keys(selectedVariants).length === filteredVariants.filter(v => v.stock > 0).length ? '#3b82f6' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => {
                  const availableVariants = filteredVariants.filter(v => v.stock > 0);
                  const allSelected = Object.keys(selectedVariants).length === availableVariants.length;
                  
                  if (allSelected) {
                    // Bỏ chọn tất cả
                    setSelectedVariants({});
                  } else {
                    // Chọn tất cả
                    const newSelected: {[key: string]: number} = {};
                    availableVariants.forEach(variant => {
                      newSelected[variant._id] = 1;
                    });
                    setSelectedVariants(newSelected);
                  }
                }}
              >
                {Object.keys(selectedVariants).length === filteredVariants.filter(v => v.stock > 0).length && (
                  <FaCheck 
                    style={{ 
                      color: 'white', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }} 
                  />
                )}
              </div>
              <span style={{ fontWeight: '600', color: '#374151' }}>
                {Object.keys(selectedVariants).length === filteredVariants.filter(v => v.stock > 0).length 
                  ? 'Bỏ chọn tất cả' 
                  : 'Chọn tất cả'
                } ({filteredVariants.filter(v => v.stock > 0).length} sản phẩm có sẵn)
              </span>
            </div>
          )}
          {filteredVariants.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>Không có loại sản phẩm phù hợp.</div>}
          {filteredVariants.map((variant: any, index: number) => {
            const isSelected = selectedVariants[variant._id] > 0;
            const selectedQuantity = selectedVariants[variant._id] || 0;
            return (
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
                    <div className="mb-1">
                      {variant.salePrice && variant.salePrice > 0 ? (
                        <>
                          Giá: <span className="text-red-600 font-semibold">{formatPrice(variant.salePrice)}</span>
                          <span className="text-gray-400 line-through ml-2">{formatPrice(variant.price)}</span>
                        </>
                      ) : (
                        <>Giá: <span className="text-gray-900 font-semibold">{formatPrice(variant.price)}</span></>
                      )}
                    </div>
                    <div className="mb-1">Tồn kho: <span className="font-semibold">{variant.stock}</span></div>
                    <div className="mb-1">SKU: <span className="font-mono">{variant.sku || 'N/A'}</span></div>
                    <div className="mb-1">Size (inch): <span>{variant.size ? `${variant.size} inch` : 'N/A'}</span></div>
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
                            {Object.entries(variant.specifications).map(([key, value]) => (
                              <tr key={key}>
                                <td className="pr-2 text-gray-600">{key}</td>
                                <td className="text-gray-800">{String(value)}</td>
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
                    border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: 14,
                    background: isSelected 
                      ? '#eff6ff' 
                      : variant.stock === 0 
                        ? '#f8d7da' 
                        : variant.stock <= 5 
                          ? '#fffbe6' 
                          : '#fff',
                    boxShadow: isSelected 
                      ? '0 4px 12px rgba(59, 130, 246, 0.15)' 
                      : '0 2px 8px #f0f1f2',
                    marginBottom: 4,
                    position: 'relative',
                    transition: 'all 0.2s',
                    cursor: variant.stock > 0 ? 'pointer' : 'not-allowed',
                  }}
                  className={variant.stock > 0 ? 'hover:shadow-lg transition-all' : ''}
                  onClick={() => variant.stock > 0 && handleVariantToggle(variant._id, variant)}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                  )}
                  {/* Checkbox */}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: isSelected ? '2px solid #3b82f6' : '2px solid #d1d5db',
                      borderRadius: '4px',
                      background: isSelected ? '#3b82f6' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: variant.stock > 0 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (variant.stock > 0) {
                        handleVariantToggle(variant._id, variant);
                      }
                    }}
                  >
                    {isSelected && (
                      <FaCheck 
                        style={{ 
                          color: 'white', 
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }} 
                      />
                    )}
                  </div>

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
                      {variant.salePrice && variant.salePrice > 0 ? (
                        <>
                          <span className="text-red-600 font-semibold">{formatPrice(variant.salePrice)}</span>
                          <span className="text-gray-400 line-through ml-2">{formatPrice(variant.price)}</span>
                        </>
                      ) : (
                        <span className="text-gray-900 font-semibold">{formatPrice(variant.price)}</span>
                      )}
                    </div>
                    <div className="text-gray-600 text-sm mb-1">Tồn kho: {variant.stock}</div>
                    {variant.size && (
                      <Tag color="blue" style={{ marginLeft: 0 }}>{variant.size} inch</Tag>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Quantity controls */}
                    {isSelected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Button
                          size="small"
                          disabled={selectedQuantity <= 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVariantQuantityChange(variant._id, selectedQuantity - 1);
                          }}
                          style={{ minWidth: '24px', height: '24px', padding: '0' }}
                        >
                          -
                        </Button>
                        <Input
                          value={selectedQuantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            handleVariantQuantityChange(variant._id, value);
                          }}
                          style={{ width: '50px', textAlign: 'center', height: '24px' }}
                          min={1}
                          max={variant.stock}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="small"
                          disabled={selectedQuantity >= variant.stock}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVariantQuantityChange(variant._id, selectedQuantity + 1);
                          }}
                          style={{ minWidth: '24px', height: '24px', padding: '0' }}
                        >
                          +
                        </Button>
                      </div>
                    )}

                    {/* Action button */}
                    <Button
                      type={isSelected ? "primary" : "default"}
                      disabled={variant.stock <= 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (variant.stock > 0 && variant._id) {
                          handleVariantToggle(variant._id, variant);
                        }
                      }}
                      style={{ minWidth: 80, fontWeight: 600 }}
                    >
                      {isSelected ? 'Bỏ chọn' : 'Chọn'}
                    </Button>
                  </div>
                </div>
              </Popover>
            );
          })}
        </div>
        {Object.keys(selectedVariants).length > 0 && (
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Sản phẩm đã chọn ({Object.keys(selectedVariants).length} loại):
              </div>
              {Object.entries(selectedVariants).map(([variantId, quantity]) => {
                const variant = product.variants?.find(v => v._id === variantId);
                if (!variant) return null;
                const price = variant.salePrice && variant.salePrice > 0 ? variant.salePrice : variant.price;
                return (
                  <div key={variantId} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'white',
                    borderRadius: '6px',
                    marginBottom: '4px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <span style={{ fontWeight: '500' }}>{variant.name || `${variant.size || ''}`}</span>
                      <span style={{ color: '#6b7280', marginLeft: '8px' }}>x{quantity}</span>
                    </div>
                    <div style={{ fontWeight: '600', color: '#374151' }}>
                      {formatPrice(price * quantity)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                Tổng số lượng: {getTotalQuantity()} sản phẩm
              </span>
              <span style={{ fontWeight: '700', color: '#1f2937', fontSize: '16px' }}>
                Tổng tiền: {formatPrice(getTotalPrice())}
              </span>
            </div>
          </div>
        )}
        <div className="flex justify-center mt-6">
          <Button
            type="primary"
            disabled={Object.keys(selectedVariants).length === 0 || isLoading}
            onClick={handleVariantSelect}
            loading={isLoading}
            style={{ minWidth: 120 }}
          >
            {Object.keys(selectedVariants).length > 0 
              ? `Thêm ${getTotalQuantity()} sản phẩm vào giỏ` 
              : 'Chọn sản phẩm trước'
            }
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductCard; 