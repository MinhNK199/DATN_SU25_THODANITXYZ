import React from 'react';
import HeroSlider from '../../components/client/HeroSlider';
import FeaturedProductsSection from '../../components/client/FeaturedProductsSection';
import HotSaleSection from '../../components/client/HotSaleSection';
import AccessoriesSection from '../../components/client/AccessoriesSection';
import RecommendedProductsSection from '../../components/client/RecommendedProductsSection';
import FloatingButtons from '../../components/client/FloatingButtons';
import { FaGift, FaHeadset, FaUsers } from 'react-icons/fa';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSlider />

      {/* Accessories Section */}
      <AccessoriesSection />

      {/* Hot Sale Section */}
      <HotSaleSection />

      {/* Featured Products Section */}
      <FeaturedProductsSection />

      {/* Recommended Products Section */}
      <RecommendedProductsSection />

      {/* Contact Section */}
      <section id="contact-section" className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-pink-600 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              SUPPORT CENTER
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Liên hệ với chúng tôi
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Hỗ trợ khách hàng 24/7 với đội ngũ chuyên nghiệp, sẵn sàng giải đáp mọi thắc mắc
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <FaHeadset className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Hotline</h3>
              <p className="text-2xl font-bold text-blue-400 mb-2">1900-1234</p>
              <p className="text-gray-300">24/7 hỗ trợ</p>
            </div>
            <div className="group text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <FaGift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Email</h3>
              <p className="text-lg font-semibold text-emerald-400 mb-2">support@techtrend.com</p>
              <p className="text-gray-300">Phản hồi trong 24h</p>
            </div>
            <div className="group text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <FaUsers className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Chat trực tuyến</h3>
              <p className="text-lg font-semibold text-purple-400 mb-2">Chat ngay</p>
              <p className="text-gray-300">Hỗ trợ tức thì</p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Buttons */}
      <FloatingButtons />
    </div>
  );
};

export default Home; 