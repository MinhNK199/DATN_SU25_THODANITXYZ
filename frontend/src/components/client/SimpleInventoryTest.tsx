import React, { useState } from 'react';
import { Card, Button, InputNumber, Space, Typography, Alert } from 'antd';
import { useInventory } from '../../contexts/InventoryContext';
import { toast } from 'react-hot-toast';

const { Title, Text } = Typography;

const SimpleInventoryTest: React.FC = () => {
  const { state, getAvailableStock, getReservedQuantity } = useInventory();
  const [testProductId] = useState('test-product-123');
  const [quantity, setQuantity] = useState(1);

  const availableStock = getAvailableStock(testProductId);
  const reservedQuantity = getReservedQuantity(testProductId);

  return (
    <Card title="Simple Inventory Test" className="mb-4">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message="Inventory Status"
          description={
            <div>
              <p>Connected: {state.isConnected ? '✅ Yes' : '❌ No'}</p>
              <p>Loading: {state.loading ? '⏳ Yes' : '✅ No'}</p>
              <p>Error: {state.error || 'None'}</p>
            </div>
          }
          type={state.isConnected ? 'success' : 'error'}
        />

        <div>
          <Title level={4}>Product: {testProductId}</Title>
          <Text>Available Stock: <strong>{availableStock}</strong></Text>
          <br />
          <Text>Reserved Quantity: <strong>{reservedQuantity}</strong></Text>
        </div>

        <div>
          <Text>Test Quantity: </Text>
          <InputNumber
            min={1}
            max={10}
            value={quantity}
            onChange={(value) => setQuantity(value || 1)}
          />
        </div>

        <Button
          type="primary"
          onClick={() => {
            toast.success(`Testing with quantity: ${quantity}`);
            console.log('Inventory State:', state);
            console.log('Available Stock:', availableStock);
            console.log('Reserved Quantity:', reservedQuantity);
          }}
        >
          Test Inventory
        </Button>
      </Space>
    </Card>
  );
};

export default SimpleInventoryTest;
