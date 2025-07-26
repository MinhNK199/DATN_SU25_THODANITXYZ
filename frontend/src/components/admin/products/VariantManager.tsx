"use client"

import type React from "react"
import { Button, Input, InputNumber, Switch, Row, Col, Card, Space, Tooltip, ColorPicker, message } from "antd"
import { FaPlus, FaTrash } from "react-icons/fa"
import SpecificationEditor from "./SpecificationEditor"

interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  salePrice?: number
  stock: number
  color?: { code: string; name: string }
  size?: number
  weight?: number
  images: string[]
  isActive: boolean
  length?: number
  width?: number
  height?: number
  specifications?: { [key: string]: string }
}

interface VariantManagerProps {
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
}

const VariantManager: React.FC<VariantManagerProps> = ({ variants, onVariantsChange }) => {
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: "",
      sku: "",
      price: 0,
      salePrice: 0,
      stock: 0,
      color: { code: "#000000", name: "" },
      size: 0,
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      images: [],
      isActive: true,
      specifications: {},
    }
    onVariantsChange([...variants, newVariant])
  }

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    console.log(`🔄 Updating variant ${id}, field: ${field}, value:`, value)

    const updatedVariants = variants.map((v) => {
      if (v.id === id) {
        const updatedVariant = {
          ...v,
          [field]: value,
        }

        // CRITICAL: Đặc biệt xử lý color để đảm bảo luôn là object hợp lệ
        if (field === "color") {
          if (typeof value === "object" && value !== null && value.code !== undefined) {
            updatedVariant.color = {
              code: typeof value.code === "string" ? value.code : "#000000",
              name: typeof value.name === "string" ? value.name : "",
            }
            console.log("✅ Color updated to:", updatedVariant.color)
          } else {
            console.log("⚠️ Invalid color value, using default")
            updatedVariant.color = { code: "#000000", name: "" }
          }
        }

        // CRITICAL: Đặc biệt xử lý specifications để đảm bảo luôn là object hợp lệ
        if (field === "specifications") {
          if (typeof value === "object" && value !== null) {
            updatedVariant.specifications = { ...value }
            console.log("✅ Specifications updated to:", updatedVariant.specifications)
          } else {
            console.log("⚠️ Invalid specifications value, using empty object")
            updatedVariant.specifications = {}
          }
        }

        return updatedVariant
      }
      return v
    })

    console.log(
      "📤 Updated variants:",
      updatedVariants.map((v) => ({
        id: v.id,
        name: v.name,
        color: v.color,
        specifications: v.specifications,
      })),
    )

    onVariantsChange(updatedVariants)
  }

  const removeVariant = (id: string) => {
    if (variants.length <= 1) {
      message.warning("Phải có ít nhất 1 biến thể!")
      return
    }
    const updatedVariants = variants.filter((v) => v.id !== id)
    onVariantsChange(updatedVariants)
  }

  const formatPrice = (price: number) => {
    if (!price || price <= 0) return "0 ₫"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const validatePositiveNumber = (value: any) => {
    if (typeof value !== "number" || value <= 0 || isNaN(value)) {
      return {
        validateStatus: "error" as const,
        help: "Phải nhập số dương",
      }
    }
    return {}
  }

  // CRITICAL FIX: Xử lý ColorPicker change event đúng cách
  const handleColorChange = (variantId: string, colorValue: any, hex?: string) => {
    console.log(`🎨 Handling color change for variant ${variantId}:`, { colorValue, hex })

    const currentVariant = variants.find((v) => v.id === variantId)
    const currentColor = currentVariant?.color || { code: "#000000", name: "" }

    let newColor: { code: string; name: string }

    if (hex) {
      // Từ ColorPicker - chỉ cập nhật code
      newColor = {
        code: hex,
        name: currentColor.name,
      }
      console.log("🎨 Color from ColorPicker:", newColor)
    } else if (typeof colorValue === "object" && colorValue !== null) {
      // Từ object - đảm bảo có đầy đủ code và name
      newColor = {
        code: typeof colorValue.code === "string" ? colorValue.code : currentColor.code,
        name: typeof colorValue.name === "string" ? colorValue.name : currentColor.name,
      }
      console.log("🎨 Color from object:", newColor)
    } else {
      // Fallback
      console.log("⚠️ Invalid color input, using current color")
      newColor = currentColor
    }

    // Validate final color object
    if (!newColor.code || typeof newColor.code !== "string") {
      newColor.code = "#000000"
    }
    if (typeof newColor.name !== "string") {
      newColor.name = ""
    }

    console.log("✅ Final color to set:", newColor)
    updateVariant(variantId, "color", newColor)
  }

  const handleSpecificationsChange = (variantId: string, specs: Record<string, string>) => {
    console.log(`📋 Handling specifications change for variant ${variantId}:`, specs)

    // Validate specs object
    const validSpecs = typeof specs === "object" && specs !== null ? { ...specs } : {}

    console.log("✅ Final specs to set:", validSpecs)
    updateVariant(variantId, "specifications", validSpecs)
  }

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
              <h4 className="font-medium">
                Biến thể {index + 1}
                {variant.color?.code && variant.color.code !== "#000000" && (
                  <span
                    className="ml-2 inline-block w-4 h-4 rounded border"
                    style={{ backgroundColor: variant.color.code }}
                    title={`${variant.color.name || "Unnamed"} (${variant.color.code})`}
                  />
                )}
              </h4>
              <Space>
                <Tooltip title="Kích hoạt biến thể">
                  <Switch
                    checked={variant.isActive}
                    onChange={(checked) => updateVariant(variant.id, "isActive", checked)}
                    size="small"
                  />
                </Tooltip>
                <Button
                  danger
                  size="small"
                  icon={<FaTrash />}
                  onClick={() => removeVariant(variant.id)}
                  disabled={variants.length <= 1}
                />
              </Space>
            </div>

            <Row gutter={16}>
              <Col span={8}>
                <Input
                  placeholder="Tên biến thể"
                  value={variant.name}
                  onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                />
              </Col>
              <Col span={8}>
                <Input
                  placeholder="SKU"
                  value={variant.sku}
                  onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  placeholder="Cân nặng (gram)"
                  value={variant.weight || undefined}
                  onChange={(value) => updateVariant(variant.id, "weight", value || 0)}
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
                  onChange={(value) => updateVariant(variant.id, "price", value || 0)}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  placeholder="Giá khuyến mãi"
                  value={variant.salePrice || undefined}
                  onChange={(value) => updateVariant(variant.id, "salePrice", value)}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </Col>
              <Col span={8}>
                <InputNumber
                  placeholder="Tồn kho"
                  value={variant.stock || undefined}
                  onChange={(value) => updateVariant(variant.id, "stock", value || 0)}
                  className="w-full"
                />
              </Col>
            </Row>

            <Row gutter={16}>
              
              <Col span={6}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ minWidth: 60, fontSize: 12 }}>Size:</span>
                <InputNumber
                  placeholder="Size (mm, cm, ...)"
                  value={variant.size || undefined}
                  onChange={(value) => updateVariant(variant.id, "size", value || 0)}
                  min={1}
                  style={{ width: "100%" }}
                  {...validatePositiveNumber(variant.size)}
                />
                </div>
              </Col>
              <Col span={18}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ minWidth: 60, fontSize: 12 }}>Kích thước:</span>
                  <InputNumber
                    placeholder="D"
                    value={variant.length || undefined}
                    onChange={(value) => updateVariant(variant.id, "length", value || 0)}
                    min={1}
                    style={{ width: 50 }}
                    {...validatePositiveNumber(variant.length)}
                  />
                  <InputNumber
                    placeholder="R"
                    value={variant.width || undefined}
                    onChange={(value) => updateVariant(variant.id, "width", value || 0)}
                    min={1}
                    style={{ width: 50 }}
                    {...validatePositiveNumber(variant.width)}
                  />
                  <InputNumber
                    placeholder="C"
                    value={variant.height || undefined}
                    onChange={(value) => updateVariant(variant.id, "height", value || 0)}
                    min={1}
                    style={{ width: 50 }}
                    {...validatePositiveNumber(variant.height)}
                  />
                </div>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Input
                  placeholder="Link hình ảnh (cách nhau bởi dấu phẩy)"
                  value={variant.images?.join(",") || ""}
                  onChange={(e) =>
                    updateVariant(
                      variant.id,
                      "images",
                      e.target.value
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
                {Array.isArray(variant.images) && variant.images[0] && (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={variant.images[0] || "/placeholder.svg"}
                      alt="Preview"
                      style={{
                        maxWidth: 120,
                        maxHeight: 120,
                        borderRadius: 8,
                        border: "1px solid #eee",
                      }}
                    />
                  </div>
                )}
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <div style={{ marginTop: 8, marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>Thông số kỹ thuật biến thể:</span>
                  <SpecificationEditor
                    value={variant.specifications || {}}
                    onChange={(specs) => handleSpecificationsChange(variant.id, specs)}
                  />
                  {/* Debug info - REMOVE IN PRODUCTION */}
                  <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
                    Debug specs: {JSON.stringify(variant.specifications)}
                  </div>
                </div>
              </Col>
            </Row>

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
                  <div className="font-medium">{variant.isActive ? "Kích hoạt" : "Không kích hoạt"}</div>
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
              <div className="font-bold text-green-600">{variants.filter((v) => v.isActive).length}</div>
              <div className="text-gray-600">Kích hoạt</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-orange-600">{variants.reduce((sum, v) => sum + v.stock, 0)}</div>
              <div className="text-gray-600">Tổng tồn kho</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600">{variants.filter((v) => v.stock === 0).length}</div>
              <div className="text-gray-600">Hết hàng</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default VariantManager
