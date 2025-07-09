import React, { useState } from 'react';
import axios from 'axios';
import { FaStar, FaThumbsUp, FaThumbsDown, FaImage, FaTimes, FaUser, FaCalendar, FaCheck } from 'react-icons/fa';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  date: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
  pros: string[];
  cons: string[];
}

const ProductReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'Nguyễn Văn A',
      rating: 5,
      title: 'Sản phẩm tuyệt vời!',
      comment: 'iPhone 15 Pro Max thực sự rất đáng tiền. Camera chất lượng cao, hiệu năng mượt mà, pin trâu. Tôi rất hài lòng với sản phẩm này.',
      images: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop'
      ],
      date: '2024-01-15',
      helpful: 24,
      notHelpful: 2,
      verified: true,
      pros: ['Camera chất lượng cao', 'Hiệu năng mượt mà', 'Pin trâu'],
      cons: ['Giá cao']
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Trần Thị B',
      rating: 4,
      title: 'Tốt nhưng có thể cải thiện',
      comment: 'Sản phẩm tốt, thiết kế đẹp. Tuy nhiên giá hơi cao và không có jack 3.5mm. Camera chụp đẹp nhưng đôi khi bị lag.',
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop'],
      date: '2024-01-10',
      helpful: 15,
      notHelpful: 5,
      verified: true,
      pros: ['Thiết kế đẹp', 'Camera chụp đẹp'],
      cons: ['Giá cao', 'Không có jack 3.5mm', 'Camera đôi khi lag']
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Lê Văn C',
      rating: 5,
      title: 'Đáng mua!',
      comment: 'Mua được 2 tháng rồi, rất hài lòng. Pin trâu, chơi game mượt, camera đẹp. Khuyến nghị mua!',
      images: [],
      date: '2024-01-05',
      helpful: 8,
      notHelpful: 1,
      verified: false,
      pros: ['Pin trâu', 'Chơi game mượt', 'Camera đẹp'],
      cons: []
    }
  ]);

  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    title: '',
    comment: '',
    pros: '',
    cons: '',
    images: [] as string[]
  });
  const [sentimentResult, setSentimentResult] = useState<null | {
    sentiment: string;
    score: number;
    comparative: number;
    words: string[];
    positive: string[];
    negative: string[];
  }>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentError, setSentimentError] = useState<string | null>(null);

  const ratingStats = {
    average: 4.7,
    total: 1247,
    distribution: {
      5: 789,
      4: 234,
      3: 156,
      2: 45,
      1: 23
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleRatingHover = (rating: number) => {
    setHoverRating(rating);
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
  };

  const handleNotHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, notHelpful: review.notHelpful + 1 }
        : review
    ));
  };

  const handleSubmitReview = () => {
    if (selectedRating === 0) {
      alert('Vui lòng chọn đánh giá sao!');
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userId: 'currentUser',
      userName: 'Người dùng hiện tại',
      rating: selectedRating,
      title: newReview.title,
      comment: newReview.comment,
      images: newReview.images,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      notHelpful: 0,
      verified: false,
      pros: newReview.pros ? newReview.pros.split(',').map(p => p.trim()) : [],
      cons: newReview.cons ? newReview.cons.split(',').map(c => c.trim()) : []
    };

    setReviews(prev => [review, ...prev]);
    setShowReviewForm(false);
    setNewReview({ title: '', comment: '', pros: '', cons: '', images: [] });
    setSelectedRating(0);
  };

  const addMockImage = () => {
    const mockImages = [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop'
    ];
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    setNewReview(prev => ({
      ...prev,
      images: [...prev.images, randomImage]
    }));
  };

  const removeImage = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Gọi API phân tích cảm xúc khi comment thay đổi
  React.useEffect(() => {
    const fetchSentiment = async () => {
      if (!newReview.comment.trim()) {
        setSentimentResult(null);
        return;
      }
      setSentimentLoading(true);
      setSentimentError(null);
      try {
        const res = await axios.post('/api/rating/analyze-sentiment', { comment: newReview.comment });
        setSentimentResult(res.data);
      } catch (err: any) {
        setSentimentError('Không phân tích được cảm xúc');
        setSentimentResult(null);
      } finally {
        setSentimentLoading(false);
      }
    };
    fetchSentiment();
  }, [newReview.comment]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đánh giá sản phẩm</h1>
          <p className="text-gray-600">
            Chia sẻ trải nghiệm của bạn về sản phẩm
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá sản phẩm</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(ratingStats.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{ratingStats.average}</span>
                </div>
                <span className="text-gray-600">({ratingStats.total} đánh giá)</span>
              </div>
            </div>
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Viết đánh giá
            </button>
          </div>

          {/* Rating Distribution */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố đánh giá</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = ratingStats.distribution[rating as keyof typeof ratingStats.distribution];
                const percentage = (count / ratingStats.total) * 100;
                return (
                  <div key={rating} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 w-16">
                      <span className="text-sm text-gray-600">{rating}</span>
                      <FaStar className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Viết đánh giá của bạn</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Rating Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleRatingClick(rating)}
                      onMouseEnter={() => handleRatingHover(rating)}
                      onMouseLeave={() => handleRatingHover(0)}
                      className="text-2xl"
                    >
                      <FaStar
                        className={`w-8 h-8 ${
                          rating <= (hoverRating || selectedRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề đánh giá</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Tóm tắt đánh giá của bạn"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Review Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét chi tiết</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {/* Hiển thị kết quả cảm xúc */}
                <div className="mt-2 min-h-[32px]">
                  {sentimentLoading && <span className="text-blue-500 text-sm">Đang phân tích cảm xúc...</span>}
                  {sentimentError && <span className="text-red-500 text-sm">{sentimentError}</span>}
                  {sentimentResult && !sentimentLoading && (
                    <div className="text-sm flex flex-col md:flex-row md:items-center md:space-x-4">
                      <span className="font-semibold">Cảm xúc: </span>
                      <span className={
                        sentimentResult.sentiment === 'positive' ? 'text-green-600' :
                        sentimentResult.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }>
                        {sentimentResult.sentiment === 'positive' && 'Tích cực'}
                        {sentimentResult.sentiment === 'negative' && 'Tiêu cực'}
                        {sentimentResult.sentiment === 'neutral' && 'Trung tính'}
                      </span>
                      <span>• Điểm: {sentimentResult.score}</span>
                      {sentimentResult.positive.length > 0 && (
                        <span className="text-green-700">Từ tích cực: {sentimentResult.positive.join(', ')}</span>
                      )}
                      {sentimentResult.negative.length > 0 && (
                        <span className="text-red-700">Từ tiêu cực: {sentimentResult.negative.join(', ')}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ưu điểm (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={newReview.pros}
                    onChange={(e) => setNewReview(prev => ({ ...prev, pros: e.target.value }))}
                    placeholder="Ví dụ: Đẹp, nhanh, pin trâu"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nhược điểm (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={newReview.cons}
                    onChange={(e) => setNewReview(prev => ({ ...prev, cons: e.target.value }))}
                    placeholder="Ví dụ: Giá cao, nặng"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Thêm ảnh (tối đa 5 ảnh)</label>
                <div className="flex flex-wrap gap-2">
                  {newReview.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Review ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {newReview.images.length < 5 && (
                    <button
                      onClick={addMockImage}
                      className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600"
                    >
                      <FaImage className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Gửi đánh giá
                </button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{review.userName}</span>
                        {review.verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <FaCheck className="w-3 h-3 mr-1" />
                            Đã mua
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <FaCalendar className="w-3 h-3" />
                        <span>{formatDate(review.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>

                {/* Pros and Cons */}
                {(review.pros.length > 0 || review.cons.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {review.pros.length > 0 && (
                      <div>
                        <h5 className="font-medium text-green-700 mb-1">Ưu điểm:</h5>
                        <ul className="text-sm text-gray-600">
                          {review.pros.map((pro, index) => (
                            <li key={index} className="flex items-center">
                              <FaCheck className="w-3 h-3 text-green-500 mr-2" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons.length > 0 && (
                      <div>
                        <h5 className="font-medium text-red-700 mb-1">Nhược điểm:</h5>
                        <ul className="text-sm text-gray-600">
                          {review.cons.map((con, index) => (
                            <li key={index} className="flex items-center">
                              <FaTimes className="w-3 h-3 text-red-500 mr-2" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Images */}
                {review.images.length > 0 && (
                  <div className="mb-3">
                    <div className="flex space-x-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                    >
                      <FaThumbsUp className="w-4 h-4" />
                      <span className="text-sm">Hữu ích ({review.helpful})</span>
                    </button>
                    <button
                      onClick={() => handleNotHelpful(review.id)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                    >
                      <FaThumbsDown className="w-4 h-4" />
                      <span className="text-sm">Không hữu ích ({review.notHelpful})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;