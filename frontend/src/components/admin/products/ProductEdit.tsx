"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { Product } from "../../../interfaces/Product"
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  message,
  Card,
  Switch,
  Divider,
  Row,
  Col,
  Collapse,
  Tabs,
  Spin,
  TreeSelect,
  Typography,
  Space,
  type UploadFile,
  type UploadProps,
} from "antd"
import VariantManager from "./VariantManager"
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons"
import slugify from "slugify"
import { getCategories, getBrands, getProductById, updateProduct } from "./api"
import type { Category } from "../../../interfaces/Category"
import type { Brand } from "../../../interfaces/Brand"
import { validateAllVariants, cleanColorData, validateAndCleanProductData } from "./utils/validation"

const { TextArea } = Input
const { Panel } = Collapse
const { TabPane } = Tabs
const { Title, Text } = Typography
const API_URL = "http://localhost:8000/api/product"

interface ProductVariant {
  id: string
  _id?: string
  name: string
  sku: string
  price: number
  salePrice?: number
  stock: number
  color?: { code: string; name: string }
  size?: number
  length?: number
  width?: number
  height?: number
  weight?: number
  images: string[]
  isActive: boolean
  specifications?: { [key: string]: string }
}

// Helper function để lấy tên màu từ code
const getColorNameByCode = (code: string): string => {
  const colorMap: { [key: string]: string } = {
    "#000000": "Đen",
    "#FFFFFF": "Trắng",
    "#FF0000": "Đỏ",
    "#00FF00": "Xanh lá",
    "#0000FF": "Xanh dương",
    "#FFFF00": "Vàng",
    "#FF00FF": "Tím",
    "#00FFFF": "Xanh cyan",
    "#FFA500": "Cam",
    "#800080": "Tím đậm",
    "#FFC0CB": "Hồng",
    "#A52A2A": "Nâu",
    "#808080": "Xám",
    "#C0C0C0": "Bạc",
    "#FFD700": "Vàng kim",
    "#8B4513": "Nâu đậm",
    "#4B0082": "Chàm",
    "#FF1493": "Hồng đậm",
    "#32CD32": "Xanh lime",
    "#87CEEB": "Xanh sky",
  }
  return colorMap[code] || "Màu khác"
}

