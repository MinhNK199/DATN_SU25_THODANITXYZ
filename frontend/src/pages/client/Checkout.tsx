import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaCreditCard, FaPaypal, FaApple, FaGoogle, FaTruck, FaShieldAlt, FaCheckCircle, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../components/client/ToastContainer';
import OrderSuccessModal from '../../components/client/OrderSuccessModal';

const Checkout: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'credit-card'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const { state: cartState, clearCart } = useCart();
  const { showSuccess } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      const newOrderNumber = 'ORD-' + Date.now().toString().slice(-8);
      setOrderNumber(newOrderNumber);
      setShowSuccessModal(true);
      clearCart();
      showSuccess(
        'Đặt hàng thành công!',
        `Đơn hàng ${newOrderNumber} đã được xác nhận và sẽ được giao trong 2-3 ngày.`
      );
      setIsProcessing(false);
    }, 2000);
  };

  const steps = [
    { number: 1, title: 'Thông tin giao hàng', icon: FaTruck },
    { number: 2, title: 'Phương thức thanh toán', icon: FaCreditCard },
    { number: 3, title: 'Xác nhận đơn hàng', icon: FaCheck }
  ];

  const shippingFee = cartState.total > 500000 ? 0 : 30000;
  const total = cartState.total + shippingFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/cart" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-4">
            <FaArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <FaCheck className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin giao hàng</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên đệm *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ giao hàng *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thành phố *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mã bưu điện *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                      >
                        Tiếp tục
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment Method */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="credit-card"
                            checked={formData.paymentMethod === 'credit-card'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <FaCreditCard className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">Thẻ tín dụng/ghi nợ</span>
                        </label>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={formData.paymentMethod === 'paypal'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <FaPaypal className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">PayPal</span>
                        </label>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={formData.paymentMethod === 'cod'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <FaTruck className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                        </label>
                      </div>
                    </div>
                    <div className="mt-6 flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                      >
                        <FaArrowLeft className="w-4 h-4" />
                        <span>Quay lại</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
                      >
                        Tiếp tục
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Order Review */}
                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Xác nhận đơn hàng</h2>
                    
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
                      {cartState.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Information */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Thông tin giao hàng</h3>
                      <p className="text-gray-700">
                        {formData.firstName} {formData.lastName}<br />
                        {formData.address}<br />
                        {formData.city}, {formData.zipCode}<br />
                        {formData.phone}<br />
                        {formData.email}
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                      >
                        <FaArrowLeft className="w-4 h-4" />
                        <span>Quay lại</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Đang xử lý...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <FaLock className="w-4 h-4" />
                            <span>Đặt hàng an toàn</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">{formatPrice(cartState.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>

              {shippingFee > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    💡 Thêm {formatPrice(500000 - cartState.total)} để được miễn phí vận chuyển!
                  </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <FaCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Đảm bảo giao hàng trong 2-3 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderNumber={orderNumber}
        estimatedDelivery="2-3 ngày làm việc"
      />
    </div>
  );
};

export default Checkout; 