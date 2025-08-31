import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaTag, FaSearch, FaArrowLeft } from 'react-icons/fa';

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

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // Sửa URL: backend mount tại /api/blogs/public/published
        let url = `/api/blogs/public/published?page=${currentPage}&limit=12`;
        
        if (searchTerm) {
          url += `&search=${encodeURIComponent(searchTerm)}`;
        }
        
        if (selectedTag) {
          url += `&tag=${encodeURIComponent(selectedTag)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Lỗi khi tải dữ liệu blog');
        }
        const data = await response.json();
        setBlogs(data.blogs || []);
        setTotalPages(data.totalPages || 1);
        
        // Extract unique tags from blogs
        const tags = Array.from(new Set(data.blogs?.flatMap((blog: Blog) => blog.tags) || [])) as string[];
        setAvailableTags(tags);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage, searchTerm, selectedTag]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchParams({ search: searchTerm, tag: selectedTag });
  };

  const handleTagFilter = (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
    setCurrentPage(1);
    setSearchParams({ search: searchTerm, tag: selectedTag === tag ? '' : tag });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải blog...</p>
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
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>
            
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center text-red-600 py-8">
            <p>Không thể tải dữ liệu blog: {error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy bài viết</h3>
            <p className="text-gray-500">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
          </div>
        ) : (
          <>
            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <div 
                  key={blog._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                  onClick={() => navigate(`/blog/${blog.slug}`)}
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {blog.coverImage ? (
                      <img
                        src={getImageUrl(blog.coverImage)}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Khi ảnh bị lỗi, thay thế bằng placeholder
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    {/* Placeholder khi không có ảnh hoặc ảnh bị lỗi */}
                    <div className={`w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400 ${blog.coverImage ? 'hidden' : ''}`}>
                      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {/* Brand Tag */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                        {getBrandFromTags(blog.tags)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta Info */}
                    <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                      <div className="flex items-center">
                        <FaUser className="mr-2" />
                        <span>{blog.author?.name || 'Quản trị viên'}</span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2" />
                        <span>{formatDate(blog.publishedAt)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                      {blog.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.summary}
                    </p>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full flex items-center"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogList;
