import React, { useState, useEffect } from 'react';
import { FaCookieBite, FaTimes, FaShieldAlt } from 'react-icons/fa';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookieConsent');
    if (!hasAccepted) {
      // Show cookie consent after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl transform transition-transform duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
          {/* Cookie Icon and Message */}
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">
              <FaCookieBite className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Chúng tôi sử dụng cookie và các công nghệ tương tự để cá nhân hóa nội dung, 
                tùy chỉnh và đo lường quảng cáo, đồng thời cung cấp trải nghiệm tốt hơn. 
                Bằng cách nhấp "Chấp nhận tất cả", bạn đồng ý với việc sử dụng cookie của chúng tôi. 
                Bạn có thể tìm hiểu thêm trong{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                  Chính sách bảo mật
                </a>
                .
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Từ chối
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-300 flex items-center space-x-2"
            >
              <FaShieldAlt className="w-4 h-4" />
              <span>Chấp nhận tất cả</span>
            </button>
            <button
              onClick={handleDecline}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Đóng"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 