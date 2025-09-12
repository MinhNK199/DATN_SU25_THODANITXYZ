import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import toast from "react-hot-toast";

interface RatingFormProps {
  productId: string;
  orderId: string;
}

interface RatingData {
  rating: number;
  comment: string;
  images: string[];
  reply?: string; // ✅ thêm reply
}

const RatingForm: React.FC<RatingFormProps> = ({ productId, orderId }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);

  // Khi load trang, check xem user đã đánh giá chưa
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await axiosInstance.get("/rating/check", {
          params: { productId, orderId },
        });

        if (res.data?.hasRated) {
          setHasRated(true);
          setRatingData({
            rating: res.data.rating?.rating || 0,
            comment: res.data.rating?.comment || "",
            images: res.data.rating?.images || [],
            reply: res.data.rating?.reply || "", // ✅ thêm reply
          });
        }
      } catch (err) {
        console.error("❌ Lỗi khi check rating:", err);
      }
    };

    fetchRating();
  }, [productId, orderId]);

  // Upload ảnh
 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  // Giới hạn tổng số ảnh = 5
  if (filePreviews.length + files.length > 5) {
    toast.error("Bạn chỉ có thể tải lên tối đa 5 ảnh");
    return;
  }

  const previews = Array.from(files).map((file) =>
    URL.createObjectURL(file)
  );
  setFilePreviews((prev) => [...prev, ...previews]);

  for (const file of files) {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages((prev) => [...prev, res.data.url]);
    } catch (error) {
      toast.error("Upload ảnh thất bại");
    }
  }
};

  // Gửi đánh giá
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Vui lòng chọn số sao");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/rating", {
        productId,
        orderId,
        rating,
        comment,
        images,
      });
      toast.success("Đánh giá thành công!");
      setHasRated(true);
      setRatingData({ rating, comment, images });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Nếu đã đánh giá → chỉ hiển thị đánh giá đã nhập + phản hồi
  if (hasRated && ratingData) {
    return (
      <div className="p-3 bg-gray-100 rounded-md border space-y-3">
        <div>
          <p className="font-medium mb-1">Bạn đã đánh giá:</p>
          <div className="flex items-center gap-1 text-yellow-500 text-lg">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>{star <= ratingData.rating ? "★" : "☆"}</span>
            ))}
          </div>
          <p className="mt-2">
            Bình luận: {ratingData.comment || "(Không có bình luận)"}
          </p>
          {ratingData.images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {ratingData.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="Uploaded"
                  className="w-20 h-20 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>

        {/* ✅ hiển thị phản hồi admin */}
        {ratingData.reply && ratingData.reply.trim() !== "" && (
          <div className="p-3 bg-white rounded border border-blue-200">
            <p className="font-semibold text-blue-600 mb-1">Phản hồi từ Admin:</p>
            <p className="text-gray-700">{ratingData.reply}</p>
          </div>
        )}
      </div>
    );
  }

  // Nếu chưa đánh giá → hiển thị form
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-white p-4 rounded-md border"
    >
      {/* Chọn số sao */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${
              star <= rating ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Nhập bình luận */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Viết cảm nhận của bạn..."
        className="w-full border rounded p-2"
      />

      {/* Upload ảnh */}
      <div>
       <input
  type="file"
  accept="image/*"
  multiple
  onChange={handleFileChange}
  disabled={filePreviews.length >= 5}
/>
        <div className="flex gap-2 mt-2 flex-wrap">
          {filePreviews.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="preview"
              className="w-20 h-20 object-cover rounded border"
            />
          ))}
        </div>
      </div>

      {/* Nút gửi */}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
};

export default RatingForm;
