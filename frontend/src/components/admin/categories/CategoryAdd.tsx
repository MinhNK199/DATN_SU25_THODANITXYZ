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
    InputNumber,
    ColorPicker,
    Row,
    Col,
    Image,
    TreeSelect,
    Upload
} from 'antd';
import { useNotification } from "../../../hooks/useNotification";
import { useErrorNotification } from "../../../hooks/useErrorNotification";
import { ArrowLeftOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { FaTrash } from 'react-icons/fa';
import type { UploadFile } from 'antd/es/upload/interface';
import { createCategory, fetchCategories } from './api';
import { Category } from '../../../interfaces/Category';
import slugify from 'slugify';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type FieldType = Omit<Category, '_id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy' | 'parent'> & {
    parent?: string | null;
};

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
    const { handleError } = useErrorNotification();
    const [previewImage, setPreviewImage] = useState<string>('');
    // Thêm state cho file ảnh upload
    const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);

    const watchedImageUrl = Form.useWatch('image', form);

    useEffect(() => {
        setPreviewImage(watchedImageUrl || '');
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
            // Lấy URL ảnh từ fileList đã upload
            let imageUrl = "";
            if (imageFileList.length > 0 && imageFileList[0].url) {
                imageUrl = imageFileList[0].url; // Lấy ảnh đã upload
                
                // Đảm bảo URL có protocol đầy đủ
                if (imageUrl.startsWith('//')) {
                    imageUrl = 'http:' + imageUrl;
                } else if (!imageUrl.startsWith('http')) {
                    imageUrl = 'http://localhost:8000' + imageUrl;
                }
            }
            
            // Nếu không có ảnh, sử dụng placeholder URL hợp lệ
            if (!imageUrl || imageUrl.trim() === "") {
                imageUrl = "https://via.placeholder.com/300x200/cccccc/666666?text=No+Image";
            }
            
            // Tạo slug đúng format (chỉ chữ thường, số và dấu gạch ngang)
            const generatedSlug = slugify(values.name, { 
                lower: true, 
                strict: true,
                remove: /[*+~.()'"!:@]/g
            }).substring(0, 50); // Giới hạn 50 ký tự
            
            console.log("🔍 Original name:", values.name);
            console.log("🔍 Generated slug:", generatedSlug);
            console.log("🔍 Meta title length:", values.metaTitle?.length);
            console.log("🔍 Meta description length:", values.metaDescription?.length);
            
            // Validate dữ liệu trước khi gửi
            if (!values.name || values.name.trim().length < 2) {
                error('Tên danh mục phải có ít nhất 2 ký tự');
                return;
            }
            
            if (values.name.trim().length > 100) {
                error('Tên danh mục không được quá 100 ký tự');
                return;
            }
            
            // Validate slug
            const finalSlug = values.slug?.trim() || generatedSlug;
            if (finalSlug.length < 2) {
                error('Slug phải có ít nhất 2 ký tự');
                return;
            }
            
            if (finalSlug.length > 50) {
                error('Slug không được quá 50 ký tự');
                return;
            }
            
            if (!/^[a-z0-9-]+$/.test(finalSlug)) {
                error('Slug chỉ được chứa chữ thường, số và dấu gạch ngang');
                return;
            }
            
            // Validate metaTitle
            if (values.metaTitle && values.metaTitle.trim().length > 60) {
                error('Meta title không được quá 60 ký tự');
                return;
            }
            
            // Validate metaDescription
            if (values.metaDescription && values.metaDescription.trim().length > 160) {
                error('Meta description không được quá 160 ký tự');
                return;
            }
            
            // Làm sạch và validate dữ liệu
            const categoryData = {
                name: values.name.trim(),
                slug: finalSlug,
                description: values.description?.trim() || '',
                image: imageUrl,
                color: typeof values.color === 'string' ? values.color : (values.color?.toHexString?.() || '#1890ff'),
                order: values.order || 0,
                isActive: values.isActive !== undefined ? values.isActive : true,
                metaTitle: values.metaTitle?.trim() || '',
                metaDescription: values.metaDescription?.trim() || '',
                parent: values.parent || null
            };
            
            console.log("📤 Generated slug:", generatedSlug);
            console.log("📤 Final slug:", finalSlug);
            console.log("📤 Image URL:", imageUrl);
            console.log("📤 Image URL type:", typeof imageUrl);
            console.log("📤 Image URL length:", imageUrl.length);
            console.log("📤 Color value:", values.color);
            console.log("📤 Color processed:", categoryData.color);
            console.log("📤 Sending category data:", categoryData);
            await createCategory(categoryData);
            success('Thêm danh mục thành công!');
            navigate('/admin/categories');
        } catch (error: any) { 
            console.error("❌ Error creating category:", error);
            handleError(error, 'Thêm danh mục thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = slugify(name, { lower: true, strict: true });
        form.setFieldsValue({ slug });
    }

    // Xử lý upload ảnh
    const handleImageUpload = async (info: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const { fileList } = info;
        setImageFileList(fileList);

        // Lấy file mới nhất
        const latestFile = fileList[fileList.length - 1];
        if (latestFile && latestFile.originFileObj) {
            // Cập nhật preview image
            setPreviewImage(URL.createObjectURL(latestFile.originFileObj));
            
            // Upload ảnh lên server ngay lập tức
            try {
                const token = localStorage.getItem("token");
                const formData = new FormData();
                formData.append("image", latestFile.originFileObj);
                
                const response = await fetch("http://localhost:8000/api/upload/", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data?.url) {
                        const fullUrl = data.url.startsWith('http') ? data.url : `http://localhost:8000${data.url}`;
                        // Cập nhật fileList với URL từ server
                        const updatedFileList = fileList.map((file: any, index: number) => {
                            if (index === fileList.length - 1) {
                                return {
                                    ...file,
                                    url: fullUrl,
                                    thumbUrl: fullUrl,
                                    status: 'done'
                                };
                            }
                            return file;
                        });
                        setImageFileList(updatedFileList);
                        setPreviewImage(fullUrl);
                        antdMessage.success("Upload ảnh thành công!");
                    }
                } else {
                    antdMessage.error("Upload ảnh thất bại!");
                }
            } catch (error) {
                console.error("Upload error:", error);
                handleError(error, "Lỗi khi upload ảnh!");
            }
        } else if (latestFile && latestFile.url) {
            // Nếu là ảnh hiện tại (không phải file mới)
            setPreviewImage(latestFile.url);
        }
    };

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
                                
                                {/* Upload ảnh */}
                                <Form.Item label="Ảnh danh mục">
                                    <div className="space-y-2">
                                        <Upload
                                            listType="picture-card"
                                            fileList={imageFileList}
                                            onChange={handleImageUpload}
                                            beforeUpload={() => false}
                                            multiple={false}
                                            showUploadList={false}
                                        >
                                            {imageFileList.length < 1 && (
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                                                    <div className="text-sm text-gray-500">Upload</div>
                                                </div>
                                            )}
                                        </Upload>
                                        
                                        {/* Hiển thị preview ảnh đã upload */}
                                        <div className="flex gap-3 flex-wrap mt-3">
                                            {imageFileList.length > 0 && imageFileList.map((file, idx) => (
                                                <div key={idx} className="relative group">
                                                    <Image
                                                        src={file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "")}
                                                        alt={`Ảnh danh mục ${idx + 1}`}
                                                        width={100}
                                                        height={100}
                                                        className="rounded-lg border border-gray-200 object-cover shadow-sm"
                                                        onError={(e) => {
                                                            console.error("Image load error:", file.url);
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                    <Button
                                                        size="small"
                                                        danger
                                                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                        style={{
                                                            padding: 0,
                                                            borderRadius: "50%",
                                                            width: 24,
                                                            height: 24,
                                                            minWidth: 0,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                        onClick={() => {
                                                            setImageFileList([]);
                                                            setPreviewImage("");
                                                            form.setFieldsValue({ image: "" });
                                                        }}
                                                    >
                                                        <FaTrash className="text-xs" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
                                {previewImage && previewImage.trim() !== "" ? (
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <Image
                                                src={previewImage || '/placeholder.png'}
                                                fallback="/placeholder.png"
                                                alt="Xem trước hình ảnh"
                                                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                <Text className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium">
                                                    Ảnh danh mục
                                                </Text>
                                            </div>
                                        </div>
                                        
                                        {/* Nút thay đổi ảnh */}
                                        <Upload
                                            showUploadList={false}
                                            beforeUpload={() => false}
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                        >
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<UploadOutlined />}
                                                block
                                                style={{
                                                    background: "#1677ff",
                                                    border: "none",
                                                    boxShadow: "0 2px 8px rgba(22,119,255,0.2)"
                                                }}
                                            >
                                                Thay đổi ảnh
                                            </Button>
                                        </Upload>
                                    </div>
                                ) : (
                                    <div className="h-48 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300">
                                        <UploadOutlined className="text-4xl text-gray-400 mb-2" />
                                        <Text type="secondary" className="text-center">
                                            Chưa có ảnh danh mục
                                        </Text>
                                        <Text type="secondary" className="text-xs text-center mt-1">
                                            Upload ảnh để xem trước
                                        </Text>
                                    </div>
                                )}
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
