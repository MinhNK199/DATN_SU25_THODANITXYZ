import React from 'react';
import { Modal, Descriptions, Divider, Table, Tag } from 'antd';
import { FaEye } from 'react-icons/fa';
import type { Bill } from '../../../interfaces/Bill';

interface BillDetailModalProps {
    visible: boolean;
    onCancel: () => void;
    bill: Bill | null;
    loading: boolean;
    getStatusColor: (status: string) => string;
    getStatusLabel: (status: string) => string;
    getPaymentMethodLabel: (method: string) => string;
    getPaymentStatusLabel: (status: string) => string;
    formatDate: (date: Date) => string;
    getCustomerName: (customer: any) => string;
    getCustomerEmail: (customer: any) => string;
    getCustomerId: (customer: any) => string;
    getProductName: (product: any) => string;
    getProductId: (product: any) => string;
}

const BillDetailModal: React.FC<BillDetailModalProps> = ({
    visible,
    onCancel,
    bill,
    loading,
    getStatusColor,
    getStatusLabel,
    getPaymentMethodLabel,
    getPaymentStatusLabel,
    formatDate,
    getCustomerName,
    getCustomerEmail,
    getCustomerId,
    getProductName,
    getProductId,
}) => {
    // Columns cho bảng chi tiết sản phẩm
    const productColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            render: (product: any) => (
                <div>
                    <div className="font-semibold">{getProductName(product)}</div>
                    <div className="text-gray-500 text-sm">ID: {getProductId(product)}</div>
                </div>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number) => (
                <span className="font-medium">{quantity}</span>
            ),
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => (
                <span className="text-green-600 font-semibold">
                    {price.toLocaleString()}₫
                </span>
            ),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            render: (record: any) => (
                <span className="text-blue-600 font-semibold">
                    {(record.quantity * record.price).toLocaleString()}₫
                </span>
            ),
        },
    ];

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <FaEye className="text-blue-500" />
                    <span>Chi tiết hóa đơn</span>
                    {bill && (
                        <Tag color="blue" className="ml-2">
                            {bill.billNumber}
                        </Tag>
                    )}
                </div>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            centered
        >
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải chi tiết...</p>
                </div>
            ) : bill ? (
                <div className="space-y-6">
                    {/* Thông tin cơ bản */}
                    <Descriptions title="Thông tin hóa đơn" bordered column={2}>
                        <Descriptions.Item label="Mã hóa đơn" span={1}>
                            <span className="font-semibold text-blue-600">{bill.billNumber}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo" span={1}>
                            {formatDate(new Date(bill.createdAt!))}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái" span={1}>
                            <Tag color={getStatusColor(bill.status)}>
                                {getStatusLabel(bill.status)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền" span={1}>
                            <span className="text-green-600 font-semibold text-lg">
                                {bill.totalAmount.toLocaleString()}₫
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán" span={1}>
                            {getPaymentMethodLabel(bill.paymentMethod)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái thanh toán" span={1}>
                            <Tag color={bill.paymentStatus === 'paid' ? 'green' : 'orange'}>
                                {getPaymentStatusLabel(bill.paymentStatus)}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    {/* Thông tin khách hàng */}
                    <Descriptions title="Thông tin khách hàng" bordered column={1}>
                        <Descriptions.Item label="Tên khách hàng">
                            {getCustomerName(bill.customer)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {getCustomerEmail(bill.customer)}
                        </Descriptions.Item>
                        <Descriptions.Item label="ID khách hàng">
                            <code className="bg-gray-100 px-2 py-1 rounded">
                                {getCustomerId(bill.customer)}
                            </code>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    {/* Chi tiết sản phẩm */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Chi tiết sản phẩm</h3>
                        <Table
                            dataSource={bill.items}
                            columns={productColumns}
                            rowKey={(record, index) => index?.toString() || '0'}
                            pagination={false}
                            size="small"
                            summary={() => (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={3}>
                                        <span className="font-semibold text-lg">Tổng cộng:</span>
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={1}>
                                        <span className="text-green-600 font-semibold text-lg">
                                            {bill.totalAmount.toLocaleString()}₫
                                        </span>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            )}
                        />
                    </div>

                    <Divider />

                    {/* Thông tin bổ sung */}
                    <Descriptions title="Thông tin bổ sung" bordered column={1}>
                        <Descriptions.Item label="ID hóa đơn">
                            <code className="bg-gray-100 px-2 py-1 rounded">
                                {bill._id}
                            </code>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">
                            {bill.updatedAt ? formatDate(new Date(bill.updatedAt)) : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lượng sản phẩm">
                            {bill.items.length} sản phẩm
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    Không tìm thấy thông tin hóa đơn
                </div>
            )}
        </Modal>
    );
};

export default BillDetailModal; 