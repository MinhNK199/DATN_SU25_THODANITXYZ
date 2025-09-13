import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaHeart,
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

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variantQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
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

    axios
      .get(`http://localhost:8000/api/product/${id}`)
      .then((response) => {
        const data = response.data;
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
        const url = `http://localhost:8000/api/product/${id}/related`;
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

  // Fetch featured products (top products by sales)
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/product/top");
        setFeaturedProducts(res.data.slice(0, 8));
      } catch (err) {
        console.error("Error fetching featured products:", err);
        // Fallback: use related products as featured
        if (relatedProducts.length > 0) {
          setFeaturedProducts(relatedProducts.slice(0, 8));
        }
      }
    };
    fetchFeaturedProducts();
  }, [relatedProducts]);

  // Fetch trending products (suggested products)
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/product/suggest");
        setTrendingProducts(res.data.slice(0, 6));
      } catch (err) {
        console.error("Error fetching trending products:", err);
        // Fallback: try search for popular products
        try {
          const searchRes = await axios.get("http://localhost:8000/api/product/search?q=popular&limit=6");
          setTrendingProducts(searchRes.data.slice(0, 6));
        } catch (searchErr) {
          console.error("Error fetching search products:", searchErr);
          // Final fallback: use related products as trending
          if (relatedProducts.length > 0) {
            setTrendingProducts(relatedProducts.slice(0, 6));
          }
        }
      }
    };
    fetchTrendingProducts();
  }, [relatedProducts]);

  // Fetch recommended products (AI recommendations)
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        // Try to get user-specific recommendations first
        const res = await axios.get("http://localhost:8000/api/recommendation", {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRecommendedProducts(res.data.slice(0, 4));
      } catch (err) {
        console.error("Error fetching recommended products:", err);
        // Fallback: try favorites recommendations
        try {
          const favoritesRes = await axios.get("http://localhost:8000/api/product/recommendations/favorites", {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setRecommendedProducts(favoritesRes.data.slice(0, 4));
        } catch (favoritesErr) {
          console.error("Error fetching favorites recommendations:", favoritesErr);
          // Final fallback: use related products as recommended
          if (relatedProducts.length > 0) {
            setRecommendedProducts(relatedProducts.slice(0, 4));
          }
        }
      }
    };
    fetchRecommendedProducts();
  }, [relatedProducts]);


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Bắt buộc chọn variant nếu sản phẩm có variants
    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      toast.error("Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng");
      return;
    }
    
    try {
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

  const handleBuyNow = async () => {
    if (!product) return;
    
    // Bắt buộc chọn variant nếu sản phẩm có variants
    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      toast.error("Vui lòng chọn màu sắc trước khi mua ngay");
      return;
    }
    
    try {
      const finalQuantity = selectedVariantId
        ? getVariantQuantity(selectedVariantId)
        : quantity;
      
      // Tạo sản phẩm tạm thời cho checkout
      const selectedVariant = selectedVariantId ? product.variants?.find((v: any) => v._id === selectedVariantId) : null;
      const displayPrice = selectedVariant ? 
        (selectedVariant.salePrice && selectedVariant.salePrice < selectedVariant.price ? selectedVariant.salePrice : selectedVariant.price) :
        (product.salePrice || product.price);
      
      console.log('🔍 ProductDetail - Selected variant debug:', {
        selectedVariantId,
        selectedVariant,
        variantImages: selectedVariant?.images,
        productImages: product.images,
        hasVariantImages: !!selectedVariant?.images?.length,
        variantColor: selectedVariant?.color,
        variantSize: selectedVariant?.size,
        allVariants: product.variants
      });
      
      const tempProduct = {
        _id: `temp_${Date.now()}`,
        product: {
          _id: product._id,
          name: product.name,
          images: product.images,
          price: product.price,
          salePrice: product.salePrice,
          stock: product.stock,
          availableStock: product.availableStock
        },
        variantId: selectedVariantId,
        variantInfo: selectedVariant ? {
          _id: selectedVariant._id,
          name: selectedVariant.name,
          color: selectedVariant.color,
          size: selectedVariant.size,
          sku: selectedVariant.sku,
          images: selectedVariant.images,
          price: selectedVariant.price,
          salePrice: selectedVariant.salePrice,
          stock: selectedVariant.stock
        } : null,
        quantity: finalQuantity,
        price: displayPrice
      };
      
      // Lưu sản phẩm tạm thời vào localStorage
      localStorage.setItem('buyNowProduct', JSON.stringify(tempProduct));
      console.log('🔍 ProductDetail - Lưu buyNowProduct:', tempProduct);
      console.log('🔍 ProductDetail - localStorage buyNowProduct:', localStorage.getItem('buyNowProduct'));
      
      // Chuyển đến trang checkout
      navigate('/checkout/shipping', { 
        state: { 
          buyNow: true,
          product: tempProduct 
        } 
      });
      
    } catch (error) {
      console.error("Error processing buy now:", error);
      toast.error("Không thể xử lý mua ngay");
    }
  };

  const getVariantQuantity = (variantId: string) => {
    return variantQuantities[variantId] || 1;
  };

  // Helper function to map product data
  const mapProductData = (product: any) => ({
    _id: product._id || product.id,
    name: product.name,
    price: product.salePrice || product.price,
    originalPrice: product.salePrice ? product.price : undefined,
    image: product.images && product.images.length > 0 ? product.images[0] : "",
    brand: typeof product.brand === "object" ? product.brand?.name : product.brand,
    rating: product.averageRating || 0,
    reviewCount: product.numReviews || 0,
    discount: product.salePrice
      ? Math.round(100 - (product.salePrice / product.price) * 100)
      : undefined,
    isNew: product.isFeatured || false,
    isHot: product.isActive || false,
    stock: product.stock || 0,
    variants: product.variants || [],
  });

  // Helper function to switch to variant image
  const switchToVariantImage = (variant: any) => {
    if (variant.images && variant.images.length > 0) {
      const allImages = [...(product.images || [])];
      
      // Thêm ảnh từ các variant khác
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((v: any) => {
          if (v.images && v.images.length > 0) {
            v.images.forEach((img: string) => {
              if (!allImages.includes(img)) {
                allImages.push(img);
              }
            });
          }
        });
      }
      
      // Thêm ảnh phụ
      if (product.additionalImages && product.additionalImages.length > 0) {
        product.additionalImages.forEach((img: string) => {
          if (!allImages.includes(img)) {
            allImages.push(img);
          }
        });
      }
      
      // Tìm ảnh đầu tiên của variant này
      const variantFirstImage = variant.images[0];
      const variantImageIndex = allImages.findIndex(img => img === variantFirstImage);
      
      if (variantImageIndex !== -1) {
        setSelectedImage(variantImageIndex);
      } else {
        // Nếu không tìm thấy trong allImages, thử tìm trong ảnh gốc
        const originalIndex = (product.images || []).findIndex(img => img === variantFirstImage);
        if (originalIndex !== -1) {
          setSelectedImage(originalIndex);
        }
      }
    }
  };


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
        {/* Breadcrumb */}
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

        {/* Main Product Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Product Images Section - TechTrend Style */}
            <div className="flex flex-col space-y-4">
              {/* Main Image/Video with Navigation */}
              <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden group">
                {(() => {
                  const allImages = [...(product.images || [])];
                  
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
                  
                  if (product.additionalImages && product.additionalImages.length > 0) {
                    product.additionalImages.forEach((img: string) => {
                      if (!allImages.includes(img)) {
                        allImages.push(img);
                      }
                    });
                  }

                  return allImages.length > 1 && (
                    <>
                      {/* Left Navigation Arrow */}
                      <button
                        onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : allImages.length - 1)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full flex items-center justify-center z-10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Right Navigation Arrow */}
                      <button
                        onClick={() => setSelectedImage(selectedImage < allImages.length - 1 ? selectedImage + 1 : 0)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full flex items-center justify-center z-10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  );
                })()}

                <div className="aspect-square flex items-center justify-center bg-gray-50">
                  {(() => {
                    const allImages = [...(product.images || [])];
                    
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
                    
                    if (product.additionalImages && product.additionalImages.length > 0) {
                      product.additionalImages.forEach((img: string) => {
                        if (!allImages.includes(img)) {
                          allImages.push(img);
                        }
                      });
                    }

                    return allImages.length > 0 ? (
                      <img
                        src={allImages[selectedImage]}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain cursor-zoom-in"
                        onClick={() => {
                          // Có thể thêm modal xem ảnh phóng to ở đây
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                        <div className="text-center">
                          <div className="text-6xl mb-4">📷</div>
                          <div className="text-lg">Không có ảnh</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Discount Badge */}
                {product.salePrice && product.salePrice < product.price && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded text-sm font-bold shadow-lg">
                    -{Math.round(100 - (product.salePrice / product.price) * 100)}%
                  </div>
                )}
                
                {/* New Badge */}
                {product.isNew && (
                  <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                    MỚI
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery - TechTrend Style */}
              {(() => {
                const allImages = [...(product.images || [])];
                
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

                if (product.additionalImages && product.additionalImages.length > 0) {
                  product.additionalImages.forEach((img: string) => {
                    if (!allImages.includes(img)) {
                      allImages.push(img);
                    }
                  });
                }
                
                return (
                  <div className="relative">
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                      {/* All Images */}
                      {allImages.length > 0 ? (
                        allImages.map((image: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedImage(index);
                            }}
                            onMouseEnter={() => {
                              // Khi hover vào thumbnail, chuyển sang ảnh đó
                              setSelectedImage(index);
                            }}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                              selectedImage === index
                                ? "border-red-500"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))
                      ) : (
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                          <div className="text-center text-gray-500">
                            <div className="text-sm">📷</div>
                            <div className="text-xs">No images</div>
                          </div>
                        </div>
                      )}
                    </div>
                        
                    {/* Right Navigation Arrow for Thumbnails */}
                    {allImages.length > 4 && (
                      <button className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-16 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-600 hover:text-gray-800 flex items-center justify-center shadow-lg rounded-l transition-all duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Product Information Section - TechTrend Style */}
            <div className="flex flex-col gap-4 md:gap-6 justify-start">
              {/* Brand Tag */}
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {typeof product.brand === "object"
                    ? product.brand.name
                    : product.brand}
                </span>
                <span className="text-xs text-gray-500">Mall</span>
              </div>

              {/* Product Title */}
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
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
                <div className="hidden md:block h-4 w-px bg-gray-300"></div>
                <span className="text-sm text-gray-600">
                  {product.reviewCount || 0} Đánh Giá
                </span>
                <div className="hidden md:block h-4 w-px bg-gray-300"></div>
                <span className="text-sm text-gray-600">
                  Đã Bán {product.soldCount || 0}+
                </span>
                <div className="hidden md:block h-4 w-px bg-gray-300"></div>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Tố cáo
                </button>
              </div>

              {/* Price Section */}
              <div className="space-y-4">
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
                      <span className="text-2xl md:text-3xl font-bold text-red-600">
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
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        -{Math.round(100 - ((product.variants.find((v: Variant) => v._id === selectedVariantId)?.salePrice || 0) / (product.variants.find((v: Variant) => v._id === selectedVariantId)?.price || 1)) * 100)}%
                      </span>
                    </>
                  ) : selectedVariantId ? (
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">
                      {formatPrice(
                        product.variants.find(
                          (v: Variant) => v._id === selectedVariantId
                        )?.price || 0
                      )}
                    </span>
                  ) : product.salePrice &&
                    product.salePrice < product.price ? (
                    <>
                      <span className="text-2xl md:text-3xl font-bold text-red-600">
                        {formatPrice(product.salePrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        -{Math.round(100 - (product.salePrice / product.price) * 100)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Voucher Section */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Voucher của shop</span>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Giảm 50k
                    </button>
                  </div>
                </div>

                {/* Installment Section */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
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
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaTruck className="text-green-600 w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">Vận Chuyển</span>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Mua trước 18:00, Cam kết nhận hàng trong 4 Giờ &gt;
                  </button>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Phí ship 0₫
                </div>
                <div className="text-sm text-gray-600">
                  Tặng Voucher ₫15.000 nếu đơn giao sau thời gian trên.
                </div>
              </div>

              {/* TechTrend Guarantee */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-sm font-medium text-gray-700 mb-2">An Tâm Mua Sắm Cùng TechTrend</div>
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <FaCheck className="text-green-500" />
                  <span>Trả hàng miễn phí 15 ngày. Chính hãng 100% - Miễn phí vận chuyển</span>
                  <button className="text-blue-600 hover:text-blue-800 ml-1">▼</button>
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

              {/* Color Selection - Shopee Style */}
              {product?.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">MÀU SẮC</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant: any, index: number) => (
                        <button
                          key={variant._id || index}
                          onClick={() => {
                            setSelectedVariantId(variant._id);
                            // Khi click vào variant, chuyển sang ảnh của variant đó
                            switchToVariantImage(variant);
                          }}
                            onMouseEnter={() => {
                              // Khi hover vào variant, chuyển sang ảnh của variant đó
                              switchToVariantImage(variant);
                            }}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center space-x-2 ${
                            selectedVariantId === variant._id
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {/* Preview ảnh variant nếu có, nếu không thì hiển thị màu */}
                          {variant.images && variant.images.length > 0 ? (
                            <img
                              src={variant.images[0]}
                              alt={variant.color?.name || variant.name || `Màu ${index + 1}`}
                              className="w-4 h-4 rounded-full object-cover border border-gray-300"
                            />
                          ) : (
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{
                                backgroundColor: variant.color?.hex || variant.color?.name || '#e5e7eb'
                              }}
                            ></div>
                          )}
                          <span>{variant.color?.name || variant.name || `Màu ${index + 1}`}</span>
                        </button>
                      ))}
                    </div>
                    {/* Thông báo yêu cầu chọn variant */}
                    {!selectedVariantId && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700 flex items-center">
                          <span className="mr-1">⚠️</span>
                          Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Số Lượng</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <FaMinus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-0 focus:outline-none font-semibold"
                        min="1"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      CÒN HÀNG
                    </span>
                  </div>
                </div>
              </div>


              {/* Action Buttons */}
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0 || (product.variants && product.variants.length > 0 && !selectedVariantId)}
                    className="flex-1 bg-white border-2 border-red-500 text-red-500 py-3 md:py-4 px-6 rounded-lg font-semibold hover:bg-red-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">Thêm Vào Giỏ Hàng</span>
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0 || (product.variants && product.variants.length > 0 && !selectedVariantId)}
                    className="flex-1 bg-red-600 text-white py-3 md:py-4 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                  >
                    Mua Ngay
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

              {/* Benefits */}
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

        {/* Featured Products Section */}
        {featuredProducts && featuredProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Sản phẩm nổi bật
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Hot</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((featuredProduct) => (
                <ProductCard
                  key={featuredProduct._id || featuredProduct.id}
                  product={mapProductData(featuredProduct)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Sản phẩm liên quan
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Cùng danh mục</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct._id || relatedProduct.id}
                  product={mapProductData(relatedProduct)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Products Section */}
        {trendingProducts && trendingProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Sản phẩm đang hot
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Trending</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingProducts.map((trendingProduct) => (
                <ProductCard
                  key={trendingProduct._id || trendingProduct.id}
                  product={mapProductData(trendingProduct)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recommended Products Section */}
        {recommendedProducts && recommendedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Có thể bạn cũng thích
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Gợi ý</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((recommendedProduct) => (
                <ProductCard
                  key={recommendedProduct._id || recommendedProduct.id}
                  product={mapProductData(recommendedProduct)}
                />
              ))}
            </div>
          </div>
        )}

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
      </div>

    </div>
  );
};

export default ProductDetail;
