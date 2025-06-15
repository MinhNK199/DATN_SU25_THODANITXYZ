import React from "react";
import { FaEnvelope } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/bill";

interface SendBillEmailProps {
    billId: string;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const SendBillEmail: React.FC<SendBillEmailProps> = ({ billId, onSuccess, onError }) => {
    const handleSendEmail = async () => {
        try {
            const res = await fetch(`${API_URL}/${billId}/send-email`, {
                method: "POST",
            });

            if (res.ok) {
                onSuccess("Gửi email thành công!");
            } else {
                onError("Gửi email thất bại!");
            }
        } catch (error) {
            onError("Lỗi khi gửi email!");
        }
    };

    return (
        <button
            onClick={handleSendEmail}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center gap-1"
        >
            <FaEnvelope /> Email
        </button>
    );
};

export default SendBillEmail;
