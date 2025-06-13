import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../../interfaces/Product";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { Form, Input, InputNumber, Select, Button, message, Space, Card } from "antd";
import type { FormInstance } from "antd/es/form";

const API_URL = "http://localhost:5000/api/product";

const ProductAdd: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
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
      }
    };

    fetchData();
  }, []);

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
      setLoading(true);
      const productData = {
        ...values,
        images: images.filter(img => img.trim() !== ""),
        specifications,
        isActive: true
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        message.success("Thêm sản phẩm thành công!");
        setTimeout(() => {
          navigate("/admin/product-list");
        }, 1500);
      } else {
        const err = await res.json();
        message.error(`Thêm thất bại: ${err.message || "Lỗi máy chủ"}`);
      }
    } catch (error) {
      message.error("Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
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
          initialValues={{ isActive: true }}
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
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Thêm sản phẩm
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ProductAdd;
