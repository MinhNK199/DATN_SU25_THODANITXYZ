import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Điện thoại',
      details: ['+84 (28) 123-4567', '+84 (28) 987-6543'],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      details: ['support@techtrend.com', 'sales@techtrend.com'],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Địa chỉ',
      details: ['123 Đường Công nghệ, Quận 1', 'TP. Hồ Chí Minh, Việt Nam'],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FaClock,
      title: 'Giờ làm việc',
      details: ['Thứ 2 - Thứ 6: 8:00 - 18:00', 'Thứ 7 - Chủ nhật: 9:00 - 16:00'],
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com/techtrendstore', label: 'Facebook' },
    { icon: FaTwitter, href: 'https://twitter.com/techtrendstore', label: 'Twitter' },
    { icon: FaInstagram, href: 'https://instagram.com/techtrendstore', label: 'Instagram' },
    { icon: FaLinkedin, href: 'https://linkedin.com/company/techtrendstore', label: 'LinkedIn' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await axios.post('/api/contact/send', formData);
      
      if (response.data.success) {
        setSubmitStatus('success');
        setSubmitMessage(response.data.message);
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(response.data.message || 'Có lỗi xảy ra khi gửi tin nhắn');
      }
    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(
        error.response?.data?.message || 
        'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Liên hệ TechTrend Store</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Có câu hỏi về sản phẩm? Cần hỗ trợ kỹ thuật? Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Gửi tin nhắn và chúng tôi sẽ phản hồi trong vòng 24 giờ.
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
              
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{submitMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{submitMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
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
                    <option value="support">Hỗ trợ kỹ thuật</option>
                    <option value="sales">Câu hỏi về bán hàng</option>
                    <option value="billing">Vấn đề thanh toán</option>
                    <option value="partnership">Hợp tác</option>
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
                    placeholder="Hãy cho chúng tôi biết chúng tôi có thể giúp gì cho bạn..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="w-5 h-5" />
                      <span>Gửi tin nhắn</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              {/* Map */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-64 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3251290358!2d106.6641!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b90b68bd3%3A0x8d0a16ebc3d161c!2zMTIzIMSQxrDhu51uZyBDw7RuZyBuZ2jhu4cgVGjDoG5oIHBo4buRIEjDgSB0w6J5IGjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1634567890123!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="TechTrend Store Location"
                    className="rounded-lg"
                  ></iframe>
                  <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md">
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">TechTrend Store</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">123 Đường Công nghệ, Quận 1, TP.HCM</p>
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
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
                <p className="text-gray-600 mt-4">
                  Theo dõi chúng tôi trên mạng xã hội để cập nhật những sản phẩm mới nhất và ưu đãi đặc biệt.
                </p>
              </div>

              {/* FAQ Link */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Câu hỏi thường gặp</h3>
                <p className="text-gray-600 mb-4">
                  Tìm câu trả lời cho những câu hỏi thường gặp về sản phẩm, dịch vụ và chính sách của chúng tôi.
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
              Chúng tôi cung cấp nhiều cách để bạn có thể liên hệ với chúng tôi. Chọn cách thuận tiện nhất cho bạn.
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
              <p className="text-lg font-semibold text-blue-600">+84 (24) 123-4567</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gửi email</h3>
              <p className="text-gray-600 mb-4">
                Gửi email cho chúng tôi và nhận phản hồi trong vòng 24 giờ
              </p>
              <p className="text-lg font-semibold text-blue-600">support@electronstore.com</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMapMarkerAlt className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Đến cửa hàng</h3>
              <p className="text-gray-600 mb-4">
                Ghé thăm cửa hàng của chúng tôi để trải nghiệm trực tiếp
              </p>
              <p className="text-lg font-semibold text-blue-600">123 Đường Công nghệ, Q1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 