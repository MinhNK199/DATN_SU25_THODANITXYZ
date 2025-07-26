import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";
import { Banner } from "../../interfaces/Banner";
import moment from "moment";

const HeroSlider: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/banner");
        const data = await res.json();

        const today = moment();
        const filtered = data.banners.filter((banner: Banner) => {
          const start = banner.startDate ? moment(banner.startDate) : null;
          const end = banner.endDate ? moment(banner.endDate) : null;
          return (
            banner.isActive &&
            (!start || today.isSameOrAfter(start, "day")) &&
            (!end || today.isSameOrBefore(end, "day"))
          );
        });

        setBanners(filtered);
      } catch (error) {
        console.error("Failed to fetch banners", error);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-[700px] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      {banners.map((slide, index) => (
        <div
          key={slide._id || index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </div>

          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-white">
                {slide.badge && (
                  <div className="mb-6">
                    <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                      {slide.badge}
                    </span>
                  </div>
                )}

                {slide.subtitle && (
                  <div className="mb-4">
                    <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-6 shadow-lg">
                      {slide.subtitle}
                    </span>
                  </div>
                )}

                <h1 className="text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {slide.title}
                </h1>

                {slide.description && (
                  <p className="text-xl mb-8 text-gray-200 leading-relaxed max-w-lg line-clamp-4">
                    {slide.description}
                  </p>
                )}

                {slide.features?.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-8">
                    {slide.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                      >
                        <FaStar className="text-yellow-400 w-4 h-4" />
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {slide.buttonText && slide.buttonLink && (
                    <Link
                      to={slide.buttonLink}
                      className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      <span>{slide.buttonText}</span>
                      <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

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

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white scale-125 shadow-lg"
                : "bg-white/50 hover:bg-white/75 hover:scale-110"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
