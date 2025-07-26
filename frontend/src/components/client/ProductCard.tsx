import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart,
  FaShoppingCart,
  FaEye,
  FaStar,
  FaBalanceScale,
} from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [filterText, setFilterText] = useState('');
  const [filterSize, setFilterSize] = useState<string | undefined>(undefined);

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
  };

  const closeVariantModal = () => {
    setShowVariantModal(false);
  };

  const handleVariantSelect = async () => {
    if (!selectedVariantId) {
      toast.error("Vui lòng chọn một loại sản phẩm!");
      return;
    }
    const validVariant = product.variants?.find(v => v._id === selectedVariantId);
    if (!validVariant) {
      toast.error("Loại sản phẩm không hợp lệ hoặc không tồn tại!");
      return;
    }
    if (validVariant.stock <= 0) {
      toast.error("Loại sản phẩm đã hết hàng!");
      return;
    }
    setIsLoading(true);
    try {
      await addToCart(product._id, 1, selectedVariantId); // Gửi productId và variantId riêng biệt
      toast.success("Đã thêm vào giỏ hàng!");
      closeVariantModal();
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product.variants && product.variants.length > 0) {
      openVariantModal();
      return;
    }
    setIsLoading(true);
    try {
      await addToCart(product._id, 1);
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng!");
    } finally {
      setIsLoading(false);
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
    console.log("Add to compare:", product.name);
    toast.success("Tính năng so sánh sẽ được phát triển sau");
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

  const bestPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map((v: any) => v.salePrice && v.salePrice > 0 && v.salePrice < v.price ? v.salePrice : v.price))
    : product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image || (product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg')}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </Link>

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
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={isLoading || isOutOfStock}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1 ${
                isOutOfStock
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
                  : product.variants && product.variants.length > 0
                  ? "Chọn loại"
                  : "Thêm vào giỏ"}
              </span>
            </button>
            <button
              onClick={handleAddFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite
                  ? "text-red-500 bg-red-100 hover:bg-red-200"
                  : "text-gray-600 bg-white hover:bg-red-500 hover:text-white"
              }`}
            >
              <FaHeart className="w-4 h-4" />
            </button>
            <Link
              to={`/product/${product._id}`}
              className="p-2 bg-white text-gray-600 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
            >
              <FaEye className="w-4 h-4" />
            </Link>
            <button
              onClick={handleCompare}
              className="p-2 bg-white text-gray-600 hover:bg-green-500 hover:text-white rounded-lg transition-colors"
            >
              <FaBalanceScale className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="text-sm text-blue-600 font-medium mb-1">
  {product.brand && typeof product.brand === "object"
    ? product.brand.name
    : product.brand || "Không rõ thương hiệu"}
</div>

        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center space-x-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating || product.averageRating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.reviewCount || product.numReviews || 0})</span>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(bestPrice)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="mb-3">{getStockStatus()}</div>

        <div className="space-y-1 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Miễn phí vận chuyển
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
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            isOutOfStock
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <FaShoppingCart className="w-4 h-4" />
          <span>
            {isLoading
              ? "Đang thêm..."
              : isOutOfStock
              ? "Hết hàng"
              : product.variants && product.variants.length > 0
              ? "Chọn loại sản phẩm"
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
          {filteredVariants.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>Không có loại sản phẩm phù hợp.</div>}
          {filteredVariants.map((variant: any) => (
            <Popover
              key={variant._id}
              content={(
                <div style={{ minWidth: 300 }}>
                  <div className="font-semibold mb-1 text-base">{variant.name || `${variant.size || ''}`}</div>
                  <div className="mb-2">
                    <img
                      src={variant.images && variant.images[0] ? variant.images[0] : '/placeholder-image.jpg'}
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
                    src={variant.images && variant.images[0] ? variant.images[0] : '/placeholder-image.jpg'}
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
            disabled={!selectedVariantId || isLoading}
            onClick={handleVariantSelect}
            loading={isLoading}
            style={{ minWidth: 120 }}
          >
            Xác nhận
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductCard; 