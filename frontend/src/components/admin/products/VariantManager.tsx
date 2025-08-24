"use client"

import type React from "react"
import { Button, Input, InputNumber, Switch, Row, Col, Card, Space, Tooltip, ColorPicker, message, Select } from "antd"
import { FaPlus, FaTrash } from "react-icons/fa"
import SpecificationEditor from "./SpecificationEditor"
import { validateVariant, cleanColorData, COLOR_OPTIONS, type ProductVariant } from "./utils/validation"

interface VariantManagerProps {
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
}

const VariantManager: React.FC<VariantManagerProps> = ({ variants, onVariantsChange }) => {
  // Validation functions
  const validateVariant = (variant: ProductVariant): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!variant.name?.trim()) {
      errors.push("Tên biến thể không được để trống")
    }
    
    if (!variant.sku?.trim()) {
      errors.push("SKU không được để trống")
    }
    
    if (!variant.price || variant.price <= 0) {
      errors.push("Giá phải lớn hơn 0")
    }
    
    if (variant.stock < 0) {
      errors.push("Tồn kho không được âm")
    }
    
    if (!variant.length || variant.length <= 0) {
      errors.push("Chiều dài phải lớn hơn 0")
    }
    
    if (!variant.width || variant.width <= 0) {
      errors.push("Chiều rộng phải lớn hơn 0")
    }
    
    if (!variant.height || variant.height <= 0) {
      errors.push("Chiều cao phải lớn hơn 0")
    }
    
    if (!variant.images?.length || variant.images.every(img => !img.trim())) {
      errors.push("Phải có ít nhất 1 hình ảnh")
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: "",
      sku: "",
      price: 0,
      salePrice: 0,
      stock: 0,
      color: { code: "#000000", name: "Đen" },
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

  const updateVariant = (id: string, field: keyof ProductVariant, value: unknown) => {
    console.log(`🔄 Updating variant ${id}, field: ${field}, value:`, value)

    const updatedVariants = variants.map((v) => {
      if (v.id === id) {
        const updatedVariant = {
          ...v,
          [field]: value,
        }

        // CRITICAL: Đặc biệt xử lý color để đảm bảo luôn là object hợp lệ
        if (field === "color") {
          if (typeof value === "object" && value !== null && "code" in value) {
            const colorValue = value as { code?: string; name?: string }
            updatedVariant.color = {
              code: typeof colorValue.code === "string" ? colorValue.code : "#000000",
              name: typeof colorValue.name === "string" ? colorValue.name : "",
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
            updatedVariant.specifications = { ...value as Record<string, string> }
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
  const handleColorChange = (variantId: string, colorValue: unknown, hex?: string) => {
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

  const handleColorSelect = (variantId: string, colorOption: { code: string; name: string }) => {
    console.log(`🎨 Color selected for variant ${variantId}:`, colorOption)
    updateVariant(variantId, "color", colorOption)
  }

  const handleSpecificationsChange = (variantId: string, specs: Record<string, string>) => {
    console.log(`📋 Handling specifications change for variant ${variantId}:`, specs)

    // Validate specs object
    const validSpecs = typeof specs === "object" && specs !== null ? { ...specs } : {}

    console.log("✅ Final specs to set:", validSpecs)
    updateVariant(variantId, "specifications", validSpecs)
  }

  // Validate all variants
  const validateAllVariants = () => {
    const allErrors: { variantId: string; errors: string[] }[] = []
    
    variants.forEach((variant, index) => {
      const validation = validateVariant(variant)
      if (!validation.isValid) {
        allErrors.push({
          variantId: variant.id,
          errors: validation.errors
        })
      }
    })
    
    return allErrors
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Sản phẩm biến thể</h3>
        <Button type="primary" icon={<FaPlus />} onClick={addVariant}>
          Thêm biến thể
        </Button>
      </div>

      {variants.map((variant, index) => {
        const validation = validateVariant(variant)
        
        return (
          <Card key={variant.id} className={`mb-4 ${!validation.isValid ? 'border-red-300 bg-red-50' : ''}`}>
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

              {/* Validation errors */}
              {!validation.isValid && (
                <div className="bg-red-100 border border-red-300 rounded p-2">
                  <div className="text-red-700 text-sm font-medium mb-1">Lỗi validation:</div>
                  <ul className="text-red-600 text-xs list-disc list-inside">
                    {validation.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Row gutter={16}>
                <Col span={8}>
                  <Input
                    placeholder="Tên biến thể *"
                    value={variant.name}
                    onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                    status={!variant.name?.trim() ? "error" : undefined}
                  />
                </Col>
                <Col span={8}>
                  <Input
                    placeholder="SKU *"
                    value={variant.sku}
                    onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                    status={!variant.sku?.trim() ? "error" : undefined}
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
                    placeholder="Giá gốc *"
                    value={variant.price || undefined}
                    onChange={(value) => updateVariant(variant.id, "price", value || 0)}
                    className="w-full"
                    status={!variant.price || variant.price <= 0 ? "error" : undefined}
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
                    placeholder="Tồn kho *"
                    value={variant.stock || undefined}
                    onChange={(value) => updateVariant(variant.id, "stock", value || 0)}
                    className="w-full"
                    min={0}
                    status={variant.stock < 0 ? "error" : undefined}
                  />
                </Col>
              </Row>

              {/* Color Selection */}
              <Row gutter={16}>
                <Col span={12}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Màu sắc:</label>
                    <div className="flex gap-2 items-center">
                      <ColorPicker
                        value={variant.color?.code || "#000000"}
                        onChange={(color, hex) => handleColorChange(variant.id, color, hex)}
                        showText
                        size="middle"
                      />
                      <Select
                        placeholder="Chọn màu có sẵn"
                        style={{ width: 200 }}
                        value={variant.color?.code}
                        onChange={(value) => {
                          const selectedColor = COLOR_OPTIONS.find(c => c.code === value)
                          if (selectedColor) {
                            handleColorSelect(variant.id, selectedColor)
                          }
                        }}
                        options={COLOR_OPTIONS.map(color => ({
                          label: (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: color.code }}
                              />
                              <span>{color.name}</span>
                            </div>
                          ),
                          value: color.code
                        }))}
                      />
                    </div>
                    {variant.color?.name && (
                      <div className="text-xs text-gray-500">
                        Tên màu: {variant.color.name}
                      </div>
                    )}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Size:</label>
                    <InputNumber
                      placeholder="Size (mm, cm, ...)"
                      value={variant.size || undefined}
                      onChange={(value) => updateVariant(variant.id, "size", value || 0)}
                      min={1}
                      className="w-full"
                      {...validatePositiveNumber(variant.size)}
                    />
                  </div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kích thước (cm):</label>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Dài:</span>
                        <InputNumber
                          placeholder="D"
                          value={variant.length || undefined}
                          onChange={(value) => updateVariant(variant.id, "length", value || 0)}
                          min={1}
                          style={{ width: 80 }}
                          status={!variant.length || variant.length <= 0 ? "error" : undefined}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Rộng:</span>
                        <InputNumber
                          placeholder="R"
                          value={variant.width || undefined}
                          onChange={(value) => updateVariant(variant.id, "width", value || 0)}
                          min={1}
                          style={{ width: 80 }}
                          status={!variant.width || variant.width <= 0 ? "error" : undefined}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Cao:</span>
                        <InputNumber
                          placeholder="C"
                          value={variant.height || undefined}
                          onChange={(value) => updateVariant(variant.id, "height", value || 0)}
                          min={1}
                          style={{ width: 80 }}
                          status={!variant.height || variant.height <= 0 ? "error" : undefined}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hình ảnh *:</label>
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
                      status={!variant.images?.length || variant.images.every(img => !img.trim()) ? "error" : undefined}
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
                  </div>
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
        )
      })}

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
