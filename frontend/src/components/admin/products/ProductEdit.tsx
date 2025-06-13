import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product } from "../../../interfaces/Product";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { Form, Input, InputNumber, Select, Button, message, Card } from "antd";

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

  const handleSpecificationChange = (key: string, value: string, index: number) => {
    const newSpecs = { ...specifications };
    const keys = Object.keys(newSpecs);
    const currentKey = keys[index];
    
    if (key !== currentKey) {
      delete newSpecs[currentKey];
      newSpecs[key] = value;
    } else {
      newSpecs[key] = value;
    }
    
    setSpecifications(newSpecs);
  };

  const addSpecification = () => {
    setSpecifications({ ...specifications, "": "" });
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...specifications };
    delete newSpecs[key];
    setSpecifications(newSpecs);
  };

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const productData = {
        ...values,
        images: images.filter(img => img.trim() !== ""),
        specifications,
      };

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        message.success("Cập nhật sản phẩm thành công!");
        setTimeout(() => {
          navigate("/admin/product-list");
        }, 1500);
      } else {
        const err = await res.json();
        message.error(`Cập nhật thất bại: ${err.message || "Lỗi máy chủ"}`);
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
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
        <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa sản phẩm</h1>
        <Button
          onClick={() => navigate("/admin/product-list")}
          icon={<FaArrowLeft />}
          type="link"
        >
          Quay lại
        </Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá"
              rules={[
                { required: true, message: "Vui lòng nhập giá!" },
                { type: "number", min: 0, message: "Giá phải lớn hơn 0!" }
              ]}
            >
              <InputNumber
                className="w-full"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                placeholder="Nhập giá sản phẩm"
              />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Số lượng"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng!" },
                { type: "number", min: 0, message: "Số lượng phải lớn hơn 0!" }
              ]}
            >
              <InputNumber
                className="w-full"
                min={0}
                placeholder="Nhập số lượng"
              />
            </Form.Item>

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
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
              className="md:col-span-2"
            >
              <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
            </Form.Item>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh
              </label>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông số kỹ thuật
              </label>
              <div className="space-y-2">
                {Object.entries(specifications).map(([key, value], index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={key}
                      onChange={(e) => handleSpecificationChange(e.target.value, value, index)}
                      placeholder="Tên thông số"
                    />
                    <Input
                      value={value}
                      onChange={(e) => handleSpecificationChange(key, e.target.value, index)}
                      placeholder="Giá trị"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<FaTrash />}
                      onClick={() => removeSpecification(key)}
                    />
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
            </div>

            <Form.Item
              name="isActive"
              valuePropName="checked"
              className="md:col-span-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                />
                <span className="text-sm font-medium text-gray-700">Đang bán</span>
              </div>
            </Form.Item>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              size="large"
            >
              Cập nhật
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ProductEdit;