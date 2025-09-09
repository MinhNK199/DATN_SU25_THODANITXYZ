import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import toast from "react-hot-toast";

interface RatingFormProps {
  productId: string;
  orderId: string;
}

const RatingForm: React.FC<RatingFormProps> = ({ productId, orderId }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [images, setImages] = useState<string[]>([]); // URLs sau khi upload
  const [filePreviews, setFilePreviews] = useState<string[]>([]); // Preview trước khi submit
  const [loading, setLoading] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // Check xem user đã đánh giá chưa
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await axiosInstance.get("/rating/check", {
          params: { productId, orderId },
        });
        if (res.data?.hasRated) {
          setHasRated(true);
          setRating(res.data.rating?.rating || 0);
          setComment(res.data.rating?.comment || "");
          setImages(res.data.rating?.images || []);
        }
      } catch (err) {
        console.error("Lỗi khi check rating:", err);
      }
    };
    fetchRating();
  }, [productId, orderId]);

  // Xử lý chọn ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const previews = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setFilePreviews((prev) => [...prev, ...previews]);

    // Upload từng file
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (hasRated) {
    return (
      <div className="p-3 bg-gray-100 rounded-md">
        <p className="font-medium">Bạn đã đánh giá:</p>
        <p>Số sao: {rating}⭐</p>
        <p>Bình luận: {comment}</p>
        <div className="flex gap-2 mt-2">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Uploaded"
              className="w-20 h-20 object-cover rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-md border">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Viết cảm nhận của bạn..."
        className="w-full border rounded p-2"
      />

      <div>
        <input type="file" accept="image/*" multiple onChange={handleFileChange} />
        <div className="flex gap-2 mt-2 flex-wrap">
          {filePreviews.map((src, idx) => (
            <img key={idx} src={src} alt="preview" className="w-20 h-20 object-cover rounded border" />
          ))}
        </div>
      </div>

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
