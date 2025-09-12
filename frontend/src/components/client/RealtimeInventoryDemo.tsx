import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, InputNumber, Badge, Spin } from 'antd';
import { FaShoppingCart, FaEye, FaSync } from 'react-icons/fa';
import { useInventory } from '../../contexts/InventoryContext';
import RealtimeStockDisplay from './RealtimeStockDisplay';
import RealtimeAddToCart from './RealtimeAddToCart';
import { toast } from 'react-hot-toast';

interface RealtimeInventoryDemoProps {
  productId: string;
  productName: string;
  initialStock?: number;
}

const RealtimeInventoryDemo: React.FC<RealtimeInventoryDemoProps> = ({
  productId,
  productName,
  initialStock = 10
}) => {
  const {
    state,
    getAvailableStock,
    getReservedQuantity,
    reserveProduct,
    releaseReservation,
    checkStock,
    joinProductRoom,
    leaveProductRoom
  } = useInventory();

  const [testQuantity, setTestQuantity] = useState(1);
  const [isTesting, setIsTesting] = useState(false);

  // Join product room for realtime updates
  useEffect(() => {
    joinProductRoom(productId);
    return () => {
      leaveProductRoom(productId);
    };
  }, [productId, joinProductRoom, leaveProductRoom]);

  // Test functions
  const handleTestReserve = async () => {
    if (testQuantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    setIsTesting(true);
    try {
      const success = await reserveProduct({
        productId,
        quantity: testQuantity
      });

      if (success) {
        toast.success(`Đã đặt trước ${testQuantity} sản phẩm`);
      } else {
        toast.error('Không thể đặt trước sản phẩm');
      }
    } catch (error) {
      toast.error('Lỗi khi đặt trước sản phẩm');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestRelease = async () => {
    if (testQuantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0');
      return;
    }

    setIsTesting(true);
    try {
      const success = await releaseReservation({
        productId,
        quantity: testQuantity
      });

      if (success) {
        toast.success(`Đã hủy đặt trước ${testQuantity} sản phẩm`);
      } else {
        toast.error('Không thể hủy đặt trước sản phẩm');
      }
    } catch (error) {
      toast.error('Lỗi khi hủy đặt trước sản phẩm');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestCheckStock = async () => {
    setIsTesting(true);
    try {
      const success = await checkStock([{
        productId,
        quantity: testQuantity
      }]);

      if (success) {
        toast.success(`Có thể đặt ${testQuantity} sản phẩm`);
      } else {
        toast.error(`Không thể đặt ${testQuantity} sản phẩm`);
      }
    } catch (error) {
      toast.error('Lỗi khi kiểm tra tồn kho');
    } finally {
      setIsTesting(false);
    }
  };

  const availableStock = getAvailableStock(productId);
  const reservedQuantity = getReservedQuantity(productId);

  return (
    <Card 
      title={`Realtime Inventory Demo - ${productName}`}
      className="mb-4"
      extra={
        <Badge 
          status={state.isConnected ? 'success' : 'error'} 
          text={state.isConnected ? 'Connected' : 'Disconnected'}
        />
      }
    >
      <Row gutter={[16, 16]}>
        {/* Stock Display */}
        <Col span={24}>
          <Card size="small" title="Stock Information">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {availableStock}
                  </div>
                  <div className="text-sm text-gray-600">Available Stock</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {reservedQuantity}
                  </div>
                  <div className="text-sm text-gray-600">Reserved</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {availableStock + reservedQuantity}
                  </div>
                  <div className="text-sm text-gray-600">Total Stock</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Realtime Components */}
        <Col span={12}>
          <Card size="small" title="Realtime Stock Display">
            <RealtimeStockDisplay
              productId={productId}
              initialStock={initialStock}
              showReserved={true}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card size="small" title="Realtime Add to Cart">
            <RealtimeAddToCart
              productId={productId}
              initialStock={initialStock}
              showQuantityInput={true}
              maxQuantity={availableStock}
            />
          </Card>
        </Col>

        {/* Test Controls */}
        <Col span={24}>
          <Card size="small" title="Test Controls">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <InputNumber
                  min={1}
                  max={availableStock}
                  value={testQuantity}
                  onChange={(value) => setTestQuantity(value || 1)}
                  className="w-full"
                  placeholder="Quantity"
                />
              </Col>
              <Col span={6}>
                <Button
                  type="primary"
                  icon={<FaShoppingCart />}
                  onClick={handleTestReserve}
                  loading={isTesting}
                  className="w-full"
                >
                  Test Reserve
                </Button>
              </Col>
              <Col span={6}>
                <Button
                  type="default"
                  icon={<FaSync />}
                  onClick={handleTestRelease}
                  loading={isTesting}
                  className="w-full"
                >
                  Test Release
                </Button>
              </Col>
              <Col span={6}>
                <Button
                  type="dashed"
                  icon={<FaEye />}
                  onClick={handleTestCheckStock}
                  loading={isTesting}
                  className="w-full"
                >
                  Check Stock
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Status */}
        <Col span={24}>
          <Card size="small" title="System Status">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div className="text-center">
                  <div className={`text-lg font-bold ${state.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {state.isConnected ? '🟢' : '🔴'}
                  </div>
                  <div className="text-sm text-gray-600">WebSocket</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <div className={`text-lg font-bold ${state.loading ? 'text-yellow-600' : 'text-green-600'}`}>
                    {state.loading ? <Spin /> : '✅'}
                  </div>
                  <div className="text-sm text-gray-600">Loading</div>
                </div>
              </Col>
              <Col span={8}>
                <div className="text-center">
                  <div className={`text-lg font-bold ${state.error ? 'text-red-600' : 'text-green-600'}`}>
                    {state.error ? '❌' : '✅'}
                  </div>
                  <div className="text-sm text-gray-600">Error</div>
                </div>
              </Col>
            </Row>
            {state.error && (
              <div className="mt-2 text-red-600 text-sm">
                Error: {state.error}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default RealtimeInventoryDemo;
