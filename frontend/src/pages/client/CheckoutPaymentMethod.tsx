import React, { useState } from "react";
import { FaTruck, FaCreditCard, FaChevronDown, FaChevronUp, FaArrowLeft } from "react-icons/fa";

interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  cardInfo: { number: string; name: string; expiry: string; cvv: string };
  setCardInfo: React.Dispatch<
    React.SetStateAction<{
      number: string;
      name: string;
      expiry: string;
      cvv: string;
    }>
  >;
  walletInfo: { type: string; phone: string };
  setWalletInfo: React.Dispatch<
    React.SetStateAction<{ type: string; phone: string }>
  >;
  bankTransferInfo: { transactionId: string };
  setBankTransferInfo: React.Dispatch<
    React.SetStateAction<{ transactionId: string }>
  >;
  showNewCardForm: boolean;
  setShowNewCardForm: React.Dispatch<React.SetStateAction<boolean>>;
  showNewWalletForm: boolean;
  setShowNewWalletForm: React.Dispatch<React.SetStateAction<boolean>>;
  isCODAllowed?: boolean;
  finalTotal?: number;
}

const CheckoutPaymentMethod: React.FC<Props> = ({
  formData,
  setFormData,
  cardInfo,
  setCardInfo,
  walletInfo,
  setWalletInfo,
  bankTransferInfo,
  setBankTransferInfo,
  showNewCardForm,
  setShowNewCardForm,
  showNewWalletForm,
  setShowNewWalletForm,
  isCODAllowed = true,
  finalTotal = 0,
}) => {
  const [isOnlinePaymentOpen, setIsOnlinePaymentOpen] = useState(false);

  const handlePaymentMethodChange = (method: string) => {
    setFormData((prev: any) => ({ ...prev, paymentMethod: method }));
    if (method === "online") {
      setIsOnlinePaymentOpen(true);
    } else {
      setIsOnlinePaymentOpen(false);
    }
  };

  const handleOnlinePaymentSelect = (method: string) => {
    setFormData((prev: any) => ({ ...prev, paymentMethod: method }));
  };

  return (
    <div className="space-y-6">
      {/* COD Option */}
      <div className={`bg-white border-2 rounded-2xl p-6 transition-all duration-300 ${isCODAllowed
          ? 'border-gray-200 hover:border-blue-300 cursor-pointer'
          : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
        }`}>
        <label className={`flex items-center space-x-4 ${isCODAllowed ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
          <input
            type="radio"
            name="paymentMethod"
            value="COD"
            checked={formData.paymentMethod === "COD"}
            onChange={() => isCODAllowed && handlePaymentMethodChange("COD")}
            disabled={!isCODAllowed}
            className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
          />
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCODAllowed ? 'bg-green-100' : 'bg-red-100'
              }`}>
              <FaTruck className={`w-6 h-6 ${isCODAllowed ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${isCODAllowed ? 'text-gray-900' : 'text-red-800'}`}>
                Thanh toán khi nhận hàng
                {!isCODAllowed && <span className="text-sm text-red-600 ml-2">(Không khả dụng)</span>}
              </h3>
              <p className={`text-sm ${isCODAllowed ? 'text-gray-600' : 'text-red-600'}`}>
                {isCODAllowed
                  ? 'Thanh toán bằng tiền mặt khi nhận hàng'
                  : `Đơn hàng có giá trị ${finalTotal.toLocaleString('vi-VN')}₫ vượt quá giới hạn 100 triệu ₫ cho thanh toán COD`
                }
              </p>
            </div>
          </div>
        </label>

        {/* Thông báo giới hạn COD */}
        {!isCODAllowed && (
          <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-sm">!</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-800 mb-1">
                  Giới hạn thanh toán COD
                </h4>
                <p className="text-sm text-red-700">
                  Đơn hàng có giá trị trên 100 triệu ₫ không được phép thanh toán COD.
                  Vui lòng chọn phương thức thanh toán trực tuyến để tiếp tục.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Online Payment Option */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-all duration-300">
        <label className="block cursor-pointer">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={formData.paymentMethod === "online" || formData.paymentMethod === "momo" || formData.paymentMethod === "vnpay"}
                onChange={() => handlePaymentMethodChange("online")}
                className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FaCreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">Thanh toán trực tuyến</h3>
                  <p className="text-gray-600 text-sm">Thanh toán qua ví điện tử hoặc thẻ ngân hàng</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (formData.paymentMethod === "online" || formData.paymentMethod === "momo" || formData.paymentMethod === "vnpay") {
                      setIsOnlinePaymentOpen(!isOnlinePaymentOpen);
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isOnlinePaymentOpen ? (
                    <FaChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <FaChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </label>

        {/* Online Payment Dropdown */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOnlinePaymentOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="space-y-4">
              {/* MoMo */}
              <div className="bg-white rounded-xl p-4 hover:bg-blue-50 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-200">
                <label className="flex items-center space-x-4 cursor-pointer">
                  <input
                    type="radio"
                    name="onlinePaymentMethod"
                    value="momo"
                    checked={formData.paymentMethod === "momo"}
                    onChange={() => handleOnlinePaymentSelect("momo")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <img
                        src="/images/wallets/momo.png"
                        alt="MoMo"
                        className="w-10 h-8"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">MoMo</h4>
                      <p className="text-sm text-gray-600">Thanh toán qua ví MoMo</p>
                    </div>
                  </div>
                </label>
              </div>


              {/* VNPAY */}
              <div className="bg-white rounded-xl p-4 hover:bg-blue-50 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-200">
                <label className="flex items-center space-x-4 cursor-pointer">
                  <input
                    type="radio"
                    name="onlinePaymentMethod"
                    value="vnpay"
                    checked={formData.paymentMethod === "vnpay"}
                    onChange={() => handleOnlinePaymentSelect("vnpay")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <img
                        src="/images/wallets/vnpay.png"
                        alt="VNPAY"
                        className="w-16 h-8"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">VNPAY</h4>
                      <p className="text-sm text-gray-600">Thanh toán qua VNPAY</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex pt-6">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // setCurrentStep(1); // This line was removed from props, so it's removed here.
          }}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  );
};

export default CheckoutPaymentMethod;
