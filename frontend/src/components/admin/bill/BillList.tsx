import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Bill } from "../../../interfaces/Bill";
import { FaFilePdf, FaEnvelope } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/bill";

const BillList: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error" | "">("");

    const fetchBills = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setBills(Array.isArray(data.data) ? data.data : []);
            // Log kiểm tra
            console.log('Bills:', data.data);
        } catch (error) {
            setMessage("Lỗi khi tải hóa đơn!");
            setMessageType("error");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handleExportPDF = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/${id}/export-pdf`, {
                method: "POST",
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bill-${id}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setMessage("Xuất PDF thành công!");
                setMessageType("success");
            } else {
                setMessage("Xuất PDF thất bại!");
                setMessageType("error");
            }
        } catch (error) {
            setMessage("Lỗi khi xuất PDF!");
            setMessageType("error");
        }
    };

    const handleSendEmail = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/${id}/send-email`, {
                method: "POST",
            });

            if (res.ok) {
                setMessage("Gửi email thành công!");
                setMessageType("success");
            } else {
                setMessage("Gửi email thất bại!");
                setMessageType("error");
            }
        } catch (error) {
            setMessage("Lỗi khi gửi email!");
            setMessageType("error");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'paid':
                return 'text-green-600 bg-green-100';
            case 'cancelled':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-700 text-center flex-grow">
                    Danh sách Hóa đơn
                </h1>
            </div>

            {message && (
                <div
                    className={`mb-4 px-4 py-2 rounded-md italic text-center shadow-md font-medium
          ${messageType === "success" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}
                >
                    {message}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-20 text-gray-600 text-lg">
                    Đang tải...
                </div>
            ) : (
                <table className="w-full border-collapse bg-white">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th className="py-3 px-4 border">STT</th>
                            <th className="py-3 px-4 border">Mã hóa đơn</th>
                            <th className="py-3 px-4 border">Khách hàng</th>
                            <th className="py-3 px-4 border">Tổng tiền</th>
                            <th className="py-3 px-4 border">Trạng thái</th>
                            <th className="py-3 px-4 border">Thanh toán</th>
                            <th className="py-3 px-4 border">Ngày tạo</th>
                            <th className="py-3 px-4 border">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.map((bill, index) => (
                            <tr
                                key={bill._id}
                                className="border-b text-gray-700 hover:bg-gray-100"
                            >
                                <td className="py-3 px-4 text-center">{index + 1}</td>
                                <td className="py-3 px-4 text-center">{bill.billNumber}</td>
                                <td className="py-3 px-4 text-center">
                                    {(bill as any).customer?.name || bill.customer}
                                </td>
                                <td className="py-3 px-4 text-center text-green-600 font-semibold">
                                    {bill.totalAmount.toLocaleString()}₫
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(bill.status)}`}>
                                        {bill.status === 'pending' ? 'Chờ xử lý' :
                                            bill.status === 'paid' ? 'Đã thanh toán' : 'Đã hủy'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    {bill.paymentMethod === 'cash' ? 'Tiền mặt' :
                                        bill.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' : 'Chuyển khoản'}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    {bill.createdAt ? formatDate(bill.createdAt) : 'N/A'}
                                </td>
                                <td className="py-3 px-4 flex gap-2 justify-center">
                                    <button
                                        onClick={() => handleExportPDF(bill._id!)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-1"
                                    >
                                        <FaFilePdf /> PDF
                                    </button>
                                    <button
                                        onClick={() => handleSendEmail(bill._id!)}
                                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center gap-1"
                                    >
                                        <FaEnvelope /> Email
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BillList;
