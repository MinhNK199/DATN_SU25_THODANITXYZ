import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Typography, Space, Tooltip } from 'antd';
// import { format, formatDistanceToNow } from 'date-fns';
import { useChat } from '../../contexts/ChatContext';
import { chatApi } from '../../services/chatApi';
import { Message } from '../../interfaces/Chat';

const { Text } = Typography;

interface ChatMessageListProps {
  conversationId: string;
  className?: string;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ 
  conversationId, 
  className = '' 
}) => {
  const { messages, currentConversation, markAsRead } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter messages for current conversation
  const conversationMessages = messages.filter(msg => msg.conversation === conversationId);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (conversationId && currentConversation?._id === conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId, currentConversation, markAsRead]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('vi-VN', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const isMyMessage = (message: Message) => {
    // Assuming we have user context to get current user ID
    // This should be replaced with actual user ID from auth context
    return message.sender.role === 'customer'; // Temporary logic
  };

  const renderMessage = (message: Message) => {
    const isMine = isMyMessage(message);
    const isSystem = message.type === 'system';

    if (isSystem) {
      return (
        <div key={message._id} className="flex justify-center my-2">
          <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div
        key={message._id}
        className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex max-w-[80%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          {!isMine && (
            <Avatar
              src={message.sender.avatar}
              size="small"
              className="mr-2 mt-1"
            >
              {message.sender.fullName?.charAt(0)}
            </Avatar>
          )}

          {/* Message Content */}
          <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
            {/* Sender name for group chats */}
            {!isMine && (
              <Text className="text-xs text-gray-500 mb-1">
                {message.sender.fullName}
              </Text>
            )}

            {/* Message bubble */}
            <div
              className={`px-4 py-2 rounded-2xl ${
                isMine
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="border rounded-lg p-2 bg-white/10">
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-blue-200"
                      >
                        📎 {attachment.originalName}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply to message */}
              {message.replyTo && (
                <div className="mt-2 p-2 bg-white/20 rounded-lg border-l-2 border-white/30">
                  <Text className="text-xs opacity-75">
                    Trả lời: {message.replyTo.content.substring(0, 50)}
                    {message.replyTo.content.length > 50 && '...'}
                  </Text>
                </div>
              )}
            </div>

            {/* Message status and time */}
            <div className={`flex items-center mt-1 space-x-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
              <Text className="text-xs text-gray-400">
                {formatTime(message.createdAt)}
              </Text>
              
              {isMine && (
                <div className="flex items-center space-x-1">
                  {message.readBy.length > 1 && (
                    <Tooltip title="Đã đọc">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </Tooltip>
                  )}
                  {message.status === 'sent' && (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                  {message.status === 'delivered' && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* My avatar */}
          {isMine && (
            <Avatar
              src={message.sender.avatar}
              size="small"
              className="ml-2 mt-1"
            >
              {message.sender.fullName?.charAt(0)}
            </Avatar>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <div className="space-y-2">
        {conversationMessages.map(renderMessage)}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