const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [images, setImages] = useState<string[]>([""])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [previewImage, setPreviewImage] = useState<string>("")
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const getAuthHeader = () => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = slugify(name, { lower: true, strict: true })
    form.setFieldsValue({ slug })
  }

  useEffect(() => {
    if (!id) {
      message.error("ID Sản phẩm không hợp lệ.")
      navigate("/admin/products")
      return
    }

    const fetchData = async () => {
      try {
        const [productData, cats, brs] = await Promise.all([getProductById(id), getCategories(), getBrands()])
        setCategories(cats)
        setBrands(brs)

        // ENHANCED: Set variants với proper data cleaning cho ColorSelector
        if (productData.variants && Array.isArray(productData.variants)) {
          const cleanedVariants = productData.variants.map((variant: any, index: number) => {
            console.log(`🔄 Processing variant ${index} for form:`, variant)

            // CRITICAL: Clean color data cho ColorSelector
            const cleanColor = cleanColorData(variant.color)
            console.log(`✅ Cleaned color for variant ${index}:`, cleanColor)

            // Clean specifications
            let cleanSpecs = {}
            if (variant.specifications && typeof variant.specifications === "object") {
              cleanSpecs = { ...variant.specifications }
            }

            const cleanedVariant = {
              id: variant._id || variant.id || Date.now().toString(),
              _id: variant._id,
              name: variant.name || "",
              sku: variant.sku || "",
              price: Number(variant.price) || 0,
              salePrice: variant.salePrice ? Number(variant.salePrice) : undefined,
              stock: Number(variant.stock) || 0,
              color: cleanColor, // ĐẢM BẢO LÀ OBJECT HỢP LỆ CHO COLORSELECTOR
              size: Number(variant.size) || 0,
              length: Number(variant.length) || 0,
              width: Number(variant.width) || 0,
              height: Number(variant.height) || 0,
              weight: Number(variant.weight) || 0,
              images: Array.isArray(variant.images) ? variant.images : [],
              isActive: Boolean(variant.isActive),
              specifications: cleanSpecs, // ĐẢM BẢO LÀ OBJECT
            }

            console.log(`✅ Cleaned variant ${index} for form:`, {
              name: cleanedVariant.name,
              color: cleanedVariant.color,
              specifications: cleanedVariant.specifications,
            })

            return cleanedVariant
          })

          console.log("📤 Setting variants in form:", cleanedVariants)
          setVariants(cleanedVariants)
        }

        setImages(productData.images || [])
        if (productData.images?.length > 0) {
          setPreviewImage(productData.images[0])
        }
        form.setFieldsValue({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price,
          salePrice: productData.salePrice,
          stock: productData.stock,
          sku: productData.sku,
          brand:
            typeof productData.brand === "object" && productData.brand !== null && "_id" in productData.brand
              ? (productData.brand as any)._id
              : productData.brand,
          category:
            typeof productData.category === "object" && productData.category !== null && "_id" in productData.category
              ? (productData.category as any)._id
              : productData.category,
          weight: productData.weight,
          warranty: productData.warranty,
          tags: productData.tags || [],
          isActive: productData.isActive,
          isFeatured: productData.isFeatured,
          dimensions: {
            length: productData.dimensions?.length || 0,
            width: productData.dimensions?.width || 0,
            height: productData.dimensions?.height || 0,
          },
        })
      } catch (error) {
        message.error("Không thể tải dữ liệu sản phẩm.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, form, navigate])

  const categoryTree = buildCategoryTree(categories)

  const handleSubmit = async (values: any) => {
    if (!id) return

    // Validate variants using utility function (isEdit = true để không yêu cầu ảnh)
    const validation = validateAllVariants(variants, true)
    if (!validation.isValid) {
      message.error(`Lỗi validation:\n${validation.errors.join('\n')}`)
      return
    }
    setSubmitting(true)
    try {
      console.log("📝 Form values before processing:", values)
      console.log("📝 Current variants:", variants)

      const uploadedImageUrls = fileList
        .map((file) => {
          if (file.response && file.response.url) return file.response.url
          if (file.url) return file.url
          return null
        })
        .filter((url): url is string => url !== null)

      // CRITICAL: Pre-process variants to ensure color is object before sending
      const processedVariants = variants.map((variant, index) => {
        console.log(`🔧 Pre-processing variant ${index}:`, variant.name)

        // CRITICAL: Ensure color is always a proper object
        const finalColor = cleanColorData(variant.color)

        // Ensure specifications is always a proper object
        let finalSpecs = {}
        if (variant.specifications && typeof variant.specifications === "object") {
          finalSpecs = { ...variant.specifications }
        }

        const processedVariant = {
          // Chỉ giữ _id cho variant đã tồn tại, loại bỏ id để tránh lỗi ObjectId casting
          ...(variant._id && { _id: variant._id }),
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          salePrice: variant.salePrice,
          stock: variant.stock,
          color: finalColor, // ALWAYS VALID OBJECT
          specifications: finalSpecs, // ALWAYS OBJECT
          size: variant.size,
          length: variant.length,
          width: variant.width,
          height: variant.height,
          weight: variant.weight,
          images: variant.images,
          isActive: variant.isActive,
        }

        console.log(`✅ Pre-processed variant ${index}:`, {
          name: processedVariant.name,
          color: processedVariant.color,
          specifications: processedVariant.specifications,
        })

        return processedVariant
      })

      const getId = (val: any) => (typeof val === "object" && val !== null && "_id" in val ? val._id : val)

      // Prepare data for submission
      const formData = {
        name: values.name,
        slug: slugify(values.name, { lower: true, strict: true }),
        description: values.description,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : images.filter((img) => img.trim() !== ""),
        tags: values.tags || [],
        warranty: values.warranty,
        brand: getId(values.brand),
        category: getId(values.category),
        price: processedVariants[0]?.price,
        stock: processedVariants.reduce((sum, v) => sum + (v.stock || 0), 0),
        variants: processedVariants, // Use pre-processed variants
        isActive: values.isActive,
        isFeatured: values.isFeatured,
      }

      console.log("🧹 Data before validation:", formData)

      // Validate and clean data
      const cleanedData = validateAndCleanProductData(formData)

      console.log("✅ Final data to submit:", cleanedData)

      await updateProduct(id, cleanedData)
      message.success("Cập nhật sản phẩm thành công!")
      navigate("/admin/products")
    } catch (error) {
      console.error("❌ Error submitting form:", error)
      // message is handled in api.ts
    } finally {
      setSubmitting(false)
    }
  }

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

  const handleUploadChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList)
    if (newFileList.length > 0) {
      const firstFile = newFileList.find((f) => f.status === "done" || f.originFileObj)
      if (firstFile) {
        if (firstFile.url) {
          setPreviewImage(firstFile.url)
        } else if (firstFile.originFileObj) {
          const reader = new FileReader()
          reader.onload = (e) => setPreviewImage(e.target?.result as string)
          reader.readAsDataURL(firstFile.originFileObj)
        }
      }
    } else {
      setPreviewImage("")
    }
  }

  const uploadProps: UploadProps = {
    action: "https://api.cloudinary.com/v1_1/your_cloudinary_name/image/upload", // THAY THẾ
    listType: "picture-card",
    fileList,
    onChange: handleUploadChange,
    multiple: true,
    data: {
      upload_preset: "your_upload_preset", // THAY THẾ
    },
    onPreview: async (file) => {
      let src = file.url as string
      if (!src) {
        src = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.readAsDataURL(file.originFileObj as any)
          reader.onload = () => resolve(reader.result as string)
        })
      }
      const image = new Image()
      image.src = src
      const imgWindow = window.open(src)
      imgWindow?.document.write(image.outerHTML)
    },
  }

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

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={() => message.error("Vui lòng kiểm tra lại các trường thông tin!")}
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card className="shadow-lg rounded-xl mb-6">
              <Title level={4}>Thông tin chung</Title>
              <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                <Input placeholder="VD: Áo thun nam" onChange={handleNameChange} />
              </Form.Item>
              <Form.Item name="sku" label="SKU">
                <Input placeholder="VD: ATN-001" />
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

          <Col xs={24} lg={8}>
            <Card className="shadow-lg rounded-xl sticky top-6">
              <Title level={4}>Tổ chức</Title>
              <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                <TreeSelect treeData={categoryTree} placeholder="Chọn danh mục" treeDefaultExpandAll allowClear />
              </Form.Item>
              <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true }]}>
                <Select
                  placeholder="Chọn thương hiệu"
                  options={brands.map((b) => ({ label: b.name, value: b._id }))}
                  allowClear
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="isActive" label="Hiển thị" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>Xem trước ảnh</Title>
              {previewImage ? (
                <img
                  src={previewImage || "/placeholder.svg"}
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
                <Button type="primary" htmlType="submit" loading={submitting} block icon={<SaveOutlined />}>
                  Lưu thay đổi
                </Button>
                <Button block icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/products")}>
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

const buildCategoryTree = (categories: Category[], parentId: string | null = null): any[] => {
  return categories
    .filter((cat) => {
      if (typeof cat.parent === "object" && cat.parent !== null && "_id" in cat.parent) {
        return (cat.parent as any)._id === parentId
      }
      return cat.parent === parentId
    })
    .map((cat) => ({
      title: cat.name,
      value: cat._id,
      children: buildCategoryTree(categories, cat._id),
    }))
}

export default ProductEdit
