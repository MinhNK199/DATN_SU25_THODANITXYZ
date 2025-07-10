import React, { useState } from 'react';
import { FaSearch, FaChevronDown, FaChevronUp, FaQuestionCircle, FaShippingFast, FaCreditCard, FaShieldAlt, FaUndo } from 'react-icons/fa';

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqCategories = [
    {
      title: 'Câu hỏi chung',
      icon: FaQuestionCircle,
      items: [
        {
          question: 'ElectronStore là gì?',
          answer: 'ElectronStore là một nhà bán lẻ điện tử trực tuyến cao cấp chuyên về smartphone, laptop, máy tính bảng và phụ kiện mới nhất từ các thương hiệu hàng đầu thế giới.'
        },
        {
          question: 'Làm thế nào để tạo tài khoản?',
          answer: 'Bạn có thể tạo tài khoản bằng cách nhấp vào nút "Đăng ký" trong menu điều hướng. Chỉ cần cung cấp email, mật khẩu và thông tin cơ bản để bắt đầu.'
        },
        {
          question: 'Tôi có thể mua sắm mà không cần tạo tài khoản không?',
          answer: 'Có, bạn có thể duyệt và thêm sản phẩm vào giỏ hàng mà không cần tài khoản. Tuy nhiên, tạo tài khoản cho phép bạn lưu thông tin, theo dõi đơn hàng và truy cập các ưu đãi độc quyền.'
        },
        {
          question: 'Làm thế nào để đặt lại mật khẩu?',
          answer: 'Nhấp vào "Quên mật khẩu" trên trang đăng nhập, nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.'
        }
      ]
    },
    {
      title: 'Vận chuyển & Giao hàng',
      icon: FaShippingFast,
      items: [
        {
          question: 'Vận chuyển mất bao lâu?',
          answer: 'Vận chuyển tiêu chuẩn mất 3-5 ngày làm việc trong nội thành. Vận chuyển nhanh (1-2 ngày làm việc) và vận chuyển qua đêm cũng có sẵn với phí bổ sung.'
        },
        {
          question: 'Bạn có vận chuyển quốc tế không?',
          answer: 'Có, chúng tôi vận chuyển đến hơn 100 quốc gia trên toàn thế giới. Chi phí vận chuyển và thời gian giao hàng quốc tế thay đổi theo địa điểm. Bạn có thể kiểm tra các tùy chọn vận chuyển trong quá trình thanh toán.'
        },
        {
          question: 'Chi phí vận chuyển là bao nhiêu?',
          answer: 'Chúng tôi cung cấp vận chuyển miễn phí tiêu chuẩn cho đơn hàng trên 500K trong nội thành. Chi phí vận chuyển quốc tế được tính dựa trên điểm đến và trọng lượng gói hàng.'
        },
        {
          question: 'Tôi có thể theo dõi đơn hàng không?',
          answer: 'Có, sau khi đơn hàng được vận chuyển, bạn sẽ nhận được số theo dõi qua email. Bạn cũng có thể theo dõi đơn hàng trong bảng điều khiển tài khoản của mình.'
        }
      ]
    },
    {
      title: 'Thanh toán & Hóa đơn',
      icon: FaCreditCard,
      items: [
        {
          question: 'Bạn chấp nhận những phương thức thanh toán nào?',
          answer: 'Chúng tôi chấp nhận tất cả các thẻ tín dụng chính (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, Google Pay và chuyển khoản ngân hàng cho tài khoản doanh nghiệp.'
        },
        {
          question: 'Thông tin thanh toán của tôi có an toàn không?',
          answer: 'Có, chúng tôi sử dụng mã hóa SSL cấp độ ngân hàng để bảo vệ thông tin thanh toán của bạn. Chúng tôi không bao giờ lưu trữ thông tin thẻ tín dụng hoàn chỉnh trên máy chủ của mình.'
        },
        {
          question: 'Bạn có cung cấp thanh toán trả góp không?',
          answer: 'Có, chúng tôi cung cấp các tùy chọn thanh toán trả góp thông qua các đối tác tài chính của chúng tôi. Bạn có thể chọn tùy chọn này trong quá trình thanh toán nếu bạn đủ điều kiện.'
        },
        {
          question: 'Tôi có thể sử dụng nhiều phương thức thanh toán không?',
          answer: 'Hiện tại, chúng tôi chỉ chấp nhận một phương thức thanh toán cho mỗi đơn hàng. Tuy nhiên, bạn có thể sử dụng thẻ quà tặng kết hợp với các phương thức thanh toán khác.'
        }
      ]
    },
    {
      title: 'Đổi trả & Bảo hành',
      icon: FaUndo,
      items: [
        {
          question: 'Chính sách đổi trả của bạn là gì?',
          answer: 'Chúng tôi cung cấp chính sách đổi trả 30 ngày cho hầu hết các sản phẩm. Sản phẩm phải ở tình trạng ban đầu với tất cả bao bì và phụ kiện đi kèm. Một số hạn chế áp dụng.'
        },
        {
          question: 'Làm thế nào để trả lại sản phẩm?',
          answer: 'Để trả lại sản phẩm, đăng nhập vào tài khoản của bạn, vào lịch sử đơn hàng và chọn "Trả lại sản phẩm." Làm theo hướng dẫn để in nhãn trả hàng và gửi sản phẩm về.'
        },
        {
          question: 'Bạn có cung cấp bảo hành không?',
          answer: 'Tất cả sản phẩm đều có bảo hành của nhà sản xuất. Chúng tôi cũng cung cấp các tùy chọn bảo hành mở rộng để bảo vệ thêm. Điều khoản bảo hành thay đổi theo sản phẩm.'
        },
        {
          question: 'Nếu sản phẩm của tôi bị hư hỏng khi đến thì sao?',
          answer: 'Nếu sản phẩm của bạn bị hư hỏng khi đến, vui lòng liên hệ với dịch vụ khách hàng của chúng tôi trong vòng 48 giờ kể từ khi giao hàng. Chúng tôi sẽ sắp xếp thay thế hoặc hoàn tiền.'
        }
      ]
    },
    {
      title: 'Bảo mật & Quyền riêng tư',
      icon: FaShieldAlt,
      items: [
        {
          question: 'Làm thế nào để bảo vệ thông tin cá nhân của tôi?',
          answer: 'Chúng tôi sử dụng mã hóa và các biện pháp bảo mật tiêu chuẩn trong ngành để bảo vệ thông tin cá nhân của bạn. Chúng tôi không bao giờ chia sẻ dữ liệu của bạn với bên thứ ba mà không có sự đồng ý của bạn.'
        },
        {
          question: 'Bạn có sử dụng cookie không?',
          answer: 'Có, chúng tôi sử dụng cookie để cải thiện trải nghiệm mua sắm của bạn, ghi nhớ sở thích của bạn và cung cấp nội dung được cá nhân hóa. Bạn có thể quản lý cài đặt cookie trong trình duyệt của mình.'
        },
        {
          question: 'Tôi có thể xóa tài khoản không?',
          answer: 'Có, bạn có thể xóa tài khoản bất cứ lúc nào bằng cách liên hệ với dịch vụ khách hàng của chúng tôi. Vui lòng lưu ý rằng hành động này không thể hoàn tác.'
        },
        {
          question: 'Bạn xử lý vi phạm dữ liệu như thế nào?',
          answer: 'Trong trường hợp không may xảy ra vi phạm dữ liệu, chúng tôi sẽ ngay lập tức thông báo cho khách hàng bị ảnh hưởng và thực hiện tất cả các bước cần thiết để bảo mật thông tin của bạn.'
        }
      ]
    }
  ];

  const toggleItem = (categoryIndex: number, itemIndex: number) => {
    const key = categoryIndex * 100 + itemIndex;
    setOpenItems(prev => 
      prev.includes(key) 
        ? prev.filter(id => id !== key)
        : [...prev, key]
    );
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Câu hỏi thường gặp</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Tìm câu trả lời cho những câu hỏi thường gặp về sản phẩm, dịch vụ và chính sách của chúng tôi.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm câu trả lời..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            {searchTerm && (
              <p className="text-center mt-4 text-gray-600">
                Tìm thấy {filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)} kết quả
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {filteredCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6" />
                      <h2 className="text-2xl font-bold">{category.title}</h2>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {category.items.map((item, itemIndex) => {
                      const key = categoryIndex * 100 + itemIndex;
                      const isOpen = openItems.includes(key);
                      return (
                        <div key={itemIndex} className="p-6">
                          <button
                            onClick={() => toggleItem(categoryIndex, itemIndex)}
                            className="w-full flex items-center justify-between text-left focus:outline-none"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 pr-4">
                              {item.question}
                            </h3>
                            {isOpen ? (
                              <FaChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <FaChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="mt-4 text-gray-600 leading-relaxed">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Không tìm thấy câu trả lời?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình, đừng ngần ngại liên hệ với chúng tôi. 
              Đội ngũ hỗ trợ khách hàng của chúng tôi luôn sẵn sàng giúp đỡ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
              >
                Liên hệ chúng tôi
              </a>
              <a
                href="/products"
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-gray-400 transition-colors"
              >
                Xem sản phẩm
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ; 