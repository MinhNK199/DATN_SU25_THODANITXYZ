import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    Button,
    Switch,
    message,
    Typography,
    Spin,
    Alert,
    Space,
    InputNumber,
    ColorPicker,
    Row,
    Col,
    Image,
    TreeSelect
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { getCategoryById, updateCategory, fetchCategories } from './api';
import { ICategory } from '../../../interfaces/Category';
import slugify from 'slugify';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

type FieldType = Omit<ICategory, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy' | 'parent'> & {
    parent?: string | null;
};

const buildCategoryTree = (categories: ICategory[], parentId: string | null = null): any[] => {
    return categories
        .filter(cat => (typeof cat.parent === 'string' ? cat.parent : cat.parent?._id) === parentId)
        .map(cat => ({
            title: cat.name,
            value: cat._id,
            children: buildCategoryTree(categories, cat._id)
        }));
};

const CategoryEdit: React.FC = () => {
    const [form] = Form.useForm<FieldType>();
    const [submitting, setSubmitting] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<ICategory[]>([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

    const [previewImage, setPreviewImage] = useState<string>('');
    const watchedImageUrl = Form.useWatch('image', form);

    useEffect(() => {
        setPreviewImage(watchedImageUrl);
    }, [watchedImageUrl]);

  useEffect(() => {
        const fetchAndSetCategory = async () => {
            if (!id) {
                setError("ID danh mục không hợp lệ.");
                setPageLoading(false);
                return;
            }
            try {
                const [categoryData, allCategories] = await Promise.all([
                    getCategoryById(id),
                    fetchCategories()
                ]);

                if (categoryData) {
                    const parentId = typeof categoryData.parent === 'object' ? categoryData.parent?._id : categoryData.parent;
                    form.setFieldsValue({ ...categoryData, parent: parentId });
                    setPreviewImage(categoryData.image || '');
                    setCategories(allCategories.filter(cat => cat._id !== id));
        } else {
                    setError("Không tìm thấy danh mục.");
                }
            } catch (err) {
                setError("Lỗi khi tải dữ liệu danh mục.");
            } finally {
                setPageLoading(false);
            }
        };

        fetchAndSetCategory();
    }, [id, form]);

    const onFinish = async (values: FieldType) => {
        if (!id) return;
        setSubmitting(true);
        try {
            const finalValues = { ...values, slug: slugify(values.name, { lower: true, strict: true }) };
            await updateCategory(id, finalValues);
            message.success('Cập nhật danh mục thành công!');
            navigate('/admin/categories');
        } catch (error: any) {
            message.error(error.message || 'Cập nhật danh mục thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = slugify(name, { lower: true, strict: true });
        form.setFieldsValue({ slug });
    }

    const categoryTree = buildCategoryTree(categories, null);

    if (pageLoading) {
        return <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center"><Spin size="large" tip="Đang tải dữ liệu..." /></div>;
    }

    if (error) {
        return <div className="p-6 bg-gray-100 min-h-screen"><Alert message="Lỗi" description={error} type="error" showIcon /></div>;
    }

  return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={() => message.error('Vui lòng kiểm tra lại các trường thông tin!')}
            >
                <Row gutter={[24, 24]}>
                    {/* Main Content */}
                    <Col xs={24} lg={16}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Card className="shadow-lg rounded-xl">
                                <Title level={4}>Thông tin cơ bản</Title>
                                <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}>
                                    <Input placeholder="Nhập tên danh mục" onChange={handleNameChange} />
                                </Form.Item>
                                <Form.Item name="slug" label="Slug (URL thân thiện)" rules={[{ required: true, message: 'Slug không được để trống!' }]}>
                                    <Input placeholder="vi-du-slug" readOnly />
                                </Form.Item>
                                <Form.Item name="description" label="Mô tả">
                                    <TextArea rows={4} placeholder="Nhập mô tả chi tiết cho danh mục" />
                                </Form.Item>
                            </Card>

                            <Card className="shadow-lg rounded-xl">
                                <Title level={4}>Hình ảnh & Icon</Title>
                                <Form.Item name="image" label="URL Hình ảnh" help="Nhập URL hình ảnh cho danh mục.">
                                    <Input placeholder="https://example.com/image.png" />
                                </Form.Item>
                                <Form.Item name="icon" label="Icon">
                                    <Input placeholder="Ví dụ: shopping-cart (Tên icon từ thư viện)" />
                                </Form.Item>
                            </Card>

                            <Card className="shadow-lg rounded-xl">
                                <Title level={4}>Tối ưu hóa công cụ tìm kiếm (SEO)</Title>
                                <Paragraph type="secondary">Cung cấp tiêu đề và mô tả meta để cải thiện thứ hạng trên công cụ tìm kiếm.</Paragraph>
                                <Form.Item name="metaTitle" label="Meta Title"><Input placeholder="Tiêu đề SEO (tối đa 60 ký tự)" maxLength={60} showCount /></Form.Item>
                                <Form.Item name="metaDescription" label="Meta Description"><TextArea rows={2} placeholder="Mô tả SEO (tối đa 160 ký tự)" maxLength={160} showCount /></Form.Item>
                            </Card>
                        </Space>
                    </Col>
                    
                    {/* Sidebar */}
                    <Col xs={24} lg={8}>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Card className="shadow-lg rounded-xl">
                                <Title level={4}>Xem trước hình ảnh</Title>
                                <Image
                                    src={previewImage || '/placeholder.png'}
                                    fallback="/placeholder.png"
                                    alt="Xem trước hình ảnh"
                                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '8px' }}
                                />
                            </Card>

                            <Card className="shadow-lg rounded-xl">
                                <Title level={4}>Tổ chức</Title>
                                <Form.Item name="parent" label="Danh mục cha">
                                    <TreeSelect
                                        style={{ width: '100%' }}
                                        treeData={categoryTree}
                                        placeholder="Chọn danh mục cha (để trống nếu là danh mục gốc)"
                                        treeDefaultExpandAll
                                        allowClear
                                    />
                                </Form.Item>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="order" label="Thứ tự">
                                            <InputNumber min={0} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="color" label="Màu sắc">
                                            <ColorPicker showText />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
                                </Form.Item>
                            </Card>

                            <Card className="shadow-lg rounded-xl">
                                <Title level={4}>Hành động</Title>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={submitting}
                                        icon={<PlusOutlined />}
                                        shape="round"
                                        size="large"
                                        block
                                        style={{
                                            background: '#fff',
                                            color: '#1677ff',
                                            border: '2px solid #1677ff',
                                            fontWeight: 600,
                                            boxShadow: '0 2px 8px rgba(22,119,255,0.08)',
                                        }}
                                    >
                                        Lưu thay đổi
                                    </Button>
                                    <Button
                                        type="default"
                                        icon={<ArrowLeftOutlined />}
                                        htmlType="button"
                                        onClick={() => navigate('/admin/categories')}
                                        shape="round"
                                        size="large"
                                        block
                                        style={{
                                            background: '#fff',
                                            color: '#888',
                                            border: '2px solid #bbb',
                                            fontWeight: 500,
                                        }}
                                    >
                                        Quay lại
                                    </Button>
                                </Space>
                            </Card>
                        </Space>
                    </Col>
                </Row>
            </Form>
    </div>
  );
};

export default CategoryEdit;
