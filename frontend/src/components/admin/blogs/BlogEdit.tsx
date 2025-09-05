import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaImage, FaSpinner } from 'react-icons/fa';

interface Blog {
  _id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  coverImage?: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface BlogEditProps {
  blog: Blog;
  onClose: () => void;
  onSuccess: () => void;
}

const BlogEdit: React.FC<BlogEditProps> = ({ blog, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: blog.title,
    summary: blog.summary,
    content: blog.content,
    tags: blog.tags.join(', '),
    metaTitle: blog.metaTitle || '',
    metaDescription: blog.metaDescription || ''
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(blog.coverImage || '');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          coverImage: 'Vui lòng chọn file ảnh hợp lệ'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          coverImage: 'Kích thước file không được vượt quá 5MB'
        }));
        return;
      }

      setCoverImage(file);
      setErrors(prev => ({
        ...prev,
        coverImage: ''
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('Bắt đầu upload ảnh:', file.name, file.size, file.type);
      
      const formData = new FormData();
      formData.append('image', file);

      // Sử dụng proxy thay vì gọi trực tiếp
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lỗi response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload thành công:', data);
      console.log('URL ảnh nhận được:', data.url);
      console.log('Kiểu dữ liệu URL:', typeof data.url);
      
      if (!data.url) {
        throw new Error('Không nhận được URL ảnh từ server');
      }
      
      return data.url;
    } catch (error) {
      console.error('Lỗi upload ảnh:', error);
      throw error;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề bài viết';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung bài viết';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Vui lòng nhập tóm tắt bài viết';
    }

    if (formData.summary.length > 300) {
      newErrors.summary = 'Tóm tắt không được vượt quá 300 ký tự';
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title không được vượt quá 60 ký tự';
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description không được vượt quá 160 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Upload image first if exists
      let imageUrl = blog.coverImage || '';
      if (coverImage) {
        setUploading(true);
        imageUrl = await uploadImage(coverImage);
        setUploading(false);
        
        // Cập nhật imagePreview với URL mới sau khi upload thành công
        console.log('Trước khi cập nhật imagePreview:', imagePreview);
        setImagePreview(imageUrl);
        console.log('Đã cập nhật imagePreview với URL mới:', imageUrl);
        console.log('State imagePreview sau khi set:', imagePreview); // Lưu ý: React state update là async
        
        // Đợi một chút để state cập nhật
        setTimeout(() => {
          console.log('State imagePreview sau 100ms:', imagePreview);
        }, 100);
      }

      // Prepare blog data
      const blogData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        coverImage: imageUrl
      };

      console.log('Gửi dữ liệu blog để update:', blogData);

      // Update blog sử dụng proxy
      // Sửa URL: backend mount tại /api/blogs
      const response = await fetch(`/api/blogs/${blog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(blogData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi cập nhật bài viết');
      }

      alert('Cập nhật bài viết thành công!');
      onSuccess();
    } catch (error) {
      console.error('Lỗi:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật bài viết');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setImagePreview('');
    // Không cần xóa blog.coverImage vì đó là dữ liệu gốc
    console.log('Đã xóa ảnh mới được chọn');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa bài viết</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tiêu đề bài viết..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tóm tắt <span className="text-red-500">*</span>
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows={3}
              maxLength={300}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.summary ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập tóm tắt bài viết (tối đa 300 ký tự)..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.summary && (
                <p className="text-sm text-red-600">{errors.summary}</p>
              )}
              <span className="text-sm text-gray-500 ml-auto">
                {formData.summary.length}/300
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bìa bài viết
            </label>
            <div className="space-y-4">
              {/* Current Image - chỉ hiển thị khi không có ảnh mới được chọn */}
              {blog.coverImage && !coverImage && (
                <div className="relative">
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={blog.coverImage}
                      alt="Current cover"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        // Khi ảnh bị lỗi, thay thế bằng placeholder
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {/* Placeholder khi ảnh bị lỗi */}
                    <div className="hidden w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Image Upload */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <FaSpinner className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                    ) : (
                      <FaUpload className="w-8 h-8 text-gray-400 mb-2" />
                    )}
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click để upload</span> hoặc kéo thả file
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (tối đa 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Image Preview - chỉ hiển thị khi có ảnh mới được chọn hoặc upload thành công */}
              {coverImage && imagePreview && (
                <div className="relative">
                  {(() => {
                    console.log('Rendering Image Preview với:', { coverImage: coverImage?.name, imagePreview });
                    return null;
                  })()}
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        // Khi ảnh bị lỗi, thay thế bằng placeholder
                        console.error('Lỗi hiển thị ảnh preview:', imagePreview);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                      onLoad={(e) => {
                        console.log('Ảnh preview đã load thành công:', imagePreview);
                      }}
                    />
                    {/* Placeholder khi ảnh bị lỗi */}
                    <div className="hidden w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              )}

              {errors.coverImage && (
                <p className="text-sm text-red-600">{errors.coverImage}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung bài viết <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={8}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập nội dung bài viết..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tags, cách nhau bởi dấu phẩy (ví dụ: Apple, Samsung, Công nghệ)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Tags giúp người đọc dễ dàng tìm kiếm bài viết
            </p>
          </div>

          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleInputChange}
              maxLength={60}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.metaTitle ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Meta title cho SEO (tối đa 60 ký tự)..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.metaTitle && (
                <p className="text-sm text-red-600">{errors.metaTitle}</p>
              )}
              <span className="text-sm text-gray-500 ml-auto">
                {formData.metaTitle.length}/60
              </span>
            </div>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              rows={2}
              maxLength={160}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.metaDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Meta description cho SEO (tối đa 160 ký tự)..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.metaDescription && (
                <p className="text-sm text-red-600">{errors.metaDescription}</p>
              )}
              <span className="text-sm text-gray-500 ml-auto">
                {formData.metaDescription.length}/160
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật bài viết'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEdit;
