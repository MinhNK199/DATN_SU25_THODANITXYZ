import React from 'react';
import { FaUsers, FaGlobe, FaAward, FaSmile, FaShieldAlt, FaTruck, FaHeadset, FaCreditCard } from 'react-icons/fa';

const About: React.FC = () => {
  const stats = [
    { icon: FaUsers, number: '50K+', label: 'Khách hàng hài lòng' },
    { icon: FaGlobe, number: '100+', label: 'Quốc gia phục vụ' },
    { icon: FaAward, number: '15+', label: 'Năm kinh nghiệm' },
    { icon: FaSmile, number: '99%', label: 'Tỷ lệ hài lòng' }
  ];

  const features = [
    {
      icon: FaShieldAlt,
      title: 'Mua sắm an toàn',
      description: 'Dữ liệu của bạn được bảo vệ bằng bảo mật cấp độ ngân hàng'
    },
    {
      icon: FaTruck,
      title: 'Giao hàng nhanh',
      description: 'Miễn phí vận chuyển cho đơn hàng trên 500K toàn quốc'
    },
    {
      icon: FaHeadset,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ dịch vụ khách hàng luôn sẵn sàng hỗ trợ'
    },
    {
      icon: FaCreditCard,
      title: 'Thanh toán dễ dàng',
      description: 'Nhiều phương thức thanh toán cho sự thuận tiện của bạn'
    }
  ];

  const team = [
    {
      name: 'Nguyễn Văn A',
      position: 'CEO & Người sáng lập',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      name: 'Trần Thị B',
      position: 'CTO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
    },
    {
      name: 'Lê Văn C',
      position: 'Trưởng phòng Thiết kế',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
    },
    {
      name: 'Phạm Thị D',
      position: 'Giám đốc Marketing',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Về ElectronStore</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            Chúng tôi đam mê mang đến cho bạn những công nghệ mới nhất và tốt nhất. 
            Sứ mệnh của chúng tôi là làm cho các thiết bị điện tử cao cấp trở nên dễ tiếp cận với mọi người.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Được thành lập vào năm 2009, ElectronStore bắt đầu như một cửa hàng điện tử nhỏ với một ước mơ lớn: 
                làm cho công nghệ tiên tiến trở nên dễ tiếp cận với mọi người. Những gì bắt đầu như một dự án đam mê 
                đã phát triển thành một trong những nhà bán lẻ điện tử trực tuyến hàng đầu.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Ngày nay, chúng tôi phục vụ khách hàng tại hơn 100 quốc gia, cung cấp những smartphone, laptop, 
                máy tính bảng và phụ kiện mới nhất từ các thương hiệu đáng tin cậy nhất thế giới. Cam kết của chúng tôi 
                về chất lượng, dịch vụ khách hàng và giá cả cạnh tranh vẫn là trung tâm của mọi việc chúng tôi làm.
              </p>
              <div className="flex space-x-4">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  Tìm hiểu thêm
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-gray-400 transition-colors">
                  Liên hệ chúng tôi
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Cửa hàng của chúng tôi"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-blue-600">15+</div>
                <div className="text-gray-600">Năm xuất sắc</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại sao chọn chúng tôi</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết cung cấp trải nghiệm mua sắm tốt nhất với các sản phẩm cao cấp và dịch vụ xuất sắc.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Gặp gỡ đội ngũ của chúng tôi</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những con người đam mê đứng sau ElectronStore, những người làm việc không mệt mỏi để mang đến cho bạn trải nghiệm tốt nhất.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gray-600">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Sẵn sàng mua sắm?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Khám phá bộ sưu tập tuyệt vời các thiết bị điện tử cao cấp của chúng tôi và tận hưởng trải nghiệm mua sắm tốt nhất.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Mua sắm ngay
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Liên hệ bán hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 