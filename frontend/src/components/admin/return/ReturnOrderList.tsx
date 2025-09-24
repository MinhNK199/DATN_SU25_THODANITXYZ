import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, message, Modal, Input, Select, Space, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, CheckOutlined, PlayCircleOutlined } from '@ant-design/icons';
import axiosInstance from '../../../api/axiosInstance';

const { TextArea } = Input;
const { Option } = Select;

interface ReturnOrder {
  _id: string;
  user: {
    fullName: string;
    phone: string;
    email: string;
  };
  shipper: {
    fullName: string;
    phone: string;
  };
  totalPrice: number;
  status: string;
  orderTracking: {
    status: string;
    deliveryFailureReason: string;
    deliveryFailureTime: string;
    returnStartTime: string;
    returnCompletedTime: string;
    returnProcessingType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ReturnOrderList: React.FC = () => {
  const [orders, setOrders] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ReturnOrder | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [processingType, setProcessingType] = useState<'refund' | 'exchange' | 'restock' | 'disposal'>('refund');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [completionDetails, setCompletionDetails] = useState('');

  useEffect(() => {
    fetchReturnOrders();
  }, []);

  const fetchReturnOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/shipper/returns');
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Error fetching return orders:', error);
      message.error('Lỗi khi tải danh sách đơn hàng hoàn trả');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'return_pending': return 'orange';
      case 'return_confirmed': return 'blue';
      case 'return_processing': return 'purple';
      case 'return_completed': return 'green';
      case 'delivered_failed': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'return_pending': return 'Chờ xác nhận hoàn trả';
      case 'return_confirmed': return 'Đã xác nhận nhận hàng';
      case 'return_processing': return 'Đang xử lý hoàn trả';
      case 'return_completed': return 'Hoàn tất xử lý';
      case 'delivered_failed': return 'Giao hàng thất bại';
      default: return status;
    }
  };

  const getProcessingTypeText = (type: string): string => {
    switch (type) {
      case 'refund': return 'Hoàn tiền';
      case 'exchange': return 'Đổi hàng';
      case 'restock': return 'Nhập kho lại';
      case 'disposal': return 'Hủy hàng';
      default: return type;
    }
  };

  const handleConfirmReturn = async () => {
    if (!selectedOrder) return;

    try {
      await axiosInstance.post(`/admin/shipper/returns/${selectedOrder._id}/confirm`, {
        notes: notes || 'Admin đã xác nhận nhận hoàn trả'
      });
      
      message.success('Đã xác nhận nhận hoàn trả thành công!');
      setShowConfirmModal(false);
      setSelectedOrder(null);
      setNotes('');
      fetchReturnOrders();
    } catch (error) {
      console.error('Error confirming return:', error);
      message.error('Lỗi khi xác nhận hoàn trả');
    }
  };

  const handleStartProcessing = async () => {
    if (!selectedOrder) return;

    try {
      await axiosInstance.post(`/admin/shipper/returns/${selectedOrder._id}/start-processing`, {
        notes: notes || `Bắt đầu xử lý hoàn trả - ${getProcessingTypeText(processingType)}`,
        processingType
      });
      
      message.success('Đã bắt đầu xử lý hoàn trả!');
      setShowProcessingModal(false);
      setSelectedOrder(null);
      setNotes('');
      setProcessingType('refund');
      fetchReturnOrders();
    } catch (error) {
      console.error('Error starting processing:', error);
      message.error('Lỗi khi bắt đầu xử lý hoàn trả');
    }
  };

  const handleCompleteProcessing = async () => {
    if (!selectedOrder) return;

    try {
      await axiosInstance.post(`/admin/shipper/returns/${selectedOrder._id}/complete-processing`, {
        notes: notes || 'Hoàn tất xử lý hoàn trả',
        refundAmount: processingType === 'refund' ? refundAmount : undefined,
        completionDetails
      });
      
      message.success('Đã hoàn tất xử lý hoàn trả!');
      setShowCompleteModal(false);
      setSelectedOrder(null);
      setNotes('');
      setRefundAmount(0);
      setCompletionDetails('');
      fetchReturnOrders();
    } catch (error) {
      console.error('Error completing processing:', error);
      message.error('Lỗi khi hoàn tất xử lý hoàn trả');
    }
  };

