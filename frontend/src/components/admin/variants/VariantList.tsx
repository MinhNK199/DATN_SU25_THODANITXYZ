import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Typography, Button, Space, Input, Select, Avatar, Tag, Modal, Tooltip, message, Row, Col, Badge, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined, SearchOutlined, DownloadOutlined, UploadOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { debounce } from 'lodash';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { variantApi } from './api';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface Variant {
  _id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  color?: { code: string; name: string } | string; // <-- Sửa dòng này
  size?: string;
  weight?: number;
  images: string[];
  isActive: boolean;
  product: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
}

const VariantList: React.FC = () => {
  const navigate = useNavigate();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [total, setTotal] = useState(0);

  // Fetch variants
  const fetchVariants = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        product: selectedProduct,
        isActive:
          selectedStatus === "active"
            ? true
            : selectedStatus === "inactive"
            ? false
            : undefined,
      };
      
      const response = await variantApi.getVariants(params);
      setVariants(response.variants || []);
      setTotalPages(response.pages || 1);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error fetching variants:', error);
      message.error('Không thể tải danh sách biến thể');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for filter
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/product');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [currentPage, searchTerm, selectedProduct, selectedStatus]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete variant
  const handleDelete = async (id: string) => {
    try {
      await variantApi.deleteVariant(id);
      message.success('Xóa biến thể thành công');
      fetchVariants();
    } catch (error) {
      console.error('Error deleting variant:', error);
      message.error('Không thể xóa biến thể');
    }
  };

  // Toggle variant status
  const handleToggleStatus = async (variantId: string, currentStatus: boolean) => {
    try {
      await variantApi.updateVariant(variantId, { isActive: !currentStatus });
      message.success('Cập nhật trạng thái thành công');
      fetchVariants();
    } catch (error) {
      console.error('Error toggling variant status:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  // Bulk operations
  const handleBulkDelete = () => {
    if (selectedVariants.length === 0) {
      message.error('Vui lòng chọn biến thể để xóa');
      return;
    }

    confirm({
      title: `Bạn có chắc chắn muốn xóa ${selectedVariants.length} biến thể?`,
      icon: <ExclamationCircleFilled />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:8000/api/product/variants/bulk`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { variantIds: selectedVariants }
          });
          message.success(`Đã xóa ${selectedVariants.length} biến thể`);
          setSelectedVariants([]);
          setSelectedRowKeys([]);
          fetchVariants();
        } catch (error) {
          console.error('Error bulk deleting variants:', error);
          message.error('Không thể xóa biến thể');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  const columns: ColumnsType<Variant> = [
    {
      title: 'Biến thể',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (_, record) => (
        <Space size={8}>
          <Avatar 
            shape="square" 
            size={48} 
            src={record.images && record.images.length > 0 ? record.images[0] : undefined}
            style={{ backgroundColor: typeof record.color === 'object' && record.color !== null ? record.color.code : (record.color || '#f0f0f0') }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 13 }}>
            <Text strong style={{ fontSize: 14 }}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>SKU: {record.sku}</Text>
            <Space size="small">
              {record.color && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div 
                    style={{ 
                      width: 14, 
                      height: 14, 
                      borderRadius: '50%', 
                      backgroundColor: typeof record.color === 'object' && record.color !== null ? record.color.code : (record.color || '#000000'),
                      border: '1px solid #d9d9d9'
                    }} 
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {typeof record.color === 'object' && record.color !== null && 'name' in record.color
                      ? record.color.name || record.color.code
                      : record.color}
                  </Text>
                </div>
              )}
              {record.size && <Text type="secondary" style={{ fontSize: 12 }}>Size: {record.size}</Text>}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product',
      key: 'product',
      width: 120,
      render: (product) => (
        <Text style={{ fontSize: 13 }}>{product?.name || 'N/A'}</Text>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 90,
      render: (price, record) => (
        <div>
          {record.salePrice && record.salePrice < price ? (
            <>
              <Text delete type="secondary" style={{ fontSize: 12 }}>{formatPrice(price)}</Text>
              <br />
              <Text type="danger" strong style={{ fontSize: 13 }}>{formatPrice(record.salePrice)}</Text>
            </>
          ) : (
            <Text strong style={{ fontSize: 13 }}>{formatPrice(price)}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      align: 'center',
      width: 80,
      render: (stock) => (
        <Tag color={stock > 0 ? 'green' : 'red'} style={{ fontSize: 12, padding: '2px 8px' }}>
          {stock > 0 ? `Còn (${stock})` : 'Hết'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      width: 90,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record._id, isActive)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
          size="small"
        />
      ),
    },
    // {
    //   title: 'Ngày tạo',
    //   dataIndex: 'createdAt',
    //   key: 'createdAt',
    //   width: '12%',
    //   render: (createdAt) => (
    //     <Text type="secondary">{formatDate(createdAt)}</Text>
    //   ),
    // },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/admin/variants/detail/${record._id}`)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} size="small" onClick={() => navigate(`/admin/variants/edit/${record._id}`)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              size="small"
              onClick={() => handleDelete(record._id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: Variant[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedVariants(newSelectedRows.map(row => row._id));
    },
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>Quản lý biến thể sản phẩm</Title>
            <Text type="secondary">Quản lý các biến thể của sản phẩm</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<UploadOutlined />}>
                Import
              </Button>
              <Button icon={<DownloadOutlined />}>
                Export
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/admin/variants/add')}
              >
                Thêm biến thể
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm biến thể..."
              prefix={<SearchOutlined />}
              onChange={(e) => debouncedSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Tất cả sản phẩm"
              style={{ width: '100%' }}
              value={selectedProduct}
              onChange={setSelectedProduct}
              allowClear
            >
              {products.map((product) => (
                <Option key={product._id} value={product._id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Tất cả trạng thái"
              style={{ width: '100%' }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Kích hoạt</Option>
              <Option value="inactive">Không kích hoạt</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedProduct('');
                setSelectedStatus('all');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>

        {/* Bulk Actions */}
        {selectedVariants.length > 0 && (
          <Row style={{ marginBottom: 16 }}>
            <Col>
              <Space>
                <Text>Đã chọn {selectedVariants.length} biến thể</Text>
                <Button danger onClick={handleBulkDelete}>
                  Xóa đã chọn
                </Button>
                <Button onClick={() => {
                  setSelectedVariants([]);
                  setSelectedRowKeys([]);
                }}>
                  Bỏ chọn
                </Button>
              </Space>
            </Col>
          </Row>
        )}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={variants}
          rowKey="_id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: currentPage,
            total: totalPages * 20,
            pageSize: 20,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} biến thể`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default VariantList;