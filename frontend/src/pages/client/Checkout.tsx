import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaLock,
  FaCreditCard,
  FaPaypal,
  FaTruck,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../components/client/ToastContainer";
import OrderSuccessModal from "../../components/client/OrderSuccessModal";
import axios from "axios";
import userApi, { Address } from "../../services/userApi";
import Select from "react-select";
import { createOrder, createMomoPayment } from "../../services/orderApi";
import { getTaxConfig } from "../../services/cartApi";
import ScrollToTop from "../../components/ScrollToTop";
import CheckoutShippingInfo from "./CheckoutShippingInfo";
import CheckoutPaymentMethod from "./CheckoutPaymentMethod";
import CheckoutReview from "./CheckoutReview";

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
  const [formData, setFormData] = useState({
    lastName: "",
    phone: "",
    address: "",
    province_code: "",
    district_code: "",
    ward_code: "",
    paymentMethod: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
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

  const { state: cartState, clearCart } = useCart();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  useEffect(() => {
    axios
      .get<Province[]>("https://provinces.open-api.vn/api/?depth=1")
      .then((r) => setProvinces(r.data))
      .catch(() => {});
    getTaxConfig()
      .then((cfg) => setTaxRate(cfg.rate))
      .catch(() => setTaxRate(0.08));
  }, []);

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

  useEffect(() => {
    if (formData.province_code) {
      fetchDistrictsByProvinceCode(formData.province_code);
      setFormData((f) => ({ ...f, district_code: "", ward_code: "" }));
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
      setFormData((f) => ({ ...f, district_code: "", ward_code: "" }));
    }
  }, [formData.province_code]);

  // Load xã/phường khi chọn quận/huyện
  useEffect(() => {
    if (formData.district_code) {
      axios
        .get(`https://provinces.open-api.vn/api/d/${formData.district_code}?depth=2`)
        .then((r) => {
          setWards(r.data.wards || []);
        })
        .catch(() => setWards([]));
      setFormData((f) => ({ ...f, ward_code: "" }));
    } else {
      setWards([]);
      setFormData((f) => ({ ...f, ward_code: "" }));
    }
  }, [formData.district_code]);

  const userApiWithExtra = userApi as typeof userApi & {
    getAddresses?: () => Promise<Address[]>;
    getMyPaymentMethods?: () => Promise<{ methods: PaymentMethod[] }>;
  };

  useEffect(() => {
    userApiWithExtra.getAddresses?.().then((data: Address[]) => {
      setAddresses(data);
      const defaultAddress = data.find((a) => a.isDefault) || data[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setFormData((f) => ({
          ...f,
          lastName: defaultAddress.fullName.split(" ").slice(-1).join(" "),
          phone: defaultAddress.phone,
          address: defaultAddress.address,
          province_code: defaultAddress.city,
          district_code: defaultAddress.district,
          ward_code: defaultAddress.ward,
          paymentMethod: f.paymentMethod || "",
        }));
        if (defaultAddress.city)
          fetchDistrictsByProvinceCode(defaultAddress.city);
      } else {
        setSelectedAddressId("new");
      }
    });
  }, []);

  useEffect(() => {
    if (currentStep === 2) {
      userApiWithExtra.getMyPaymentMethods?.();
    }
  }, [currentStep]);

  const handleSelectAddress = async (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === "new") {
      setFormData({
        lastName: "",
        phone: "",
        address: "",
        province_code: "",
        district_code: "",
        ward_code: "",
        paymentMethod: "",
      });
      setDistricts([]);
      setWards([]);
    } else {
      const addr = addresses.find((a) => a._id === addressId);
      if (addr) {
        setFormData((f) => ({
          ...f,
          lastName: addr.fullName.split(" ").slice(-1).join(" "),
          phone: addr.phone,
          address: addr.address,
          province_code: addr.city,
          district_code: addr.district,
          ward_code: addr.ward,
          paymentMethod: f.paymentMethod || "",
        }));
        await fetchDistrictsByProvinceCode(addr.city);
      }
    }
  };

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

  // 1. Validate thông tin giao hàng
  const handleNextStepShipping = () => {
    if (
      !formData.lastName ||
      !formData.phone ||
      !formData.address ||
      !formData.province_code ||
      !formData.district_code ||
      !formData.ward_code
    ) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }
    setCurrentStep(2);
  };

  // 2. Validate phương thức thanh toán
  const handleNextStepPayment = () => {
    if (!formData.paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    if (formData.paymentMethod === "credit-card") {
      if (!cardInfo.number || !cardInfo.name || !cardInfo.expiry || !cardInfo.cvv) {
        alert("Vui lòng nhập đầy đủ thông tin thẻ!");
        return;
      }
    }
    if (formData.paymentMethod === "e-wallet") {
      if (!walletInfo.type) {
        alert("Vui lòng chọn loại ví điện tử!");
        return;
      }
      if (!walletInfo.phone) {
        alert("Vui lòng nhập số điện thoại ví!");
        return;
      }
    }
    if (formData.paymentMethod === "bank-transfer") {
      if (!bankTransferInfo.transactionId) {
        alert("Vui lòng nhập mã giao dịch chuyển khoản!");
        return;
      }
    }
    setCurrentStep(3);
  };

  // 3. Đặt hàng
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);

    if (!cartState.items || cartState.items.length === 0) {
      alert("Vui lòng thêm sản phẩm vào giỏ hàng.");
      setIsProcessing(false);
      return;
    }

    if (!formData.paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán.");
      setIsProcessing(false);
      return;
    }

    try {
      const shippingAddress = {
        fullName: formData.lastName,
        address: formData.address,
        city: getProvinceName(),
        postalCode:
          formData.ward_code +
          "-" +
          formData.district_code +
          "-" +
          formData.province_code,
        phone: formData.phone,
      };
      const orderItems = cartState.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.images?.[0] || "",
        price: item.product.salePrice || item.product.price,
        product: item.product._id,
      }));
      let paymentMethod = "";
      if (formData.paymentMethod === "credit-card")
        paymentMethod = "credit-card";
      else if (formData.paymentMethod === "e-wallet")
        paymentMethod = walletInfo.type;
      else if (formData.paymentMethod === "bank-transfer")
        paymentMethod = "BANKING";
      else paymentMethod = "COD";

      const orderData = {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: cartState.total,
        taxPrice: cartState.total * taxRate,
        shippingPrice: shippingFee,
        totalPrice: cartState.total + shippingFee + cartState.total * taxRate,
      };
      const res = await createOrder(orderData);
      setOrderNumber(res._id || "");

      // Xử lý từng loại ví
      if (formData.paymentMethod === "e-wallet" && walletInfo.type === "momo") {
        const momoRes = await createMomoPayment({
          amount: orderData.totalPrice,
          orderId: res._id,
          orderInfo: `Thanh toán đơn hàng ${res._id}`,
          redirectUrl: window.location.origin + "/checkout/success",
          ipnUrl: "http://localhost:5173/api/payment/momo/webhook",
          extraData: "",
        });
        if (momoRes && momoRes.payUrl) {
          window.location.href = momoRes.payUrl;
          return;
        } else {
          alert("Không lấy được link thanh toán Momo. Vui lòng thử lại.");
        }
      } else if (
        formData.paymentMethod === "e-wallet" &&
        walletInfo.type === "zalopay"
      ) {
        const zaloRes = await axios.post("/api/orders/create", {
          orderId: res._id,
        });
        if (zaloRes.data && zaloRes.data.order_url) {
          window.location.href = zaloRes.data.order_url;
          return;
        } else {
          alert("Không lấy được link thanh toán ZaloPay. Vui lòng thử lại.");
        }
      } else if (
        formData.paymentMethod === "e-wallet" &&
        walletInfo.type === "vnpay"
      ) {
        try {
          const vnpayRes = await axios.post("/api/payment/vnpay/create", {
            amount: orderData.totalPrice,
            orderId: res._id,
            orderInfo: `Thanh toán đơn hàng ${res._id}`,
            redirectUrl: window.location.origin + "/checkout/success",
          });
          if (vnpayRes.data && vnpayRes.data.payUrl) {
            window.location.href = vnpayRes.data.payUrl;
            return;
          } else {
            alert("Không lấy được link thanh toán VNPAY. Vui lòng thử lại.");
          }
        } catch (err) {
          const error = err as Error;
          alert(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
        }
      } else {
        setShowSuccessModal(true);
        clearCart();
        showSuccess(
          "Đặt hàng thành công!",
          `Đơn hàng ${res._id} đã được xác nhận và sẽ được giao trong 2-3 ngày.`
        );
      }
    } catch (err: any) {
      alert("Đặt hàng thất bại. Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { number: 1, title: "Thông tin giao hàng", icon: FaTruck },
    { number: 2, title: "Phương thức thanh toán", icon: FaCreditCard },
    { number: 3, title: "Xác nhận đơn hàng", icon: FaCheck },
  ];

  const subtotal =
    typeof summary.subtotal === "number" ? summary.subtotal : cartState.total;
  const shippingFee =
    typeof summary.shipping === "number"
      ? summary.shipping
      : cartState.total > 500000
      ? 0
      : 30000;
  const taxPrice =
    typeof summary.tax === "number" ? summary.tax : cartState.total * taxRate;
  const finalTotal = subtotal + shippingFee + taxPrice;

  const getProvinceName = () =>
    provinces.find((p) => String(p.code) === formData.province_code)?.name ||
    "";
  const getDistrictName = () =>
    districts.find((d) => String(d.code) === formData.district_code)?.name ||
    "";
  const getWardName = () =>
    wards.find((w) => String(w.code) === formData.ward_code)?.name || "";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  useEffect(() => {
    if (
      currentStep === 2 &&
      (!cartState.items || cartState.items.length === 0)
    ) {
      navigate("/");
    }
  }, [currentStep, cartState.items, navigate]);

  useEffect(() => {
    if (showSuccessModal) {
      setRedirectCountdown(5);
      const interval = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
      const timer = setTimeout(() => {
        navigate("/");
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
        <div className="mb-8">
          <Link
            to="/cart"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? (
                    <FaCheck className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <CheckoutShippingInfo
                    formData={formData}
                    setFormData={setFormData}
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    setSelectedAddressId={setSelectedAddressId}
                    provinces={provinces}
                    districts={districts}
                    wards={wards}
                    districtLoading={districtLoading}
                    handleSelectAddress={handleSelectAddress}
                    fetchDistrictsByProvinceCode={fetchDistrictsByProvinceCode}
                    setCurrentStep={handleNextStepShipping}
                    handleInputChange={handleInputChange}
                    handleNextStepShipping={handleNextStepShipping}
                  />
                )}
                {currentStep === 2 && (
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
                    orderNumber={orderNumber}
                    setCurrentStep={handleNextStepPayment}
                    handleInputChange={handleInputChange}
                  />
                )}
                {currentStep === 3 && (
                  <CheckoutReview
                    formData={formData}
                    cartState={cartState}
                    getProvinceName={getProvinceName}
                    getDistrictName={getDistrictName}
                    getWardName={getWardName}
                    isProcessing={isProcessing}
                    setCurrentStep={setCurrentStep}
                    handleSubmit={handleSubmit}
                    orderNumber={orderNumber}
                    formatPrice={formatPrice}
                  />
                )}
              </form>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế VAT:</span>
                  <span className="font-semibold">{formatPrice(taxPrice)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>
              {shippingFee > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    💡 Thêm {formatPrice(500000 - cartState.total)} để được miễn
                    phí vận chuyển!
                  </p>
                </div>
              )}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <FaCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Đảm bảo giao hàng trong 2-3 ngày
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderNumber={orderNumber}
        estimatedDelivery="2-3 ngày làm việc"
      >
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