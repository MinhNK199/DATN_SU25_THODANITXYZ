import React, { useState, useEffect } from 'react';
import { FaFire, FaGift, FaClock, FaPercent, FaArrowRight } from 'react-icons/fa';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  salePrice: number;
  endTime: string;
  image: string;
  type: 'flash-sale' | 'promo' | 'bundle';
  products: string[];
  soldCount: number;
  totalCount: number;
}

const PromotionBanner: React.FC = () => {
  const [currentPromotion, setCurrentPromotion] = useState<Promotion>({
    id: '1',
    title: 'FLASH SALE - iPhone 15 Pro Max',
    description: 'Giảm giá sốc 30% cho iPhone 15 Pro Max. Chỉ còn 50 sản phẩm!',
    discount: 30,
    originalPrice: 32990000,
    salePrice: 23093000,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    type: 'flash-sale',
    products: ['iPhone 15 Pro Max 256GB', 'iPhone 15 Pro Max 512GB'],
    soldCount: 23,
    totalCount: 50
  });

  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 45,
    seconds: 30
  });

  const [isVisible, setIsVisible] = useState(true);

  // Countdown timer - commented out for UI only
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     const now = new Date().getTime();
  //     const end = new Date(currentPromotion.endTime).getTime();
  //     const difference = end - now;

  //     if (difference > 0) {
  //       const hours = Math.floor(difference / (1000 * 60 * 60));
  //       const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  //       const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  //       setTimeLeft({ hours, minutes, seconds });
  //     } else {
  //       // Flash sale ended
  //       setCurrentPromotion(prev => ({
  //         ...prev,
  //         title: 'Flash Sale đã kết thúc!',
  //         description: 'Cảm ơn bạn đã tham gia. Hãy theo dõi các khuyến mãi tiếp theo!'
  //       }));
  //     }
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, [currentPromotion.endTime]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  const progressPercentage = (currentPromotion.soldCount / currentPromotion.totalCount) * 100;

  const promotions = [
    {
      id: '1',
      title: 'FLASH SALE - iPhone 15 Pro Max',
      description: 'Giảm giá sốc 30% cho iPhone 15 Pro Max. Chỉ còn 50 sản phẩm!',
      discount: 30,
      originalPrice: 32990000,
      salePrice: 23093000,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      type: 'flash-sale' as const,
      products: ['iPhone 15 Pro Max 256GB', 'iPhone 15 Pro Max 512GB'],
      soldCount: 23,
      totalCount: 50
    },
    {
      id: '2',
      title: 'Bundle Deal - MacBook + AirPods',
      description: 'Mua MacBook Pro M3 + AirPods Pro 2, tiết kiệm 5 triệu đồng!',
      discount: 15,
      originalPrice: 45990000,
      salePrice: 39091500,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      type: 'bundle' as const,
      products: ['MacBook Pro 14" M3', 'AirPods Pro 2'],
      soldCount: 8,
      totalCount: 20
    },
    {
      id: '3',
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Giảm giá 20% cho Samsung Galaxy S24 Ultra. Tặng kèm Galaxy Buds!',
      discount: 20,
      originalPrice: 27990000,
      salePrice: 22392000,
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
      type: 'promo' as const,
      products: ['Samsung Galaxy S24 Ultra 512GB'],
      soldCount: 15,
      totalCount: 30
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-40 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-black bg-opacity-20 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <FaFire className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-white font-bold text-lg">{currentPromotion.title}</h2>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Product Info */}
            <div className="flex space-x-4">
              <div className="relative">
                <img
                  src={currentPromotion.image}
                  alt={currentPromotion.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{currentPromotion.discount}%
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-white text-sm mb-2">{currentPromotion.description}</p>
                
                {/* Price */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(currentPromotion.salePrice)}
                  </span>
                  <span className="text-lg text-gray-200 line-through">
                    {formatPrice(currentPromotion.originalPrice)}
                  </span>
                  <span className="bg-yellow-400 text-red-600 px-2 py-1 rounded text-sm font-bold">
                    Tiết kiệm {formatPrice(currentPromotion.originalPrice - currentPromotion.salePrice)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-white text-sm mb-1">
                    <span>Đã bán: {currentPromotion.soldCount}/{currentPromotion.totalCount}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Products */}
                <div className="text-white text-sm">
                  <span className="font-medium">Sản phẩm:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentPromotion.products.map((product, index) => (
                      <span key={index} className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Countdown & Actions */}
            <div className="flex flex-col justify-between">
              {/* Countdown Timer */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <FaClock className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">Kết thúc sau:</span>
                </div>
                <div className="flex space-x-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center min-w-[60px]">
                    <div className="text-2xl font-bold text-white">{formatTime(timeLeft.hours)}</div>
                    <div className="text-xs text-gray-200">Giờ</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center min-w-[60px]">
                    <div className="text-2xl font-bold text-white">{formatTime(timeLeft.minutes)}</div>
                    <div className="text-xs text-gray-200">Phút</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center min-w-[60px]">
                    <div className="text-2xl font-bold text-white">{formatTime(timeLeft.seconds)}</div>
                    <div className="text-xs text-gray-200">Giây</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={() => console.log('Buy now clicked')}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-600 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <FaGift className="w-5 h-5" />
                  <span>MUA NGAY</span>
                  <FaArrowRight className="w-4 h-4" />
                </button>
                
                <button 
                  onClick={() => console.log('View details clicked')}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Xem chi tiết
                </button>
              </div>

              {/* Additional Promotions */}
              <div className="mt-4">
                <div className="flex space-x-2">
                  {promotions.slice(1).map((promo) => (
                    <button
                      key={promo.id}
                      onClick={() => {
                        setCurrentPromotion(promo);
                        console.log('Switch to promotion:', promo.title);
                      }}
                      className={`flex-1 p-2 rounded-lg text-xs font-medium transition-colors ${
                        currentPromotion.id === promo.id
                          ? 'bg-white text-red-600'
                          : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <FaPercent className="w-3 h-3" />
                        <span>-{promo.discount}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-black bg-opacity-20 px-6 py-2">
          <div className="flex items-center justify-center space-x-2 text-white text-sm">
            <FaFire className="w-4 h-4 text-yellow-400" />
            <span>🔥 Chỉ còn {currentPromotion.totalCount - currentPromotion.soldCount} sản phẩm!</span>
            <FaFire className="w-4 h-4 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionBanner; 