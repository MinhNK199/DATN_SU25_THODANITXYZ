import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../components/client/ToastContainer";
import { getTaxConfig } from "../../services/cartApi";
import ScrollToTop from "../../components/ScrollToTop";
import CheckoutPaymentMethod from "./CheckoutPaymentMethod";

const CheckoutPaymentPage: React.FC = () => {
  const [formData, setFormData] = useState({
    lastName: "",
    phone: "",
    address: "",
    province_code: "",
    ward_code: "",
    paymentMethod: "",
  });
  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [walletInfo, setWalletInfo] = useState({ type: "", phone: "" });
  const [bankTransferInfo, setBankTransferInfo] = useState({
    transactionId: "",
  });
  const [showNewCardForm, setShowNewCardForm] = useState<boolean>(false);
  const [showNewWalletForm, setShowNewWalletForm] = useState<boolean>(false);
  const [taxRate, setTaxRate] = useState(0.08);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const { state: cartState } = useCart();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  useEffect(() => {
    getTaxConfig()
      .then((cfg) => setTaxRate(cfg.rate))
      .catch(() => setTaxRate(0.08));

    // Lấy thông tin shipping từ localStorage
    const shippingData = localStorage.getItem('checkoutShippingData');
    if (shippingData) {
      const { selectedAddress: savedAddress, formData: savedFormData } = JSON.parse(shippingData);
      setSelectedAddress(savedAddress);
      setFormData(savedFormData);
    } else {
      // Nếu không có thông tin shipping, quay về trang shipping
      navigate('/checkout/shipping');
    }
    
    // Kiểm tra nếu không có sản phẩm trong giỏ hàng, redirect về Cart
    if (!cartState.items || cartState.items.length === 0) {
      navigate('/cart');
    }
  }, [navigate, cartState.items]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (formData.paymentMethod) {
      // Lưu thông tin payment vào localStorage
      localStorage.setItem('checkoutPaymentData', JSON.stringify({
        formData,
        cardInfo,
        walletInfo,
        bankTransferInfo
      }));
      navigate('/checkout/review');
    } else {
      alert("Vui lòng chọn phương thức thanh toán!");
    }
  };

  const handlePrevStep = () => {
    navigate('/checkout/shipping');
  };

  const subtotal = cartState.total || 0;
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const taxPrice = subtotal * taxRate;
  const finalTotal = subtotal + shippingFee + taxPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex items-center space-x-3 text-white hover:text-blue-100 transition-all duration-300 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-sm"
              >
                <FaArrowLeft className="w-5 h-5" />
                <span className="font-semibold text-lg">Quay lại</span>
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">
                Phương thức thanh toán
              </h1>
              <p className="text-blue-100 text-lg">Bước 2/3 - Chọn cách thanh toán phù hợp và an toàn</p>
            </div>
            <div className="w-40"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-xl scale-110">
                    <FaCheck className="w-8 h-8" />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-base font-bold text-blue-600">Thông tin giao hàng</p>
                    <p className="text-sm text-gray-400 mt-1">Bước 1</p>
                  </div>
                </div>
                <div className="flex-1 mx-6">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"></div>
                </div>
              </div>
              
              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-xl scale-110">
                    <span className="text-2xl">2</span>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-base font-bold text-blue-600">Phương thức thanh toán</p>
                    <p className="text-sm text-gray-400 mt-1">Bước 2</p>
                  </div>
                </div>
                <div className="flex-1 mx-6">
                  <div className="h-2 rounded-full bg-gray-200"></div>
                </div>
              </div>
              
              <div className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 bg-white border-gray-300 text-gray-400 shadow-md">
                    <span className="text-2xl">3</span>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-base font-bold text-gray-500">Xác nhận đơn hàng</p>
                    <p className="text-sm text-gray-400 mt-1">Bước 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-8xl mx-auto">
          {/* Left Column - Form */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  💳 Phương thức thanh toán
                </h2>
                <p className="text-blue-100">Chọn cách thanh toán phù hợp và an toàn</p>
              </div>
              
              <div className="p-8">
                <CheckoutPaymentMethod
                  formData={formData}
                  setFormData={setFormData}
                  cardInfo={cardInfo}
                  setCardInfo={setCardInfo}
                  walletInfo={walletInfo}
                  setWalletInfo={setWalletInfo}
                  bankTransferInfo={bankTransferInfo}
                  setBankTransferInfo={setBankTransferInfo}
                  showNewCardForm={showNewCardForm}
                  setShowNewCardForm={setShowNewCardForm}
                  showNewWalletForm={showNewWalletForm}
                  setShowNewWalletForm={setShowNewWalletForm}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Action */}
          <div className="xl:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Order Summary Card - Collapsible */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                  className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-5 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-3 text-xl">📋</span>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-white">Tóm tắt đơn hàng</h3>
                        <p className="text-green-100 text-sm mt-1">
                          {cartState.items?.length || 0} sản phẩm • {formatPrice(finalTotal)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-white text-sm font-semibold">
                        {isOrderSummaryOpen ? 'Thu gọn' : 'Xem chi tiết'}
                      </span>
                      {isOrderSummaryOpen ? (
                        <FaChevronUp className="text-white text-lg" />
                      ) : (
                        <FaChevronDown className="text-white text-lg" />
                      )}
                    </div>
                  </div>
                </button>
                
                {/* Collapsible Content */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isOrderSummaryOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="p-6">
                    {/* Order Items Preview - Compact */}
                    <div className="mb-6">
                      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">🛍️</span>
                        Sản phẩm ({cartState.items?.length || 0})
                      </h4>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {cartState.items?.slice(0, 4).map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden shadow-sm">
                              {item.product.images?.[0] ? (
                                <img 
                                  src={item.product.images[0]} 
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">No Image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                SL: <span className="font-semibold text-blue-600">{item.quantity}</span> × {formatPrice(item.product.salePrice || item.product.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900">
                                {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                              </div>
                            </div>
                          </div>
                        ))}
                        {cartState.items && cartState.items.length > 4 && (
                          <div className="text-center py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <span className="text-blue-700 font-semibold text-sm">
                              +{cartState.items.length - 4} sản phẩm khác
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price Breakdown - Compact */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
                      <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">💰</span>
                        Chi tiết thanh toán
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-700 text-sm">Tạm tính:</span>
                          <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-700 text-sm">Phí vận chuyển:</span>
                          <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-700 text-sm">Thuế VAT (8%):</span>
                          <span className="font-semibold text-gray-900">{formatPrice(taxPrice)}</span>
                        </div>
                        
                        <div className="pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {formatPrice(finalTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Promotional Message - Compact */}
                    {shippingFee > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">💡</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-800 mb-1">
                              Thêm {formatPrice(500000 - cartState.total)} để được miễn phí vận chuyển!
                            </p>
                            <div className="w-full bg-blue-200 rounded-full h-2 mb-1">
                              <div 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${Math.min((cartState.total / 500000) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-blue-600">
                              Đã tiết kiệm: {formatPrice(cartState.total)} / {formatPrice(500000)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button Card */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Security & Guarantee - Compact */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-xl p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <FaCheck className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-green-800">
                              Giao hàng 2-3 ngày
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 via-violet-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-xs">🔒</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-purple-800">
                              Thanh toán an toàn
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-xs">🔄</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-orange-800">
                              Đổi trả 30 ngày
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Continue Button - Prominent */}
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={!formData.paymentMethod}
                        className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg"
                      >
                        <span>Tiếp tục</span>
                        <span className="ml-3 text-xl">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default CheckoutPaymentPage;