  const columns: ColumnsType<ReturnOrder> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (id: string) => (
        <span className="font-mono text-xs">{id.slice(-8)}</span>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.user?.fullName}</div>
          <div className="text-xs text-gray-500">{record.user?.phone}</div>
        </div>
      ),
    },
    {
      title: 'Shipper',
      key: 'shipper',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.shipper?.fullName}</div>
          <div className="text-xs text-gray-500">{record.shipper?.phone}</div>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (price: number) => (
        <span className="font-medium text-green-600">
          {price?.toLocaleString('vi-VN')}đ
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Lý do thất bại',
      key: 'failureReason',
      width: 200,
      render: (_, record) => (
        <div className="text-xs">
          <div className="text-red-600 font-medium">
            {record.orderTracking?.deliveryFailureReason}
          </div>
          <div className="text-gray-500">
            {record.orderTracking?.deliveryFailureTime && 
              new Date(record.orderTracking.deliveryFailureTime).toLocaleDateString('vi-VN')
            }
          </div>
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'return_pending' && (
            <Tooltip title="Xác nhận nhận hoàn trả">
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => {
                  setSelectedOrder(record);
                  setShowConfirmModal(true);
                }}
              >
                Xác nhận
              </Button>
            </Tooltip>
          )}
          
          {record.status === 'return_confirmed' && (
            <Tooltip title="Bắt đầu xử lý hoàn trả">
              <Button
                type="primary"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => {
                  setSelectedOrder(record);
                  setRefundAmount(record.totalPrice);
                  setShowProcessingModal(true);
                }}
              >
                Xử lý
              </Button>
            </Tooltip>
          )}
          
          {record.status === 'return_processing' && (
            <Tooltip title="Hoàn tất xử lý">
              <Button
                type="primary"
                size="small"
                style={{ backgroundColor: '#52c41a' }}
                onClick={() => {
                  setSelectedOrder(record);
                  setShowCompleteModal(true);
                }}
              >
                Hoàn tất
              </Button>
            </Tooltip>
          )}
          
          {record.status === 'return_completed' && (
            <Tag color="green">✅ Đã xong</Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card title="🔄 Quản lý đơn hàng hoàn trả" className="shadow-md">
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
        />
      </Card>

      {/* Modal xác nhận nhận hoàn trả */}
      <Modal
        title="🔄 Xác nhận nhận hoàn trả"
        open={showConfirmModal}
        onOk={handleConfirmReturn}
        onCancel={() => {
          setShowConfirmModal(false);
          setSelectedOrder(null);
          setNotes('');
        }}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <p>Xác nhận đã nhận hoàn trả từ shipper cho đơn hàng:</p>
          <div className="bg-gray-50 p-3 rounded">
            <p><strong>Mã đơn:</strong> {selectedOrder?._id.slice(-8)}</p>
            <p><strong>Khách hàng:</strong> {selectedOrder?.user?.fullName}</p>
            <p><strong>Shipper:</strong> {selectedOrder?.shipper?.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ghi chú:</label>
            <TextArea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú về việc nhận hoàn trả..."
            />
          </div>
        </div>
      </Modal>

      {/* Modal bắt đầu xử lý */}
      <Modal
        title="⚙️ Bắt đầu xử lý hoàn trả"
        open={showProcessingModal}
        onOk={handleStartProcessing}
        onCancel={() => {
          setShowProcessingModal(false);
          setSelectedOrder(null);
          setNotes('');
          setProcessingType('refund');
        }}
        okText="Bắt đầu xử lý"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Loại xử lý:</label>
            <Select
              value={processingType}
              onChange={setProcessingType}
              className="w-full"
            >
              <Option value="refund">💰 Hoàn tiền</Option>
              <Option value="exchange">🔄 Đổi hàng</Option>
              <Option value="restock">📦 Nhập kho lại</Option>
              <Option value="disposal">🗑️ Hủy hàng</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ghi chú:</label>
            <TextArea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú về việc xử lý hoàn trả..."
            />
          </div>
        </div>
      </Modal>

      {/* Modal hoàn tất xử lý */}
      <Modal
        title="✅ Hoàn tất xử lý hoàn trả"
        open={showCompleteModal}
        onOk={handleCompleteProcessing}
        onCancel={() => {
          setShowCompleteModal(false);
          setSelectedOrder(null);
          setNotes('');
          setRefundAmount(0);
          setCompletionDetails('');
        }}
        okText="Hoàn tất"
        cancelText="Hủy"
      >
        <div className="space-y-4">
          {selectedOrder?.orderTracking?.returnProcessingType === 'refund' && (
            <div>
              <label className="block text-sm font-medium mb-2">Số tiền hoàn:</label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                suffix="VNĐ"
                placeholder="Nhập số tiền hoàn..."
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Chi tiết hoàn thành:</label>
            <TextArea
              rows={3}
              value={completionDetails}
              onChange={(e) => setCompletionDetails(e.target.value)}
              placeholder="Mô tả chi tiết về việc hoàn tất xử lý..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ghi chú:</label>
            <TextArea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú cuối cùng..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReturnOrderList;




