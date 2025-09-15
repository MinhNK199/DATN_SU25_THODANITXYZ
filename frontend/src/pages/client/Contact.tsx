import React, { useState, useEffect } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane, FaYoutube } from 'react-icons/fa';
import { getSettings } from '../../services/settingsService';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [settings, setSettings] = useState({
    contactPhone: '+84 123 456 789',
    contactEmail: 'support@techtrend.vn',
    contactAddress: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh, Việt Nam',
    socialFacebook: '#',
    socialTwitter: '#',
    socialInstagram: '#',
    socialYoutube: '#',
    socialLinkedin: '#'
  });

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Điện thoại',
      details: [settings.contactPhone, '+84 987 654 321'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      details: [settings.contactEmail, 'info@techtrend.vn'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Địa chỉ',
      details: [settings.contactAddress],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FaClock,
      title: 'Giờ làm việc',
      details: ['Thứ 2 - Thứ 6: 8:00 - 20:00', 'Thứ 7: 8:00 - 18:00', 'Chủ nhật: 9:00 - 17:00'],
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const socialLinks = [
    { icon: FaFacebook, href: settings.socialFacebook, label: 'Facebook' },
    { icon: FaTwitter, href: settings.socialTwitter, label: 'Twitter' },
    { icon: FaInstagram, href: settings.socialInstagram, label: 'Instagram' },
    { icon: FaYoutube, href: settings.socialYoutube, label: 'YouTube' },
    { icon: FaLinkedin, href: settings.socialLinkedin, label: 'LinkedIn' }
  ];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await getSettings();
        setSettings(prev => ({
          ...prev,
          contactPhone: settingsData.contactPhone || prev.contactPhone,
          contactEmail: settingsData.contactEmail || prev.contactEmail,
          contactAddress: settingsData.contactAddress || prev.contactAddress,
          socialFacebook: settingsData.socialFacebook || prev.socialFacebook,
          socialTwitter: settingsData.socialTwitter || prev.socialTwitter,
          socialInstagram: settingsData.socialInstagram || prev.socialInstagram,
          socialYoutube: settingsData.socialYoutube || prev.socialYoutube,
          socialLinkedin: settingsData.socialLinkedin || prev.socialLinkedin
        }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement contact form submission API
      console.log('Form submitted:', formData);
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Liên hệ TechTrend</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Có câu hỏi về sản phẩm công nghệ? Chúng tôi rất muốn nghe từ bạn. 
            Gửi tin nhắn cho chúng tôi và chúng tôi sẽ phản hồi sớm nhất có thể.
          </p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className={`bg-gradient-to-r ${info.color} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600">{detail}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Form & Map */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập họ và tên của bạn"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="general">Thắc mắc chung</option>
                    <option value="product">Tư vấn sản phẩm</option>
                    <option value="order">Hỗ trợ đơn hàng</option>
                    <option value="technical">Hỗ trợ kỹ thuật</option>
                    <option value="warranty">Bảo hành sản phẩm</option>
                    <option value="billing">Vấn đề thanh toán</option>
                    <option value="partnership">Hợp tác kinh doanh</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Tin nhắn *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Hãy cho chúng tôi biết về sản phẩm công nghệ bạn quan tâm hoặc vấn đề cần hỗ trợ..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <FaPaperPlane className="w-5 h-5" />
                  <span>Gửi tin nhắn</span>
                </button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Map */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-64 bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <FaMapMarkerAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Bản đồ tương tác sắp ra mắt</p>
                    <p className="text-sm text-gray-500">{settings.contactAddress}</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Theo dõi chúng tôi</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
                <p className="text-gray-600 mt-4">
                  Theo dõi TechTrend trên mạng xã hội để cập nhật những sản phẩm công nghệ mới nhất và ưu đãi đặc biệt.
                </p>
              </div>

              {/* FAQ Link */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Câu hỏi thường gặp</h3>
                <p className="text-gray-600 mb-4">
                  Tìm câu trả lời cho những câu hỏi thường gặp về sản phẩm công nghệ, dịch vụ và chính sách của TechTrend.
                </p>
                <a
                  href="/faq"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <span>Xem FAQ</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Contact Info */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Các cách liên hệ khác</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              TechTrend cung cấp nhiều cách để bạn có thể liên hệ với chúng tôi. Chọn cách thuận tiện nhất cho bạn.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPhone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gọi điện thoại</h3>
              <p className="text-gray-600 mb-4">
                Gọi trực tiếp cho chúng tôi để được tư vấn nhanh chóng
              </p>
              <p className="text-lg font-semibold text-blue-600">{settings.contactPhone}</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gửi email</h3>
              <p className="text-gray-600 mb-4">
                Gửi email cho chúng tôi và nhận phản hồi trong vòng 24 giờ
              </p>
              <p className="text-lg font-semibold text-blue-600">{settings.contactEmail}</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Đến cửa hàng</h3>
              <p className="text-gray-600 mb-4">
                Ghé thăm cửa hàng của chúng tôi để trải nghiệm trực tiếp
              </p>
              <p className="text-lg font-semibold text-blue-600">{settings.contactAddress.split(',')[0]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 