import React from 'react';
import { Pagination } from 'antd';

interface AdminPaginationProps {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, size?: number) => void;
    onShowSizeChange?: (current: number, size: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: boolean;
    pageSizeOptions?: string[];
    responsive?: boolean;
    itemText?: string; // Tên item để hiển thị trong showTotal (mặc định: "mục")
}

const AdminPagination: React.FC<AdminPaginationProps> = ({
    current,
    pageSize,
    total,
    onChange,
    onShowSizeChange,
    showSizeChanger = true,
    showQuickJumper = true,
    showTotal = true,
    pageSizeOptions = ['10', '20', '50', '100'],
    responsive = true,
    itemText = "mục"
}) => {
    const defaultShowTotal = (total: number, range: [number, number]) =>
        `${range[0]}-${range[1]} của ${total} ${itemText}`;

    return (
        <Pagination
            current={current}
            pageSize={pageSize}
            total={total}
            showSizeChanger={showSizeChanger}
            showQuickJumper={showQuickJumper}
            showTotal={showTotal ? defaultShowTotal : undefined}
            pageSizeOptions={pageSizeOptions}
            onChange={onChange}
            onShowSizeChange={onShowSizeChange}
            responsive={responsive}
            style={{
                marginTop: 16,
                textAlign: 'right'
            }}
        />
    );
};

export default AdminPagination;
