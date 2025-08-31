import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaRocket, FaSearch, FaCog, FaImage } from 'react-icons/fa';
import BlogAdd from './BlogAdd';
import BlogEdit from './BlogEdit';
import BlogDetail from './BlogDetail';

interface Blog {
  _id: string;
  title: string;
  summary: string;
  tags: string[];
  isPublished: boolean;
  coverImage?: string;
  author: {
    name: string;
  };
  createdAt: string;
}

const BlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchTerm]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // Sửa URL: backend mount tại /api/blogs
      const response = await fetch('/api/blogs');
      if (!response.ok) {
        throw new Error('Lỗi khi tải dữ liệu blog');
      }
      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error('Lỗi khi tải blog:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        // Sửa URL: backend mount tại /api/blogs
        const response = await fetch(`/api/blogs/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Lỗi khi xóa bài viết');
        }

        alert('Xóa bài viết thành công!');
        fetchBlogs();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Có lỗi xảy ra');
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
              // Sửa URL: backend mount tại /api/blogs
        const response = await fetch(`/api/blogs/${id}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi publish bài viết');
      }

      alert('Publish bài viết thành công!');
      fetchBlogs();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setShowEditModal(true);
  };

  const handleView = (blog: Blog) => {
    setSelectedBlog(blog);
    setShowDetailModal(true);
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchBlogs();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedBlog(null);
    fetchBlogs();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Chuẩn hóa URL ảnh (thêm host nếu là đường dẫn tương đối)
  const getImageUrl = (url?: string) => {
    if (!url || url.trim() === '') return '/placeholder.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Mặc định backend chạy ở cổng 8000
    const normalized = url.replace(/^\/+/, '');
    return `http://localhost:8000/${normalized}`;
  };

  const getStatusBadge = (isPublished: boolean) => {
    if (isPublished) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          Đã đăng
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
        Nháp
      </span>
    );
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Blog công nghệ</h1>
        <p className="text-gray-600 mt-2">Quản lý các bài viết blog công nghệ</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaPlus />
            + Thêm bài viết
          </button>
        </div>
      </div>

      {/* Blog Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tóm tắt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded mr-3 flex items-center justify-center bg-gray-100">
                        {blog.coverImage ? (
                          <img
                            src={getImageUrl(blog.coverImage)}
                            alt={blog.title}
                            className="w-10 h-10 rounded object-cover"
                            onError={(e) => {
                              // Khi ảnh bị lỗi, thay thế bằng placeholder
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        {/* Placeholder khi không có ảnh hoặc ảnh bị lỗi */}
                        <div className={`w-10 h-10 rounded flex items-center justify-center text-gray-400 ${blog.coverImage ? 'hidden' : ''}`}>
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                        <div className="text-sm text-gray-500">
                          {blog.author?.name || 'Quản trị viên'} • {formatDate(blog.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {blog.summary}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {blog.tags?.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      {blog.tags && blog.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{blog.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(blog.isPublished)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(blog)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(blog)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      {!blog.isPublished && (
                        <button
                          onClick={() => handlePublish(blog._id)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Đăng bài"
                        >
                          <FaRocket />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Trang <span className="font-medium">{currentPage}</span> của{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <BlogAdd
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {showEditModal && selectedBlog && (
        <BlogEdit
          blog={selectedBlog}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDetailModal && selectedBlog && (
        <BlogDetail
          blog={selectedBlog}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default BlogManager; 