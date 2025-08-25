import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaTag } from 'react-icons/fa';

interface Blog {
  _id: string;
  title: string;
  summary: string;
  coverImage: string;
  tags: string[];
  publishedAt: string;
  author: {
    name: string;
  };
  slug: string;
}

const BlogSection: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blog/public/published?limit=5');
        if (!response.ok) {
          throw new Error('Lỗi khi tải dữ liệu blog');
        }
        const data = await response.json();
        setBlogs(data.blogs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const getBrandFromTags = (tags: string[]) => {
    const brandTags = tags.filter(tag => 
      ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'LG', 'Sony'].some(brand => 
        tag.toLowerCase().includes(brand.toLowerCase())
      )
    );
    return brandTags[0] || tags[0] || 'Công nghệ';
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải blog...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">
            <p>Không thể tải dữ liệu blog: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Hãy cùng chúng tôi theo dõi công nghệ...
            </h2>
            <p className="text-lg text-gray-600">
              Cập nhật những tin tức công nghệ mới nhất
            </p>
          </div>
          <button 
            onClick={() => navigate('/blogs')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
          >
            Đọc thêm bài viết →
          </button>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {blogs.map((blog) => (
            <div 
              key={blog._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
              onClick={() => navigate(`/blog/${blog.slug}`)}
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={blog.coverImage || '/default-blog.jpg'}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Brand Tag */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {getBrandFromTags(blog.tags)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Meta Info */}
                <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                  <div className="flex items-center">
                    <FaUser className="mr-1" />
                    <span>{blog.author?.name || 'Quản trị viên'}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    <span>{formatDate(blog.publishedAt)}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                  {blog.title}
                </h3>

                {/* Summary */}
                <p className="text-gray-600 text-sm line-clamp-3">
                  {blog.summary}
                </p>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {blog.tags.slice(0, 2).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center"
                      >
                        <FaTag className="mr-1 text-xs" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
