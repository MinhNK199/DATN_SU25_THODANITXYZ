import React from "react";
import { FaArrowLeft, FaLock } from "react-icons/fa";

interface Props {
  formData: any;
  cartState: any;
  getProvinceName: () => string;
  getDistrictName: () => string;
  getWardName: () => string;
  isProcessing: boolean;
  setCurrentStep: (step: number) => void;
  handleSubmit: (e: React.FormEvent) => void;
  orderNumber: string;
  formatPrice: (price: number) => string;
}

const CheckoutReview: React.FC<Props> = ({
  formData,
  cartState,
  getProvinceName,
  getDistrictName,
  getWardName,
  isProcessing,
  setCurrentStep,
  handleSubmit,
  orderNumber,
  formatPrice,
}) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Xác nhận đơn hàng</h2>
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
      {cartState.items.length === 0 ? (
        <div className="text-gray-500">Không có sản phẩm nào trong đơn hàng.</div>
      ) : (
        <div className="divide-y divide-gray-200">
          {cartState.items.map((item: any) => {
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
);

export default CheckoutReview;