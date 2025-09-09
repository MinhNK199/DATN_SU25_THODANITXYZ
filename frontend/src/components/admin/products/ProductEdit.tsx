"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
  Spin,
  TreeSelect,
  Typography,
  Space,
  Upload,
  Image,
  type UploadFile,
} from "antd"
import VariantManager from "./VariantManager"
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons"
import { FaTrash } from "react-icons/fa"
import slugify from "slugify"
import { getCategories, getBrands, getProductById, updateProduct } from "./api"
import type { Category } from "../../../interfaces/Category"
import type { Brand } from "../../../interfaces/Brand"
import { validateAllVariants, cleanColorData, validateAndCleanProductData } from "./utils/validation"

const { Title, Text } = Typography

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
  const [previewImage, setPreviewImage] = useState<string>("")
  // Thêm state cho ảnh đại diện
  const [mainImageFileList, setMainImageFileList] = useState<UploadFile[]>([])


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
          // Khởi tạo fileList cho ảnh đại diện hiện tại
          const currentMainImage: UploadFile[] = [{
            uid: '-1',
            name: 'current-main-image',
            status: 'done',
            url: productData.images[0],
            thumbUrl: productData.images[0]
          }]
          setMainImageFileList(currentMainImage)
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
      message.error(`Lỗi:\n${validation.errors.join('\n')}`)
      return
    }
    setSubmitting(true)
    try {
      console.log("📝 Form values before processing:", values)
      console.log("📝 Current variants:", variants)

      // Lấy URL ảnh đại diện từ fileList đã upload
      let mainImageUrl = ""
      if (mainImageFileList.length > 0 && mainImageFileList[0].url) {
        mainImageUrl = mainImageFileList[0].url
      } else if (images.length > 0) {
        // Fallback về ảnh gốc nếu không có ảnh mới
        mainImageUrl = images[0]
      }
      
      // Nếu không có ảnh nào, sử dụng mảng rỗng
      const finalImages = mainImageUrl ? [mainImageUrl] : []
      
      // Validation: Kiểm tra có ít nhất 1 ảnh
      if (finalImages.length === 0) {
        message.error("Vui lòng chọn ít nhất 1 ảnh đại diện cho sản phẩm!");
        return;
      }

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
        images: finalImages,
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




  // Xử lý upload ảnh đại diện
  const handleMainImageUpload = async (info: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { fileList } = info;
    setMainImageFileList(fileList);

    // Lấy file mới nhất
    const latestFile = fileList[fileList.length - 1];
    if (latestFile && latestFile.originFileObj) {
      // Cập nhật preview image
      setPreviewImage(URL.createObjectURL(latestFile.originFileObj));
      
      // Upload ảnh lên server ngay lập tức
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("image", latestFile.originFileObj);
        
        const response = await fetch("http://localhost:8000/api/upload/", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data?.url) {
            const fullUrl = data.url.startsWith('http') ? data.url : `http://localhost:8000${data.url}`;
            // Cập nhật fileList với URL từ server
            const updatedFileList = fileList.map((file: any, index: number) => {
              if (index === fileList.length - 1) {
                return {
                  ...file,
                  url: fullUrl,
                  thumbUrl: fullUrl,
                  status: 'done'
                };
              }
              return file;
            });
            setMainImageFileList(updatedFileList);
            setPreviewImage(fullUrl);
            message.success("Upload ảnh thành công!");
          }
        } else {
          message.error("Upload ảnh thất bại!");
        }
      } catch (error) {
        console.error("Upload error:", error);
        message.error("Lỗi khi upload ảnh!");
      }
    } else if (latestFile && latestFile.url) {
      // Nếu là ảnh hiện tại (không phải file mới)
      setPreviewImage(latestFile.url);
    }
  };

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
              <Form.Item label="Ảnh đại diện sản phẩm">
                <div className="space-y-2">
                  <Upload
                    listType="picture-card"
                    fileList={mainImageFileList}
                    onChange={handleMainImageUpload}
                    beforeUpload={() => false}
                    multiple={false}
                    showUploadList={false}
                  >
                    {mainImageFileList.length < 1 && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                        <div className="text-sm text-gray-500">Upload</div>
                      </div>
                    )}
                  </Upload>
                  
                  {/* Hiển thị preview ảnh đã upload */}
                  <div className="flex gap-3 flex-wrap mt-3">
                    {mainImageFileList.length > 0 && mainImageFileList.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <Image
                          src={file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "")}
                          alt={`Ảnh đại diện ${idx + 1}`}
                          width={100}
                          height={100}
                          className="rounded-lg border border-gray-200 object-cover shadow-sm"
                          onError={(e) => {
                            console.error("Image load error:", file.url);
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <Button
                          size="small"
                          danger
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            padding: 0,
                            borderRadius: "50%",
                            width: 24,
                            height: 24,
                            minWidth: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => {
                            // Xóa ảnh hiện tại
                            setMainImageFileList([]);
                            setPreviewImage("");
                          }}
                        >
                          <FaTrash className="text-xs" />
                        </Button>
                      </div>
                    ))}
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

              <Title level={4}>Xem trước ảnh đại diện</Title>
              {previewImage && previewImage.trim() !== "" ? (
                <div className="space-y-3">
                  <div className="relative group">
                    <Image
                      src={previewImage || "/placeholder.svg"}
                      alt="Preview ảnh đại diện"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                      onError={(e) => {
                        console.error("Image load error:", previewImage);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <Text className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium">
                        Ảnh đại diện
                      </Text>
                    </div>
                  </div>
                  
                  {/* Nút sửa ảnh */}
                  <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleMainImageUpload}
                    accept="image/*"
                  >
                    <Button
                      type="primary"
                      size="small"
                      icon={<UploadOutlined />}
                      block
                      style={{
                        background: "#1677ff",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(22,119,255,0.2)"
                      }}
                    >
                      Thay đổi ảnh
                    </Button>
                  </Upload>
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
