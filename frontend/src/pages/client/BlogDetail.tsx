import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaTag, FaArrowLeft, FaShare, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

interface Blog {
  _id: string;
  title: string;
  content: string;
  summary: string;
  coverImage: string;
  tags: string[];
  publishedAt: string;
  author: {
    name: string;
  };
  slug: string;
}

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        // Sửa URL: backend mount tại /api/blogs/public/slug/${slug}
        const response = await fetch(`/api/blogs/public/slug/${slug}`);
        if (!response.ok) {
          throw new Error('Không tìm thấy bài viết');
        }
        const data = await response.json();
        setBlog(data);
        
        // Fetch related blogs
        if (data.tags && data.tags.length > 0) {
          // Sửa URL: backend mount tại /api/blogs/public/published
          const relatedResponse = await fetch(`/api/blogs/public/published?tag=${encodeURIComponent(data.tags[0])}&limit=3`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedBlogs(relatedData.blogs?.filter((b: Blog) => b._id !== data._id) || []);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Chuẩn hóa URL ảnh (thêm host nếu là đường dẫn tương đối)
  const getImageUrl = (url?: string) => {
    if (!url || url.trim() === '') return '/placeholder.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Mặc định backend chạy ở cổng 8000
    const normalized = url.replace(/^\/+/, '');
    return `http://localhost:8000/${normalized}`;
  };

  const getBrandFromTags = (tags: string[]) => {
    const brandTags = tags.filter(tag => 
      ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'LG', 'Sony'].some(brand => 
        tag.toLowerCase().includes(brand.toLowerCase())
      )
    );
    return brandTags[0] || tags[0] || 'Công nghệ';
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy bài viết</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => navigate('/blogs')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại danh sách blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Blog Công nghệ</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <FaUser className="mr-2" />
                <span>{blog.author?.name || 'Quản trị viên'}</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex items-center">
                  <FaTag className="mr-2" />
                  <span>{getBrandFromTags(blog.tags)}</span>
                </div>
              )}
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">Chia sẻ:</span>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Chia sẻ trên Facebook"
              >
                <FaFacebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 text-blue-400 hover:bg-blue-50 rounded-full transition-colors"
                title="Chia sẻ trên Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                title="Chia sẻ trên LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="mb-8">
            <div className="w-full h-96 bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
              {blog.coverImage ? (
                <img
                  src={getImageUrl(blog.coverImage)}
                  alt={blog.title}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    // Khi ảnh bị lỗi, thay thế bằng placeholder
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              {/* Placeholder khi không có ảnh hoặc ảnh bị lỗi */}
              <div className={`w-full h-96 bg-gray-100 rounded-lg shadow-lg flex items-center justify-center text-gray-400 ${blog.coverImage ? 'hidden' : ''}`}>
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                    onClick={() => navigate(`/blogs?tag=${encodeURIComponent(tag)}`)}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <div className="border-t pt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Bài viết liên quan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <div 
                    key={relatedBlog._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => navigate(`/blog/${relatedBlog.slug}`)}
                  >
                    <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {relatedBlog.coverImage ? (
                        <img
                          src={getImageUrl(relatedBlog.coverImage)}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Khi ảnh bị lỗi, thay thế bằng placeholder
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      {/* Placeholder khi không có ảnh hoặc ảnh bị lỗi */}
                      <div className={`w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 ${relatedBlog.coverImage ? 'hidden' : ''}`}>
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {relatedBlog.title}
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedBlog.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
