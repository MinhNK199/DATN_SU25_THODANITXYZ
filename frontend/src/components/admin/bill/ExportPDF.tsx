import React from "react";
import { FaFilePdf } from "react-icons/fa";

const API_URL = "http://localhost:9000/api/bill";

interface ExportPDFProps {
    billId: string;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const ExportPDF: React.FC<ExportPDFProps> = ({ billId, onSuccess, onError }) => {
    const handleExportPDF = async () => {
        try {
            const res = await fetch(`${API_URL}/${billId}/export-pdf`, {
                method: "POST",
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bill-${billId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                onSuccess("Xuất PDF thành công!");
            } else {
                onError("Xuất PDF thất bại!");
            }
        } catch (error) {
            onError("Lỗi khi xuất PDF!");
        }
    };

    return (
        <button
            onClick={handleExportPDF}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-1"
        >
            <FaFilePdf /> PDF
        </button>
    );
};

export default ExportPDF;
