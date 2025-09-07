"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Space,
  Card,
  Row,
  Col,
  Typography,
  TreeSelect,
  Switch,
  Divider,
} from "antd"
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons"
import { getCategories, getBrands } from "./api"
import slugify from "slugify"
import type { Category } from "../../../interfaces/Category"
import type { Brand } from "../../../interfaces/Brand"
import VariantManager from "./VariantManager"
import { validateAllVariants, cleanColorData, validateAndCleanProductData } from "./utils/validation"

const { Title, Text } = Typography
const { Option } = Select

const API_URL = "http://localhost:8000/api"

// Hàm chuyển đổi cấu trúc cây cho TreeSelect
const buildCategoryTree = (categories: Category[], parentId: string | null = null): any[] => {
  return categories
    .filter((cat) => cat.parent === parentId || (parentId === null && !cat.parent))
    .map((cat) => ({
      title: cat.name,
      value: cat._id,
      children: buildCategoryTree(categories, cat._id),
    }))
}

const ProductAddPage: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [images, setImages] = useState<string[]>([""])
  const [previewImage, setPreviewImage] = useState<string>("")
  const [variants, setVariants] = useState<any[]>([])
  const [specs, setSpecs] = useState<Record<string, string>>({})
  // Thêm state cho file ảnh đại diện
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const mainImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const currentSpecs = form.getFieldValue("specifications")
    if (currentSpecs && typeof currentSpecs === "object") {
      form.setFieldsValue({
        specifications: Object.entries(currentSpecs)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n"),
      })
    } else if (!currentSpecs) {
      form.setFieldsValue({ specifications: "" })
    }
  }, [form])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brs] = await Promise.all([getCategories(), getBrands()])
        setCategories(cats)
        setBrands(brs)
      } catch (error) {
        message.error("Không thể tải dữ liệu cho danh mục và thương hiệu.")
      }
    }
    fetchData()
  }, [])

  const categoryTree = buildCategoryTree(categories)

  // ENHANCED: handleVariantsChange với better validation cho ColorSelector
  const handleVariantsChange = (newVariants: any[]) => {
    console.log("🔄 Variants changed:", newVariants)

    // CRITICAL: Đảm bảo color luôn là object hợp lệ cho ColorSelector
    const cleanedVariants = newVariants.map((variant, index) => {
      const cleanedVariant = { ...variant }

      // CRITICAL: Validate color object structure cho ColorSelector
      cleanedVariant.color = cleanColorData(variant.color)

      // Validate specifications
      if (!cleanedVariant.specifications || typeof cleanedVariant.specifications !== "object") {
        cleanedVariant.specifications = {}
      }

      console.log(`✅ Validated variant ${index} for ColorSelector:`, {
        name: cleanedVariant.name,
        color: cleanedVariant.color,
      })

      return cleanedVariant
    })

    console.log("✅ Cleaned variants for ColorSelector:", cleanedVariants)
    setVariants(cleanedVariants)
  }

  const onFinish = async (values: any) => {
    const validation = validateAllVariants(variants)
    if (!validation.isValid) {
      message.error(`Lỗi validation:\n${validation.errors.join('\n')}`)
      return
    }
    setLoading(true)
    try {
      const brandId = typeof values.brand === "string" ? values.brand : values.brand?._id
      const categoryId = typeof values.category === "string" ? values.category : values.category?._id

      // Tạo FormData
      const formData = new FormData()
      // Đảm bảo các trường bắt buộc và đúng kiểu
  // Đảm bảo các trường bắt buộc luôn có giá trị hợp lệ
  const productName = values.name?.trim() || "";
  const productDescription = values.description?.trim() || "";
  const productPrice = variants[0]?.price ? Number(variants[0].price) : 0;
  const productStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  const productCategory = categoryId || (typeof values.category === "string" ? values.category : "");
  const productBrand = brandId || (typeof values.brand === "string" ? values.brand : "");

  formData.append("name", productName);
  formData.append("description", productDescription);
  formData.append("price", String(productPrice));
  formData.append("stock", String(productStock));
  formData.append("category", productCategory);
  formData.append("brand", productBrand);
      formData.append("sku", values.sku || "")
      formData.append("warranty", String(values.warranty || 0))
      formData.append("isActive", String(values.isActive))
      formData.append("isFeatured", String(values.isFeatured))
      if (values.tags) formData.append("tags", JSON.stringify(values.tags))

      // Ảnh đại diện
      if (mainImageFile) {
        formData.append("image", mainImageFile)
      }

      // Biến thể
      formData.append("variants", JSON.stringify(variants.map((v) => {
        const { imageFile, ...rest } = v;
        return rest;
      })))

      // Gửi request
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/product`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        message.error(errorData.message || "Thêm sản phẩm thất bại.")
        return
      }
      message.success("Thêm sản phẩm thành công!")
      navigate("/admin/products")
    } catch (error) {
      message.error("Đã xảy ra lỗi. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = slugify(name, { lower: true, strict: true })
    form.setFieldsValue({ slug })
  }

  // Xử lý chọn file ảnh đại diện
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setMainImageFile(file)
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          specifications: {},
        }}
        onFinish={onFinish}
        onFinishFailed={() => message.error("Vui lòng kiểm tra lại các trường thông tin!")}
      >
        <Row gutter={24}>
          {/* Cột chính cho Form */}
          <Col xs={24} lg={16}>
            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4}>Thông tin chung</Title>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
              >
                <Input placeholder="VD: Iphone 15 Pro Max" onChange={handleNameChange} />
              </Form.Item>
              <Form.Item name="sku" label="SKU (Mã định danh sản phẩm)">
                <Input placeholder="VD: ATN-001" />
              </Form.Item>
              <Form.Item label="Ảnh đại diện sản phẩm">
                <input
                  type="file"
                  accept="image/*"
                  ref={mainImageInputRef}
                  onChange={handleMainImageChange}
                />
                {mainImageFile && (
                  <img
                    src={URL.createObjectURL(mainImageFile)}
                    alt="Preview"
                    style={{ width: "100%", maxHeight: 200, marginTop: 8, borderRadius: 8 }}
                  />
                )}
              </Form.Item>
              <Form.Item name="description" label="Mô tả chi tiết">
                <Input.TextArea rows={6} placeholder="Nhập mô tả chi tiết cho sản phẩm..." />
              </Form.Item>
            </Card>

            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4}>Thông tin bổ sung</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="warranty" label="Bảo hành (tháng)">
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="tags" label="Tags (phân cách bởi dấu phẩy)">
                    <Select mode="tags" style={{ width: "100%" }} placeholder="VD: iphone, apple" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card className="shadow-lg rounded-xl mb-6">
              <VariantManager variants={variants} onVariantsChange={handleVariantsChange} />
            </Card>
          </Col>

          {/* Cột phụ cho Sidebar */}
          <Col xs={24} lg={8}>
            <Card className="shadow-lg rounded-xl sticky top-6">
              <Title level={4}>Tổ chức</Title>
              <Form.Item
                name="category"
                label="Danh mục sản phẩm"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <TreeSelect
                  style={{ width: "100%" }}
                  treeData={categoryTree}
                  placeholder="Chọn một danh mục"
                  treeDefaultExpandAll
                  allowClear
                />
              </Form.Item>
              <Form.Item
                name="brand"
                label="Thương hiệu"
                rules={[{ required: true, message: "Vui lòng chọn thương hiệu!" }]}
              >
                <Select placeholder="Chọn một thương hiệu" style={{ width: "100%" }}>
                  {brands.map((brand) => (
                    <Option key={brand._id} value={brand._id}>
                      {brand.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="isActive" label="Hiển thị" valuePropName="checked" initialValue={true}>
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              {/* Xem trước ảnh đại diện */}
              {mainImageFile ? (
                <img
                  src={URL.createObjectURL(mainImageFile)}
                  alt="Preview"
                  style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }}
                />
              ) : (
                <div className="h-48 flex items-center justify-center bg-gray-200 rounded-lg mb-4">
                  <Text type="secondary">Chưa có ảnh</Text>
                </div>
              )}

              <Divider />

              <Title level={4}>Hành động</Title>
              <Space direction="vertical" className="w-full">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<PlusOutlined />}
                  shape="round"
                  size="large"
                  block
                  style={{
                    background: "#fff",
                    color: "#1677ff",
                    border: "2px solid #1677ff",
                    fontWeight: 600,
                    boxShadow: "0 2px 8px rgba(22,119,255,0.08)",
                  }}
                >
                  Thêm sản phẩm
                </Button>
                <Button
                  type="default"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/admin/products")}
                  shape="round"
                  size="large"
                  block
                  style={{
                    background: "#fff",
                    color: "#888",
                    border: "2px solid #bbb",
                    fontWeight: 500,
                  }}
                >
                  Quay lại
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default ProductAddPage
