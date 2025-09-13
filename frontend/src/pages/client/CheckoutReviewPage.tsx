"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { clearCart } from "@/redux/slices/cartSlice";
import { Card, Button, message, Divider, Space, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import Image from "next/image";

const { Title, Text } = Typography;

const CheckoutReviewPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const cartState = useSelector((state: RootState) => state.cart);
  const voucher = useSelector((state: RootState) => state.voucher.voucher);
  const checkout = useSelector((state: RootState) => state.checkout);

  const [loading, setLoading] = useState(false);

  const selectedCartItems = checkout.buyNowProduct
    ? [checkout.buyNowProduct]
    : cartState.items.filter((item) =>
        checkout.selectedCartItemIds?.includes(item._id)
      );

  // ===== TÍNH TOÁN GIÁ =====
  const subtotal = selectedCartItems.reduce((sum, item) => {
    const variant = item.variantInfo;
    const displayPrice = variant
      ? (variant.salePrice && variant.salePrice < variant.price
          ? variant.salePrice
          : variant.price)
      : (item.product.salePrice && item.product.salePrice < item.product.price
          ? item.product.salePrice
          : item.product.price);

    const price = Number(displayPrice) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + price * quantity;
  }, 0);

  const voucherDiscount = voucher && voucher.isValid ? voucher.discountAmount : 0;
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const taxRate = 0.1; // 10% VAT
  const taxPrice = (subtotal - voucherDiscount) * taxRate;
  const finalTotal = subtotal - voucherDiscount + shippingFee + taxPrice;

  // Giới hạn COD
  const COD_LIMIT = 100000000;
  const isCODAllowed = finalTotal <= COD_LIMIT;

  const handlePlaceOrder = async () => {
    if (!checkout.shippingAddress) {
      message.error("Vui lòng nhập địa chỉ giao hàng trước khi đặt hàng");
      return;
    }

    if (checkout.paymentMethod === "COD" && !isCODAllowed) {
      message.error("Đơn hàng COD vượt quá 100 triệu. Vui lòng chọn phương thức khác.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        orderItems: selectedCartItems,
        shippingAddress: checkout.shippingAddress,
        paymentMethod: checkout.paymentMethod,
        itemsPrice: subtotal,
        voucherDiscount: voucherDiscount,
        taxPrice: taxPrice,
        shippingPrice: shippingFee,
        totalPrice: finalTotal,
      };

      console.log("Order Data:", orderData);

      // API tạo đơn hàng
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Đặt hàng thất bại");
      const data = await res.json();

      message.success("Đặt hàng thành công!");
      dispatch(clearCart());
      router.push(`/order-success/${data._id}`);
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra khi đặt hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkout.shippingAddress || !checkout.paymentMethod) {
      message.warning("Vui lòng nhập đầy đủ thông tin trước khi xác nhận đơn hàng");
      router.push("/checkout");
    }
  }, [checkout, router]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Title level={2} className="mb-6 text-center">
        Xác nhận đơn hàng
      </Title>

      {/* Shipping Address */}
      <Card title="Địa chỉ giao hàng" className="mb-6">
        <p><strong>Họ và tên:</strong> {checkout.shippingAddress?.fullName}</p>
        <p><strong>Địa chỉ:</strong> {checkout.shippingAddress?.address}</p>
        <p><strong>Tỉnh/Thành phố:</strong> {checkout.shippingAddress?.city}</p>
        <p><strong>Số điện thoại:</strong> {checkout.shippingAddress?.phone}</p>
      </Card>

      {/* Payment Method */}
      <Card title="Phương thức thanh toán" className="mb-6">
        <Text strong>
          {checkout.paymentMethod === "COD"
            ? "Thanh toán khi nhận hàng (COD)"
            : checkout.paymentMethod}
        </Text>
      </Card>

      {/* Order Items */}
      <Card
        title="Sản phẩm trong đơn hàng"
        className="mb-6"
        extra={<ShoppingCartOutlined />}
      >
        {selectedCartItems.map((item, index) => {
          const variant = item.variantInfo;
          const displayPrice = variant
            ? (variant.salePrice && variant.salePrice < variant.price
                ? variant.salePrice
                : variant.price)
            : (item.product.salePrice && item.product.salePrice < item.product.price
                ? item.product.salePrice
                : item.product.price);

          return (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-4 mb-4"
            >
              <div className="flex items-center space-x-4">
                <Image
                  src={variant?.images?.[0] || item.product.image}
                  alt={item.product.name}
                  width={60}
                  height={60}
                  className="rounded"
                />
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  {variant && (
                    <p className="text-sm text-gray-500">
                      {variant.color?.name} / {variant.size}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">x{item.quantity}</p>
                </div>
              </div>
              <Text strong>{displayPrice.toLocaleString()}₫</Text>
            </div>
          );
        })}
      </Card>

      {/* Order Summary */}
      <Card title="Tóm tắt đơn hàng" className="mb-6">
        <Space direction="vertical" className="w-full">
          <div className="flex justify-between">
            <Text>Tạm tính</Text>
            <Text strong>{subtotal.toLocaleString()}₫</Text>
          </div>
          {voucherDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <Text>Giảm giá voucher</Text>
              <Text strong>-{voucherDiscount.toLocaleString()}₫</Text>
            </div>
          )}
          <div className="flex justify-between">
            <Text>Phí vận chuyển</Text>
            <Text strong>{shippingFee.toLocaleString()}₫</Text>
          </div>
          <div className="flex justify-between">
            <Text>Thuế VAT (10%)</Text>
            <Text strong>{taxPrice.toLocaleString()}₫</Text>
          </div>
          <Divider />
          <div className="flex justify-between text-lg">
            <Text strong>Tổng cộng</Text>
            <Text strong className="text-red-600">
              {finalTotal.toLocaleString()}₫
            </Text>
          </div>
        </Space>
      </Card>

      <div className="flex justify-end">
        <Button
          type="primary"
          size="large"
          loading={loading}
          onClick={handlePlaceOrder}
          disabled={checkout.paymentMethod === "COD" && !isCODAllowed}
        >
          Đặt hàng
        </Button>
      </div>
    </div>
  );
};

export default CheckoutReviewPage;
