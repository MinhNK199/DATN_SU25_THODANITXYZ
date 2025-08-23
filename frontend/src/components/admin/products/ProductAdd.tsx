"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  // Thêm state cho ảnh đại diện
  const [mainImage, setMainImage] = useState<string>("")

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
    // Validate variants using utility function
    const validation = validateAllVariants(variants)
    if (!validation.isValid) {
      message.error(`Lỗi validation:\n${validation.errors.join('\n')}`)
      return
    }
    // Lấy tổng tồn kho từ các biến thể
    const totalStock = variants.reduce((sum, v) => sum + (Number.parseInt(v.stock, 10) || 0), 0)
    // Lấy giá gốc từ biến thể đầu tiên
    const mainPrice = variants[0].price
    // Gộp tất cả ảnh từ các biến thể
    const allImages = variants
      .flatMap((v) => (Array.isArray(v.images) ? v.images.filter((img: string) => !!img) : []))
      .filter(Boolean)
    if (allImages.length < 1) {
      message.error("Phải có ít nhất 1 hình ảnh sản phẩm")
      return
    }
    setLoading(true)
    try {
      const brandId = typeof values.brand === "string" ? values.brand : values.brand?._id
      const categoryId = typeof values.category === "string" ? values.category : values.category?._id

      // CRITICAL: Pre-process variants to ensure color is object before sending
      const processedVariants = variants.map((v, idx) => {
        console.log(`🔧 Pre-processing variant ${idx}:`, v.name)

        // Ensure color is always a proper object
        const finalColor = cleanColorData(v.color)

        // Ensure specifications is always a proper object
        let finalSpecs = {}
        if (v.specifications && typeof v.specifications === "object") {
          finalSpecs = { ...v.specifications }
        }

        const processedVariant = {
          // Loại bỏ trường id để tránh lỗi ObjectId casting
          name: v.name,
          sku: v.sku,
          price: v.price,
          salePrice: v.salePrice,
          stock: v.stock,
          color: finalColor, // ALWAYS VALID OBJECT
          specifications: finalSpecs, // ALWAYS OBJECT
          size: typeof v.size === "number" ? v.size : Number.parseFloat(v.size) || 0,
          length: typeof v.length === "number" ? v.length : Number.parseFloat(v.length) || 0,
          width: typeof v.width === "number" ? v.width : Number.parseFloat(v.width) || 0,
          height: typeof v.height === "number" ? v.height : Number.parseFloat(v.height) || 0,
          weight: typeof v.weight === "number" ? v.weight : Number.parseFloat(v.weight) || 0,
          images: Array.isArray(v.images) ? v.images : [],
          isActive: !!v.isActive,
        }

        console.log(`✅ Pre-processed variant ${idx}:`, {
          name: processedVariant.name,
          color: processedVariant.color,
          specifications: processedVariant.specifications,
        })

        return processedVariant
      })

      const productData = {
        name: values.name,
        sku: values.sku,
        description: values.description || "", // Không bắt buộc nhập
        mainImage: mainImage,
        warranty: values.warranty,
        tags: values.tags || [],
        brand: brandId,
        category: categoryId,
        price: mainPrice, // BẮT BUỘC cho backend
        stock: totalStock, // BẮT BUỘC cho backend
        images: allImages, // Đảm bảo có ít nhất 1 ảnh
        variants: processedVariants, // Use pre-processed variants
        isActive: values.isActive,
        isFeatured: values.isFeatured,
      }

      console.log("🧹 Data before validation:", productData)

      // Validate and clean data
      const cleanedData = validateAndCleanProductData(productData)

      console.log("✅ Final data to submit:", cleanedData)

      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.details && Array.isArray(errorData.details)) {
          errorData.details.forEach((msg: string) => message.error(msg))
        } else if (
          errorData.message &&
          errorData.message.includes("duplicate key") &&
          errorData.message.includes("slug")
        ) {
          message.error("Sản phẩm này đã tồn tại. Vui lòng chọn tên khác hoặc kiểm tra lại.")
        } else {
          message.error(errorData.message || "Thêm sản phẩm thất bại.")
        }
        console.error("Backend error:", errorData)
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

  // Hình ảnh: nhập link
  const handleImageChange = (value: string, idx: number) => {
    const newImages = [...images]
    newImages[idx] = value
    setImages(newImages)
    if (idx === 0) setPreviewImage(value)
  }
  const addImageField = () => setImages([...images, ""])
  const removeImageField = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx)
    setImages(newImages)
    if (idx === 0 && newImages.length > 0) setPreviewImage(newImages[0])
    if (newImages.length === 0) setPreviewImage("")
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
              <Form.Item name="mainImage" label="Link ảnh đại diện">
                <Input
                  placeholder="Nhập link ảnh đại diện..."
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                />
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

              <Divider />

              <Title level={4}>Xem trước ảnh</Title>
              {mainImage ? (
                <img
                  src={mainImage || "/placeholder.svg"}
                  alt="Preview"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
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
