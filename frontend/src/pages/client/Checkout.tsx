import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaLock, FaCreditCard, FaPaypal, FaTruck, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../components/client/ToastContainer';
import OrderSuccessModal from '../../components/client/OrderSuccessModal';
import axios from 'axios';
import userApi, { Address } from '../../services/userApi';
import Select from 'react-select';
import { createOrder, createMomoPayment } from "../../services/orderApi";
import { getTaxConfig } from '../../services/cartApi';
import ScrollToTop from '../../components/ScrollToTop';

interface Province {
  code: number;
  name: string;
}
interface District {
  code: number;
  name: string;
}
interface Ward {
  code: number;
  name: string;
}

// Thêm interface cho PaymentMethod
interface PaymentMethod {
  _id: string;
  type: string;
  provider?: string;
  last4?: string;
  name?: string;
  phone?: string;
}

const Checkout: React.FC = () => {
  const location = useLocation();
  const summary = location.state || {};
  const [currentStep, setCurrentStep] = useState(1);
  // Khởi tạo formData với paymentMethod là 'COD'
  const [formData, setFormData] = useState({
    lastName: '',
    phone: '',
    address: '',
    province_code: '',
    district_code: '',
    ward_code: '',
    paymentMethod: 'COD'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Địa chỉ động
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Thêm state cho thông tin bổ sung
  const [cardInfo, setCardInfo] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [walletInfo, setWalletInfo] = useState({ type: '', phone: '' });
  const [bankTransferInfo, setBankTransferInfo] = useState({ transactionId: '' });

  // Lấy danh sách thẻ/ví đã lưu khi vào bước thanh toán
  const [showNewCardForm, setShowNewCardForm] = useState<boolean>(false);
  const [showNewWalletForm, setShowNewWalletForm] = useState<boolean>(false);

  const [taxRate, setTaxRate] = useState(0.08);
  useEffect(() => {
    axios
      .get<Province[]>("https://provinces.open-api.vn/api/?depth=1")
      .then((r) => setProvinces(r.data))
      .catch(() => {});
    getTaxConfig().then(cfg => setTaxRate(cfg.rate)).catch(() => setTaxRate(0.08));
  }, []);

  // Fetch districts khi chọn tỉnh
  const fetchDistrictsByProvinceCode = (provinceCode: string) => {
    setDistrictLoading(true);
    axios
      .get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      .then((r) => {
        setDistricts(r.data.districts || []);
      })
      .catch(() => setDistricts([]))
      .finally(() => setDistrictLoading(false));
  };

  // Khi chọn tỉnh, fetch quận/huyện và reset quận, phường
  useEffect(() => {
    if (formData.province_code) {
      fetchDistrictsByProvinceCode(formData.province_code);
      setFormData(f => ({ ...f, district_code: '', ward_code: '' }));
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
      setFormData(f => ({ ...f, district_code: '', ward_code: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.province_code]);

  // Khi chọn quận, fetch phường
  useEffect(() => {
    if (formData.district_code) {
      setFormData(f => ({ ...f, ward_code: '' }));
    } else {
      setWards([]);
      setFormData(f => ({ ...f, ward_code: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.district_code]);

  const userApiWithExtra = userApi as typeof userApi & {
    getAddresses?: () => Promise<Address[]>;
    getMyPaymentMethods?: () => Promise<{ methods: PaymentMethod[] }>;
  };

  useEffect(() => {
    userApiWithExtra.getAddresses?.().then((data: Address[]) => {
      setAddresses(data);
      const defaultAddress = data.find(a => a.isDefault) || data[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setFormData(f => ({
          ...f,
          lastName: defaultAddress.fullName.split(' ').slice(-1).join(' '),
          phone: defaultAddress.phone,
          address: defaultAddress.address,
          province_code: defaultAddress.city,
          district_code: defaultAddress.district,
          ward_code: defaultAddress.ward,
          paymentMethod: formData.paymentMethod || 'COD',
        }));
        if (defaultAddress.city) fetchDistrictsByProvinceCode(defaultAddress.city);
      } else {
        setSelectedAddressId('new');
      }
    });
  }, []);

  // Lấy danh sách thẻ/ví đã lưu khi vào bước thanh toán
  useEffect(() => {
    if (currentStep === 2) {
      userApiWithExtra.getMyPaymentMethods?.();
    }
  }, [currentStep]);

  // Khi chọn địa chỉ đã lưu, fill đủ tỉnh, quận, phường
  const handleSelectAddress = async (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === 'new') {
      setFormData({
        lastName: '',
        phone: '',
        address: '',
        province_code: '',
        district_code: '',
        ward_code: '',
        paymentMethod: 'COD',
      });
      setDistricts([]);
      setWards([]);
    } else {
      const addr = addresses.find(a => a._id === addressId);
      if (addr) {
        setFormData(f => ({
          ...f,
          lastName: addr.fullName.split(' ').slice(-1).join(' '),
          phone: addr.phone,
          address: addr.address,
          province_code: addr.city,
          district_code: addr.district,
          ward_code: addr.ward,
          paymentMethod: formData.paymentMethod || 'COD',
        }));
        await fetchDistrictsByProvinceCode(addr.city);
      }
    }
  };

  const { state: cartState, clearCart } = useCart();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Đảm bảo handleInputChange cập nhật đúng và log formData
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit order - formData:', formData);
    if (isProcessing) return;
    setIsProcessing(true);

    // Validate cart
    if (!cartState.items || cartState.items.length === 0) {
      showError("Giỏ hàng trống", "Vui lòng thêm sản phẩm vào giỏ hàng.");
      setIsProcessing(false);
      return;
    }

    // BỎ validate địa chỉ giao hàng để test VNPAY
    // Validate phương thức thanh toán
    if (!formData.paymentMethod) {
      showError("Chưa chọn phương thức thanh toán", "Vui lòng chọn phương thức thanh toán.");
      setIsProcessing(false);
      return;
    }

    try {
      // Chuẩn bị dữ liệu gửi lên backend
      const shippingAddress = {
        fullName: formData.lastName,
        address: formData.address,
        city: getProvinceName(),
        postalCode: formData.ward_code + '-' + formData.district_code + '-' + formData.province_code,
        phone: formData.phone,
      };
      const orderItems = cartState.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.images?.[0] || '',
        price: item.product.salePrice || item.product.price,
        product: item.product._id,
      }));
      // Map payment method cho backend
      let paymentMethod = '';
      if (formData.paymentMethod === 'credit-card') paymentMethod = 'credit-card';
      else if (formData.paymentMethod === 'e-wallet') paymentMethod = 'e-wallet';
      else if (formData.paymentMethod === 'bank-transfer') paymentMethod = 'BANKING';
      else if (formData.paymentMethod === 'vnpay') paymentMethod = 'VNPAY'; // Sửa: gửi VNPAY chữ hoa
      else paymentMethod = 'COD';

      const orderData = {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: cartState.total,
        taxPrice: cartState.total * taxRate,
        shippingPrice: shippingFee,
        totalPrice: cartState.total + shippingFee + cartState.total * taxRate,
      };
      console.log('Order data gửi backend:', orderData);
      const res = await createOrder(orderData);
      setOrderNumber(res._id || '');
      if (paymentMethod === 'e-wallet') {
        const momoRes = await createMomoPayment({
          amount: orderData.totalPrice,
          orderId: res._id,
          orderInfo: `Thanh toán đơn hàng ${res._id}`,
          redirectUrl: window.location.origin + '/checkout/success',
          ipnUrl: 'http://localhost:5173/api/payment/momo/webhook',
          extraData: ''
        });
        if (momoRes && momoRes.payUrl) {
          window.location.href = momoRes.payUrl;
          return;
        } else {
          showError('Không lấy được link thanh toán Momo', momoRes.message || 'Vui lòng thử lại.');
        }
      } else if (paymentMethod === 'VNPAY') {
        try {
          console.log('Gọi API VNPAY với:', {
            amount: orderData.totalPrice,
            orderId: res._id,
            orderInfo: `Thanh toán đơn hàng ${res._id}`,
            redirectUrl: window.location.origin + '/checkout/success'
          });
          const vnpayRes = await axios.post('/api/payment/vnpay/create', {
            amount: orderData.totalPrice,
            orderId: res._id,
            orderInfo: `Thanh toán đơn hàng ${res._id}`,
            redirectUrl: window.location.origin + '/checkout/success'
          });
          console.log('VNPAY response:', vnpayRes.data);
          if (vnpayRes.data && vnpayRes.data.payUrl) {
            window.location.href = vnpayRes.data.payUrl;
            return;
          } else {
            showError('Không lấy được link thanh toán VNPAY', vnpayRes.data.message || 'Vui lòng thử lại.');
          }
        } catch (err) {
          const error = err as Error;
          console.error('Lỗi khi gọi API VNPAY:', error);
          showError('Lỗi khi gọi API VNPAY', error.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
      } else {
        setShowSuccessModal(true);
        clearCart();
        showSuccess('Đặt hàng thành công!', `Đơn hàng ${res._id} đã được xác nhận và sẽ được giao trong 2-3 ngày.`);
      }
    } catch (err) {
      const error = err as Error;
      console.error('Lỗi đặt hàng:', error);
      showError('Đặt hàng thất bại', error.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { number: 1, title: 'Thông tin giao hàng', icon: FaTruck },
    { number: 2, title: 'Phương thức thanh toán', icon: FaCreditCard },
    { number: 3, title: 'Xác nhận đơn hàng', icon: FaCheck }
  ];

  // Khi render, ưu tiên lấy subtotal, savings, shipping, tax, total từ summary nếu có
  const subtotal = typeof summary.subtotal === 'number' ? summary.subtotal : cartState.total;
  const shippingFee = typeof summary.shipping === 'number' ? summary.shipping : (cartState.total > 500000 ? 0 : 30000);
  const taxPrice = typeof summary.tax === 'number' ? summary.tax : (cartState.total * taxRate);
  const finalTotal = subtotal + shippingFee + taxPrice;

  // Helper lấy tên tỉnh/huyện/xã
  const getProvinceName = () => provinces.find(p => String(p.code) === formData.province_code)?.name || "";
  const getDistrictName = () => districts.find(d => String(d.code) === formData.district_code)?.name || "";
  const getWardName = () => wards.find(w => String(w.code) === formData.ward_code)?.name || "";

  useEffect(() => {
    // Khi chuyển bước, scroll lên đầu trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Nếu ở bước thanh toán mà giỏ hàng rỗng, tự động về trang chủ
  useEffect(() => {
    if (currentStep === 2 && (!cartState.items || cartState.items.length === 0)) {
      navigate('/');
    }
  }, [currentStep, cartState.items, navigate]);

  // Sau khi đặt hàng thành công, tự động về trang chủ sau 5s và hiển thị đếm ngược
  useEffect(() => {
    if (showSuccessModal) {
      setRedirectCountdown(5);
      const interval = setInterval(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [showSuccessModal, navigate]);

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
                    {/* Địa chỉ nhanh */}
                    {addresses.length > 0 && (
                      <div className="mb-4">
                        <div className="font-semibold mb-2">Chọn địa chỉ đã lưu:</div>
                        <div className="space-y-2">
                          {addresses.map(addr => (
                            <label key={addr._id} className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="address-select"
                                value={addr._id}
                                checked={selectedAddressId === addr._id}
                                onChange={() => handleSelectAddress(addr._id)}
                                className="mr-2"
                              />
                              <span>
                                <span className="font-medium">{addr.fullName}</span> - {addr.phone} <br />
                                <span className="text-gray-500 text-sm">{addr.address}, {addr.wardName}, {addr.districtName}, {addr.cityName}</span>
                                {addr.isDefault && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Mặc định</span>}
                              </span>
                            </label>
                          ))}
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="address-select"
                              value="new"
                              checked={selectedAddressId === 'new'}
                              onChange={() => handleSelectAddress('new')}
                              className="mr-2"
                            />
                            <span className="font-medium text-blue-600">Địa chỉ mới</span>
                          </label>
                        </div>
                      </div>
                    )}
                    {/* Form địa chỉ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.lastName}
                          onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ (số nhà, tên đường...)</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
                        <Select
                          options={provinces.map((p) => ({ value: String(p.code), label: p.name }))}
                          value={
                            provinces.find((p) => String(p.code) === formData.province_code)
                              ? {
                                  value: formData.province_code,
                                  label:
                                    provinces.find((p) => String(p.code) === formData.province_code)?.name ?? ''
                                }
                              : null
                          }
                          onChange={option =>
                            setFormData(f => ({
                              ...f,
                              province_code: option?.value || '',
                              district_code: '', // reset district when province changes
                              ward_code: '' // reset ward when province changes
                            }))
                          }
                          placeholder="Chọn tỉnh/thành phố..."
                          isClearable
                          classNamePrefix="react-select"
                          noOptionsMessage={() => "Không tìm thấy"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                        <Select
                          options={districts.map((d) => ({ value: String(d.code), label: d.name }))}
                          isLoading={districtLoading}
                          value={districts.find((d) => String(d.code) === formData.district_code)
                            ? { value: formData.district_code, label: districts.find((d) => String(d.code) === formData.district_code)?.name ?? '' }
                            : null}
                          onChange={option => setFormData(f => ({ ...f, district_code: option?.value || '' }))}
                          placeholder="Chọn quận/huyện..."
                          isClearable
                          isDisabled={!formData.province_code}
                          classNamePrefix="react-select"
                          noOptionsMessage={() => formData.province_code ? "Không tìm thấy" : "Chọn tỉnh/thành phố trước"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Xã/Phường/Thị trấn</label>
                        <Select
                          options={wards.map((w) => ({ value: String(w.code), label: w.name }))}
                          value={wards.find((w) => String(w.code) === formData.ward_code)
                            ? { value: formData.ward_code, label: wards.find((w) => String(w.code) === formData.ward_code)?.name ?? '' }
                            : null}
                          onChange={option => setFormData(f => ({ ...f, ward_code: option?.value || '' }))}
                          placeholder="Chọn xã/phường/thị trấn..."
                          isClearable
                          isDisabled={!formData.district_code}
                          classNamePrefix="react-select"
                          noOptionsMessage={() => formData.district_code ? "Không tìm thấy" : "Chọn quận/huyện trước"}
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
                      {/* COD */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="COD"
                            checked={formData.paymentMethod === 'COD'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <FaTruck className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                        </label>
                      </div>
                      {/* Thẻ tín dụng/ghi nợ */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="credit-card"
                            checked={formData.paymentMethod === 'credit-card'}
                            onChange={e => {
                              handleInputChange(e);
                              setShowNewCardForm(false);
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <FaCreditCard className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">Thẻ tín dụng/ghi nợ</span>
                        </label>
                        {formData.paymentMethod === 'credit-card' && (
                          <div className="mt-4">
                            {(showNewCardForm || true) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  placeholder="Số thẻ"
                                  value={cardInfo.number}
                                  onChange={e => setCardInfo(c => ({ ...c, number: e.target.value }))}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                  required
                                />
                                <input
                                  type="text"
                                  placeholder="Tên chủ thẻ"
                                  value={cardInfo.name}
                                  onChange={e => setCardInfo(c => ({ ...c, name: e.target.value }))}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                  required
                                />
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  value={cardInfo.expiry}
                                  onChange={e => setCardInfo(c => ({ ...c, expiry: e.target.value }))}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                  required
                                />
                                <input
                                  type="text"
                                  placeholder="CVV"
                                  value={cardInfo.cvv}
                                  onChange={e => setCardInfo(c => ({ ...c, cvv: e.target.value }))}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                  required
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Ví điện tử */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="e-wallet"
                            checked={formData.paymentMethod === 'e-wallet'}
                            onChange={e => {
                              handleInputChange(e);
                              setShowNewWalletForm(false);
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <FaPaypal className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">Ví điện tử</span>
                        </label>
                        {formData.paymentMethod === 'e-wallet' && (
                          <div className="mt-4">
                            {(showNewWalletForm || true) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                  value={walletInfo.type}
                                  onChange={e => setWalletInfo(w => ({ ...w, type: e.target.value }))}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                  required
                                >
                                  <option value="">Chọn ví</option>
                                  <option value="momo">Momo</option>
                                  <option value="zalopay">ZaloPay</option>
                                  <option value="vnpay">VNPAY</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="Số điện thoại ví"
                                  value={walletInfo.phone}
                                  onChange={e => setWalletInfo(w => ({ ...w, phone: e.target.value }))}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                  required
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* VNPAY */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="vnpay"
                            checked={formData.paymentMethod === 'vnpay'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <img src="/images/banks/vcb.png" alt="VNPAY" className="w-5 h-5" />
                          <span className="font-medium">Thanh toán qua VNPAY</span>
                        </label>
                      </div>
                      {/* Chuyển khoản ngân hàng */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank-transfer"
                            checked={formData.paymentMethod === 'bank-transfer'}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <FaCreditCard className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">Chuyển khoản ngân hàng</span>
                        </label>
                        {formData.paymentMethod === 'bank-transfer' && (
                          <div className="mt-4">
                            <div className="mb-2 text-sm text-gray-700">
                              <b>Thông tin tài khoản nhận:</b><br />
                              Ngân hàng: Vietcombank<br />
                              Số tài khoản: 0123456789<br />
                              Chủ tài khoản: Nguyễn Văn A<br />
                              Nội dung chuyển khoản: <b>Thanh toan don hang #{orderNumber || 'Mã đơn hàng'}</b>
                            </div>
                            <input
                              type="text"
                              placeholder="Nhập mã giao dịch chuyển khoản của bạn"
                              value={bankTransferInfo.transactionId}
                              onChange={e => setBankTransferInfo(b => ({ ...b, transactionId: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                              required
                            />
                          </div>
                        )}
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
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
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
                      {cartState.items.length === 0 ? (
                        <div className="text-gray-500">Không có sản phẩm nào trong đơn hàng.</div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {cartState.items.map((item) => {
                            const p = item.product;
                            const image = p.images && p.images.length > 0 ? p.images[0] : '/images/no-image.png';
                            const hasDiscount = p.salePrice && p.salePrice < p.price;
                            return (
                              <div key={item._id} className="flex items-center justify-between py-4">
                                <div className="flex items-center space-x-4">
                                  <img src={image} alt={p.name} className="w-16 h-16 object-cover rounded border" />
                                  <div>
                                    <div className="font-semibold text-gray-900 text-base">{p.name}</div>
                                    <div className="text-xs text-gray-500">Mã: {p._id}</div>
                                    {/* Nếu có phân loại/thuộc tính, render ở đây */}
                                    {/* <div className="text-xs text-gray-500">Màu: ..., Size: ...</div> */}
                                    {hasDiscount ? (
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-gray-400 line-through text-sm">{formatPrice(p.price)}</span>
                                        <span className="text-red-600 font-bold text-base">{formatPrice(p.salePrice!)}</span>
                                        <span className="text-xs text-green-600 font-semibold">-{Math.round(100 - (p.salePrice! / p.price) * 100)}%</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-900 font-bold text-base">{formatPrice(p.price)}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end min-w-[120px]">
                                  <span className="text-gray-700 text-sm">Số lượng: <b>{item.quantity}</b></span>
                                  <span className="text-gray-900 font-semibold text-base mt-1">{formatPrice((p.salePrice || p.price) * item.quantity)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Shipping Information */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Thông tin giao hàng</h3>
                      <p className="text-gray-700">
                        {formData.lastName}<br />
                        {formData.address}<br />
                        {getWardName() && `${getWardName()}, `}
                        {getDistrictName() && `${getDistrictName()}, `}
                        {getProvinceName()}<br />
                        {formData.phone}
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
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế VAT:</span>
                  <span className="font-semibold">{formatPrice(taxPrice)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{formatPrice(finalTotal)}</span>
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
      >
        {/* Dòng báo đếm ngược */}
        {showSuccessModal && (
          <div className="text-center text-sm text-gray-500 mt-2">
            Bạn sẽ được chuyển về trang chủ sau {redirectCountdown} giây...
          </div>
        )}
      </OrderSuccessModal>
      <ScrollToTop />
    </div>
  );
};

export default Checkout;