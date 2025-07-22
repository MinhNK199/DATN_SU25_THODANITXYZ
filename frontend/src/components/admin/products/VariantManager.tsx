import React from 'react';
import {
  Button,
  Input,
  InputNumber,
  Switch,
  Row,
  Col,
  Card,
  Space,
  Tooltip,
  ColorPicker,
} from 'antd';
import { FaPlus, FaTrash } from 'react-icons/fa';
import SpecificationEditor from './SpecificationEditor';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  color?: { code: string; name: string };
  size?: number; // size là số
  weight?: number;
  images: string[];
  isActive: boolean;
  length?: number;
  width?: number;
  height?: number;
  specifications?: { [key: string]: string };
}

interface VariantManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
}

const VariantManager: React.FC<VariantManagerProps> = ({ variants, onVariantsChange }) => {
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: '',
      sku: '',
      price: 0,
      salePrice: 0,
      stock: 0,
      color: { code: '#000000', name: '' },
      size: 0,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      images: [],
      isActive: true,
      specifications: {},
    };
    onVariantsChange([...variants, newVariant]);
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    const updatedVariants = variants.map((v) => {
      if (v.id === id) {
        return {
          ...{
            id: v.id,
            name: v.name || '',
            sku: v.sku || '',
            price: v.price || 0,
            salePrice: v.salePrice || 0,
            stock: v.stock || 0,
            color: v.color || { code: '#000000', name: '' },
            size: v.size || 0,
            length: v.length || 0,
            width: v.width || 0,
            height: v.height || 0,
            weight: v.weight || 0,
            images: v.images || [],
            isActive: typeof v.isActive === 'boolean' ? v.isActive : true,
            specifications: v.specifications || {},
          },
          [field]: value,
        };
      }
      return v;
    });
    onVariantsChange(updatedVariants);
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 1) {
      // Không cho xóa nếu chỉ còn 1 biến thể
      return;
    }
    const updatedVariants = variants.filter((v) => v.id !== id);
    onVariantsChange(updatedVariants);
  };

  const formatPrice = (price: number) => {
    if (!price || price <= 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Thêm validate khi nhập size, length, width, height
  const validatePositiveNumber = (value: any) => {
    if (typeof value !== 'number' || value <= 0 || isNaN(value)) {
      return {
        validateStatus: 'error',
        help: 'Phải nhập số dương',
      };
    }
    return {};
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sản phẩm biến thể</h3>
        <Button type="primary" icon={<FaPlus />} onClick={addVariant}>
          Thêm biến thể
        </Button>
      </div>

      {variants.map((variant, index) => (
        <Card key={variant.id} className="mb-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Biến thể {index + 1}</h4>
              <Space>
                <Tooltip key={`tooltip-${variant.id}`} title="Kích hoạt biến thể">
                  <Switch
                    checked={variant.isActive}
                    onChange={(checked) =>
                      updateVariant(variant.id, 'isActive', checked)
                    }
                    size="small"
                  />
                </Tooltip>
                <Button
                  key={`btn-${variant.id}`}
                  danger
                  size="small"
                  icon={<FaTrash />}
                  onClick={() => removeVariant(variant.id)}
                />
              </Space>
            </div>


            <Row gutter={16}>
              <Col span={8}>
                <Input
                  placeholder="Tên biến thể"
                  value={variant.name}
                  onChange={(e) =>
                    updateVariant(variant.id, 'name', e.target.value)
                  }
                />
              </Col>
              <Col span={8}>
                <Input
                  placeholder="SKU"
                  value={variant.sku}
                  onChange={(e) =>
                    updateVariant(variant.id, 'sku', e.target.value)
                  }
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  placeholder="Cân nặng (gram)"
                  value={variant.weight || undefined}
                  onChange={(value) => updateVariant(variant.id, 'weight', value || 0)}
                  min={0}
                  className="w-full"
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <InputNumber
                  placeholder="Giá gốc"
                  value={variant.price || undefined}
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
                  value={variant.stock || undefined}
                  onChange={(value) => updateVariant(variant.id, 'stock', value || 0)}
                  className="w-full"
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ minWidth: 60 }}>Màu sắc:</span>
                  <ColorPicker
                    value={variant.color?.code || '#000000'}
                    onChange={(color, hex) => {
                      updateVariant(variant.id, 'color', { ...variant.color, code: hex });
                    }}
                    showText
                  />
                  <Input
                    placeholder="Tên màu"
                    value={variant.color?.name || ''}
                    onChange={e => updateVariant(variant.id, 'color', { ...variant.color, name: e.target.value })}
                    style={{ width: 100 }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <InputNumber
                  placeholder="Size (mm, cm, ...)"
                  value={variant.size || undefined}
                  onChange={value => updateVariant(variant.id, 'size', value || 0)}
                  min={1}
                  style={{ width: '100%' }}
                  {...validatePositiveNumber(variant.size)}
                />
              </Col>
              <Col span={8}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ minWidth: 80 }}>Kích thước (cm):</span>
                  <InputNumber
                    placeholder="Dài"
                    value={variant.length || undefined}
                    onChange={value => updateVariant(variant.id, 'length', value || 0)}
                    min={1}
                    style={{ width: 60 }}
                    {...validatePositiveNumber(variant.length)}
                  />
                  <InputNumber
                    placeholder="Rộng"
                    value={variant.width || undefined}
                    onChange={value => updateVariant(variant.id, 'width', value || 0)}
                    min={1}
                    style={{ width: 60 }}
                    {...validatePositiveNumber(variant.width)}
                  />
                  <InputNumber
                    placeholder="Cao"
                    value={variant.height || undefined}
                    onChange={value => updateVariant(variant.id, 'height', value || 0)}
                    min={1}
                    style={{ width: 60 }}
                    {...validatePositiveNumber(variant.height)}
                  />
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Input
                  placeholder="Link hình ảnh (cách nhau bởi dấu phẩy)"
                  value={variant.images?.join(',') || ''}
                  onChange={(e) => updateVariant(variant.id, 'images', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                />
                {/* Nếu đã có ít nhất 1 ảnh, hiển thị nút Thêm ảnh */}
                {Array.isArray(variant.images) && variant.images.length > 0 && (
                  <Button
                    style={{ marginTop: 8 }}
                    onClick={() => updateVariant(variant.id, 'images', [...variant.images, ''])}
                  >
                    Thêm ảnh
                  </Button>
                )}
                {/* Xem trước ảnh đầu tiên nếu có */}
                {Array.isArray(variant.images) && variant.images[0] && (
                  <div style={{ marginTop: 8 }}>
                    <img src={variant.images[0]} alt="Preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }} />
                  </div>
                )}
              </Col>
            </Row>

            {/* Thông số kỹ thuật cho từng biến thể */}
            <Row gutter={16}>
              <Col span={24}>
                <div style={{ marginTop: 8, marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>Thông số kỹ thuật:</span>
                  <SpecificationEditor
                    value={typeof variant.specifications === 'object' && variant.specifications !== null ? variant.specifications : {}}
                    onChange={specs => updateVariant(variant.id, 'specifications', specs)}
                  />
                </div>
              </Col>
            </Row>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Giá:</span>
                  <div className="font-medium">
                    {formatPrice(variant.price)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Tồn kho:</span>
                  <div className="font-medium">{variant.stock}</div>
                </div>
                <div>
                  <span className="text-gray-600">Trạng thái:</span>
                  <div className="font-medium">
                    {variant.isActive ? 'Kích hoạt' : 'Không kích hoạt'}
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

      {variants.length > 0 && (
        <Card size="small" className="bg-blue-50">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600">{variants.length}</div>
              <div className="text-gray-600">Tổng biến thể</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">
                {variants.filter((v) => v.isActive).length}
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
                {variants.filter((v) => v.stock === 0).length}
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
