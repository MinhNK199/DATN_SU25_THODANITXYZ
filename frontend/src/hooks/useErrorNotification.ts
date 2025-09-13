import { useNotification } from '../contexts/NotificationContext';
import { AlertTriangle, Database, Server, Shield, Bug, Wifi, Lock } from 'lucide-react';
import React from 'react';

export const useErrorNotification = () => {
  const { showNotification } = useNotification();

  const showError = (message: string, title?: string, type?: 'api' | 'auth' | 'network' | 'validation' | 'server' | 'database') => {
    const errorTitle = title || 'Lỗi xảy ra';
    
    // Chọn icon dựa trên loại lỗi
    let icon: React.ReactNode = React.createElement(AlertTriangle, { className: "w-4 h-4" });
    switch (type) {
      case 'api':
        icon = React.createElement(Bug, { className: "w-4 h-4" });
        break;
      case 'auth':
        icon = React.createElement(Lock, { className: "w-4 h-4" });
        break;
      case 'network':
        icon = React.createElement(Wifi, { className: "w-4 h-4" });
        break;
      case 'validation':
        icon = React.createElement(Shield, { className: "w-4 h-4" });
        break;
      case 'server':
        icon = React.createElement(Server, { className: "w-4 h-4" });
        break;
      case 'database':
        icon = React.createElement(Database, { className: "w-4 h-4" });
        break;
      default:
        icon = React.createElement(AlertTriangle, { className: "w-4 h-4" });
    }

    showNotification({
      title: errorTitle,
      message: message,
      type: 'error',
      icon: icon
    });
  };

  const showApiError = (message: string, title?: string) => {
    showError(message, title || 'Lỗi API', 'api');
  };

  const showAuthError = (message: string, title?: string) => {
    showError(message, title || 'Lỗi xác thực', 'auth');
  };

  const showNetworkError = (message: string, title?: string) => {
    showError(message, title || 'Lỗi kết nối', 'network');
  };

  const showValidationError = (message: string, title?: string) => {
    showError(message, title || 'Lỗi dữ liệu', 'validation');
  };

  const showServerError = (message: string, title?: string) => {
    showError(message, title || 'Lỗi máy chủ', 'server');
  };

  const showDatabaseError = (message: string, title?: string) => {
    showError(message, title || 'Lỗi cơ sở dữ liệu', 'database');
  };

  // Hàm xử lý lỗi thông minh - tự động phân loại lỗi
  const handleError = (error: any, defaultMessage?: string) => {
    console.error('Error caught by useErrorNotification:', error);
    
    let message = defaultMessage || 'Có lỗi xảy ra';
    let type: 'api' | 'auth' | 'network' | 'validation' | 'server' | 'database' = 'api';
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('phiên đăng nhập')) {
        message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
        type = 'auth';
      } else if (errorMessage.includes('403') || errorMessage.includes('forbidden') || errorMessage.includes('không có quyền')) {
        message = 'Không có quyền thực hiện hành động này';
        type = 'auth';
      } else if (errorMessage.includes('400') || errorMessage.includes('bad request') || errorMessage.includes('dữ liệu không hợp lệ')) {
        message = error.message;
        type = 'validation';
      } else if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('không tìm thấy')) {
        message = 'Không tìm thấy dữ liệu yêu cầu';
        type = 'api';
      } else if (errorMessage.includes('500') || errorMessage.includes('internal server error') || errorMessage.includes('lỗi máy chủ')) {
        message = 'Lỗi máy chủ, vui lòng thử lại sau';
        type = 'server';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('kết nối')) {
        message = 'Lỗi kết nối mạng, vui lòng kiểm tra kết nối internet';
        type = 'network';
      } else if (errorMessage.includes('database') || errorMessage.includes('cơ sở dữ liệu')) {
        message = error.message;
        type = 'database';
      } else {
        message = error.message;
      }
    } else if (typeof error === 'string') {
      message = error;
    } else if (error?.message) {
      message = error.message;
    }
    
    showError(message, undefined, type);
  };

  return {
    showError,
    showApiError,
    showAuthError,
    showNetworkError,
    showValidationError,
    showServerError,
    showDatabaseError,
    handleError
  };
};
