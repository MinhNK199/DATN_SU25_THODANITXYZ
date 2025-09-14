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
      <section id="contact-section" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hỗ trợ khách hàng 24/7 với đội ngũ chuyên nghiệp
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <FaHeadset className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Hotline</h3>
              <p className="text-gray-600">1900-xxxx</p>
              <p className="text-sm text-gray-500">24/7 hỗ trợ</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                <FaGift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">support@example.com</p>
              <p className="text-sm text-gray-500">Phản hồi trong 24h</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                <FaUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat trực tuyến</h3>
              <p className="text-gray-600">Chat ngay</p>
              <p className="text-sm text-gray-500">Hỗ trợ tức thì</p>
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