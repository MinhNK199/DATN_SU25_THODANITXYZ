import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaFire, FaStar, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  brand: any;
  category?: any;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  numReviews?: number;
  discount?: number;
  discountAmount?: number;
  isNew?: boolean;
  isHot?: boolean;
  stock: number;
  totalStock?: number;
  soldStock?: number;
  remainingStock?: number;
  soldPercentage?: number;
  variants?: any[];
  isFeatured?: boolean;
}

const HotSaleSection: React.FC = () => {
  const [hotSaleProducts, setHotSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate time until end of day
  const calculateTimeUntilEndOfDay = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999); // End of current day
    
    const timeDiff = endOfDay.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      // If past end of day, calculate until end of next day
      endOfDay.setDate(endOfDay.getDate() + 1);
      const nextDayDiff = endOfDay.getTime() - now.getTime();
      return nextDayDiff;
    }
    
    return timeDiff;
  };

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const timeDiff = calculateTimeUntilEndOfDay();
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Update immediately
    updateCountdown();
    
    // Update every second
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch hot sale products
  useEffect(() => {
    const fetchHotSaleProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch products with sale price or sale variants
        const response = await fetch('/api/product?sale=true&limit=20');
        if (!response.ok) throw new Error('Lỗi khi tải sản phẩm hot sale');
        
        const data = await response.json();
        let products = data.products || data;
        
        // If no products with sale, try fetching products with variants that have sale
        if (products.length === 0) {
          const variantResponse = await fetch('/api/product?hasSaleVariants=true&limit=20');
          if (variantResponse.ok) {
            const variantData = await variantResponse.json();
            products = variantData.products || variantData;
          }
        }
        
        // Process products to find the best sale prices
        const processedProducts = products.map((product: any) => {
          let bestDiscount = 0;
          let salePrice = product.salePrice;
          let originalPrice = product.price;
          let discountAmount = 0;
          
          // Check if product has variants with sale prices
          if (product.variants && product.variants.length > 0) {
            const saleVariants = product.variants.filter((variant: any) => 
              variant.salePrice && variant.salePrice < variant.price
            );
            
            if (saleVariants.length > 0) {
              // Find variant with highest discount
              const bestVariant = saleVariants.reduce((best: any, current: any) => {
                const bestDiscountPercent = Math.round(100 - (best.salePrice / best.price) * 100);
                const currentDiscountPercent = Math.round(100 - (current.salePrice / current.price) * 100);
                return currentDiscountPercent > bestDiscountPercent ? current : best;
              });
              
              salePrice = bestVariant.salePrice;
              originalPrice = bestVariant.price;
              bestDiscount = Math.round(100 - (salePrice / originalPrice) * 100);
              discountAmount = originalPrice - salePrice;
            }
          } else if (product.salePrice && product.salePrice < product.price) {
            // Product itself has sale price
            salePrice = product.salePrice;
            originalPrice = product.price;
            bestDiscount = Math.round(100 - (salePrice / originalPrice) * 100);
            discountAmount = originalPrice - salePrice;
          }
          
          // Add stock information for hot sale
          const totalStock = product.stock || Math.floor(Math.random() * 100) + 20;
          const soldStock = Math.floor(Math.random() * (totalStock * 0.7)) + 10;
          const remainingStock = totalStock - soldStock;
          const soldPercentage = Math.round((soldStock / totalStock) * 100);
          
          return {
            ...product,
            price: originalPrice,
            salePrice: salePrice,
            discount: bestDiscount,
            discountAmount: discountAmount,
            stock: totalStock, // Add stock property
            totalStock: totalStock,
            soldStock: soldStock,
            remainingStock: remainingStock,
            soldPercentage: soldPercentage,
            isHot: false, // We removed installment info
            // Ensure image is properly set
            image: product.image || (product.images && product.images.length > 0 ? product.images[0] : ''),
          };
        }).filter((product: any) => product.discount > 0); // Only products with actual discounts
        
        // Sort by discount percentage (highest first) and take top 8
        const sortedProducts = processedProducts
          .sort((a: any, b: any) => b.discount - a.discount)
          .slice(0, 8);
        
        // If no products found, use demo data
        if (sortedProducts.length === 0) {
          const demoProducts = [
            {
              _id: '1',
              name: 'iPhone 15 Pro Max 256GB',
              price: 34990000,
              salePrice: 29990000,
              image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 5,
              reviewCount: 12,
              discount: 14,
              discountAmount: 5000000,
              stock: 100,
              totalStock: 100,
              soldStock: 65,
              remainingStock: 35,
              soldPercentage: 65,
              variants: [],
              isHot: false
            },
            {
              _id: '2',
              name: 'Samsung Galaxy S24 Ultra 512GB',
              price: 29990000,
              salePrice: 24990000,
              image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop',
              brand: { name: 'Samsung' },
              rating: 4.8,
              reviewCount: 28,
              discount: 17,
              discountAmount: 5000000,
              stock: 80,
              totalStock: 80,
              soldStock: 48,
              remainingStock: 32,
              soldPercentage: 60,
              variants: [],
              isHot: false
            },
            {
              _id: '3',
              name: 'MacBook Air M2 13 inch',
              price: 28990000,
              salePrice: 23990000,
              image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 4.9,
              reviewCount: 15,
              discount: 17,
              discountAmount: 5000000,
              stock: 60,
              totalStock: 60,
              soldStock: 42,
              remainingStock: 18,
              soldPercentage: 70,
              variants: [],
              isHot: false
            },
            {
              _id: '4',
              name: 'iPad Pro 12.9 inch M2',
              price: 25990000,
              salePrice: 20990000,
              image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 4.7,
              reviewCount: 22,
              discount: 19,
              discountAmount: 5000000,
              stock: 50,
              totalStock: 50,
              soldStock: 35,
              remainingStock: 15,
              soldPercentage: 70,
              variants: [],
              isHot: false
            },
            {
              _id: '5',
              name: 'AirPods Pro 2nd Gen',
              price: 6990000,
              salePrice: 5490000,
              image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 4.8,
              reviewCount: 45,
              discount: 21,
              discountAmount: 1500000,
              stock: 150,
              totalStock: 150,
              soldStock: 90,
              remainingStock: 60,
              soldPercentage: 60,
              variants: [],
              isHot: false
            },
            {
              _id: '6',
              name: 'Samsung Galaxy Watch 6 Classic',
              price: 9990000,
              salePrice: 7990000,
              image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
              brand: { name: 'Samsung' },
              rating: 4.7,
              reviewCount: 32,
              discount: 20,
              discountAmount: 2000000,
              stock: 70,
              totalStock: 70,
              soldStock: 56,
              remainingStock: 14,
              soldPercentage: 80,
              variants: [],
              isHot: false
            },
            {
              _id: '7',
              name: 'MacBook Pro 14 inch M3',
              price: 49990000,
              salePrice: 42990000,
              image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
              brand: { name: 'Apple' },
              rating: 4.9,
              reviewCount: 18,
              discount: 14,
              discountAmount: 7000000,
              stock: 30,
              totalStock: 30,
              soldStock: 21,
              remainingStock: 9,
              soldPercentage: 70,
              variants: [],
              isHot: false
            },
            {
              _id: '8',
              name: 'Sony WH-1000XM5',
              price: 9990000,
              salePrice: 7990000,
              image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
              brand: { name: 'Sony' },
              rating: 4.8,
              reviewCount: 67,
              discount: 20,
              discountAmount: 2000000,
              stock: 90,
              totalStock: 90,
              soldStock: 72,
              remainingStock: 18,
              soldPercentage: 80,
              variants: [],
              isHot: false
            }
          ];
          setHotSaleProducts(demoProducts);
        } else {
          setHotSaleProducts(sortedProducts);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching hot sale products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotSaleProducts();
  }, []);


  const formatTime = (value: number) => value.toString().padStart(2, '0');

  // Handle Buy Now - Navigate to product detail
  const handleBuyNow = (product: Product) => {
    navigate(`/product/${product._id}`);
  };

  // Handle Add to Cart - Navigate to product detail
  const handleAddToCart = (product: Product) => {
    navigate(`/product/${product._id}`);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev >= hotSaleProducts.length - 5 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev <= 0 ? Math.max(0, hotSaleProducts.length - 5) : prev - 1
    );
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">Đang tải sản phẩm hot sale...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }

   return (
     <section className="py-20 relative overflow-hidden">
       {/* Background decoration */}
       <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50"></div>
       <div className="absolute inset-0">
         <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-red-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
         <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
         <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
       </div>
       
       <div className="container mx-auto px-4 relative z-10">
         <div className="bg-white/80 backdrop-blur-sm rounded-3xl relative overflow-hidden shadow-2xl border border-white/20">
           {/* Background decoration */}
           <div className="absolute top-0 left-0 w-full h-full">
             <div className="absolute top-10 left-10 w-32 h-32 bg-red-200 rounded-full opacity-20 animate-pulse"></div>
             <div className="absolute top-20 right-20 w-24 h-24 bg-orange-200 rounded-full opacity-30 animate-bounce"></div>
             <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-yellow-200 rounded-full opacity-25 animate-pulse"></div>
             <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-red-300 rounded-full opacity-15 animate-bounce"></div>
           </div>
           
           <div className="relative z-10 p-8">
        {/* Header with countdown */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-3xl p-8 mb-16 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between relative z-10">
            {/* Title */}
            <div className="flex items-center gap-6 mb-6 lg:mb-0">
              <div className="bg-white bg-opacity-20 p-4 rounded-full shadow-lg">
                <FaFire className="text-white text-5xl animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-1 rounded-full text-sm font-semibold mb-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  FLASH SALE
                </div>
                <h2 className="text-4xl lg:text-6xl font-bold text-white drop-shadow-2xl">
                  HOT SALE
                </h2>
                <p className="text-white/90 text-lg mt-2">Giảm giá sốc - Cơ hội vàng!</p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex flex-col items-center lg:items-end gap-4">
              <span className="text-white text-xl font-semibold">Kết thúc sau:</span>
              <div className="flex items-center gap-3 bg-white bg-opacity-20 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white border-opacity-30 shadow-xl">
                <div className="text-center">
                  <div className="text-white text-3xl font-bold drop-shadow-lg">{formatTime(timeLeft.days)}</div>
                  <div className="text-white/80 text-sm">NGÀY</div>
                </div>
                <div className="text-white text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="text-white text-3xl font-bold drop-shadow-lg">{formatTime(timeLeft.hours)}</div>
                  <div className="text-white/80 text-sm">GIỜ</div>
                </div>
                <div className="text-white text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="text-white text-3xl font-bold drop-shadow-lg">{formatTime(timeLeft.minutes)}</div>
                  <div className="text-white/80 text-sm">PHÚT</div>
                </div>
                <div className="text-white text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="text-white text-3xl font-bold drop-shadow-lg">{formatTime(timeLeft.seconds)}</div>
                  <div className="text-white/80 text-sm">GIÂY</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full opacity-10 transform translate-x-20 -translate-y-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full opacity-15 transform -translate-x-16 translate-y-16 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-orange-300 rounded-full opacity-20 transform -translate-x-12 -translate-y-12 animate-pulse"></div>
        </div>


        {/* Products Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-1 sm:left-2 lg:left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-red-500 to-orange-500 shadow-xl rounded-full p-1.5 sm:p-2 lg:p-3 hover:from-red-600 hover:to-orange-600 transition-all duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-1 sm:right-2 lg:right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-red-500 to-orange-500 shadow-xl rounded-full p-1.5 sm:p-2 lg:p-3 hover:from-red-600 hover:to-orange-600 transition-all duration-300 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
          </button>

          {/* Products Grid */}
          <div className="overflow-hidden px-6 sm:px-8 lg:px-12">
            <div 
              className="flex gap-1 sm:gap-2 lg:gap-3 transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 5)}%)` }}
            >
              {hotSaleProducts.slice(currentIndex, currentIndex + 5).map((product) => (
                <div key={product._id} className="flex-shrink-0 w-1/5 px-0.5 sm:px-1 lg:px-2">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 overflow-hidden group relative">
                    {/* Discount Badge */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        -{product.discount}%
                      </div>
                    </div>

                    {/* Product Image */}
                    <div 
                      className="relative h-32 sm:h-40 lg:h-48 bg-gray-50 overflow-hidden flex items-center justify-center cursor-pointer"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <img
                        src={product.image || (product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop')}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.log('Image failed to load:', e.currentTarget.src);
                          e.currentTarget.src = 'https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=No+Image';
                        }}
                        onLoad={() => {
                          // console.log('Image loaded successfully:', product.name);
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-2 sm:p-3 lg:p-4">
                      {/* Brand */}
                      <div className="text-xs text-gray-500 mb-1 hidden sm:block">{product.brand?.name || 'Brand'}</div>
                      
                      {/* Product Name */}
                      <h3 
                        className="font-semibold text-gray-900 mb-2 line-clamp-2 text-xs sm:text-sm leading-tight cursor-pointer hover:text-red-600 transition-colors duration-200"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        {product.name}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2 sm:mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-2 h-2 sm:w-3 sm:h-3 ${
                                i < Math.floor(product.rating || 4.8)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1 hidden sm:inline">
                          ({product.reviewCount || 0})
                        </span>
                      </div>

                      {/* Price Section */}
                      <div className="mb-2 sm:mb-3">
                        {/* Sale Price */}
                        <div className="text-sm sm:text-base lg:text-lg font-bold text-red-600 mb-1">
                          {product.salePrice?.toLocaleString('vi-VN')}₫
                        </div>
                        
                        {/* Original Price */}
                        <div className="text-xs sm:text-sm text-gray-500 line-through">
                          {product.price?.toLocaleString('vi-VN')}₫
                        </div>
                        
                        {/* Discount Amount */}
                        <div className="text-xs text-green-600 font-medium hidden sm:block">
                          Tiết kiệm: {product.discountAmount?.toLocaleString('vi-VN')}₫
                        </div>
                      </div>

                      {/* Stock Progress */}
                      <div className="mb-2 sm:mb-4 hidden sm:block">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">Đã bán: {product.soldPercentage}%</span>
                          <span className="text-xs text-red-600 font-medium">Còn {product.remainingStock}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${product.soldPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex gap-1 sm:gap-2">
                        <button 
                          onClick={() => handleBuyNow(product)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
                        >
                          Mua ngay
                        </button>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="bg-white border-2 border-red-500 text-red-500 py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95"
                        >
                          <FaShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-8 gap-3">
          {Array.from({ length: Math.ceil(hotSaleProducts.length / 5) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * 5)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / 5) === index 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-lg transform scale-125' 
                  : 'bg-white bg-opacity-60 hover:bg-opacity-80'
              }`}
            />
          ))}
         </div>
           </div>
         </div>
       </div>
     </section>
  );
};

export default HotSaleSection;
