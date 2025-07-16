import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { useNavigate } from "react-router-dom";

const VoucherList: React.FC = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/product?pageSize=1000")
      .then(res => res.json())
      .then(data => {
        // Gộp tất cả voucher từ các sản phẩm
        const allVouchers: any[] = [];
        (data.products || []).forEach((p: any) => {
          (p.vouchers || []).forEach((v: any) => {
            allVouchers.push({ ...v, productName: p.name });
          });
        });
        setVouchers(allVouchers);
      });
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Button type="primary" onClick={() => navigate("/admin/vouchers/add")}>Thêm voucher</Button>
      <Table
        className="mt-4"
        dataSource={vouchers}
        columns={[
          { title: "Mã", dataIndex: "code" },
          { title: "Loại", dataIndex: "discountType" },
          { title: "Giá trị", dataIndex: "value" },
          { title: "Ngày bắt đầu", dataIndex: "startDate", render: (d: string) => d ? new Date(d).toLocaleString() : "" },
          { title: "Ngày kết thúc", dataIndex: "endDate", render: (d: string) => d ? new Date(d).toLocaleString() : "" },
          { title: "Sản phẩm", dataIndex: "productName" },
        ]}
        rowKey={r => r.code + r.productName}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default VoucherList; 