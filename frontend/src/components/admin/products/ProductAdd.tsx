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
  Space,
  Card,
  Row,
  Col,
  Typography,
  TreeSelect,
  Switch,
  Divider,
  Upload,
  Image,
} from "antd"
import { PlusOutlined, ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons"
import { getCategories, getBrands } from "./api"
import slugify from "slugify"
import type { Category } from "../../../interfaces/Category"
import type { Brand } from "../../../interfaces/Brand"
import VariantManager from "./VariantManager"
import { validateAllVariants, cleanColorData } from "./utils/validation"
import { useNotification } from "../../../hooks/useNotification"
import type { UploadFile } from "antd/es/upload/interface"

const { Title, Text } = Typography
const { Option } = Select

const API_URL = "http://localhost:8000/api"

// Hàm chuyển đổi cấu trúc cây cho TreeSelect
const buildCategoryTree = (categories: Category[], parentId: string | null = null): any[] => { // eslint-disable-line @typescript-eslint/no-explicit-any
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
  const { success, error } = useNotification()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [variants, setVariants] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  // Thêm state cho file ảnh đại diện
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [mainImageFileList, setMainImageFileList] = useState<UploadFile[]>([])
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalImageFileList, setAdditionalImageFileList] = useState<UploadFile[]>([])

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
      } catch (err: unknown) {
        error("Không thể tải dữ liệu cho danh mục và thương hiệu.")
      }
    }
    fetchData()
  }, [])

  const categoryTree = buildCategoryTree(categories)

  // ENHANCED: handleVariantsChange với better validation cho ColorSelector
  const handleVariantsChange = (newVariants: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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

  const onFinish = async (values: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const validation = validateAllVariants(variants)
    if (!validation.isValid) {
      error(`Lỗi:\n${validation.errors.join('\n')}`)
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

  // Validation trước khi gửi
  if (!productName || productName.length < 2) {
    error("Tên sản phẩm phải có ít nhất 2 ký tự");
    return;
  }
  if (!productDescription || productDescription.length < 10) {
    error("Mô tả sản phẩm phải có ít nhất 10 ký tự");
    return;
  }
  if (!productPrice || productPrice <= 0) {
    error("Giá sản phẩm phải lớn hơn 0");
    return;
  }
  if (!productCategory) {
    error("Vui lòng chọn danh mục");
    return;
  }
  if (!productBrand) {
    error("Vui lòng chọn thương hiệu");
    return;
  }
  if (variants.length === 0) {
    error("Phải có ít nhất 1 biến thể");
    return;
  }

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

      // Ảnh phụ
      // Biến thể
      formData.append("variants", JSON.stringify(variants.map((v) => {
        const { imageFile, ...rest } = v; // eslint-disable-line @typescript-eslint/no-unused-vars
        return rest;
      })))

      // Thêm ảnh phụ
      additionalImages.forEach((file, index) => {
        formData.append('additionalImages', file);
        console.log(`📤 Added additional image ${index + 1}:`, file.name);
      });

      // Debug: Log form data
      console.log("📤 Sending product data:");
      console.log("Name:", productName);
      console.log("Description:", productDescription);
      console.log("Price:", productPrice);
      console.log("Stock:", productStock);
      console.log("Category:", productCategory);
      console.log("Brand:", productBrand);
      console.log("SKU:", values.sku);
      console.log("Variants:", variants);
      console.log("Main image file:", mainImageFile);
      console.log("Additional images:", additionalImages);

      // Gửi request
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_URL}/product`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Error response:", errorData);
        error(errorData.message || "Thêm sản phẩm thất bại.")
        return
      }
      success("Thêm sản phẩm thành công!")
      navigate("/admin/products")
    } catch (err: unknown) {
      error("Đã xảy ra lỗi. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = slugify(name, { lower: true, strict: true })
    form.setFieldsValue({ slug })
  }


  // Xử lý upload ảnh đại diện với Upload component
  const handleMainImageUpload = (info: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { fileList } = info;
    setMainImageFileList(fileList);

    // Lấy file mới nhất
    const latestFile = fileList[fileList.length - 1];
    if (latestFile && latestFile.originFileObj) {
      setMainImageFile(latestFile.originFileObj);
    }
  };

  // Xử lý upload ảnh phụ
  const handleAdditionalImagesUpload = (info: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { fileList } = info;
    setAdditionalImageFileList(fileList);

    // Lấy tất cả files
    const files = fileList.map((file: any) => file.originFileObj).filter(Boolean); // eslint-disable-line @typescript-eslint/no-explicit-any
    setAdditionalImages(files);
  };


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          specifications: {},
        }}
        onFinish={onFinish}
        onFinishFailed={() => error("Vui lòng kiểm tra lại các trường thông tin!")}
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
                <div className="space-y-4">
                  <Upload
                    listType="picture-card"
                    fileList={mainImageFileList}
                    onChange={handleMainImageUpload}
                    beforeUpload={() => false}
                    maxCount={1}
                    showUploadList={false}
                    className="w-full"
                  >
                    {mainImageFileList.length < 1 && (
                      <div className="flex flex-col items-center justify-center h-32 w-full">
                        <UploadOutlined className="text-3xl text-gray-400 mb-2" />
                        <div className="text-sm text-gray-500">Upload</div>
                        
                      </div>
                    )}
                  </Upload>
                  
                  {/* Hiển thị preview ảnh đã chọn */}
                  {mainImageFile && (
                    <div className="relative group">
                      <Image
                        src={URL.createObjectURL(mainImageFile)}
                        alt="Preview ảnh đại diện"
                        className="w-full max-h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                        onError={(e) => {
                          console.error("Image load error:", mainImageFile.name);
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <Button
                        size="small"
                        danger
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{
                          padding: 0,
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => {
                          setMainImageFile(null);
                          setMainImageFileList([]);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              </Form.Item>

              <Form.Item label="Ảnh phụ (tối đa 5 ảnh)">
                <div className="space-y-4">
                  <Upload
                    listType="picture-card"
                    fileList={additionalImageFileList}
                    onChange={handleAdditionalImagesUpload}
                    beforeUpload={() => false}
                    maxCount={5}
                    multiple
                    className="w-full"
                    showUploadList={{
                      showPreviewIcon: true,
                      showRemoveIcon: true,
                    }}
                  >
                    {additionalImageFileList.length < 5 && (
                      <div className="flex flex-col items-center justify-center h-24 w-full">
                        <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                        <div className="text-sm text-gray-500">Thêm ảnh phụ</div>
                        <div className="text-xs text-gray-400">
                          {additionalImageFileList.length}/5
                        </div>
                      </div>
                    )}
                  </Upload>
                  
                  <div className="space-y-1">
                    <Text type="secondary" className="text-xs block">
                      • Ảnh phụ sẽ hiển thị trong trang chi tiết sản phẩm
                    </Text>
                    <Text type="secondary" className="text-xs block">
                      • Tối đa 5 ảnh phụ mỗi lần upload
                    </Text>
                    <Text type="secondary" className="text-xs block">
                      • Định dạng: JPG, PNG, JPEG (tối đa 5MB/ảnh)
                    </Text>
                  </div>
                </div>
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
              <div className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2 block">Xem trước ảnh đại diện</Text>
                {mainImageFile ? (
                  <div className="relative group">
                    <Image
                      src={URL.createObjectURL(mainImageFile)}
                      alt="Preview ảnh đại diện"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                      onError={(e) => {
                        console.error("Image load error:", mainImageFile.name);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <Text className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium">
                        Ảnh đại diện
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300">
                    <UploadOutlined className="text-4xl text-gray-400 mb-2" />
                    <Text type="secondary" className="text-center">
                      Chưa có ảnh đại diện
                    </Text>
                    <Text type="secondary" className="text-xs text-center mt-1">
                      Upload ảnh để xem trước
                    </Text>
                  </div>
                )}
              </div>

              <Divider />

              <Title level={4}>Hành động</Title>
              <Space direction="vertical" className="w-full">
                <Button
                  type="primary"
                  className="admin-primary-button"
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
