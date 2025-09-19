  import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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


const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [filter, setFilter] = useState({
    sort: "newest",
    hasImage: false,
    star: 0,
  });
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [autoSlide, setAutoSlide] = useState(true);

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
        console.log('🔍 ProductDetail - Fetched product data:', {
          id: data._id,
          name: data.name,
          price: data.price,
          salePrice: data.salePrice,
          variants: data.variants?.length || 0
        });
        setProduct(data);
        
        // Auto-select first variant if product has variants and no variant is selected
        if (data.variants && data.variants.length > 0 && !selectedVariantId) {
          setSelectedVariantId(data.variants[0]._id);
          console.log('🔍 Auto-selected first variant:', data.variants[0]._id);
        }
        
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
        // Check if res.data is an array, if not use res.data.suggestions or res.data.products or empty array
        const products = Array.isArray(res.data) ? res.data : (res.data.suggestions || res.data.products || []);
        setTrendingProducts(products.slice(0, 6));
      } catch (err) {
        console.error("Error fetching trending products:", err);
        // Fallback: try to get products with high rating
        try {
          const searchRes = await axios.get("http://localhost:8000/api/product?minRating=4&limit=6&sort=-averageRating");
          setTrendingProducts(searchRes.data.products?.slice(0, 6) || []);
        } catch (searchErr) {
          console.error("Error fetching trending products:", searchErr);
          // Final fallback: use related products as trending
          if (relatedProducts.length > 0) {
            setTrendingProducts(relatedProducts.slice(0, 6));
          }
        }
      }
    };
    fetchTrendingProducts();
  }, [relatedProducts]);

  // Get all images (product + variants + additional)
  const getAllImages = () => {
    if (!product) return [];
    
    let images = [...(product.images || [])];
    
    // Add variant images
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant: any) => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach((img: any) => {
            if (!images.includes(img)) {
              images.push(img);
            }
          });
        }
      });
    }
    
    // Add additional images
    if (product.additionalImages && product.additionalImages.length > 0) {
      product.additionalImages.forEach((img: any) => {
        if (!images.includes(img)) {
          images.push(img);
        }
      });
    }
    
    return images;
  };

  // Auto-slide effect
  useEffect(() => {
    if (!product || !autoSlide) return;
    
    const images = getAllImages();
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [product, autoSlide]);

  // Zoom functions
  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const formatPrice = (price: number | undefined | null) => {
    if (!price || price === 0) {
      return "Liên hệ";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getDisplayPrice = (product: any, selectedVariantId?: string) => {
    if (!product) return 0;
    
    // If variant is selected, use variant price
    if (selectedVariantId && product.variants) {
      const variant = product.variants.find((v: any) => v._id === selectedVariantId);
      if (variant) {
        return variant.salePrice || variant.price || 0;
      }
    }
    
    // Use product price
    return product.salePrice || product.price || 0;
  };

  const getOriginalPrice = (product: any, selectedVariantId?: string) => {
    if (!product) return 0;
    
    // If variant is selected, use variant original price
    if (selectedVariantId && product.variants) {
      const variant = product.variants.find((v: any) => v._id === selectedVariantId);
      if (variant) {
        return variant.salePrice ? variant.price : 0;
      }
    }
    
    // Use product original price
    return product.salePrice ? product.price : 0;
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Bắt buộc chọn variant nếu sản phẩm có variants
    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      toast.error("Vui lòng chọn sản phẩm trước khi thêm vào giỏ hàng");
      return;
    }
    
    try {
      await addToCart(product._id, quantity, selectedVariantId);
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
      toast.error("Vui lòng chọn sản phẩm trước khi mua ngay");
      return;
    }
    
    // Kiểm tra thêm: nếu có variants nhưng selectedVariantId không tồn tại trong danh sách variants
    if (selectedVariantId && product.variants && product.variants.length > 0) {
      const variantExists = product.variants.find((v: any) => v._id === selectedVariantId);
      if (!variantExists) {
        toast.error("Sản phẩm đã chọn không hợp lệ. Vui lòng chọn lại.");
        setSelectedVariantId(undefined);
        return;
      }
    }
    
    try {
      // Thêm sản phẩm vào giỏ hàng trước
      await addToCart(product._id, quantity, selectedVariantId);
      
      // Sau khi thêm vào giỏ thành công, chuyển đến trang checkout
      navigate('/checkout/shipping', { 
        state: { 
          buyNow: true
        } 
      });
      
    } catch (error) {
      console.error("Error processing buy now:", error);
      toast.error("Không thể xử lý mua ngay");
    }
  };


  // Helper function to get current stock (variant or product)
  const getCurrentStock = (product: any, selectedVariantId?: string) => {
    if (!product) return 0;
    
    // If variant is selected, use variant stock
    if (selectedVariantId && product.variants) {
      const variant = product.variants.find((v: any) => v._id === selectedVariantId);
      if (variant) {
        return variant.stock || 0;
      }
    }
    
    // If no variants, use product stock
    if (!product.variants || product.variants.length === 0) {
      return product.stock || 0;
    }
    
    // If has variants but no variant selected, return total stock of all variants
    // This allows the button to be enabled if any variant has stock
    return product.variants.reduce((total: number, variant: any) => total + (variant.stock || 0), 0);
  };

  // Helper function to check if product is in stock
  const isInStock = (product: any, selectedVariantId?: string) => {
    return getCurrentStock(product, selectedVariantId) > 0;
  };

  // Helper function to map product data
  const mapProductData = (product: any) => {
    // Calculate total stock for products with variants
    let totalStock = product.stock || 0;
    if (product.variants && product.variants.length > 0) {
      totalStock = product.variants.reduce((total: number, variant: any) => total + (variant.stock || 0), 0);
    }
    
    return {
      _id: product._id || product.id,
      name: product.name,
      price: product.salePrice || product.price,
      originalPrice: product.salePrice ? product.price : undefined,
      image: product.images && product.images.length > 0 ? product.images[0] : "",
      brand: typeof product.brand === "object" ? product.brand?.name || 'N/A' : product.brand || 'N/A',
      category: typeof product.category === "object" ? product.category?.name || 'N/A' : product.category || 'N/A',
      rating: product.rating || product.averageRating || 0,
      reviewCount: product.reviewCount || product.numReviews || 0,
      discount: product.salePrice
        ? Math.round(100 - (product.salePrice / product.price) * 100)
        : undefined,
      isNew: product.isFeatured || false,
      isHot: product.isActive || false,
      stock: totalStock,
      variants: product.variants || [],
    };
  };

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
        const originalIndex = (product.images || []).findIndex((img: any) => img === variantFirstImage);
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
                  <Link 
                    to={`/products?category=${typeof product.category === "object" ? product.category?.slug || product.category?._id : product.category}`} 
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {typeof product.category === "object"
                      ? product.category?.name || 'N/A'
                      : product.category || 'N/A'}
                  </Link>
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
                <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden group max-w-2xl mx-auto aspect-square">
                  {(() => {
                    const allImages = getAllImages();

                    return allImages.length > 1 && (
                      <>
                        {/* Left Navigation Arrow */}
                        <button
                          onClick={() => {
                            setSelectedImage(selectedImage > 0 ? selectedImage - 1 : allImages.length - 1);
                            setAutoSlide(false); // Tắt auto-slide khi click
                          }}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full flex items-center justify-center z-10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {/* Right Navigation Arrow */}
                        <button
                          onClick={() => {
                            setSelectedImage(selectedImage < allImages.length - 1 ? selectedImage + 1 : 0);
                            setAutoSlide(false); // Tắt auto-slide khi click
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full flex items-center justify-center z-10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    );
                  })()}

                  <div 
                    className="aspect-square flex items-center justify-center bg-gray-50 relative overflow-hidden group cursor-zoom-in"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  >
                    {(() => {
                      const allImages = getAllImages();
                      
                      return allImages.length > 0 ? (
                        <div className="relative w-full h-full overflow-hidden">
                          <img
                            src={allImages[selectedImage]}
                            alt={product.name}
                            className={`w-96 h-96 object-contain transition-transform duration-300 ${
                              isZoomed ? 'scale-150' : 'scale-100'
                            }`}
                            style={{
                              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                              imageRendering: 'auto'
                            }}
                            onClick={() => {
                              // Có thể thêm modal xem ảnh phóng to ở đây
                            }}
                          />
                          
                          {/* Zoom lens */}
                          {isZoomed && (
                            <div 
                              className="absolute w-32 h-32 border-2 border-gray-400 bg-transparent pointer-events-none z-20"
                              style={{
                                left: `${zoomPosition.x}%`,
                                top: `${zoomPosition.y}%`,
                                transform: 'translate(-50%, -50%)',
                                borderRadius: '50%',
                                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                              }}
                            />
                          )}
                          
                          {/* Auto-slide indicator */}
                          {allImages.length > 1 && (
                            <div className="absolute top-4 right-4 flex space-x-1">
                              {allImages.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                    index === selectedImage ? 'bg-blue-500' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Auto-slide control */}
                        
                        </div>
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
                 const allImages = getAllImages();
                 
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
                               setAutoSlide(false); // Tắt auto-slide khi click
                             }}
                             onMouseEnter={() => {
                               // Khi hover vào thumbnail, chuyển sang ảnh đó
                               setSelectedImage(index);
                               setAutoSlide(false); // Tắt auto-slide khi hover
                             }}
                             className={`flex-shrink-0 w-28 h-28 rounded-lg border-2 transition-all duration-200 overflow-hidden ${
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
                         <div className="flex-shrink-0 w-28 h-28 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                           <div className="text-center text-gray-500">
                             <div className="text-sm">📷</div>
                             <div className="text-xs">No images</div>
                           </div>
                         </div>
                       )}
                     </div>
                         
                     {/* Right Navigation Arrow for Thumbnails */}
                     {allImages.length > 4 && (
                       <button className="absolute right-0 top-1/2 transform -translate-y-1/2 w-8 h-24 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-600 hover:text-gray-800 flex items-center justify-center shadow-lg rounded-l transition-all duration-200">
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
                    ? product.brand?.name || 'N/A'
                    : product.brand || 'N/A'}
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
                  {(() => {
                    const displayPrice = getDisplayPrice(product, selectedVariantId);
                    const originalPrice = getOriginalPrice(product, selectedVariantId);
                    const hasDiscount = originalPrice > 0 && displayPrice < originalPrice;
                    
                    if (hasDiscount) {
                      return (
                        <>
                          <span className="text-2xl md:text-3xl font-bold text-red-600">
                            {formatPrice(displayPrice)}
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                            -{Math.round(100 - (displayPrice / originalPrice) * 100)}%
                          </span>
                        </>
                      );
                    } else {
                      return (
                        <span className="text-2xl md:text-3xl font-bold text-gray-900">
                          {formatPrice(displayPrice)}
                        </span>
                      );
                    }
                  })()}
                </div>

                          
              </div>

            

              {/* TechTrend Guarantee */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-sm font-medium text-gray-700 mb-2">An Tâm Mua Sắm Cùng TechTrend</div>
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <FaCheck className="text-green-500" />
                  <span>Trả hàng miễn phí 15 ngày. Chính hãng 100% - Miễn phí vận chuyển với đơn hàng trên 10 Triệu đồng</span>
                  <button className="text-blue-600 hover:text-blue-800 ml-1">▼</button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isInStock(product, selectedVariantId)
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></span>
                <span
                  className={`font-medium ${
                    isInStock(product, selectedVariantId)
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {isInStock(product, selectedVariantId)
                    ? `Còn ${getCurrentStock(product, selectedVariantId)} sản phẩm`
                    : "Hết hàng"}
                </span>
              </div>

              {/* Color Selection - Shopee Style */}
              {product?.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <div>
                     <h3 className="text-sm font-medium text-gray-700 mb-3">CHI TIẾT SẢN PHẨM</h3>
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
                           Vui lòng chọn sản phẩm trước khi thêm vào giỏ hàng
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
                    disabled={!isInStock(product, selectedVariantId)}
                    className="flex-1 bg-white border-2 border-red-500 text-red-500 py-3 md:py-4 px-6 rounded-lg font-semibold hover:bg-red-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-sm md:text-base">Thêm Vào Giỏ Hàng</span>
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    disabled={!isInStock(product, selectedVariantId)}
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

         {/* Main Content Grid */}
         <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Column - Reviews, Details, FAQ, Description */}
           <div className="lg:col-span-2 space-y-10">
             {/* Đánh giá */}
             <div>
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

             {/* Thông tin chi tiết sản phẩm */}
             <div>
               <h2 className="relative inline-block text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                 Thông tin chi tiết
                 <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></span>
               </h2>
               <div className="bg-white rounded-2xl shadow-lg p-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                     <div className="flex justify-between py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-600">Thương hiệu:</span>
                       <span className="text-gray-900">{typeof product.brand === "object" ? product.brand?.name || 'N/A' : product.brand || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-600">Danh mục:</span>
                       <span className="text-gray-900">{typeof product.category === "object" ? product.category?.name || 'N/A' : product.category || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-600">SKU:</span>
                       <span className="text-gray-900">
                         {selectedVariantId && product.variants ? 
                           (() => {
                             const variant = product.variants.find((v: any) => v._id === selectedVariantId);
                             return variant?.sku || product.sku || 'N/A';
                           })() : 
                           product.sku || 'N/A'
                         }
                       </span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-600">Trọng lượng:</span>
                       <span className="text-gray-900">
                         {selectedVariantId && product.variants ? 
                           (() => {
                             const variant = product.variants.find((v: any) => v._id === selectedVariantId);
                             return variant?.weight ? `${variant.weight}g` : (product.weight ? `${product.weight}g` : 'N/A');
                           })() : 
                           (product.weight ? `${product.weight}g` : 'N/A')
                         }
                       </span>
                     </div>
                     {selectedVariantId && product.variants && (() => {
                       const variant = product.variants.find((v: any) => v._id === selectedVariantId);
                       return variant?.color ? (
                         <div className="flex justify-between py-2 border-b border-gray-100">
                           <span className="font-medium text-gray-600">Màu sắc:</span>
                           <span className="text-gray-900">{typeof variant.color === 'object' ? variant.color.name || variant.color.code || 'N/A' : variant.color}</span>
                         </div>
                       ) : null;
                     })()}
                     {selectedVariantId && product.variants && (() => {
                       const variant = product.variants.find((v: any) => v._id === selectedVariantId);
                       return variant?.size ? (
                         <div className="flex justify-between py-2 border-b border-gray-100">
                           <span className="font-medium text-gray-600">Kích thước:</span>
                           <span className="text-gray-900">{typeof variant.size === 'object' ? variant.size.name || variant.size.code || 'N/A' : variant.size}</span>
                         </div>
                       ) : null;
                     })()}
                   </div>
                   <div className="space-y-4">
                     <div className="flex justify-between py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-600">Tình trạng:</span>
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${isInStock(product, selectedVariantId) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {isInStock(product, selectedVariantId) ? 'Còn hàng' : 'Hết hàng'}
                       </span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-600">Đánh giá:</span>
                       <div className="flex items-center space-x-1">
                         <span className="text-yellow-500">★</span>
                         <span className="text-gray-900">{product.rating || 0}/5</span>
                         <span className="text-gray-500">({product.reviewCount || 0} đánh giá)</span>
                       </div>
                     </div>
                     <div className="flex justify-between py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-600">Số lượng còn:</span>
                       <span className="text-gray-900 font-semibold">
                         {getCurrentStock(product, selectedVariantId)} sản phẩm
                       </span>
                     </div>
                      {(() => {
                        const variant = selectedVariantId && product.variants ? 
                          product.variants.find((v: any) => v._id === selectedVariantId) : null;
                        const specs = variant?.specifications || {};
                        
                        // Mapping các key từ database sang label tiếng Việt
                        const specLabels: Record<string, string> = {
                          'RAM': 'RAM',
                          'ROM': 'Bộ nhớ',
                          'CPU': 'CPU',
                          'GPU': 'Card đồ họa',
                          'Screen': 'Màn hình',
                          'Camera': 'Camera',
                          'Battery': 'Pin',
                          'OS': 'Hệ điều hành',
                          'Connectivity': 'Kết nối',
                          'Dimensions': 'Kích thước',
                          'Weight': 'Trọng lượng',
                          'Material': 'Chất liệu',
                          'Storage': 'Lưu trữ',
                          'Display': 'Màn hình',
                          'Processor': 'Bộ xử lý',
                          'Graphics': 'Card đồ họa',
                          'Memory': 'Bộ nhớ'
                        };
                        
                        // Chỉ hiển thị những thông số có dữ liệu
                        return Object.entries(specs)
                          .filter(([, value]) => value && value.toString().trim() !== '')
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                              <span className="font-medium text-gray-600">
                                {specLabels[key] || key}:
                              </span>
                              <span className="text-gray-900">{String(value)}</span>
                            </div>
                          ));
                      })()}
                     <div className="flex justify-between py-2 border-b border-gray-100">
                       <span className="font-medium text-gray-600">Đã bán:</span>
                       <span className="text-gray-900">{product.soldCount || 0}+ sản phẩm</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>


             {/* Mô tả */}
             <div>
               <h2 className="relative inline-block text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                 Mô tả sản phẩm
                 <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></span>
               </h2>
               <div className="bg-white rounded-2xl shadow-lg p-6">
                 <div className="prose max-w-none text-gray-700 leading-relaxed">
                   {product.description || (
                     <div className="text-center py-8 text-gray-500">
                       <div className="text-4xl mb-4">📝</div>
                       <p>Chưa có mô tả chi tiết cho sản phẩm này.</p>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </div>

           {/* Right Column - Featured Products */}
           <div className="lg:col-span-1">
             {featuredProducts && featuredProducts.length > 0 && (
               <div className="sticky top-8">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-lg font-bold text-gray-900">
                     Sản phẩm nổi bật
                   </h2>
                   <div className="flex items-center space-x-2">
                     <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                     <span className="text-xs text-gray-600">Hot</span>
                   </div>
                 </div>
                 <div className="space-y-3">
                   {featuredProducts.slice(0, 4).map((featuredProduct) => (
                     <div 
                       key={featuredProduct._id || featuredProduct.id} 
                       className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md hover:border-red-300 transition-all cursor-pointer group"
                       onClick={() => navigate(`/product/${featuredProduct._id || featuredProduct.id}`)}
                     >
                       <div className="flex space-x-3">
                         {/* Product Image */}
                         <div className="flex-shrink-0">
                           <img
                             src={mapProductData(featuredProduct).image}
                             alt={mapProductData(featuredProduct).name}
                             className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                           />
                         </div>
                         
                         {/* Product Info */}
                         <div className="flex-1 min-w-0">
                           <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">
                             {mapProductData(featuredProduct).name}
                           </h3>
                           
                           {/* Rating */}
                           <div className="flex items-center space-x-1 mb-2">
                             <div className="flex items-center">
                               {[...Array(5)].map((_, index) => (
                                 <FaStar
                                   key={index}
                                   className={`w-3 h-3 ${
                                     index < Math.floor(mapProductData(featuredProduct).rating || 0)
                                       ? "text-yellow-400"
                                       : "text-gray-300"
                                   }`}
                                 />
                               ))}
                             </div>
                             <span className="text-xs text-gray-500">
                               ({mapProductData(featuredProduct).reviewCount || 0})
                             </span>
                           </div>
                           
                           {/* Price */}
                           <div className="flex items-center space-x-2">
                             <span className="text-sm font-bold text-red-600">
                               {formatPrice(mapProductData(featuredProduct).price)}
                             </span>
                             {mapProductData(featuredProduct).originalPrice && (
                               <span className="text-xs text-gray-500 line-through">
                                 {formatPrice(mapProductData(featuredProduct).originalPrice)}
                               </span>
                             )}
                           </div>
                           
                           {/* Stock Status */}
                           <div className="mt-1">
                             <span className={`text-xs px-2 py-1 rounded-full ${
                               mapProductData(featuredProduct).stock > 0 
                                 ? 'bg-green-100 text-green-800' 
                                 : 'bg-red-100 text-red-800'
                             }`}>
                               {mapProductData(featuredProduct).stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                             </span>
                           </div>
                           
                           {/* Hover indicator */}
                           <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-xs text-red-600 font-medium">
                               Xem chi tiết →
                             </span>
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* FAQ Section - Moved to right column */}
             <div className="mt-8">
               <h2 className="text-lg font-bold text-gray-900 mb-4">
                 Câu hỏi thường gặp
               </h2>
               <div className="bg-white rounded-2xl shadow-lg p-4">
                 <div className="space-y-3">
                   <div className="border border-gray-200 rounded-lg p-3">
                     <h3 className="font-semibold text-gray-900 mb-1 text-sm">Sản phẩm có chính hãng không?</h3>
                     <p className="text-gray-600 text-xs">Tất cả sản phẩm đều được nhập khẩu chính hãng với đầy đủ giấy tờ chứng nhận chất lượng.</p>
                   </div>
                   <div className="border border-gray-200 rounded-lg p-3">
                     <h3 className="font-semibold text-gray-900 mb-1 text-sm">Thời gian giao hàng bao lâu?</h3>
                     <p className="text-gray-600 text-xs">Chúng tôi cam kết giao hàng trong vòng 2-4 ngày làm việc tại Hà Nội và TP.HCM, 3-7 ngày tại các tỉnh thành khác.</p>
                   </div>
                   <div className="border border-gray-200 rounded-lg p-3">
                     <h3 className="font-semibold text-gray-900 mb-1 text-sm">Có được đổi trả không?</h3>
                     <p className="text-gray-600 text-xs">Khách hàng có thể đổi trả sản phẩm trong vòng 15 ngày kể từ ngày nhận hàng nếu sản phẩm còn nguyên vẹn.</p>
                   </div>
                   <div className="border border-gray-200 rounded-lg p-3">
                     <h3 className="font-semibold text-gray-900 mb-1 text-sm">Có bảo hành không?</h3>
                     <p className="text-gray-600 text-xs">Tất cả sản phẩm đều có bảo hành chính hãng theo tiêu chuẩn của nhà sản xuất.</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>

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
      </div>

    </div>
  );
};

export default ProductDetail;
