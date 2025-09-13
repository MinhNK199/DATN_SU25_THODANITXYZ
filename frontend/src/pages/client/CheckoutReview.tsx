import React from "react";
import { FaArrowLeft, FaCheck, FaTruck, FaCreditCard, FaMapMarkerAlt } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";

interface Props {
  selectedAddress: any;
  formData: any;
  cardInfo: { number: string; name: string; expiry: string; cvv: string };
  walletInfo: { type: string; phone: string };
  bankTransferInfo: { transactionId: string };
  selectedCartItems?: any[];
}

const CheckoutReview: React.FC<Props> = ({
  selectedAddress,
  formData,
  cardInfo,
  walletInfo,
  bankTransferInfo,
  selectedCartItems,
}) => {
  const { state: cartState } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getPaymentMethodIcon = () => {
    switch (formData.paymentMethod) {
      case 'cod':
        return <FaTruck className="w-5 h-5 text-green-600" />;
      case 'momo':
        return <img src="/images/wallets/momo.png" alt="MoMo" className="w-5 h-5" />;
      case 'vnpay':
        return <img src="/images/wallets/vnpay.png" alt="VNPAY" className="w-5 h-5" />;
      default:
        return <FaCreditCard className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPaymentMethodName = () => {
    switch (formData.paymentMethod) {
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      case 'momo':
        return 'Thanh toán qua MoMo';
      case 'vnpay':
        return 'Thanh toán qua VNPAY';
      default:
        return 'Phương thức thanh toán';
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Details Section */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaCheck className="w-5 h-5 mr-2" />
            Chi tiết đơn hàng
          </h3>
          <p className="text-blue-100 text-sm mt-1">Xem lại thông tin chi tiết sản phẩm</p>
        </div>
        
        <div className="p-6">
        {(selectedCartItems || cartState.items).length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCheck className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500">Không có sản phẩm nào trong đơn hàng.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {(selectedCartItems || cartState.items).slice(0, 3).map((item: any, index: number) => {
                const p = item.product;
                const variant = item.variantInfo;
                // Ưu tiên ảnh biến thể, nếu không có thì dùng ảnh sản phẩm đại diện
                const image = variant?.images?.[0] || (p.images && p.images.length > 0 ? p.images[0] : '/images/no-image.png');
                const displayPrice = variant ? 
                  (variant.salePrice && variant.salePrice < variant.price ? variant.salePrice : variant.price) :
                  (p.salePrice && p.salePrice < p.price ? p.salePrice : p.price);
                const hasDiscount = variant ? 
                  (variant.salePrice && variant.salePrice < variant.price) :
                  (p.salePrice && p.salePrice < p.price);
                return (
                  <div key={item._id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden shadow-sm">
                      <img 
                        src={image} 
                        alt={p.name} 
                        className="w-full h-full object-cover"
                        title={variant?.images?.[0] ? 'Ảnh biến thể' : 'Ảnh sản phẩm đại diện'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 mb-1 truncate">{p.name}</h4>
                      {variant && (
                        <p className="text-xs text-blue-600 font-medium mb-1">
                          {variant.color?.name || variant.name || 'Màu sắc'}
                          {variant.size && ` - Size ${variant.size}`}
                        </p>
                      )}
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 line-through text-xs">{formatPrice(variant?.price || p.price)}</span>
                          <span className="text-red-600 font-bold text-sm">{formatPrice(displayPrice)}</span>
                          <span className="bg-red-100 text-red-700 px-1 py-0.5 rounded text-xs font-semibold">
                            -{Math.round(100 - (displayPrice / (variant?.price || p.price)) * 100)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-900 font-bold text-sm">{formatPrice(displayPrice)}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold mb-1">
                        SL: {item.quantity}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatPrice(displayPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(selectedCartItems || cartState.items).length > 3 && (
                <div className="text-center py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <span className="text-blue-700 font-semibold text-sm">
                    +{(selectedCartItems || cartState.items).length - 3} sản phẩm khác
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Shipping Information Section */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-5">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaMapMarkerAlt className="w-5 h-5 mr-2" />
            Thông tin giao hàng
          </h3>
          <p className="text-green-100 text-sm mt-1">Địa chỉ nhận hàng của bạn</p>
        </div>
        
        <div className="p-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaMapMarkerAlt className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-900 mb-1">
                  {selectedAddress ? selectedAddress.fullName : formData.lastName}
                </h4>
                <div className="text-gray-700 text-sm space-y-1">
                  <p>{selectedAddress ? selectedAddress.address : formData.address}</p>
                  <p>
                    {selectedAddress 
                      ? `${selectedAddress.wardName || ''}, ${selectedAddress.cityName || ''}`
                      : `${formData.ward_code}, ${formData.province_code}`
                    }
                  </p>
                  <p className="font-semibold text-blue-600">
                    📞 {selectedAddress ? selectedAddress.phone : formData.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-6 py-5">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaCreditCard className="w-5 h-5 mr-2" />
            Phương thức thanh toán
          </h3>
          <p className="text-purple-100 text-sm mt-1">Cách bạn sẽ thanh toán</p>
        </div>
        
        <div className="p-6">
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                {getPaymentMethodIcon()}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-gray-900">
                  {getPaymentMethodName()}
                </h4>
                <p className="text-gray-600 text-sm">
                  {formData.paymentMethod === 'cod' 
                    ? 'Thanh toán bằng tiền mặt khi nhận hàng'
                    : 'Thanh toán trực tuyến an toàn'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex pt-4">
        <button
          type="button"
          onClick={() => {
            // Navigation is now handled by parent component
            // This button can be removed or used for other purposes
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

export default CheckoutReview;