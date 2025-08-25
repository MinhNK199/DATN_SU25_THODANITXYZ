import React from 'react';
import { FaTimes, FaUser, FaCalendarAlt, FaTag, FaEye, FaEdit } from 'react-icons/fa';

interface Blog {
  _id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  author: {
    name: string;
  };
  createdAt: string;
  isPublished: boolean;
}

interface BlogDetailProps {
  blog: Blog;
  onClose: () => void;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blog, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isPublished: boolean) => {
    if (isPublished) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
          Đã đăng
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
        Nháp
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết bài viết</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cover Image */}
          <div className="w-full h-64 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
            {blog.coverImage ? (
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Khi ảnh bị lỗi, thay thế bằng placeholder
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            {/* Placeholder khi không có ảnh hoặc ảnh bị lỗi */}
            <div className={`w-full h-full flex items-center justify-center text-gray-400 ${blog.coverImage ? 'hidden' : ''}`}>
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <FaUser className="mr-2" />
                <span>{blog.author?.name || 'Quản trị viên'}</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <FaEye className="mr-2" />
                {getStatusBadge(blog.isPublished)}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tóm tắt</h3>
            <p className="text-gray-700 leading-relaxed">{blog.summary}</p>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                  >
                    <FaTag className="mr-1 text-xs" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nội dung</h3>
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </div>

          {/* SEO Information */}
          {(blog.metaTitle || blog.metaDescription) && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin SEO</h3>
              
              {blog.metaTitle && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Meta Title</h4>
                  <p className="text-gray-600 text-sm">{blog.metaTitle}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    Độ dài: {blog.metaTitle.length}/60 ký tự
                  </div>
                </div>
              )}

              {blog.metaDescription && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Meta Description</h4>
                  <p className="text-gray-600 text-sm">{blog.metaDescription}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    Độ dài: {blog.metaDescription.length}/160 ký tự
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
