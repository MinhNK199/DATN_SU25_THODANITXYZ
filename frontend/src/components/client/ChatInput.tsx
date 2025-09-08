import React, { useState, useRef } from 'react';
import { Button, Input, Tooltip, Upload, message as antMessage } from 'antd';
import { Send, Paperclip, Smile, Image, File } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { chatApi } from '../../services/chatApi';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  placeholder = "Nhập tin nhắn...",
  disabled = false,
  className = ''
}) => {
  const { currentConversation, startTyping, stopTyping } = useChat();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!currentConversation) return;

    try {
      setIsUploading(true);
      const response = await chatApi.uploadChatFile(file, currentConversation._id);
      
      if (response.success) {
        // Send message with attachment
        await chatApi.sendMessage(currentConversation._id, {
          content: `📎 ${file.name}`,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          attachments: [response.data]
        });
        antMessage.success('Gửi file thành công');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      antMessage.error('Lỗi khi gửi file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        antMessage.error('File quá lớn. Kích thước tối đa là 10MB');
        return;
      }
      handleFileUpload(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        antMessage.error('Vui lòng chọn file hình ảnh');
        return;
      }
      handleFileUpload(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Typing indicators
    if (currentConversation) {
      if (newValue.length > 0) {
        startTyping(currentConversation._id);
      } else {
        stopTyping(currentConversation._id);
      }
    }
  };

  const handleSend = () => {
    if (value.trim()) {
      onSend();
      if (currentConversation) {
        stopTyping(currentConversation._id);
      }
    }
  };

  return (
    <div className={`flex items-end space-x-2 ${className}`}>
      {/* File Upload Buttons */}
      <div className="flex space-x-1">
        <Tooltip title="Gửi hình ảnh">
          <Button
            type="text"
            size="small"
            icon={<Image size={16} />}
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="text-gray-500 hover:text-blue-500"
          />
        </Tooltip>
        
        <Tooltip title="Gửi file">
          <Button
            type="text"
            size="small"
            icon={<File size={16} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="text-gray-500 hover:text-blue-500"
          />
        </Tooltip>
      </div>

      {/* Message Input */}
      <div className="flex-1">
        <Input.TextArea
          value={value}
          onChange={handleInputChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          disabled={disabled || isUploading}
          autoSize={{ minRows: 1, maxRows: 4 }}
          className="resize-none"
          style={{ borderRadius: '20px' }}
        />
      </div>

      {/* Send Button */}
      <Button
        type="primary"
        shape="circle"
        icon={<Send size={16} />}
        onClick={handleSend}
        disabled={!value.trim() || disabled || isUploading}
        className="bg-blue-500 hover:bg-blue-600 border-blue-500"
        loading={isUploading}
      />

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ChatInput;
