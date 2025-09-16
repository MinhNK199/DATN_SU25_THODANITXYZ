import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Spin,
    Alert,
    Typography,
    Descriptions,
    Tag,
    Button,
    Row,
    Col,
    Image,
    Space,
    ColorPicker,
    Divider,
    message
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCategoryById } from './api';
import { Category } from '../../../interfaces/Category';

const { Title, Text, Paragraph } = Typography;

const CategoryDetail: React.FC = () => {
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const getCategory = async () => {
            if (!id) {
                setError("Không tìm thấy ID danh mục.");
                setLoading(false);
                message.error("Không tìm thấy ID danh mục.");
                return;
            }

            setLoading(true);
            try {
                const foundCategory = await getCategoryById(id);
                if (foundCategory) {
                    setCategory(foundCategory);
                } else {
                    setError("Không tìm thấy danh mục.");
                    message.error("Không tìm thấy danh mục.");
                }
            } catch (err: any) {
                setError(err.message || 'Lỗi khi tải chi tiết danh mục.');
                message.error(err.message || 'Lỗi khi tải chi tiết danh mục.');
            } finally {
                setLoading(false);
            }
        };

        getCategory();
    }, [id]);

    if (loading) {
        return <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center"><Spin size="large" /></div>;
    }

    if (error) {
        return <div className="p-6 bg-gray-100 min-h-screen"><Alert message="Lỗi" description={error} type="error" showIcon /></div>;
    }

    if (!category) {
        return <div className="p-6 bg-gray-100 min-h-screen"><Alert message="Không tìm thấy danh mục" type="warning" /></div>;
    }
    
    const parentCategory = typeof category.parent === 'object' && category.parent;
    const parentName = typeof category.parent === 'object' ? category.parent?.name : '';
    const parentId = typeof category.parent === 'object' ? category.parent?._id : '';

    const InfoItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
        <div style={{ marginBottom: '1rem' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>{label}</Text>
            <Text strong>{children}</Text>
        </div>
    );

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Card className="bg-white shadow-lg rounded-xl mb-6">
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={3} className="!m-0">{category.name}</Title>
                        <Text type="secondary">Xem thông tin chi tiết về danh mục.</Text>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/categories')}>Quay lại</Button>
                            <Button type="primary" className="admin-primary-button" icon={<EditOutlined />} onClick={() => navigate(`/admin/categories/edit/${id}`)}>Chỉnh sửa</Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={10}>
                    <Card className="bg-white shadow-lg rounded-xl h-full">
                        <Title level={4}>Hình ảnh</Title>
                        <Image
                            width="100%"
                            src={category.image || '/placeholder.png'}
                            alt={category.name}
                            style={{ borderRadius: '8px', border: '1px solid #f0f0f0', aspectRatio: '4/3', objectFit: 'cover' }}
                        />
                         <Divider />
                         <Paragraph>{category.description || <Text type="secondary">Chưa có mô tả cho danh mục này.</Text>}</Paragraph>
                    </Card>
                </Col>
                <Col xs={24} lg={14}>
                     <Space direction="vertical" size="large" style={{width: '100%'}}>
                        <Card className="bg-white shadow-lg rounded-xl">
                            <Title level={4}>Thông tin chung</Title>
                             <Row gutter={16}>
                                <Col span={12}><InfoItem label="Slug">{category.slug}</InfoItem></Col>
                                <Col span={12}>
                                    <InfoItem label="Trạng thái">
                                        <Tag color={category.isActive ? 'green' : 'red'}>
                                            {category.isActive ? 'Hoạt động' : 'Ẩn'}
                                        </Tag>
                                    </InfoItem>
                                </Col>
                                <Col span={12}>
                                    <InfoItem label="Cấp bậc"><Tag color="cyan">{category.level ?? 'N/A'}</Tag></InfoItem>
                                </Col>
                                {(parentName && parentId) && (
                                     <Col span={24}>
                                        <InfoItem label="Danh mục cha">
                                            <Tag color="blue" style={{cursor: 'pointer'}} onClick={() => navigate(`/admin/categories/detail/${parentId}`)}>
                                                {parentName}
                                            </Tag>
                                        </InfoItem>
                                    </Col>
                                )}
                            </Row>
                        </Card>
                         <Card className="bg-white shadow-lg rounded-xl">
                            <Title level={4}>Thuộc tính</Title>
                             <Row gutter={16}>
                                <Col span={12}><InfoItem label="Icon">{category.icon || <Text type="secondary">N/A</Text>}</InfoItem></Col>
                                <Col span={12}><InfoItem label="Thứ tự">{category.order ?? <Text type="secondary">N/A</Text>}</InfoItem></Col>
                                <Col span={12}>
                                    <InfoItem label="Màu sắc">
                                        <Space>
                                            <ColorPicker value={category.color} disabled />
                                            <Text>{category.color || <Text type="secondary">N/A</Text>}</Text>
                                        </Space>
                                    </InfoItem>
                                </Col>
                             </Row>
                         </Card>
                        <Card className="bg-white shadow-lg rounded-xl">
                            <Title level={4}>Tối ưu hóa SEO</Title>
                            <InfoItem label="Meta Title">{category.metaTitle || <Text type="secondary">Chưa đặt</Text>}</InfoItem>
                            <InfoItem label="Meta Description">{category.metaDescription || <Text type="secondary">Chưa đặt</Text>}</InfoItem>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};

export default CategoryDetail; 