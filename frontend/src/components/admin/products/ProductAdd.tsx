import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, message, Space, Card, Row, Col, Typography, TreeSelect, Switch, Divider, Alert } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getCategories, getBrands } from './api';
import slugify from 'slugify';
import { Category } from '../../../interfaces/Category';
import { Brand } from '../../../interfaces/Brand';
import VariantManager from './VariantManager';
import SpecificationEditor from './SpecificationEditor';

const { Title, Text } = Typography;
const { Option } = Select;

const API_URL = "http://localhost:9000/api/product";

// Hàm chuyển đổi cấu trúc cây cho TreeSelect
const buildCategoryTree = (categories: Category[], parentId: string | null = null): any[] => {
    return categories
        .filter(cat => cat.parent === parentId || (parentId === null && !cat.parent))
        .map(cat => ({
            title: cat.name,
            value: cat._id,
            children: buildCategoryTree(categories, cat._id)
        }));
};

const ProductAddPage: React.FC = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [images, setImages] = useState<string[]>([""]);
    const [previewImage, setPreviewImage] = useState<string>('');
    const [variants, setVariants] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, brs] = await Promise.all([getCategories(), getBrands()]);
                setCategories(cats);
                setBrands(brs);
            } catch (error) {
                message.error('Không thể tải dữ liệu cho danh mục và thương hiệu.');
            }
        };
        fetchData();
    }, []);

    const categoryTree = buildCategoryTree(categories);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const productData = {
                ...values,
                images: images.filter(img => img.trim() !== ""),
                variants: variants,
                slug: slugify(values.name, { lower: true, strict: true }),
                specifications: values.specifications || {},
            };
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)
            });
            if (response.ok) {
                message.success('Thêm sản phẩm thành công!');
                navigate('/admin/products');
            } else {
                const errorData = await response.json();
                message.error(errorData.message || 'Thêm sản phẩm thất bại.');
            }
        } catch (error) {
            message.error('Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = slugify(name, { lower: true, strict: true });
        form.setFieldsValue({ slug });
    };

    // Hình ảnh: nhập link
    const handleImageChange = (value: string, idx: number) => {
        const newImages = [...images];
        newImages[idx] = value;
        setImages(newImages);
        if (idx === 0) setPreviewImage(value);
    };
    const addImageField = () => setImages([...images, ""]);
    const removeImageField = (idx: number) => {
        const newImages = images.filter((_, i) => i !== idx);
        setImages(newImages);
        if (idx === 0 && newImages.length > 0) setPreviewImage(newImages[0]);
        if (newImages.length === 0) setPreviewImage("");
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={() => message.error('Vui lòng kiểm tra lại các trường thông tin!')}
            >
                <Row gutter={24}>
                    {/* Cột chính cho Form */}
                    <Col xs={24} lg={16}>
                        <Card className="shadow-lg rounded-xl mb-6">
                            <Title level={4}>Thông tin chung</Title>
                            <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}>
                                <Input placeholder="VD: Iphone 15 Pro Max" onChange={handleNameChange} />
                            </Form.Item>
                            <Form.Item name="slug" label="Slug (URL thân thiện)">
                                <Input placeholder="VD: i-phone-15-pro-max" readOnly />
                            </Form.Item>
                            <Form.Item name="description" label="Mô tả chi tiết">
                                <Input.TextArea rows={6} placeholder="Nhập mô tả chi tiết cho sản phẩm..." />
                            </Form.Item>
                        </Card>

                        <Card className="shadow-lg rounded-xl mb-6">
                            <Title level={4}>Hình ảnh sản phẩm</Title>
                            {images.map((img, idx) => (
                                <Space key={idx} align="start" className="mb-2 w-full">
                                    <Input
                                        placeholder="Nhập link ảnh..."
                                        value={img}
                                        onChange={e => handleImageChange(e.target.value, idx)}
                                        className="w-full"
                                    />
                                    <Button danger onClick={() => removeImageField(idx)} disabled={images.length === 1}>Xóa</Button>
                                </Space>
                            ))}
                            <Button type="dashed" icon={<PlusOutlined />} onClick={addImageField} className="mt-2">Thêm link ảnh</Button>
                            <Text type="secondary" className="block mt-2">Nhập link ảnh sản phẩm. Ảnh đầu tiên sẽ là ảnh đại diện.</Text>
                        </Card>

                        <Card className="shadow-lg rounded-xl mb-6">
                            <Title level={4}>Giá & Kho hàng</Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="price" label="Giá gốc" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
                                        <InputNumber className="w-full" addonAfter="VND" min={0} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="salePrice" label="Giá khuyến mãi">
                                        <InputNumber className="w-full" addonAfter="VND" min={0} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="stock" label="Số lượng tồn kho" rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}>
                                        <InputNumber className="w-full" min={0} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                     <Form.Item name="sku" label="SKU (Mã định danh sản phẩm)">
                                         <Input placeholder="VD: ATN-001" />
                                     </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                        
                        <Card className="shadow-lg rounded-xl mb-6">
                            <Title level={4}>Thông tin bổ sung</Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="weight" label="Cân nặng (gram)">
                                        <InputNumber className="w-full" min={0} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="warranty" label="Bảo hành (tháng)">
                                        <InputNumber className="w-full" min={0} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item label="Kích thước (Dài x Rộng x Cao)">
                                <Space.Compact>
                                    <Form.Item name={['dimensions', 'length']} noStyle>
                                       <InputNumber placeholder="Dài (cm)" min={0} />
                                    </Form.Item>
                                    <Form.Item name={['dimensions', 'width']} noStyle>
                                        <InputNumber placeholder="Rộng (cm)" min={0} />
                                    </Form.Item>
                                    <Form.Item name={['dimensions', 'height']} noStyle>
                                        <InputNumber placeholder="Cao (cm)" min={0} />
                                    </Form.Item>
                                </Space.Compact>
                            </Form.Item>
                            <Form.Item name="tags" label="Tags (phân cách bởi dấu phẩy)">
                               <Select mode="tags" style={{ width: '100%' }} placeholder="VD: iphone, apple" />
                           </Form.Item>
                        </Card>

                        <Card className="shadow-lg rounded-xl mb-6">
                            <Title level={4}>Thông số kỹ thuật</Title>
                            <SpecificationEditor value={form.getFieldValue('specifications') || {}} onChange={specs => form.setFieldsValue({ specifications: specs })} />
                        </Card>

                        <Card className="shadow-lg rounded-xl mb-6">
                            <VariantManager variants={variants} onVariantsChange={setVariants} />
                        </Card>
                    </Col>

                    {/* Cột phụ cho Sidebar */}
                    <Col xs={24} lg={8}>
                       <Card className="shadow-lg rounded-xl sticky top-6">
                            <Title level={4}>Tổ chức</Title>
                            <Form.Item name="category" label="Danh mục sản phẩm" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}>
                                <TreeSelect
                                    style={{ width: '100%' }}
                                    treeData={categoryTree}
                                    placeholder="Chọn một danh mục"
                                    treeDefaultExpandAll
                                    allowClear
                                />
                            </Form.Item>
                            <Form.Item name="brand" label="Thương hiệu" rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}>
                                <Select placeholder="Chọn một thương hiệu" style={{ width: '100%' }}>
                                    {brands.map(brand => (
                                        <Option key={brand._id} value={brand._id}>{brand.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                             <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked">
                                        <Switch />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                     <Form.Item name="isActive" label="Hiển thị" valuePropName="checked" initialValue={true}>
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                            
                            <Divider />

                            <Title level={4}>Xem trước ảnh</Title>
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
                            ) : (
                                <div className="h-48 flex items-center justify-center bg-gray-200 rounded-lg mb-4">
                                    <Text type="secondary">Chưa có ảnh</Text>
                                </div>
                            )}

                            <Divider />

                            <Title level={4}>Hành động</Title>
                            <Space direction="vertical" className="w-full">
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
                                    Thêm sản phẩm
                                </Button>
                                <Button
                                    type="default"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate('/admin/products')}
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
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default ProductAddPage;
