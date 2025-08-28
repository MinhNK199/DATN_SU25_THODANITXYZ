import React, { useState } from 'react';
import { FaTimes, FaUpload, FaImage, FaSpinner } from 'react-icons/fa';

interface BlogAddProps {
  onClose: () => void;
  onSuccess: () => void;
}

const BlogAdd: React.FC<BlogAddProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    tags: '',
    metaTitle: '',
    metaDescription: ''
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
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
      console.log('FormData đã tạo với file:', file.name);

      // Kiểm tra token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không có token xác thực');
      }
      console.log('Token đã có:', token.substring(0, 20) + '...');

      // Sử dụng proxy thay vì gọi trực tiếp
      console.log('Gửi request upload đến /api/upload/image');
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lỗi response:', errorData);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Dữ liệu upload không hợp lệ');
        } else if (response.status === 413) {
          throw new Error('File quá lớn, vui lòng chọn file nhỏ hơn');
        } else {
          throw new Error(errorData.message || `Lỗi upload: HTTP ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Upload thành công:', data);
      
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
    console.log('Bắt đầu validation form');
    console.log('Form data để validate:', formData);
    
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề bài viết';
      console.log('Lỗi title: trống');
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung bài viết';
      console.log('Lỗi content: trống');
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Vui lòng nhập tóm tắt bài viết';
      console.log('Lỗi summary: trống');
    }

    if (formData.summary.length > 300) {
      newErrors.summary = 'Tóm tắt không được vượt quá 300 ký tự';
      console.log('Lỗi summary: quá dài', formData.summary.length);
    }

    if (formData.metaTitle && formData.metaTitle.trim() && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title không được vượt quá 60 ký tự';
      console.log('Lỗi metaTitle: quá dài', formData.metaTitle.length);
    }

    if (formData.metaDescription && formData.metaDescription.trim() && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description không được vượt quá 160 ký tự';
      console.log('Lỗi metaDescription: quá dài', formData.metaDescription.length);
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log('Lỗi validation:', newErrors);
      return false;
    }
    
    console.log('Validation thành công');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Bắt đầu submit form blog');
    console.log('Form data:', formData);
    console.log('Cover image:', coverImage);
    
    if (!validateForm()) {
      console.log('Form validation thất bại');
      return;
    }

    try {
      setLoading(true);
      console.log('Bắt đầu tạo blog...');

      // Upload image first if exists
      let imageUrl = '';
      if (coverImage) {
        console.log('Bắt đầu upload ảnh...');
        setUploading(true);
        try {
          imageUrl = await uploadImage(coverImage);
          console.log('Upload ảnh thành công:', imageUrl);
          
          // Cập nhật imagePreview với URL mới sau khi upload thành công
          setImagePreview(imageUrl);
          console.log('Đã cập nhật imagePreview với URL mới:', imageUrl);
        } catch (uploadError) {
          console.error('Lỗi upload ảnh:', uploadError);
          alert('Lỗi khi upload ảnh: ' + (uploadError instanceof Error ? uploadError.message : 'Không thể upload ảnh'));
          setUploading(false);
          setLoading(false);
          return;
        }
        setUploading(false);
      } else {
        console.log('Không có ảnh để upload');
      }

      // Prepare blog data
      const blogData = {
        ...formData,
        // Tạo slug tự động từ title nếu chưa có
        slug: formData.title.trim().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .replace(/-+/g, '-'),
        tags: formData.tags && formData.tags.trim() ? 
          formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
          [],
        // Chỉ gửi coverImage nếu có giá trị
        ...(imageUrl && { coverImage: imageUrl }),
        // Chỉ gửi metaTitle và metaDescription nếu có giá trị
        ...(formData.metaTitle && formData.metaTitle.trim() && { metaTitle: formData.metaTitle.trim() }),
        ...(formData.metaDescription && formData.metaDescription.trim() && { metaDescription: formData.metaDescription.trim() })
        // Không cần gửi author nữa, backend sẽ tự động lấy từ user đã xác thực
      };

      console.log('Gửi dữ liệu blog:', blogData);

      // Create blog
      console.log('Gửi request tạo blog đến /api/blog');
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')?.substring(0, 20)}...`
      });
      
      // Sửa URL: backend mount tại /api/blogs
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(blogData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.error('Lỗi response:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Không thể parse error response:', parseError);
        }
        
        console.log('Xử lý lỗi HTTP:', response.status, errorMessage);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        } else if (response.status === 400) {
          throw new Error('Dữ liệu không hợp lệ: ' + errorMessage);
        } else if (response.status === 403) {
          throw new Error('Không có quyền tạo bài viết');
        } else if (response.status === 500) {
          throw new Error('Lỗi máy chủ: ' + errorMessage);
        } else {
          throw new Error(errorMessage);
        }
      }

      const result = await response.json();
      console.log('Tạo blog thành công:', result);
      
      alert('Tạo bài viết thành công!');
      onSuccess();
    } catch (error) {
      console.error('Lỗi:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      
      let errorMessage = 'Có lỗi xảy ra khi tạo bài viết';
      
      if (error instanceof Error) {
        console.log('Error message:', error.message);
        if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Phiên đăng nhập đã hết hạn')) {
          errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
        } else if (error.message.includes('400') || error.message.includes('Dữ liệu không hợp lệ')) {
          errorMessage = error.message;
        } else if (error.message.includes('403') || error.message.includes('Không có quyền')) {
          errorMessage = 'Không có quyền tạo bài viết';
        } else if (error.message.includes('500') || error.message.includes('Lỗi máy chủ')) {
          errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Lỗi kết nối mạng, vui lòng kiểm tra kết nối internet';
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('Hiển thị lỗi cho user:', errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setCoverImage(null);
    setImagePreview('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Thêm bài viết mới</h2>
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
                errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Nhập tiêu đề bài viết..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.title}
              </p>
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
                errors.summary ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Nhập tóm tắt bài viết (tối đa 300 ký tự)..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.summary && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.summary}
                </p>
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

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
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

              {errors.coverImage && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.coverImage}
                </p>
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
                errors.content ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Nhập nội dung bài viết..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.content}
              </p>
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
                errors.metaTitle ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Meta title cho SEO (tối đa 60 ký tự)..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.metaTitle && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.metaTitle}
                </p>
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
                errors.metaDescription ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Meta description cho SEO (tối đa 160 ký tự)..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.metaDescription && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.metaDescription}
                </p>
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
                  Đang tạo...
                </>
              ) : (
                'Tạo bài viết'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogAdd;
