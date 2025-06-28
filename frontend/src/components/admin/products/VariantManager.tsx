import React from 'react';
import { Button, Input, InputNumber, Switch, Row, Col, Card, Space, Tooltip, ColorPicker } from 'antd';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  color?: string;
  size?: string;
  weight?: number;
  images: string[];
  isActive: boolean;
}

interface VariantManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
}

const VariantManager: React.FC<VariantManagerProps> = ({ variants, onVariantsChange }) => {
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: "",
      sku: "",
      price: 0,
      stock: 0,
      images: [],
      isActive: true,
    };
    onVariantsChange([...variants, newVariant]);
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    const updatedVariants = variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    );
    onVariantsChange(updatedVariants);
  };

  const removeVariant = (id: string) => {
    const updatedVariants = variants.filter(v => v.id !== id);
    onVariantsChange(updatedVariants);
  };

  const formatPrice = (price: number) => {
    if (!price || price <= 0) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sản phẩm biến thể</h3>
        <Button
          type="primary"
          icon={<FaPlus />}
          onClick={addVariant}
        >
          Thêm biến thể
        </Button>
      </div>

      {variants.map((variant, index) => (
        <Card key={variant.id} className="border-2 border-dashed">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Biến thể {index + 1}</h4>
              <Space>
                <Tooltip title="Kích hoạt biến thể">
                  <Switch
                    checked={variant.isActive}
                    onChange={(checked) => updateVariant(variant.id, 'isActive', checked)}
                    size="small"
                  />
                </Tooltip>
                <Button
                  danger
                  size="small"
                  icon={<FaTrash />}
                  onClick={() => removeVariant(variant.id)}
                />
              </Space>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Input
                  placeholder="Tên biến thể"
                  value={variant.name}
                  onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                />
              </Col>
              <Col span={12}>
                <Input
                  placeholder="SKU"
                  value={variant.sku}
                  onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <InputNumber
                  placeholder="Giá"
                  value={variant.price || 0}
                  onChange={(value) => updateVariant(variant.id, 'price', value || 0)}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  placeholder="Giá khuyến mãi"
                  value={variant.salePrice || undefined}
                  onChange={(value) => updateVariant(variant.id, 'salePrice', value)}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  placeholder="Tồn kho"
                  value={variant.stock || 0}
                  onChange={(value) => updateVariant(variant.id, 'stock', value || 0)}
                  className="w-full"
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <ColorPicker
                  value={variant.color || '#000000'}
                  onChange={(_, hex) => updateVariant(variant.id, 'color', hex)}
                  showText
                  style={{ width: '100%' }}
                />
              </Col>
              <Col span={8}>
                <Input
                  placeholder="Kích thước"
                  value={variant.size}
                  onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  placeholder="Cân nặng (g)"
                  value={variant.weight || undefined}
                  onChange={(value) => updateVariant(variant.id, 'weight', value)}
                  className="w-full"
                />
              </Col>
            </Row>

            {/* Thống kê nhanh */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Giá:</span>
                  <div className="font-medium">{formatPrice(variant.price)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Tồn kho:</span>
                  <div className="font-medium">{variant.stock}</div>
                </div>
                <div>
                  <span className="text-gray-600">Trạng thái:</span>
                  <div className="font-medium">
                    {variant.isActive ? "Kích hoạt" : "Không kích hoạt"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {variants.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p>Chưa có biến thể nào được thêm</p>
          <p className="text-sm">Nhấn "Thêm biến thể" để bắt đầu</p>
        </div>
      )}

      {/* Thống kê tổng quan */}
      {variants.length > 0 && (
        <Card size="small" className="bg-blue-50">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600">{variants.length}</div>
              <div className="text-gray-600">Tổng biến thể</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">
                {variants.filter(v => v.isActive).length}
              </div>
              <div className="text-gray-600">Kích hoạt</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-orange-600">
                {variants.reduce((sum, v) => sum + v.stock, 0)}
              </div>
              <div className="text-gray-600">Tổng tồn kho</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600">
                {variants.filter(v => v.stock === 0).length}
              </div>
              <div className="text-gray-600">Hết hàng</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VariantManager; 