import React from "react";
import { FaTruck, FaCreditCard, FaPaypal } from "react-icons/fa";

interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  cardInfo: { number: string; name: string; expiry: string; cvv: string };
  setCardInfo: React.Dispatch<React.SetStateAction<{ number: string; name: string; expiry: string; cvv: string }>>;
  walletInfo: { type: string; phone: string };
  setWalletInfo: React.Dispatch<React.SetStateAction<{ type: string; phone: string }>>;
  bankTransferInfo: { transactionId: string };
  setBankTransferInfo: React.Dispatch<React.SetStateAction<{ transactionId: string }>>;
  showNewCardForm: boolean;
  setShowNewCardForm: React.Dispatch<React.SetStateAction<boolean>>;
  showNewWalletForm: boolean;
  setShowNewWalletForm: React.Dispatch<React.SetStateAction<boolean>>;
  orderNumber: string;
  setCurrentStep: (step: number) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
  handleInputChange,
}) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
    <div className="space-y-4">
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
      {/* ZaloPay */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="zalopay"
            checked={formData.paymentMethod === 'zalopay'}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600"
          />
          <img src="/images/wallets/zalopay.png" alt="ZaloPay" className="w-5 h-5" />
          <span className="font-medium">Thanh toán qua ZaloPay</span>
        </label>
        {/* Không cần input số điện thoại cho ZaloPay */}
      </div>
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
        <FaTruck className="w-4 h-4" />
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
);

export default CheckoutPaymentMethod;