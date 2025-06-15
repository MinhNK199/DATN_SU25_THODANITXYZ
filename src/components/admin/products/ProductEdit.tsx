import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product } from "../../../interfaces/Product";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { Form, Input, InputNumber, Select, Button, message, Card, Switch, Divider } from "antd";

const API_URL = "http://localhost:5000/api/product";

const ProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ _id: string; name: string }[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{ [key: string]: string }>({});
  const [features, setFeatures] = useState<string[]>([]);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch product data
        const productRes = await fetch(`${API_URL}/${id}`, {
          headers: getAuthHeader(),
        });
        if (!productRes.ok) throw new Error("Không tìm thấy sản phẩm");
        const productData = await productRes.json();
        
        // Set form data
        form.setFieldsValue({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          category: productData.category._id,
          brand: productData.brand._id,
          isActive: productData.isActive,
        });
        
        // Set images and specifications
        setImages(productData.images || []);
        setSpecifications(productData.specifications || {});
        setFeatures(productData.features || []);

        // Fetch categories
        const categoriesRes = await fetch("http://localhost:5000/api/category", {
          headers: getAuthHeader(),
        });
        const categoriesData = await categoriesRes.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // Fetch brands
        const brandsRes = await fetch("http://localhost:5000/api/brand", {
          headers: getAuthHeader(),
        });
        const brandsData = await brandsRes.json();
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, form]);

  const handleImageChange = (value: string, index: number) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImage = () => {
    setImages([...images, ""]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setSpecifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addSpecification = () => {
    const key = prompt("Nhập tên thông số kỹ thuật:");
    if (key) {
      setSpecifications(prev => ({
        ...prev,
        [key]: ""
      }));
    }
  };

  const removeSpecification = (key: string) => {
    setSpecifications(prev => {
      const newSpecs = { ...prev };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  const handleFeatureChange = (value: string, index: number) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      const productData = {
        ...values,
        price: Number(values.price),
        stock: Number(values.stock),
        images: images.filter(img => img.trim() !== ""),
        specifications: specifications,
        features: features.filter(f => f.trim() !== "").length > 0 ? features.filter(f => f.trim() !== "") : undefined,
      };

      console.log('Sending data:', productData); // Debug log

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật sản phẩm thất bại");
      }

      message.success("Cập nhật sản phẩm thành công!");
      navigate("/admin/products");
    } catch (error: any) {
      console.error('Error:', error); // Debug log
      message.error(error.message || "Có lỗi xảy ra khi cập nhật sản phẩm!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Chỉnh sửa sản phẩm</h1>
        <Button
          onClick={() => navigate("/admin/products")}
          icon={<FaArrowLeft />}
          type="primary"
          ghost
        >
          Quay lại
        </Button>
      </div>

      <Card className="shadow-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: "",
            price: 0,
            stock: 0,
            description: "",
            category: undefined,
            brand: undefined,
            isActive: true
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Thông tin cơ bản" className="shadow-sm">
              <div className="space-y-4">
                <Form.Item
                  name="name"
                  label="Tên sản phẩm"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                    { min: 3, message: "Tên sản phẩm phải có ít nhất 3 ký tự!" },
                    { max: 100, message: "Tên sản phẩm không được vượt quá 100 ký tự!" }
                  ]}
                >
                  <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="price"
                    label="Giá"
                    rules={[
                      { required: true, message: "Vui lòng nhập giá!" },
                      { type: "number", min: 1, message: "Giá phải lớn hơn 0!" }
                    ]}
                  >
                    <InputNumber
                      className="w-full"
                      min={1}
                      placeholder="Nhập giá sản phẩm"
                    />
                  </Form.Item>

                  <Form.Item
                    name="stock"
                    label="Số lượng"
                    rules={[
                      { required: true, message: "Vui lòng nhập số lượng!" },
                      { type: "number", min: 1, message: "Số lượng phải lớn hơn 0!" }
                    ]}
                  >
                    <InputNumber
                      className="w-full"
                      min={1}
                      placeholder="Nhập số lượng"
                    />
                  </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="isActive"
                    label="Kích hoạt"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <Form.Item
                  name="category"
                  label="Danh mục"
                  rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                >
                  <Select placeholder="Chọn danh mục">
                    {categories.map((category) => (
                      <Select.Option key={category._id} value={category._id}>
                        {category.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="brand"
                  label="Thương hiệu"
                  rules={[{ required: true, message: "Vui lòng chọn thương hiệu!" }]}
                >
                  <Select placeholder="Chọn thương hiệu">
                    {brands.map((brand) => (
                      <Select.Option key={brand._id} value={brand._id}>
                        {brand.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[
                    { required: true, message: "Vui lòng nhập mô tả!" },
                    { min: 10, message: "Mô tả phải có ít nhất 10 ký tự!" }
                  ]}
                >
                  <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
                </Form.Item>
              </div>
            </Card>

            <div className="space-y-6">
              <Card title="Hình ảnh sản phẩm" className="shadow-sm">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || '/placeholder.png'}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="text"
                            danger
                            icon={<FaTrash />}
                            onClick={() => removeImage(index)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {images.map((image, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={image}
                          onChange={(e) => handleImageChange(e.target.value, index)}
                          placeholder="URL hình ảnh"
                        />
                        <Button
                          type="text"
                          danger
                          icon={<FaTrash />}
                          onClick={() => removeImage(index)}
                        />
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={addImage}
                      icon={<FaPlus />}
                      className="w-full"
                    >
                      Thêm hình ảnh
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title="Thông số kỹ thuật" className="shadow-sm">
                <div className="space-y-2">
                  {Object.entries(specifications).map(([key, value], index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Input
                          value={key}
                          disabled
                          placeholder="Tên thông số"
                        />
                        <Input
                          value={value}
                          onChange={(e) => handleSpecificationChange(key, e.target.value)}
                          placeholder="Giá trị"
                        />
                        <Button
                          type="text"
                          danger
                          icon={<FaTrash />}
                          onClick={() => removeSpecification(key)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={addSpecification}
                    icon={<FaPlus />}
                    className="w-full"
                  >
                    Thêm thông số
                  </Button>
                </div>
              </Card>

              <Card title="Tính năng nổi bật" className="shadow-sm">
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleFeatureChange(e.target.value, index)}
                          placeholder="Nhập tính năng nổi bật"
                        />
                        <Button
                          type="text"
                          danger
                          icon={<FaTrash />}
                          onClick={() => removeFeature(index)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={addFeature}
                    icon={<FaPlus />}
                    className="w-full"
                  >
                    Thêm tính năng
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <Divider />

          <div className="flex justify-end gap-4">
            <Button
              onClick={() => navigate("/admin/products")}
              size="large"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              size="large"
            >
              Cập nhật sản phẩm
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ProductEdit;