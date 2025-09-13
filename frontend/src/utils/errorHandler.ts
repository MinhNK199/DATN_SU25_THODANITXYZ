import { message } from 'antd';

// Global error handler for API calls
export const handleApiError = (error: any, defaultMessage?: string) => {
  console.error('API Error:', error);
  
  let errorMessage = defaultMessage || 'Có lỗi xảy ra';
  
  if (error instanceof Error) {
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || errorMsg.includes('phiên đăng nhập')) {
      errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
    } else if (errorMsg.includes('403') || errorMsg.includes('forbidden') || errorMsg.includes('không có quyền')) {
      errorMessage = 'Không có quyền thực hiện hành động này';
    } else if (errorMsg.includes('400') || errorMsg.includes('bad request') || errorMsg.includes('dữ liệu không hợp lệ')) {
      errorMessage = error.message;
    } else if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('không tìm thấy')) {
      errorMessage = 'Không tìm thấy dữ liệu yêu cầu';
    } else if (errorMsg.includes('500') || errorMsg.includes('internal server error') || errorMsg.includes('lỗi máy chủ')) {
      errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau';
    } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('kết nối')) {
      errorMessage = 'Lỗi kết nối mạng, vui lòng kiểm tra kết nối internet';
    } else if (errorMsg.includes('database') || errorMsg.includes('cơ sở dữ liệu')) {
      errorMessage = error.message;
    } else {
      errorMessage = error.message;
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
  }
  
  // Hiển thị thông báo lỗi với toast
  message.error(errorMessage);
  
  return errorMessage;
};

// Enhanced response handler for API calls
export const handleApiResponse = async (response: Response) => {
  if (response.ok) {
    return response.json();
  }
  
  const errorData = await response.json().catch(() => ({ 
    message: "An unknown error occurred" 
  }));
  
  // Phân loại lỗi dựa trên status code
  let errorMessage = errorData.message || "Something went wrong";
  
  switch (response.status) {
    case 401:
      errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
      break;
    case 403:
      errorMessage = 'Không có quyền thực hiện hành động này';
      break;
    case 400:
      errorMessage = errorData.message || 'Dữ liệu không hợp lệ';
      break;
    case 404:
      errorMessage = 'Không tìm thấy dữ liệu yêu cầu';
      break;
    case 500:
      errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau';
      break;
    default:
      errorMessage = errorData.message || 'Có lỗi xảy ra';
  }
  
  message.error(errorMessage);
  return Promise.reject(new Error(errorMessage));
};
