import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Typography, Button, Space, Input, Select, Avatar, Tag, Modal, Tooltip, Row, Col, Badge } from 'antd';
import { useNotification } from '../../../hooks/useNotification';
import { useErrorNotification } from '../../../hooks/useErrorNotification';
import { 
  DeleteOutlined, 
  EyeOutlined, 
  UndoOutlined, 
  SearchOutlined, 
  ExclamationCircleFilled,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { debounce } from 'lodash';
import axios from 'axios';
import AdminPagination from '../common/AdminPagination';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface DeletedVariant {
  _id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  color?: { code: string; name: string } | string;
  size?: string;
  weight?: number;
  images: string[];
  isActive: boolean;
  product: {
    _id: string;
    name: string;
  };
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  _id: string;
  name: string;
}

const VariantTrash: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const { handleError } = useErrorNotification();
  const [deletedVariants, setDeletedVariants] = useState<DeletedVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVariants, setTotalVariants] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Fetch deleted variants
  const fetchDeletedVariants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        product: selectedProduct,
        deleted: true
      };

      const response = await axios.get('http://localhost:8000/api/product/variants/trash', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setDeletedVariants(response.data.variants || []);
      setTotalPages(response.data.pages || 1);
      setTotalVariants(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching deleted variants:', error);
      handleError(error, 'Không thể tải danh sách biến thể đã xóa');
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
    fetchDeletedVariants();
  }, [currentPage, pageSize, searchTerm, selectedProduct]);

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setCurrentPage(1);
    setPageSize(size);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Restore variant
  const handleRestore = async (id: string) => {
    confirm({
      title: 'Khôi phục biến thể',
      icon: <UndoOutlined />,
      content: 'Bạn có chắc chắn muốn khôi phục biến thể này?',
      okText: 'Khôi phục',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.post(`http://localhost:8000/api/product/variants/${id}/restore`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          success('Khôi phục biến thể thành công');
          fetchDeletedVariants();
        } catch (error) {
          console.error('Error restoring variant:', error);
          handleError(error, 'Không thể khôi phục biến thể');
        }
      },
    });
  };

  // Permanently delete variant
  const handlePermanentDelete = async (id: string) => {
    confirm({
      title: 'Xóa vĩnh viễn biến thể',
      icon: <ExclamationCircleFilled />,
      content: 'Bạn có chắc chắn muốn xóa vĩnh viễn biến thể này? Hành động này không thể hoàn tác.',
      okText: 'Xóa vĩnh viễn',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:8000/api/product/variants/${id}/permanent`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          success('Xóa vĩnh viễn biến thể thành công');
          fetchDeletedVariants();
        } catch (error) {
          console.error('Error permanently deleting variant:', error);
          handleError(error, 'Không thể xóa vĩnh viễn biến thể');
        }
      },
    });
  };

  // Bulk restore
  const handleBulkRestore = () => {
    if (selectedVariants.length === 0) {
      error('Vui lòng chọn biến thể để khôi phục');
      return;
    }

    confirm({
      title: `Bạn có chắc chắn muốn khôi phục ${selectedVariants.length} biến thể?`,
      icon: <UndoOutlined />,
      content: 'Các biến thể sẽ được khôi phục và hiển thị lại trong danh sách chính.',
      okText: 'Khôi phục',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.post(`http://localhost:8000/api/product/variants/bulk-restore`, {
            variantIds: selectedVariants
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          success(`Đã khôi phục ${selectedVariants.length} biến thể`);
          setSelectedVariants([]);
          setSelectedRowKeys([]);
          fetchDeletedVariants();
        } catch (error) {
          console.error('Error bulk restoring variants:', error);
          handleError(error, 'Không thể khôi phục biến thể');
        }
      },
    });
  };

  // Bulk permanent delete
  const handleBulkPermanentDelete = () => {
    if (selectedVariants.length === 0) {
      error('Vui lòng chọn biến thể để xóa vĩnh viễn');
      return;
    }

    confirm({
      title: `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedVariants.length} biến thể?`,
      icon: <ExclamationCircleFilled />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa vĩnh viễn',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:8000/api/product/variants/bulk-permanent`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { variantIds: selectedVariants }
          });
          success(`Đã xóa vĩnh viễn ${selectedVariants.length} biến thể`);
          setSelectedVariants([]);
          setSelectedRowKeys([]);
          fetchDeletedVariants();
        } catch (error) {
          console.error('Error bulk permanently deleting variants:', error);
          handleError(error, 'Không thể xóa vĩnh viễn biến thể');
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
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  const columns: ColumnsType<DeletedVariant> = [
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
            style={{
              backgroundColor: typeof record.color === 'object' && record.color !== null
                ? record.color.code
                : (typeof record.color === 'string' ? record.color : '#f0f0f0')
            }}
            onError={() => {
              console.error("Avatar image load error:", record.images?.[0]);
              return false;
            }}
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
                      backgroundColor: typeof record.color === 'object' && record.color !== null
                        ? record.color.code
                        : (typeof record.color === 'string' ? record.color : '#000000'),
                      border: '1px solid #d9d9d9'
                    }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {typeof record.color === 'object' && record.color !== null && 'name' in record.color
                      ? record.color.name || record.color.code
                      : (typeof record.color === 'string' ? record.color : 'N/A')}
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
      title: 'Ngày xóa',
      dataIndex: 'deletedAt',
      key: 'deletedAt',
      width: 120,
      render: (deletedAt) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatDate(deletedAt)}
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      width: '20%',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary"
              className="admin-primary-button"
              icon={<EyeOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/variants/detail/${record._id}`);
              }}
            />
          </Tooltip>
          <Tooltip title="Khôi phục">
            <Button 
              type="primary"
              className="admin-primary-button"
              icon={<UndoOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                handleRestore(record._id);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa vĩnh viễn">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handlePermanentDelete(record._id);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: DeletedVariant[]) => {
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
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/variants')}
              >
                Quay lại
              </Button>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  <Badge count={totalVariants} showZero color="#ff4d4f">
                    Thùng rác biến thể
                  </Badge>
                </Title>
                <Text type="secondary">Quản lý các biến thể đã bị xóa</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              {selectedVariants.length > 0 && (
                <>
                  <Button 
                    type="primary"
                    className="admin-primary-button"
                    icon={<UndoOutlined />}
                    onClick={handleBulkRestore}
                  >
                    Khôi phục đã chọn
                  </Button>
                  <Button 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBulkPermanentDelete}
                  >
                    Xóa vĩnh viễn
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm biến thể đã xóa..."
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
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedProduct('');
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
          dataSource={deletedVariants}
          rowKey="_id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <AdminPagination
            current={currentPage}
            pageSize={pageSize}
            total={totalVariants}
            onChange={handlePageChange}
            onShowSizeChange={handlePageSizeChange}
            itemText="biến thể đã xóa"
          />
        </div>
      </Card>
    </div>
  );
};

export default VariantTrash;
