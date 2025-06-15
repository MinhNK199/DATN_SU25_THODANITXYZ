import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product } from "../../../interfaces/Product";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { Card, Button, Modal, message, Descriptions, Badge, Image, Tag, Divider } from "antd";

const API_URL = "http://localhost:5000/api/product";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          message.error("Không tìm thấy sản phẩm!");
          navigate("/admin/products");
        }
      } catch (error) {
        message.error("Lỗi khi tải thông tin sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleDelete = () => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
          if (res.ok) {
            message.success("Xóa sản phẩm thành công!");
            navigate("/admin/products");
          } else {
            message.error("Xóa sản phẩm thất bại!");
          }
        } catch (error) {
          message.error("Lỗi kết nối máy chủ!");
        }
      },
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Chi tiết sản phẩm</h1>
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/admin/products")}
            icon={<FaArrowLeft />}
            type="primary"
            ghost
          >
            Quay lại
          </Button>
          <Button
            onClick={() => navigate(`/admin/products/edit/${id}`)}
            icon={<FaEdit />}
            type="primary"
          >
            Chỉnh sửa
          </Button>
          <Button
            onClick={handleDelete}
            icon={<FaTrash />}
            danger
          >
            Xóa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <div className="space-y-6">
            <div className="relative">
              <Image.PreviewGroup>
                <div className="grid grid-cols-2 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </Image.PreviewGroup>
              {product.isFeatured && (
                <Badge
                  count="Nổi bật"
                  style={{
                    backgroundColor: '#52c41a',
                    position: 'absolute',
                    top: 10,
                    right: 10,
                  }}
                />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{product.name}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">Giá:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                </div>
                {product.salePrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">Giá khuyến mãi:</span>
                    <span className="text-xl font-bold text-red-600">
                      {formatPrice(product.salePrice)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">Tồn kho:</span>
                  <Tag color={product.stock > 0 ? "success" : "error"}>
                    {product.stock}
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Thông tin cơ bản" className="shadow-lg">
            <Descriptions column={1}>
              <Descriptions.Item label="Danh mục">
                {(product as any).category?.name || product.category}
              </Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">
                {(product as any).brand?.name || product.brand}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {product.description}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <Card title="Thông số kỹ thuật" className="shadow-lg">
              <Descriptions column={1}>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {value}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          )}

          {product.features && product.features.length > 0 && (
            <Card title="Tính năng nổi bật" className="shadow-lg">
              <div className="space-y-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-blue-600">•</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 