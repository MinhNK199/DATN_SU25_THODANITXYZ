import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaPlay, FaArrowRight, FaStar, FaTruck, FaShieldAlt } from 'react-icons/fa';

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  badge?: string;
  features?: string[];
}

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'MacBook Pro 14" và 16"',
      subtitle: 'TỪ 32.990.000Đ',
      description: 'Chỉ cần đổi máy tính cũ lấy ưu đãi cho máy mới hoặc tái chế miễn phí. Tốt cho bạn và môi trường.',
      buttonText: 'Mua điện thoại',
      buttonLink: '/category/mobile',
      secondaryButtonText: 'Mua MacBook',
      secondaryButtonLink: '/category/laptop',
      badge: 'HÀNG MỚI',
      features: ['Miễn phí vận chuyển', 'Bảo hành 2 năm', 'Hỗ trợ 24/7']
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2029&q=80',
      title: 'Điện thoại mới nhất',
      subtitle: 'GIẢM ĐẾN 30%',
      description: 'Khám phá những điện thoại mới nhất với công nghệ tiên tiến và tính năng tuyệt vời.',
      buttonText: 'Mua ngay',
      buttonLink: '/category/mobile',
      badge: 'DEAL HOT',
      features: ['Miễn phí vận chuyển', 'Đảm bảo hoàn tiền', 'Trả góp 0%']
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80',
      title: 'Phụ kiện cao cấp',
      subtitle: 'HÀNG MỚI VỀ',
      description: 'Nâng cấp thiết bị của bạn với bộ sưu tập phụ kiện cao cấp của chúng tôi.',
      buttonText: 'Khám phá phụ kiện',
      buttonLink: '/category/accessories',
      badge: 'CAO CẤP',
      features: ['Chất lượng cao cấp', 'Giao hàng nhanh', 'Giá tốt nhất']
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-[700px] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-white">
                {/* Badge */}
                {slide.badge && (
                  <div className="mb-6">
                    <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                      {slide.badge}
                    </span>
                  </div>
                )}

                {/* Subtitle */}
                <div className="mb-4">
                  <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-lg">
                    {slide.subtitle}
                  </span>
                </div>
                
                {/* Title */}
                <h1 className="text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {slide.title}
                </h1>
                
                {/* Description */}
                <p className="text-xl mb-8 text-gray-200 leading-relaxed max-w-lg">
                  {slide.description}
                </p>

                {/* Features */}
                {slide.features && (
                  <div className="flex flex-wrap gap-4 mb-8">
                    {slide.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                        <FaStar className="text-yellow-400 w-4 h-4" />
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    to={slide.buttonLink}
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    <span>{slide.buttonText}</span>
                    <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  {slide.secondaryButtonText && (
                    <Link
                      to={slide.secondaryButtonLink || '#'}
                      className="group border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm"
                    >
                      <span>{slide.secondaryButtonText}</span>
                      <FaPlay className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 z-10 backdrop-blur-sm hover:scale-110"
      >
        <FaChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 z-10 backdrop-blur-sm hover:scale-110"
      >
        <FaChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125 shadow-lg'
                : 'bg-white/50 hover:bg-white/75 hover:scale-110'
            }`}
          />
        ))}
      </div>

      {/* Special Offer Banner */}
      <div className="absolute top-8 right-8 bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-10 transform rotate-3 hover:rotate-0 transition-transform duration-300">
        <div className="text-center">
          <div className="text-3xl font-bold">30%</div>
          <div className="text-sm font-semibold">GIẢM</div>
          <div className="text-xs opacity-90">BLACK FRIDAY</div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 animate-pulse delay-2000"></div>
    </div>
  );
};

export default HeroSlider; 