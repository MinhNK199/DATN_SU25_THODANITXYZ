import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaHeart,
  FaShare,
  FaTruck,
  FaShieldAlt,
  FaClock,
  FaCheck,
  FaMinus,
  FaPlus,
  FaShoppingCart,
} from "react-icons/fa";
import ProductCard from "../../components/client/ProductCard";
import { useCart } from "../../contexts/CartContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Modal, Button, Input, Select, Badge, Tag, Popover } from "antd";
import { ImageIcon, Star } from "lucide-react";

interface Rating {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  images: string[];
  reply: string;
  createdAt: string;
}
const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [quantity, setQuantity] = useState(1);
  // State cho số lượng của từng biến thể
  const [variantQuantities, setVariantQuantities] = useState<
    Record<string, number>
  >({});
  // Removed unused state variables
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(undefined);
  const [filterText, setFilterText] = useState("");
  const [filterSize, setFilterSize] = useState<string | undefined>(undefined);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [filter, setFilter] = useState({
    sort: "newest",
    hasImage: false,
    star: 0,
  });

  useEffect(() => {
    if (!id || id === "undefined" || id === "null") {
      setError("ID sản phẩm không hợp lệ");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log("Fetching product with ID:", id);

    axios
      .get(`http://localhost:8000/api/product/${id}`)
      .then((response) => {
        const data = response.data;
        console.log("Product data received:", data);
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setError(err.response?.data?.message || "Không tìm thấy sản phẩm");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id || id === "undefined" || id === "null" || !product) {
      return;
    }

    const fetchRelated = async () => {
      try {
        let url = `http://localhost:8000/api/product/${id}/related`;
        const res = await axios.get(url);
        let data = Array.isArray(res.data) ? res.data : res.data.products || [];
        const price = product.salePrice || product.price;
        const minPrice = price * 0.8;
        const maxPrice = price * 1.2;
        data = data.filter(
          (p: any) =>
            p._id !== product._id &&
            (typeof p.category === "object" ? p.category._id : p.category) ===
              (typeof product.category === "object"
                ? product.category._id
                : product.category) &&
            p.price >= minPrice &&
            p.price <= maxPrice
        );
        setRelatedProducts(data.slice(0, 8));
      } catch (err) {
        setRelatedProducts([]);
      }
    };
    fetchRelated();
  }, [id, product]);

  useEffect(() => {
    if (!id) return;
    const fetchRatings = async () => {
      const params: any = { productId: id, sort: filter.sort };
      if (filter.hasImage) params.hasImage = true;
      if (filter.star > 0) params.star = filter.star;
      const res = await axios.get("/api/rating", { params });
      setRatings(res.data.data);
    };
    fetchRatings();
  }, [id, filter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscount = () => {
    if (!product || !product.originalPrice || !product.price) return 0;
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    );
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      toast.error("Vui lòng chọn loại sản phẩm!");
      setShowVariantModal(true);
      return;
    }
    try {
      // Nếu có biến thể, sử dụng số lượng của biến thể đó
      const finalQuantity = selectedVariantId
        ? getVariantQuantity(selectedVariantId)
        : quantity;
      await addToCart(product._id, finalQuantity, selectedVariantId);
      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng");
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 999)) {
      setQuantity(newQuantity);
    }
  };

  // Hàm xử lý số lượng cho biến thể
  const handleVariantQuantityChange = (
    variantId: string,
    newQuantity: number
  ) => {
    const variant = product?.variants?.find(
      (v: Variant) => v._id === variantId
    );
    if (variant && newQuantity >= 1 && newQuantity <= variant.stock) {
      setVariantQuantities((prev) => ({
        ...prev,
        [variantId]: newQuantity,
      }));
    }
  };

  // Hàm lấy số lượng của biến thể
  const getVariantQuantity = (variantId: string) => {
    return variantQuantities[variantId] || 1;
  };

  // Hàm tính tổng giá của biến thể theo số lượng
  const getVariantTotalPrice = (variant: Variant, quantity: number) => {
    const price =
      variant.salePrice && variant.salePrice < variant.price
        ? variant.salePrice
        : variant.price;
    return price * quantity;
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
    const validVariant = product.variants?.find(
      (v: any) => v._id === selectedVariantId
    );
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

  const sizeList = Array.from(
    new Set(
      (product?.variants || []).map((v: Variant) => v.size).filter(Boolean)
    )
  );

  const filteredVariants = (product?.variants || []).filter((variant: any) => {
    const matchText = filterText
      ? (variant.name || "").toLowerCase().includes(filterText.toLowerCase())
      : true;
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
          <p className="text-red-500 text-lg mb-4">
            {error || "Không tìm thấy sản phẩm"}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Quay lại
            </button>
            <button
              onClick={() => navigate("/")}
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
                <a href="/" className="text-gray-700 hover:text-blue-600">
                  Trang chủ
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <a href="#" className="text-gray-700 hover:text-blue-600">
                    {typeof product.category === "object"
                      ? product.category.name
                      : product.category}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Sản phẩm liên quan
            </h2>
            {relatedProducts && relatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {relatedProducts.slice(0, 3).map((relatedProduct) => {
                  const mappedProduct = {
                    _id: relatedProduct._id || relatedProduct.id,
                    name: relatedProduct.name,
                    price: relatedProduct.salePrice || relatedProduct.price,
                    originalPrice: relatedProduct.salePrice
                      ? relatedProduct.price
                      : undefined,
                    image:
                      relatedProduct.images && relatedProduct.images.length > 0
                        ? relatedProduct.images[0]
                        : "",
                    brand:
                      typeof relatedProduct.brand === "object"
                        ? relatedProduct.brand?.name
                        : relatedProduct.brand,
                    rating: relatedProduct.averageRating || 0,
                    reviewCount: relatedProduct.numReviews || 0,
                    discount: relatedProduct.salePrice
                      ? Math.round(
                          100 -
                            (relatedProduct.salePrice / relatedProduct.price) *
                              100
                        )
                      : undefined,
                    isNew: relatedProduct.isFeatured || false,
                    isHot: relatedProduct.isActive || false,
                    stock: relatedProduct.stock || 0,
                    variants: relatedProduct.variants || [],
                  };
                  return (
                    <ProductCard
                      key={mappedProduct._id}
                      product={mappedProduct}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500">Không có sản phẩm liên quan.</div>
            )}
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-6">
              {/* Product Images Section - Shopee Style */}
              <div className="flex flex-col space-y-4">
                {/* Main Image/Video with Navigation */}
                <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {(() => {
                    // Tạo danh sách ảnh bao gồm cả ảnh chính và ảnh biến thể
                    const allImages = [...(product.images || [])];
                    
                    // Thêm ảnh từ các biến thể
                    if (product.variants && product.variants.length > 0) {
                      product.variants.forEach((variant: any) => {
                        if (variant.images && variant.images.length > 0) {
                          variant.images.forEach((img: string) => {
                            if (!allImages.includes(img)) {
                              allImages.push(img);
                            }
                          });
                        }
                      });
                    }

                    return allImages.length > 1 && (
                      <>
                        {/* Left Navigation Arrow */}
                        <button
                          onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : allImages.length - 1)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center z-10 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {/* Right Navigation Arrow */}
                        <button
                          onClick={() => setSelectedImage(selectedImage < allImages.length - 1 ? selectedImage + 1 : 0)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center z-10 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    );
                  })()}

                  <div className="aspect-square flex items-center justify-center bg-gray-50">
                    {isVideoMode ? (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <div className="text-center text-white">
                          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <p className="text-lg font-medium">Video sản phẩm</p>
                          <p className="text-sm text-gray-300">Nhấn để xem video</p>
                        </div>
                      </div>
                    ) : (() => {
                      // Tạo danh sách ảnh bao gồm cả ảnh chính và ảnh biến thể
                      const allImages = [...(product.images || [])];
                      
                      // Thêm ảnh từ các biến thể
                      if (product.variants && product.variants.length > 0) {
                        product.variants.forEach((variant: any) => {
                          if (variant.images && variant.images.length > 0) {
                            variant.images.forEach((img: string) => {
                              if (!allImages.includes(img)) {
                                allImages.push(img);
                              }
                            });
                          }
                        });
                      }

                      return (
                        <img
                          src={allImages[selectedImage]}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      );
                    })()}
                  </div>
                  
                  {/* Discount Badge */}
                  {!isVideoMode && product.salePrice && product.salePrice < product.price && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      -{Math.round(100 - (product.salePrice / product.price) * 100)}%
                    </div>
                  )}
                  
                  {/* New Badge */}
                  {!isVideoMode && product.isNew && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                      MỚI
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery with Navigation */}
                {(() => {
                  // Tạo danh sách ảnh bao gồm cả ảnh chính và ảnh biến thể
                  const allImages = [...(product.images || [])];
                  
                  // Thêm ảnh từ các biến thể
                  if (product.variants && product.variants.length > 0) {
                    product.variants.forEach((variant: any) => {
                      if (variant.images && variant.images.length > 0) {
                        variant.images.forEach((img: string) => {
                          if (!allImages.includes(img)) {
                            allImages.push(img);
                          }
                        });
                      }
                    });
                  }

                  // Thêm ảnh phụ nếu có ít biến thể (tối đa 5 ảnh)
                  if (product.additionalImages && product.additionalImages.length > 0) {
                    const variantImageCount = product.variants?.reduce((count: number, variant: any) => {
                      return count + (variant.images?.length || 0);
                    }, 0) || 0;
                    
                    // Chỉ thêm ảnh phụ nếu tổng số ảnh biến thể < 5
                    if (variantImageCount < 5) {
                      const remainingSlots = 5 - variantImageCount;
                      const additionalImagesToShow = product.additionalImages.slice(0, remainingSlots);
                      additionalImagesToShow.forEach((img: string) => {
                        if (!allImages.includes(img)) {
                          allImages.push(img);
                        }
                      });
                    }
                  }

                  return allImages.length > 1 && (
                    <div className="relative">
                      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        {/* Video Thumbnail First */}
                        <button
                          onClick={() => setIsVideoMode(true)}
                          className={`flex-shrink-0 w-16 h-16 rounded border-2 transition-all duration-200 relative ${
                            isVideoMode
                              ? "border-red-500"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                            <div className="w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                          {/* Video Badge */}
                          <div className="absolute bottom-0 left-0 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded-tl rounded-br">
                            9.9
                          </div>
                        </button>
                        
                        {/* All Images (Product + Variants) */}
                        {allImages.map((image: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedImage(index);
                              setIsVideoMode(false);
                            }}
                            className={`flex-shrink-0 w-20 h-20 rounded border-2 transition-all duration-200 ${
                              selectedImage === index && !isVideoMode
                                ? "border-red-500"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover rounded"
                            />
                          </button>
                        ))}
                      </div>
                      
                      {/* Right Navigation Arrow for Thumbnails */}
                      <button className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-16 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-gray-800 flex items-center justify-center shadow-lg rounded-l transition-all duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  );
                })()}

              

              </div>
              <div className="flex flex-col gap-4 justify-start">
                {/* Brand Tag */}
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {typeof product.brand === "object"
                      ? product.brand.name
                      : product.brand}
                  </span>
                </div>

                {/* Product Title */}
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating and Reviews */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          className={`w-4 h-4 ${
                            index < Math.floor(product.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {product.rating || 0}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <span className="text-sm text-gray-600">
                    {product.reviewCount || 0} đánh giá
                  </span>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <span className="text-sm text-gray-600">
                    Đã bán {product.soldCount || 0}+
                  </span>
                </div>
                {/* Price Section */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {selectedVariantId &&
                    product.variants?.find(
                      (v: Variant) => v._id === selectedVariantId
                    )?.salePrice &&
                    product.variants?.find(
                      (v: Variant) => v._id === selectedVariantId
                    )?.salePrice <
                      product.variants?.find(
                        (v: Variant) => v._id === selectedVariantId
                      )?.price ? (
                      <>
                        <span className="text-2xl font-bold text-red-600">
                          {formatPrice(
                            product.variants.find(
                              (v: Variant) => v._id === selectedVariantId
                            )?.salePrice || 0
                          )}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(
                            product.variants.find(
                              (v: Variant) => v._id === selectedVariantId
                            )?.price || 0
                          )}
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                          -{Math.round(100 - ((product.variants.find((v: Variant) => v._id === selectedVariantId)?.salePrice || 0) / (product.variants.find((v: Variant) => v._id === selectedVariantId)?.price || 1)) * 100)}%
                        </span>
                      </>
                    ) : selectedVariantId ? (
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(
                          product.variants.find(
                            (v: Variant) => v._id === selectedVariantId
                          )?.price || 0
                        )}
                      </span>
                    ) : product.salePrice &&
                      product.salePrice < product.price ? (
                      <>
                        <span className="text-2xl font-bold text-red-600">
                          {formatPrice(product.salePrice)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                          -{Math.round(100 - (product.salePrice / product.price) * 100)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Voucher Section */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Voucher của shop</span>
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Giảm 50k
                      </button>
                    </div>
                  </div>

                  {/* Installment Section */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-blue-600">0% TRẢ GÓP</span>
                        <div className="text-xs text-gray-600 mt-1">
                          12 tháng x {formatPrice(Math.round((selectedVariantId ? 
                            (product.variants.find((v: Variant) => v._id === selectedVariantId)?.salePrice || 
                             product.variants.find((v: Variant) => v._id === selectedVariantId)?.price || 0) :
                            (product.salePrice || product.price)) / 12))} (Lãi suất 0%)
                        </div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Xem thêm &gt;
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Vận chuyển</span>
                      <div className="text-sm text-gray-600 mt-1">
                        Nhận từ 12 Th09 - 16 Th09
                      </div>
                      <div className="text-sm text-gray-600">
                        Phí ship 0₫
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Xem thêm &gt;
                    </button>
                  </div>
                </div>

                {/* Shopee Guarantee */}
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">An tâm mua sắm cùng Shopee</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FaCheck className="text-green-500" />
                      <span>Trả hàng miễn phí 15 ngày</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaShieldAlt className="text-green-500" />
                      <span>Chính hãng 100%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaTruck className="text-green-500" />
                      <span>Miễn phí vận chuyển</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaClock className="text-green-500" />
                      <span>Giao hàng nhanh</span>
                    </div>
                  </div>
                </div>
                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      (selectedVariantId
                        ? product.variants.find(
                            (v: Variant) => v._id === selectedVariantId
                          )?.stock
                        : product.stock) > 0
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                  <span
                    className={`font-medium ${
                      (selectedVariantId
                        ? product.variants.find(
                            (v: Variant) => v._id === selectedVariantId
                          )?.stock
                        : product.stock) > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(selectedVariantId
                      ? product.variants.find(
                          (v: Variant) => v._id === selectedVariantId
                        )?.stock
                      : product.stock) > 0
                      ? `Còn ${
                          selectedVariantId
                            ? product.variants.find(
                                (v: Variant) => v._id === selectedVariantId
                              )?.stock
                            : product.stock
                        } sản phẩm`
                      : "Hết hàng"}
                  </span>
                </div>

                {/* Color Selection */}
                {product?.variants && product.variants.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Màu sắc</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant: any, index: number) => (
                          <button
                            key={variant._id || index}
                            onClick={() => setSelectedVariantId(variant._id)}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              selectedVariantId === variant._id
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}
                          >
                            {variant.color?.name || variant.name || `Màu ${index + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity Selection */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Số lượng</h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <FaMinus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 text-center border-0 focus:outline-none"
                          min="1"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <FaPlus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">
                        CÒN HÀNG
                      </span>
                    </div>
                  </div>
                </div>
                {product?.variants && product.variants.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {selectedVariantId ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 text-sm font-medium">
                              🎯 Đã chọn:{" "}
                              {product.variants.find(
                                (v: Variant) => v._id === selectedVariantId
                              )?.name || "N/A"}
                            </span>
                            <span className="text-green-700 text-xs">
                              Số lượng: {getVariantQuantity(selectedVariantId)}
                            </span>
                          </div>
                          <button
                            className="text-green-600 hover:text-green-800 text-sm underline"
                            onClick={openVariantModal}
                          >
                            Thay đổi
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base shadow-lg"
                        onClick={openVariantModal}
                        type="button"
                      >
                        Chọn loại sản phẩm
                      </button>
                    )}
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
                    <span className="w-16 text-center font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={
                        quantity >=
                        ((selectedVariantId
                          ? product.variants.find(
                              (v: Variant) => v._id === selectedVariantId
                            )?.stock
                          : product.stock) || 999)
                      }
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Hiển thị tổng giá theo số lượng */}
                  {selectedVariantId && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">
                          🎯 Tổng giá biến thể:
                        </div>
                        <div className="text-lg font-bold text-blue-900">
                          {formatPrice(
                            getVariantTotalPrice(
                              product.variants.find(
                                (v: Variant) => v._id === selectedVariantId
                              )!,
                              quantity
                            )
                          )}
                        </div>
                        <div className="text-xs text-blue-600">
                          {formatPrice(
                            product.variants.find(
                              (v: Variant) => v._id === selectedVariantId
                            )?.salePrice ||
                              product.variants.find(
                                (v: Variant) => v._id === selectedVariantId
                              )?.price ||
                              0
                          )}{" "}
                          × {quantity}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={
                        product.stock <= 0 ||
                        (product.variants &&
                          product.variants.length > 0 &&
                          !selectedVariantId)
                      }
                      className="flex-1 bg-red-500 border-2 border-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart className="w-4 h-4" />
                      <span>Thêm vào giỏ hàng</span>
                    </button>
                    <button className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                      Mua ngay
                    </button>
                  </div>
                  
                  {/* Social Sharing */}
                  <div className="flex items-center space-x-4 pt-2">
                    <span className="text-sm text-gray-600">Chia sẻ:</span>
                    <div className="flex space-x-2">
                      <button className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <span className="text-xs font-bold">f</span>
                      </button>
                      <button className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors">
                        <span className="text-xs font-bold">M</span>
                      </button>
                      <button className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                        <span className="text-xs font-bold">P</span>
                      </button>
                      <button className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                        <span className="text-xs font-bold">X</span>
                      </button>
                    </div>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors">
                      <FaHeart className="w-4 h-4" />
                      <span className="text-sm">Favorite</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 mt-4">
                  <div className="flex items-center space-x-3">
                    <FaTruck className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Miễn phí vận chuyển
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaShieldAlt className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Bảo hành chính hãng
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaClock className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Giao hàng nhanh
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCheck className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Đổi trả dễ dàng
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Đánh giá */}
        <div className="mt-10">
          <h2 className="relative inline-block text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Đánh giá sản phẩm
            <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></span>
          </h2>
          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={filter.sort}
              onChange={(e) =>
                setFilter((f) => ({ ...f, sort: e.target.value }))
              }
              className="border p-2 rounded"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
            <button
              onClick={() =>
                setFilter((f) => ({ ...f, hasImage: !f.hasImage }))
              }
              className={`flex items-center gap-1 border p-2 rounded ${
                filter.hasImage ? "bg-blue-500 text-white" : ""
              }`}
            >
              <ImageIcon size={16} /> Có ảnh
            </button>
            <select
              value={filter.star}
              onChange={(e) =>
                setFilter((f) => ({ ...f, star: Number(e.target.value) }))
              }
              className="border p-2 rounded"
            >
              <option value={0}>Tất cả sao</option>
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>
                  {s} sao
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            {ratings.length === 0 && <p>Chưa có đánh giá nào.</p>}
            {ratings.map((r) => (
              <div key={r._id} className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.userId?.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < r.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="mt-2">{r.comment}</p>
                {r.images?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {r.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="review"
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                {r.reply && (
                  <div className="mt-3 p-3 bg-gray-100 rounded">
                    <span className="font-semibold text-sm text-gray-600">
                      Phản hồi từ Admin:
                    </span>
                    <p className="text-sm">{r.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Mô tả */}
        <div className="mt-10">
          <h2 className="relative inline-block text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Mô tả sản phẩm
            <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></span>
          </h2>
          <div className="prose max-w-none">{product.description}</div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const mappedProduct = {
                  _id: relatedProduct._id || relatedProduct.id,
                  name: relatedProduct.name,
                  price: relatedProduct.salePrice || relatedProduct.price,
                  originalPrice: relatedProduct.salePrice
                    ? relatedProduct.price
                    : undefined,
                  image:
                    relatedProduct.images && relatedProduct.images.length > 0
                      ? relatedProduct.images[0]
                      : "",
                  brand:
                    typeof relatedProduct.brand === "object"
                      ? relatedProduct.brand?.name
                      : relatedProduct.brand,
                  rating: relatedProduct.averageRating || 0,
                  reviewCount: relatedProduct.numReviews || 0,
                  discount: relatedProduct.salePrice
                    ? Math.round(
                        100 -
                          (relatedProduct.salePrice / relatedProduct.price) *
                            100
                      )
                    : undefined,
                  isNew: relatedProduct.isFeatured || false,
                  isHot: relatedProduct.isActive || false,
                  stock: relatedProduct.stock || 0,
                  variants: relatedProduct.variants || [],
                };
                return (
                  <ProductCard
                    key={mappedProduct._id}
                    product={mappedProduct}
                  />
                );
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
        styles={{ body: { maxHeight: 480, overflowY: "auto", padding: 0 } }}
        style={{
          top: 40,
          right: 0,
          marginLeft: "auto",
          marginRight: 0,
          width: 480,
          minWidth: 380,
        }}
      >
        <div style={{ display: "flex", gap: 8, padding: 16, paddingBottom: 0 }}>
          <Input
            placeholder="Tìm theo tên loại sản phẩm..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ width: 180 }}
            allowClear
          />
          <Select
            placeholder="Lọc theo kích thước"
            value={filterSize}
            onChange={setFilterSize}
            allowClear
            style={{ width: 120 }}
            options={sizeList.map((size) => ({ label: size, value: size }))}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 16,
            paddingTop: 8,
          }}
        >
          {filteredVariants.length === 0 && (
            <div style={{ color: "#888", textAlign: "center", padding: 32 }}>
              Không có loại sản phẩm phù hợp.
            </div>
          )}
          {filteredVariants.map((variant: Variant) => (
            <Popover
              key={variant._id}
              content={
                (
                  <div style={{ minWidth: 300 }}>
                    <div className="font-semibold mb-1 text-base">
                      {variant.name || `${variant.size || ""}`}
                    </div>
                    <div className="mb-2">
                      <img
                        src={
                          variant.images && variant.images[0]
                            ? variant.images[0]
                            : "/placeholder.svg"
                        }
                        alt="variant-large"
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 8,
                          objectFit: "cover",
                          border: "1px solid #eee",
                          marginBottom: 8,
                        }}
                      />
                    </div>
                    <div className="mb-1">
                      Giá:{" "}
                      <span className="text-red-600 font-semibold">
                        {formatPrice(
                          variant.salePrice && variant.salePrice < variant.price
                            ? variant.salePrice
                            : variant.price
                        )}
                      </span>
                    </div>
                    <div className="mb-1">
                      Tồn kho:{" "}
                      <span className="font-semibold">{variant.stock}</span>
                    </div>
                    <div className="mb-1">
                      SKU:{" "}
                      <span className="font-mono">{variant.sku || "N/A"}</span>
                    </div>
                    <div className="mb-1">
                      Kích thước: <span>{variant.size || "N/A"}</span>
                    </div>
                    <div className="mb-1">
                      Cân nặng:{" "}
                      <span>
                        {variant.weight ? `${variant.weight}g` : "N/A"}
                      </span>
                    </div>
                    <div className="mb-1">
                      Trạng thái:{" "}
                      <span
                        className={
                          variant.isActive ? "text-green-600" : "text-red-600"
                        }
                      >
                        {variant.isActive ? "Hoạt động" : "Ẩn"}
                      </span>
                    </div>
                    {variant.images && variant.images.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {variant.images.map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt="variant-img"
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 4,
                              objectFit: "cover",
                              border: "1px solid #eee",
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {variant.specifications &&
                      Object.keys(variant.specifications).length > 0 && (
                        <div className="mt-2">
                          <div className="font-medium mb-1">
                            Thông số loại sản phẩm:
                          </div>
                          <table className="w-full text-xs">
                            <tbody>
                              {Object.entries(variant.specifications).map(
                                ([key, value]: [string, any]) => (
                                  <tr key={key}>
                                    <td className="pr-2 text-gray-600">
                                      {key}
                                    </td>
                                    <td className="text-gray-800">{value}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </div>
                ) as React.ReactNode
              }
              placement="right"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 14,
                  background:
                    variant.stock === 0
                      ? "#f8d7da"
                      : variant.stock <= 5
                      ? "#fffbe6"
                      : "#fff",
                  boxShadow: "0 2px 8px #f0f1f2",
                  marginBottom: 4,
                  position: "relative",
                  transition: "box-shadow 0.2s",
                  cursor: variant.stock > 0 ? "pointer" : "not-allowed",
                }}
                className={
                  variant.stock > 0 ? "hover:shadow-lg transition-shadow" : ""
                }
                onClick={() =>
                  variant.stock > 0 && setSelectedVariantId(variant._id)
                }
              >
                <Badge.Ribbon
                  text={
                    variant.stock === 0
                      ? "Hết hàng"
                      : variant.stock <= 5
                      ? "Sắp hết hàng"
                      : ""
                  }
                  color={variant.stock === 0 ? "red" : "orange"}
                  style={{ display: variant.stock > 5 ? "none" : undefined }}
                >
                  <img
                    src={
                      variant.images && variant.images[0]
                        ? variant.images[0]
                        : "/placeholder.svg"
                    }
                    alt="variant"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      objectFit: "cover",
                      border: "1px solid #eee",
                    }}
                  />
                </Badge.Ribbon>
                <div style={{ flex: 1 }}>
                  <div className="font-semibold text-base mb-1">
                    {variant.name || `${variant.size || ""}`}
                  </div>
                  <div className="mb-1">
                    {variant.salePrice && variant.salePrice < variant.price ? (
                      <>
                        <span className="text-red-600 font-semibold">
                          {formatPrice(variant.salePrice)}
                        </span>
                        <span className="text-gray-400 line-through ml-2">
                          {formatPrice(variant.price)}
                        </span>
                      </>
                    ) : (
                      <span>{formatPrice(variant.price)}</span>
                    )}
                  </div>
                  <div className="text-gray-600 text-sm mb-1">
                    Tồn kho: {variant.stock}
                  </div>

                  {/* Hiển thị tổng giá theo số lượng */}
                  <div className="text-sm text-gray-600 mb-2">
                    Tổng:{" "}
                    <span className="font-semibold text-green-600">
                      {formatPrice(
                        getVariantTotalPrice(
                          variant,
                          getVariantQuantity(variant._id)
                        )
                      )}
                    </span>
                  </div>

                  {/* Nút tăng giảm số lượng */}
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVariantQuantityChange(
                          variant._id,
                          getVariantQuantity(variant._id) - 1
                        );
                      }}
                      disabled={getVariantQuantity(variant._id) <= 1}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-8 text-center">
                      {getVariantQuantity(variant._id)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVariantQuantityChange(
                          variant._id,
                          getVariantQuantity(variant._id) + 1
                        );
                      }}
                      disabled={
                        getVariantQuantity(variant._id) >= variant.stock
                      }
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>

                  {variant.size && (
                    <Tag color="blue" style={{ marginLeft: 0 }}>
                      {variant.size}
                    </Tag>
                  )}
                </div>
                <Button
                  type="primary"
                  disabled={variant.stock <= 0}
                  onClick={() =>
                    variant.stock > 0 && setSelectedVariantId(variant._id)
                  }
                  style={{ minWidth: 120, fontWeight: 600 }}
                >
                  Chọn ({getVariantQuantity(variant._id)})
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
