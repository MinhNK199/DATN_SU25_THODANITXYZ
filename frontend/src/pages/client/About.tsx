import React from 'react';
import { FaUsers, FaGlobe, FaAward, FaSmile, FaShieldAlt, FaTruck, FaHeadset, FaCreditCard, FaRocket, FaHeart, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const About: React.FC = () => {
  const navigate = useNavigate();
  
  const stats = [
    { icon: FaUsers, number: '100K+', label: 'Khách hàng tin tưởng' },
    { icon: FaGlobe, number: '63', label: 'Tỉnh thành phục vụ' },
    { icon: FaAward, number: '5+', label: 'Năm kinh nghiệm' },
    { icon: FaSmile, number: '98%', label: 'Tỷ lệ hài lòng' }
  ];

  const features = [
    {
      icon: FaShieldAlt,
      title: 'Mua sắm an toàn',
      description: 'Bảo mật thông tin khách hàng với công nghệ mã hóa SSL 256-bit'
    },
    {
      icon: FaTruck,
      title: 'Giao hàng siêu tốc',
      description: 'Miễn phí vận chuyển cho đơn hàng từ 300K, giao trong 24h'
    },
    {
      icon: FaHeadset,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ tư vấn chuyên nghiệp luôn sẵn sàng hỗ trợ'
    },
    {
      icon: FaCreditCard,
      title: 'Thanh toán đa dạng',
      description: 'Hỗ trợ COD, VNPay, MoMo, thẻ tín dụng và trả góp 0%'
    },
    {
      icon: FaRocket,
      title: 'Công nghệ tiên tiến',
      description: 'Luôn cập nhật những sản phẩm công nghệ mới nhất'
    },
    {
      icon: FaHeart,
      title: 'Chăm sóc khách hàng',
      description: 'Chính sách đổi trả linh hoạt và bảo hành chính hãng'
    }
  ];

  const team = [
    {
      name: 'Nguyễn Minh Khoa',
      position: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      description: 'Chuyên gia công nghệ với 10+ năm kinh nghiệm'
    },
    {
      name: 'Trần Thị Hương',
      position: 'CTO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      description: 'Chuyên gia phát triển hệ thống và AI'
    },
    {
      name: 'Lê Văn Đức',
      position: 'Head of Design',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      description: 'Chuyên gia UX/UI với tầm nhìn sáng tạo'
    },
    {
      name: 'Phạm Thị Linh',
      position: 'Marketing Director',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      description: 'Chuyên gia marketing số và thương hiệu'
    }
  ];

  const values = [
    {
      icon: FaStar,
      title: 'Chất lượng vượt trội',
      description: 'Chúng tôi chỉ bán những sản phẩm chính hãng, chất lượng cao nhất'
    },
    {
      icon: FaHeart,
      title: 'Tận tâm phục vụ',
      description: 'Khách hàng là trung tâm của mọi hoạt động kinh doanh'
    },
    {
      icon: FaRocket,
      title: 'Đổi mới liên tục',
      description: 'Luôn cập nhật và áp dụng công nghệ mới nhất'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <span className="text-sm font-medium">🏆 Thương hiệu uy tín #1 Việt Nam</span>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Về TechTrend Store
          </h1>
          <p className="text-xl max-w-4xl mx-auto leading-relaxed mb-8">
            Chúng tôi là đối tác tin cậy của bạn trong hành trình khám phá công nghệ. 
            Với sứ mệnh mang đến những sản phẩm điện tử chất lượng cao nhất, 
            chúng tôi cam kết cung cấp trải nghiệm mua sắm tuyệt vời cho mọi khách hàng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/products')}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Khám phá sản phẩm
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Liên hệ với chúng tôi
            </button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-500"></div>
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
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                📖 Câu chuyện của chúng tôi
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Từ ước mơ đến hiện thực
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Được thành lập vào năm 2019, <strong>TechTrend Store</strong> bắt đầu như một dự án đam mê của nhóm bạn trẻ 
                  yêu công nghệ. Với ước mơ mang đến cho người Việt những sản phẩm công nghệ chất lượng cao nhất 
                  với giá cả hợp lý.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Từ một cửa hàng nhỏ ở Hà Nội, chúng tôi đã phát triển thành một trong những 
                  <strong> thương hiệu điện tử uy tín hàng đầu Việt Nam</strong>, phục vụ khách hàng tại 63 tỉnh thành 
                  với hơn 100K+ khách hàng tin tưởng.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Chúng tôi tự hào là đối tác chính thức của các thương hiệu lớn như Apple, Samsung, 
                  Xiaomi, và nhiều nhãn hàng công nghệ khác, cam kết mang đến sản phẩm 
                  <strong> chính hãng 100%</strong> với dịch vụ bảo hành tốt nhất.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Khám phá sản phẩm
                </button>
                <button 
                  onClick={() => navigate('/contact')}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  Liên hệ chúng tôi
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Cửa hàng TechTrend Store"
                  className="rounded-3xl shadow-2xl w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-4xl font-bold text-blue-600 mb-2">5+</div>
                <div className="text-gray-600 font-medium">Năm phát triển</div>
                <div className="text-sm text-gray-500 mt-1">Từ 2019 đến nay</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-2xl font-bold">100K+</div>
                <div className="text-sm">Khách hàng</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              ✨ Tại sao chọn chúng tôi
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Dịch vụ vượt trội</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cam kết cung cấp trải nghiệm mua sắm tốt nhất với các sản phẩm cao cấp, 
              dịch vụ xuất sắc và chính sách ưu đãi hấp dẫn.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group text-center p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-white hover:from-blue-50 hover:to-purple-50 hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-white text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
              💎 Giá trị cốt lõi
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Những điều chúng tôi tin tưởng</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những giá trị này định hướng mọi hoạt động của chúng tôi và tạo nên sự khác biệt 
              trong cách chúng tôi phục vụ khách hàng.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              👥 Đội ngũ của chúng tôi
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Gặp gỡ những con người tài năng</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những con người đam mê đứng sau TechTrend Store, những người làm việc không mệt mỏi 
              để mang đến cho bạn trải nghiệm mua sắm tốt nhất và những sản phẩm công nghệ tuyệt vời.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative overflow-hidden rounded-3xl mb-6 shadow-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm font-medium">{member.description}</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{member.name}</h3>
                <p className="text-lg text-blue-600 font-semibold mb-2">{member.position}</p>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
            <span className="text-sm font-medium">🚀 Bắt đầu hành trình mua sắm của bạn</span>
          </div>
          <h2 className="text-6xl font-bold mb-8 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Sẵn sàng mua sắm?
          </h2>
          <p className="text-xl mb-12 max-w-4xl mx-auto leading-relaxed">
            Khám phá bộ sưu tập tuyệt vời các thiết bị điện tử cao cấp của chúng tôi và tận hưởng 
            trải nghiệm mua sắm tốt nhất với giá cả cạnh tranh và dịch vụ chuyên nghiệp.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => navigate('/products')}
              className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              🛒 Mua sắm ngay
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
            >
              📞 Liên hệ tư vấn
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100K+</div>
              <div className="text-blue-100">Khách hàng tin tưởng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">98%</div>
              <div className="text-blue-100">Tỷ lệ hài lòng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Hỗ trợ khách hàng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">5★</div>
              <div className="text-blue-100">Đánh giá trung bình</div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default About; 