import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaSearch, FaShoppingCart, FaExclamationTriangle, FaRocket, FaMagic, FaGift, FaHeart } from 'react-icons/fa';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [bounce, setBounce] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [funnyMessages] = useState([
    "Oops! Robot đã bị lỗi hệ thống! 🤖❌",
    "Trang này không thể kết nối được! ⚡💔",
    "404 - Trang không tìm thấy, nhưng robot vẫn yêu bạn! 💕",
    "Có vẻ như có vấn đề với kết nối! 🔌⚡",
    "Robot cần một adapter đặc biệt! 🔌🔧",
    "Oops! Có vẻ như robot bị lỗi! 😅⚡",
    "Robot cần được sửa chữa! 🔧🔌",
    "404 - Trang không tìm thấy, hãy thử robot khác! 🤖✨"
  ]);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    // Bounce animation
    setBounce(true);
    const timer = setTimeout(() => setBounce(false), 1000);

    // Change message every 3 seconds
    const messageTimer = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % funnyMessages.length);
    }, 3000);

    // Create sparkles
    const createSparkles = () => {
      const newSparkles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setSparkles(newSparkles);
    };

    createSparkles();
    const sparkleTimer = setInterval(createSparkles, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(messageTimer);
      clearInterval(sparkleTimer);
    };
  }, [funnyMessages.length]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {Array.from({ length: 400 }).map((_, i) => (
              <div
                key={i}
                className="border border-cyan-400/30 animate-pulse"
                style={{
                  animationDelay: `${i * 0.01}s`,
                  animationDuration: '3s'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Floating tech particles */}
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-80"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              animationDelay: `${sparkle.id * 0.1}s`
            }}
          />
        ))}
        
        {/* Holographic elements */}
        <div className="absolute top-10 left-10 w-32 h-32 border border-cyan-400/50 rounded-full opacity-30 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute top-20 right-20 w-24 h-24 border border-purple-400/50 rounded-full opacity-30 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        <div className="absolute bottom-20 left-20 w-40 h-40 border border-pink-400/50 rounded-full opacity-30 animate-spin" style={{ animationDuration: '25s' }} />
        <div className="absolute bottom-10 right-10 w-28 h-28 border border-green-400/50 rounded-full opacity-30 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }} />
        
        {/* Scanning lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-2/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* 404 Icon with Person Holding Plug - BIGGER & CUTER */}
        <div className="mb-8">
          <div className="relative">
            {/* Mischievous Robot SVG - TECH & PLAYFUL */}
            <div className="w-80 h-80 mx-auto relative">
              <svg
                viewBox="0 0 300 300"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Tech background decorations */}
                <circle cx="50" cy="50" r="6" fill="#00FFFF" className="animate-ping" />
                <circle cx="250" cy="80" r="4" fill="#FF00FF" className="animate-ping" style={{ animationDelay: '0.5s' }} />
                <circle cx="80" cy="250" r="5" fill="#00FF00" className="animate-ping" style={{ animationDelay: '1s' }} />
                <circle cx="220" cy="220" r="3" fill="#FFFF00" className="animate-ping" style={{ animationDelay: '1.5s' }} />
                
                {/* Robot body - futuristic blue */}
                <rect x="120" y="160" width="60" height="80" rx="10" fill="#1E40AF" />
                <rect x="125" y="165" width="50" height="70" rx="5" fill="#3B82F6" />
                
                {/* Robot head - rectangular with tech details */}
                <rect x="110" y="100" width="80" height="60" rx="15" fill="#1E40AF" />
                <rect x="115" y="105" width="70" height="50" rx="10" fill="#3B82F6" />
                
                {/* Robot antenna with blinking light */}
                <line x1="150" y1="100" x2="150" y2="80" stroke="#FFD700" strokeWidth="3" />
                <circle cx="150" cy="75" r="4" fill="#FFD700" className="animate-pulse" />
                
                {/* Robot eyes - one normal, one X (broken) */}
                <circle cx="130" cy="125" r="8" fill="#00FFFF" />
                <circle cx="130" cy="125" r="5" fill="#000" />
                <circle cx="170" cy="125" r="8" fill="#FF0000" />
                <text x="170" y="130" textAnchor="middle" fontSize="12" fill="#FFF" fontWeight="bold">X</text>
                
                {/* Robot mouth - mischievous grin */}
                <path
                  d="M125 140 Q150 150 175 140"
                  stroke="#00FFFF"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Tongue sticking out */}
                <ellipse cx="150" cy="145" rx="4" ry="2" fill="#FF69B4" />
                
                {/* Robot arms - one holding wrench, one sparking */}
                <rect x="90" y="170" width="20" height="40" rx="10" fill="#1E40AF" />
                <rect x="190" y="170" width="20" height="40" rx="10" fill="#1E40AF" />
                
                {/* Left hand holding wrench */}
                <circle cx="100" cy="200" r="8" fill="#3B82F6" />
                <rect x="95" y="195" width="10" height="15" rx="2" fill="#FFD700" transform="rotate(45 100 200)" />
                
                {/* Right hand with electric sparks */}
                <circle cx="200" cy="200" r="8" fill="#3B82F6" />
                <g className="animate-ping">
                  <path d="M200 200 L205 195 M200 200 L195 195" stroke="#00FFFF" strokeWidth="2" />
                  <path d="M200 200 L210 200 M200 200 L190 200" stroke="#00FFFF" strokeWidth="2" />
                  <path d="M200 200 L205 205 M200 200 L195 205" stroke="#00FFFF" strokeWidth="2" />
                </g>
                
                {/* Robot chest panel - open with gears */}
                <rect x="135" y="180" width="30" height="40" rx="5" fill="#000" />
                <rect x="140" y="185" width="20" height="30" rx="3" fill="#FFD700" />
                {/* Gears inside */}
                <circle cx="150" cy="200" r="6" fill="#000" stroke="#00FFFF" strokeWidth="1" />
                <circle cx="150" cy="200" r="3" fill="#00FFFF" />
                <rect x="147" y="185" width="6" height="30" fill="#00FFFF" />
                <rect x="140" y="197" width="20" height="6" fill="#00FFFF" />
                
                {/* Robot legs */}
                <rect x="125" y="240" width="15" height="30" rx="5" fill="#1E40AF" />
                <rect x="160" y="240" width="15" height="30" rx="5" fill="#1E40AF" />
                
                {/* Robot feet */}
                <ellipse cx="132" cy="275" rx="10" ry="5" fill="#3B82F6" />
                <ellipse cx="167" cy="275" rx="10" ry="5" fill="#3B82F6" />
                
                {/* Error indicators */}
                <g className="animate-pulse">
                  <text x="150" y="50" textAnchor="middle" fontSize="16" fill="#FF0000" fontWeight="bold">⚠️</text>
                  <text x="150" y="70" textAnchor="middle" fontSize="12" fill="#00FFFF">SYSTEM ERROR</text>
                </g>
                
                {/* Tech debris around robot */}
                <rect x="60" y="200" width="8" height="8" fill="#00FFFF" className="animate-bounce" />
                <rect x="230" y="180" width="6" height="6" fill="#FF00FF" className="animate-bounce" style={{ animationDelay: '0.3s' }} />
                <rect x="70" y="220" width="4" height="4" fill="#00FF00" className="animate-bounce" style={{ animationDelay: '0.6s' }} />
                <rect x="220" y="240" width="5" height="5" fill="#FFFF00" className="animate-bounce" style={{ animationDelay: '0.9s' }} />
                
                {/* Circuit patterns */}
                <path d="M50 150 L80 150 M50 160 L80 160" stroke="#00FFFF" strokeWidth="1" opacity="0.5" />
                <path d="M220 150 L250 150 M220 160 L250 160" stroke="#00FFFF" strokeWidth="1" opacity="0.5" />
                
                {/* Holographic effect lines */}
                <line x1="0" y1="100" x2="300" y2="100" stroke="#00FFFF" strokeWidth="1" opacity="0.3" className="animate-pulse" />
                <line x1="0" y1="200" x2="300" y2="200" stroke="#00FFFF" strokeWidth="1" opacity="0.3" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
              </svg>
            </div>
            
            {/* Floating tech elements around the robot */}
            <div className="absolute -top-8 -left-8 w-8 h-8 text-cyan-400 animate-ping" style={{ animationDelay: '0.5s' }}>
              <FaRocket />
            </div>
            <div className="absolute -top-4 -right-12 w-6 h-6 text-purple-400 animate-ping" style={{ animationDelay: '1s' }}>
              <FaMagic />
            </div>
            <div className="absolute -bottom-4 -left-4 w-7 h-7 text-pink-400 animate-ping" style={{ animationDelay: '1.5s' }}>
              <FaGift />
            </div>
            <div className="absolute -top-6 -right-6 w-5 h-5 text-yellow-400 animate-ping" style={{ animationDelay: '2s' }}>
              <FaHeart />
            </div>
            <div className="absolute -bottom-6 -right-8 w-6 h-6 text-green-400 animate-ping" style={{ animationDelay: '2.5s' }}>
              <FaRocket />
            </div>
            
            
            {/* Robot's speech bubble */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border-2 border-cyan-400/50">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🤖</span>
                <span className="text-sm font-bold text-cyan-300">Oops! System malfunction!</span>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-cyan-400/50"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 404 Text with Futuristic Animation */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4 transform hover:scale-110 transition-transform duration-300 animate-pulse">
            4<span className="text-cyan-400 animate-pulse">0</span>4
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-cyan-300 mb-4 animate-fade-in">
            {funnyMessages[currentMessage]}
          </h2>
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 mb-4 shadow-lg border-2 border-cyan-400/50 relative overflow-hidden">
            {/* Holographic effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>
            <div className="relative z-10">
              <p className="text-lg text-cyan-200 mb-2">
                Đừng lo lắng! Có vẻ như robot bị lỗi hệ thống, nhưng chúng tôi sẽ giúp bạn tìm đường về nhà! 🏠🤖
              </p>
              <p className="text-sm text-gray-300">
                Có thể robot cần một bản cập nhật đặc biệt, nhưng chúng ta vẫn có thể tìm thấy những điều tuyệt vời khác! ✨⚡
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons with Futuristic Effects */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button
            onClick={handleGoBack}
            className="group flex items-center px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-cyan-300 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border border-cyan-400/50 hover:border-cyan-400 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaArrowLeft className="w-4 h-4 mr-2 group-hover:animate-bounce relative z-10" />
            <span className="relative z-10">Quay lại</span>
          </button>
          
          <Link
            to="/"
            className="group flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border border-cyan-400/50 hover:border-cyan-400 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaHome className="w-4 h-4 mr-2 group-hover:animate-bounce relative z-10" />
            <span className="relative z-10">Về trang chủ</span>
          </Link>
          
          <Link
            to="/products"
            className="group flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 border border-purple-400/50 hover:border-purple-400 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaShoppingCart className="w-4 h-4 mr-2 group-hover:animate-bounce relative z-10" />
            <span className="relative z-10">Xem sản phẩm</span>
          </Link>
        </div>

        {/* Search Box with Futuristic Effects */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8 border-2 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <FaMagic className="w-5 h-5 text-cyan-400 mr-2 animate-spin" />
              <h3 className="text-lg font-semibold text-cyan-300">
                Tìm kiếm sản phẩm công nghệ ✨
              </h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập tên sản phẩm... (Hãy thử tìm kiếm điều gì đó tuyệt vời!)"
                className="flex-1 px-4 py-2 bg-slate-700/50 border-2 border-cyan-400/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 hover:border-cyan-400 text-cyan-200 placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const searchTerm = (e.target as HTMLInputElement).value;
                    if (searchTerm.trim()) {
                      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  const searchTerm = input.value;
                  if (searchTerm.trim()) {
                    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-cyan-400/50 hover:border-cyan-400"
              >
                <FaSearch className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Popular Links with Futuristic Effects */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border-2 border-purple-400/50 hover:border-purple-400 transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-cyan-400/10 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-4">
              <FaGift className="w-5 h-5 text-purple-400 mr-2 animate-bounce" />
              <h3 className="text-lg font-semibold text-purple-300">
                Các trang tuyệt vời khác 🎁
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/products"
                className="group p-3 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 hover:from-cyan-500/30 hover:to-purple-500/30 rounded-lg transition-all duration-300 text-sm font-medium text-cyan-300 hover:text-cyan-200 transform hover:scale-105 hover:shadow-md border border-cyan-400/30 hover:border-cyan-400/50"
              >
                <div className="flex items-center">
                  <FaShoppingCart className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  Sản phẩm
                </div>
              </Link>
              <Link
                to="/about"
                className="group p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg transition-all duration-300 text-sm font-medium text-purple-300 hover:text-purple-200 transform hover:scale-105 hover:shadow-md border border-purple-400/30 hover:border-purple-400/50"
              >
                <div className="flex items-center">
                  <FaHeart className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  Giới thiệu
                </div>
              </Link>
              <Link
                to="/contact"
                className="group p-3 bg-gradient-to-r from-pink-600/20 to-cyan-600/20 hover:from-pink-500/30 hover:to-cyan-500/30 rounded-lg transition-all duration-300 text-sm font-medium text-pink-300 hover:text-pink-200 transform hover:scale-105 hover:shadow-md border border-pink-400/30 hover:border-pink-400/50"
              >
                <div className="flex items-center">
                  <FaMagic className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  Liên hệ
                </div>
              </Link>
              <Link
                to="/faq"
                className="group p-3 bg-gradient-to-r from-cyan-600/20 to-green-600/20 hover:from-cyan-500/30 hover:to-green-500/30 rounded-lg transition-all duration-300 text-sm font-medium text-cyan-300 hover:text-cyan-200 transform hover:scale-105 hover:shadow-md border border-cyan-400/30 hover:border-cyan-400/50"
              >
                <div className="flex items-center">
                  <FaRocket className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  FAQ
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer with Futuristic Message */}
        <div className="mt-8 text-sm text-gray-400">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-cyan-400/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-purple-400/5 to-pink-400/5 animate-pulse"></div>
            <p className="text-center relative z-10">
              <span className="text-lg">💕</span> Nếu bạn cho rằng đây là lỗi, vui lòng{' '}
              <Link to="/contact" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline">
                liên hệ với chúng tôi
              </Link>
              {' '}để chúng tôi có thể giúp bạn! <span className="text-lg">✨</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
