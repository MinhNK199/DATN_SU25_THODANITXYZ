import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Button,
  Input,
  Descriptions,
  Image,
} from "antd";
import axiosInstance from "../../../api/axiosInstance";
import dayjs from "dayjs";
import { useNotification } from "../../../hooks/useNotification";

const { TextArea } = Input;

const RatingDetail: React.FC = () => {
  const { success, error, warning } = useNotification();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/rating/${id}`);
      setRating(res.data);
      setReply(res.data.reply || "");
    } catch (err) {
      error("Không thể tải chi tiết đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return warning("Vui lòng nhập phản hồi");
    setReplyLoading(true);
    try {
      await axiosInstance.post(`/rating/${id}/reply`, { reply });
      success("Phản hồi thành công");
      setShowReplyForm(false);
      fetchDetail();
    } catch (err: any) {
      if (err.response?.data?.error?.code === "ALREADY_REPLIED") {
        error("Đánh giá đã được phản hồi");
      } else {
        error("Phản hồi thất bại");
      }
    } finally {
      setReplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!rating) {
    return <p className="text-center text-gray-500">Không tìm thấy đánh giá</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chi tiết đánh giá</h1>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>

      {/* Thông tin sản phẩm */}
      <Card title="Sản phẩm được đánh giá" className="shadow-sm">
        <div className="flex items-center gap-4">
          {rating.productId?.images?.[0] && (
            <Image
              src={rating.productId.images[0]}
              width={80}
              height={80}
              className="rounded-lg object-cover"
            />
          )}
          <div>
            <p className="font-semibold text-lg">{rating.productId?.name}</p>
            <p className="text-gray-500">
              Giá: {rating.productId?.price?.toLocaleString("vi-VN")}₫
            </p>
          </div>
        </div>
      </Card>

      {/* Thông tin đánh giá */}
      <Card title="Thông tin đánh giá" className="shadow-sm">
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Người đánh giá">
            {rating.userName || rating.userId?.name} (
            {rating.userId?.email || "Ẩn email"})
          </Descriptions.Item>
          <Descriptions.Item label="Số sao">
            <span className="font-semibold text-yellow-500">
              {rating.rating} ★
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Bình luận">
            {rating.comment || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(rating.date || rating.createdAt).format(
              "DD/MM/YYYY HH:mm"
            )}
          </Descriptions.Item>
        </Descriptions>

        {rating.images?.length > 0 && (
          <div className="mt-4">
            <b>Ảnh đính kèm:</b>
            <div className="flex gap-2 mt-2 flex-wrap">
              {rating.images.map((img: string, i: number) => (
                <Image
                  key={i}
                  src={img}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Phản hồi */}
      <Card title="Phản hồi" className="shadow-sm">
        {rating.reply && rating.reply.trim() !== "" && !showReplyForm ? (
          <p className="p-3 bg-gray-50 border rounded">{rating.reply}</p>
        ) : showReplyForm ? (
          <div>
            <TextArea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Nhập phản hồi..."
            />
            <div className="flex gap-2 mt-2">
              <Button
                type="primary"
                loading={replyLoading}
                onClick={handleReply}
              >
                Gửi phản hồi
              </Button>
              <Button onClick={() => setShowReplyForm(false)}>Hủy</Button>
            </div>
          </div>
        ) : (
          <Button type="primary" className="admin-primary-button" onClick={() => setShowReplyForm(true)}>
            Thêm phản hồi
          </Button>
        )}
      </Card>
    </div>
  );
};

export default RatingDetail;
