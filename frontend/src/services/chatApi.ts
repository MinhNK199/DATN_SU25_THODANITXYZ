import axiosInstance from '../api/axiosInstance';
import { Conversation, Message, ChatFilters, ChatStats } from '../interfaces/Chat';

export const chatApi = {
  // Conversation APIs
  getConversations: async (filters?: ChatFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.search) params.append('search', filters.search);

    const response = await axiosInstance.get(`/chat/conversations?${params.toString()}`);
    return response.data;
  },

  getConversation: async (conversationId: string) => {
    const response = await axiosInstance.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  createConversation: async (data: {
    participantId: string;
    type?: string;
    subject?: string;
  }) => {
    const response = await axiosInstance.post('/chat/conversations', data);
    return response.data;
  },

  updateConversationStatus: async (
    conversationId: string,
    data: {
      status?: string;
      assignedTo?: string;
      priority?: string;
      tags?: string[];
    }
  ) => {
    const response = await axiosInstance.put(`/chat/conversations/${conversationId}/status`, data);
    return response.data;
  },

  // Message APIs
  getMessages: async (conversationId: string, page = 1, limit = 50) => {
    const response = await axiosInstance.get(
      `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    data: {
      content: string;
      type?: string;
      replyTo?: string;
      attachments?: any[];
    }
  ) => {
    const response = await axiosInstance.post(`/chat/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  markAsRead: async (conversationId: string) => {
    const response = await axiosInstance.put(`/chat/conversations/${conversationId}/read`);
    return response.data;
  },

  // Utility APIs
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/chat/unread-count');
    return response.data;
  },

  // Admin specific APIs
  getChatStats: async (): Promise<{ success: boolean; data: ChatStats }> => {
    const response = await axiosInstance.get('/chat/stats');
    return response.data;
  },

  getAdminConversations: async (filters?: ChatFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.search) params.append('search', filters.search);

    const response = await axiosInstance.get(`/chat/admin/conversations?${params.toString()}`);
    return response.data;
  },

  assignConversation: async (conversationId: string, adminId: string) => {
    const response = await axiosInstance.put(`/chat/conversations/${conversationId}/assign`, {
      assignedTo: adminId
    });
    return response.data;
  },

  // File upload for chat
  uploadChatFile: async (file: File, conversationId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);

    const response = await axiosInstance.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
