import api from './userApi';

const blogApi = {
  getAll: () => api.get('/blogs').then(res => res.data),
  getById: (id: string) => api.get(`/blogs/${id}`).then(res => res.data),
  create: (data: any) => api.post('/blogs', data).then(res => res.data),
  update: (id: string, data: any) => api.put(`/blogs/${id}`, data).then(res => res.data),
  remove: (id: string) => api.delete(`/blogs/${id}`).then(res => res.data),
  publish: (id: string) => api.patch(`/blogs/${id}/publish`).then(res => res.data),
  restore: (id: string) => api.patch(`/blogs/${id}/restore`).then(res => res.data),
};

export default blogApi; 