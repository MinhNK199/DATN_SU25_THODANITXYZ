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
  orderNumber: string;
  setCurrentStep: (step: number) => void;
  handleNextStep: () => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
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
  orderNumber,
  setCurrentStep,
  handleNextStep,
  handleInputChange,
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
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 cursor-pointer">
        <label className="flex items-center space-x-4 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={formData.paymentMethod === "cod"}
            onChange={() => handlePaymentMethodChange("cod")}
            className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FaTruck className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Thanh toán khi nhận hàng</h3>
              <p className="text-gray-600 text-sm">Thanh toán bằng tiền mặt khi nhận hàng</p>
            </div>
          </div>
        </label>
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
                checked={formData.paymentMethod === "online" || formData.paymentMethod === "momo" || formData.paymentMethod === "zalopay" || formData.paymentMethod === "vnpay"}
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
                    if (formData.paymentMethod === "online" || formData.paymentMethod === "momo" || formData.paymentMethod === "zalopay" || formData.paymentMethod === "vnpay") {
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
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOnlinePaymentOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
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

              {/* ZaloPay */}
              <div className="bg-white rounded-xl p-4 hover:bg-blue-50 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-200">
                <label className="flex items-center space-x-4 cursor-pointer">
                  <input
                    type="radio"
                    name="onlinePaymentMethod"
                    value="zalopay"
                    checked={formData.paymentMethod === "zalopay"}
                    onChange={() => handleOnlinePaymentSelect("zalopay")}
                    className="w-4 h-4 text-blue-600"
                  />
                                     <div className="flex items-center space-x-3">
                     <div className="w-20 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                       <img
                         src="/images/wallets/zalopay.png"
                         alt="ZaloPay"
                         className="w-16 h-8"
                       />
                     </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">ZaloPay</h4>
                      <p className="text-sm text-gray-600">Thanh toán qua ZaloPay</p>
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
            setCurrentStep(1);
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
