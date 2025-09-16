import React, { useState, useEffect } from 'react';
import { FaChevronUp, FaHeadphones } from 'react-icons/fa';

const FloatingButtons: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleContact = () => {
    // Scroll to contact section
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If no contact section exists, show alert
      alert('Liên hệ với chúng tôi qua hotline: 1900-xxxx hoặc email: support@example.com');
    }
  };


  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-4">
      {/* Contact Button */}
      <button
        onClick={handleContact}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl group"
        title="Liên hệ với chúng tôi"
      >
        <FaHeadphones className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      {/* Scroll to Top Button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl group"
          title="Cuộn lên đầu trang"
        >
          <FaChevronUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default FloatingButtons;
