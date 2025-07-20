import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Tag, Space, Popconfirm, message, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import blogApi from '../../../services/blogApi';

interface Blog {
  _id?: string;
  title: string;
  slug?: string;
  content: string;
  summary?: string;
  coverImage?: string;
  tags?: string[];
  isPublished?: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  author?: any;
  createdAt?: string;
  updatedAt?: string;
}

const BlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form] = Form.useForm();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const blogs = await blogApi.getAll();
      setBlogs(blogs);
    } catch (err) {
      message.error('Lỗi tải danh sách blog');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleAdd = () => {
    setEditingBlog(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    form.setFieldsValue(blog);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await blogApi.remove(id);
      message.success('Đã xóa bài viết');
      fetchBlogs();
    } catch {
      message.error('Lỗi xóa bài viết');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await blogApi.publish(id);
      message.success('Đã đăng bài viết');
      fetchBlogs();
    } catch {
      message.error('Lỗi đăng bài viết');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await blogApi.restore(id);
      message.success('Đã khôi phục bài viết');
      fetchBlogs();
    } catch {
      message.error('Lỗi khôi phục bài viết');
    }
  };

  const handleModalOk = async () => {
    console.log('Bắt đầu submit blog');
    try {
      const values = await form.validateFields();
      console.log('Giá trị form:', values);
      // Xử lý tags: nếu là string thì chuyển thành array
      if (typeof values.tags === 'string') {
        values.tags = values.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      }
      // Truyền author cứng để test
      values.author = "684ad9c6d1b821d4fd330907"; // Thay bằng _id thực tế của user trong DB
      if (editingBlog?._id) {
        await blogApi.update(editingBlog._id, values);
        message.success('Đã cập nhật bài viết');
      } else {
        await blogApi.create(values);
        message.success('Đã thêm bài viết');
      }
      setModalOpen(false);
      fetchBlogs();
      console.log('Đã submit xong blog');
    } catch (err: any) {
      // Thêm log lỗi chi tiết
      console.error('Lỗi khi submit blog:', err);
      message.error(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu blog');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Blog) => <b>{text}</b>,
    },
    {
      title: 'Tóm tắt',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => tags?.map(tag => <Tag key={tag}>{tag}</Tag>),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished: boolean) => isPublished ? <Tag color="green">Đã đăng</Tag> : <Tag color="orange">Nháp</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Blog) => (
        <Space>
          <button
            onClick={() => handleEdit(record)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition"
            title="Sửa"
          >
            <i className="fa-solid fa-pen text-base text-gray-700"></i>
          </button>
          <Popconfirm title="Xóa bài viết?" onConfirm={() => handleDelete(record._id!)}>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-red-300 text-red-500 hover:border-red-500 hover:bg-red-50 transition"
              title="Xóa"
            >
              <i className="fa-solid fa-trash text-base"></i>
            </button>
          </Popconfirm>
          {!record.isPublished && (
            <button
              onClick={() => handlePublish(record._id!)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-green-300 text-green-600 hover:border-green-500 hover:bg-green-50 transition"
              title="Đăng"
            >
              <i className="fa-solid fa-rocket text-base"></i>
            </button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Quản lý Blog công nghệ</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm bài viết</Button>
      </div>
      <Table rowKey="_id" columns={columns} dataSource={blogs} loading={loading} />
      <Modal
        title={editingBlog ? 'Cập nhật bài viết' : 'Thêm bài viết'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="summary" label="Tóm tắt"> 
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung' }]}> 
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Input placeholder="Cách nhau bởi dấu phẩy" />
          </Form.Item>
          <Form.Item name="metaTitle" label="Meta title"> 
            <Input maxLength={60} />
          </Form.Item>
          <Form.Item name="metaDescription" label="Meta description"> 
            <Input maxLength={160} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogManager; 