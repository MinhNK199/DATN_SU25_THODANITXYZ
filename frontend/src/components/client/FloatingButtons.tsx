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
    // You can implement contact functionality here
    // For now, just scroll to a contact section or open a modal
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If no contact section exists, you could open a contact modal
      alert('Liên hệ với chúng tôi qua hotline: 1900-xxxx hoặc email: support@example.com');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Contact Button */}
      <button
        onClick={handleContact}
        className="bg-gray-800 hover:bg-gray-900 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl group"
        title="Liên hệ"
      >
        <FaHeadphones className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>

      {/* Scroll to Top Button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="bg-gray-800 hover:bg-gray-900 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl group"
          title="Lên đầu"
        >
          <FaChevronUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default FloatingButtons;
