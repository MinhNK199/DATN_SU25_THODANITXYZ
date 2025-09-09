import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    Button,
    Switch,
    message as antdMessage,
    Typography,
    Space,
    Select,
    InputNumber,
    ColorPicker,
    Collapse,
    Row,
    Col,
    Image,
    TreeSelect,
    Upload
} from 'antd';
import { useNotification } from "../../../hooks/useNotification";
import { ArrowLeftOutlined, InfoCircleOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { createCategory, fetchCategories } from './api';
import { Category } from '../../../interfaces/Category';
import slugify from 'slugify';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

type FieldType = Omit<Category, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy' | 'parent'> & {
    parent?: string | null;
};

const instructions = [
    {
        title: 'Tên danh mục & Slug',
        description: 'Slug là phiên bản thân thiện với URL của tên. Nó thường là chữ thường và chỉ chứa chữ cái, số và dấu gạch ngang. Slug sẽ được tự động tạo khi bạn nhập tên.'
    },
    {
        title: 'Danh mục cha',
        description: 'Việc chọn danh mục cha sẽ tạo ra hệ thống phân cấp. Để trống nếu đây là một danh mục chính (cấp 1).'
    },
    {
        title: 'Thứ tự',
        description: 'Cung cấp một số để sắp xếp các danh mục. Các danh mục có số thứ tự nhỏ hơn sẽ được ưu tiên hiển thị trước.'
    },
    {
        title: 'Tối ưu hóa SEO',
        description: 'Điền các trường Meta Title và Meta Description để cải thiện thứ hạng của danh mục trên các công cụ tìm kiếm.'
    }
];

const buildCategoryTree = (categories: Category[], parentId: string | null = null): any[] => {
    return categories
        .filter(cat => (typeof cat.parent === 'string' ? cat.parent : cat.parent?._id) === parentId)
        .map(cat => ({
            title: cat.name,
            value: cat._id,
            children: buildCategoryTree(categories, cat._id)
        }));
};

const CategoryAdd: React.FC = () => {
    const [form] = Form.useForm<FieldType>();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const { success, error } = useNotification();
    const [previewImage, setPreviewImage] = useState<string>('');

    const watchedImageUrl = Form.useWatch('image', form);

    useEffect(() => {
        setPreviewImage(watchedImageUrl);
    }, [watchedImageUrl]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const fetchedCategories = await fetchCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                // handled in api
            }
        };
        loadCategories();
    }, []);

    const onFinish = async (values: FieldType) => {
        setLoading(true);
        try {
            const categoryData = {
                ...values,
                slug: values.slug || slugify(values.name, { lower: true, strict: true })
            };
            await createCategory(categoryData);
            success('Thêm danh mục thành công!');
            navigate('/admin/categories');
        } catch (error: any) { 
            error(error.message || 'Thêm danh mục thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = slugify(name, { lower: true, strict: true });
        form.setFieldsValue({ slug });
    }

    const categoryTree = buildCategoryTree(categories, null);

  return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={() => error('Vui lòng kiểm tra lại các trường thông tin!')}
                initialValues={{ isActive: true, parent: null, order: 0 }}
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
                                <Form.Item name="image" label="URL Hình ảnh" help="URL sẽ được ưu tiên nếu bạn vừa nhập URL và vừa tải ảnh lên.">
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
                                        loading={loading}
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
                                        Lưu danh mục
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

export default CategoryAdd;
