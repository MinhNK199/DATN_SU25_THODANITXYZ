import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Select,
  InputNumber,
  Badge,
  Tooltip,
  Alert,
  Tabs
} from 'antd';
import { 
  SaveOutlined, 
  ReloadOutlined, 
  CheckCircleOutlined, 
  SyncOutlined,
  SettingOutlined,
  GlobalOutlined,
  BellOutlined,
  SearchOutlined,
  ShareAltOutlined,
  PhoneOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNotification } from '../../hooks/useNotification';
import { getSettings, updateSettings, resetSettings, SettingsData } from '../../services/settingsService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm<SettingsData>();
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { success, error } = useNotification();
  const autoSaveTimeoutRef = useRef<number | null>(null);
  const isInitialLoad = useRef(true);

  // Dữ liệu mặc định
  const defaultSettings: SettingsData = {
    siteName: 'TechTrend Store',
    siteDescription: 'Cửa hàng điện tử hàng đầu Việt Nam',
    siteUrl: 'http://localhost:3000',
    adminEmail: 'admin@techtrend.com',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
    maxUploadSize: 10,
    cacheEnabled: true,
    seoTitle: 'TechTrend Store - Điện thoại, Laptop, Phụ kiện',
    seoDescription: 'Mua sắm điện tử online với giá tốt nhất',
    seoKeywords: 'điện thoại, laptop, phụ kiện, công nghệ',
    socialFacebook: 'https://facebook.com/techtrend',
    socialTwitter: 'https://twitter.com/techtrend',
    socialInstagram: 'https://instagram.com/techtrend',
    contactPhone: '1900 1234',
    contactAddress: '123 Đường ABC, Quận 1, TP.HCM',
    contactEmail: 'contact@techtrend.com'
  };

  // Broadcast changes to other tabs
  const broadcastChanges = useCallback((settings: SettingsData) => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    window.postMessage({ type: 'SETTINGS_UPDATED', settings }, '*');
  }, []);

  // Auto-save function
  const autoSave = useCallback(async (values: SettingsData) => {
    if (isInitialLoad.current) return;
    
    setAutoSaving(true);
    try {
      await updateSettings(values);
      setLastSaved(new Date());
      setHasChanges(false);
      broadcastChanges(values);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setAutoSaving(false);
    }
  }, [broadcastChanges]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback((values: SettingsData) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(values);
    }, 2000); // 2 giây delay
  }, [autoSave]);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        form.setFieldsValue(settings);
        isInitialLoad.current = false;
      } catch (err) {
        console.error('Error loading settings:', err);
        form.setFieldsValue(defaultSettings);
        isInitialLoad.current = false;
      }
    };
    
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // Real-time sync between tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminSettings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          form.setFieldsValue(newSettings);
          setLastSaved(new Date());
          setHasChanges(false);
        } catch (err) {
          console.error('Error parsing settings from storage:', err);
        }
      }
    };

    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'SETTINGS_UPDATED') {
        form.setFieldsValue(e.data.settings);
        setLastSaved(new Date());
        setHasChanges(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
    };
  }, [form]);

  const onFinish = async (values: SettingsData) => {
    setLoading(true);
    try {
      await updateSettings(values);
      setLastSaved(new Date());
      setHasChanges(false);
      success('Cài đặt đã được lưu thành công!');
    } catch (err) {
      error('Có lỗi xảy ra khi lưu cài đặt!');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const result = await resetSettings();
      form.setFieldsValue(result.settings);
      setLastSaved(new Date());
      setHasChanges(false);
      success('Đã khôi phục cài đặt mặc định');
    } catch (err) {
      error('Có lỗi xảy ra khi khôi phục cài đặt!');
    }
  };

  const handleValuesChange = (_changedValues: Partial<SettingsData>, allValues: SettingsData) => {
    if (!isInitialLoad.current) {
      setHasChanges(true);
      debouncedAutoSave(allValues);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header với status */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title level={2} className="!mb-2 flex items-center gap-3">
                <SettingOutlined className="text-blue-500" />
                Cài đặt hệ thống
              </Title>
              <Text type="secondary" className="text-lg">
                Quản lý cấu hình chung của website
              </Text>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status indicators */}
              <div className="flex items-center gap-2">
                {autoSaving && (
                  <Badge status="processing" text="Đang lưu..." />
                )}
                {hasChanges && !autoSaving && (
                  <Badge status="warning" text="Có thay đổi chưa lưu" />
                )}
                {!hasChanges && lastSaved && (
                  <Badge 
                    status="success" 
                    text={`Đã lưu lúc ${lastSaved.toLocaleTimeString()}`} 
                  />
                )}
              </div>
              
              {/* Preview toggle */}
              <Tooltip title="Xem trước">
                <Button
                  type={previewMode ? "primary" : "default"}
                  className={previewMode ? "admin-primary-button" : ""}
                  icon={<EyeOutlined />}
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? "Tắt xem trước" : "Xem trước"}
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Auto-save progress */}
          {autoSaving && (
            <Alert
              message="Đang tự động lưu cài đặt..."
              type="info"
              icon={<SyncOutlined spin />}
              showIcon
              className="mb-4"
            />
          )}
        </div>

        {/* Preview Mode */}
        {previewMode && (
          <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <Title level={4} className="!mb-0 text-blue-700">
                <EyeOutlined className="mr-2" />
                Chế độ xem trước
              </Title>
              <Button 
                type="text" 
                onClick={() => setPreviewMode(false)}
                className="text-blue-600"
              >
                Đóng
              </Button>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <Title level={3} className="!mb-2">
                      {form.getFieldValue('siteName') || 'Tên website'}
                    </Title>
                    <Text type="secondary">
                      {form.getFieldValue('siteDescription') || 'Mô tả website'}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <Text strong>Liên hệ:</Text>
                    <br />
                    <Text>{form.getFieldValue('contactPhone') || 'Số điện thoại'}</Text>
                    <br />
                    <Text>{form.getFieldValue('contactEmail') || 'Email'}</Text>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="text-center">
                    <Text strong>Mạng xã hội:</Text>
                    <br />
                    <Space>
                      {form.getFieldValue('socialFacebook') && (
                        <a href={form.getFieldValue('socialFacebook')} target="_blank" rel="noopener noreferrer">
                          Facebook
                        </a>
                      )}
                      {form.getFieldValue('socialTwitter') && (
                        <a href={form.getFieldValue('socialTwitter')} target="_blank" rel="noopener noreferrer">
                          Twitter
                        </a>
                      )}
                    </Space>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          className="space-y-6"
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="bg-white rounded-lg shadow-sm"
            tabBarStyle={{ padding: '0 24px', margin: 0 }}
          >
            {/* Tab Thông tin cơ bản */}
            <TabPane 
              tab={
                <span className="flex items-center gap-2">
                  <GlobalOutlined />
                  Thông tin cơ bản
                </span>
              } 
              key="basic"
            >
              <div className="p-6">
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card 
                      title="Thông tin website" 
                      className="h-full shadow-sm hover:shadow-md transition-shadow"
                      extra={<CheckCircleOutlined className="text-green-500" />}
                    >
                      <Form.Item
                        name="siteName"
                        label="Tên website"
                        rules={[{ required: true, message: 'Vui lòng nhập tên website!' }]}
                      >
                        <Input 
                          placeholder="Nhập tên website" 
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>

                      <Form.Item
                        name="siteDescription"
                        label="Mô tả website"
                      >
                        <TextArea 
                          rows={3} 
                          placeholder="Mô tả ngắn về website" 
                          className="rounded-lg"
                        />
                      </Form.Item>

                      <Form.Item
                        name="siteUrl"
                        label="URL website"
                        rules={[{ required: true, message: 'Vui lòng nhập URL website!' }]}
                      >
                        <Input 
                          placeholder="https://example.com" 
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>

                      <Form.Item
                        name="adminEmail"
                        label="Email quản trị"
                        rules={[
                          { required: true, message: 'Vui lòng nhập email!' },
                          { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                      >
                        <Input 
                          placeholder="admin@example.com" 
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card 
                      title="Cấu hình hệ thống" 
                      className="h-full shadow-sm hover:shadow-md transition-shadow"
                      extra={<SettingOutlined className="text-blue-500" />}
                    >
                      <Form.Item name="currency" label="Đơn vị tiền tệ">
                        <Select size="large" className="rounded-lg">
                          <Option value="VND">VND (Việt Nam Đồng)</Option>
                          <Option value="USD">USD (Đô la Mỹ)</Option>
                          <Option value="EUR">EUR (Euro)</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item name="timezone" label="Múi giờ">
                        <Select size="large" className="rounded-lg">
                          <Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</Option>
                          <Option value="UTC">UTC</Option>
                          <Option value="America/New_York">America/New_York</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item name="language" label="Ngôn ngữ">
                        <Select size="large" className="rounded-lg">
                          <Option value="vi">Tiếng Việt</Option>
                          <Option value="en">English</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item name="maxUploadSize" label="Kích thước upload tối đa (MB)">
                        <InputNumber 
                          min={1} 
                          max={100} 
                          size="large"
                          className="w-full rounded-lg" 
                        />
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>
              </div>
            </TabPane>

            {/* Tab Trạng thái hệ thống */}
            <TabPane 
              tab={
                <span className="flex items-center gap-2">
                  <SettingOutlined />
                  Trạng thái hệ thống
                </span>
              } 
              key="system"
            >
              <div className="p-6">
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <Card 
                      title="Trạng thái website" 
                      className="h-full shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Space direction="vertical" className="w-full">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Text strong>Chế độ bảo trì</Text>
                            <br />
                            <Text type="secondary">Tạm dừng website để bảo trì</Text>
                          </div>
                          <Form.Item name="maintenanceMode" valuePropName="checked" className="!mb-0">
                            <Switch size="default" />
                          </Form.Item>
                        </div>

                        <Divider className="!my-4" />

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Text strong>Cho phép đăng ký</Text>
                            <br />
                            <Text type="secondary">Người dùng có thể tự đăng ký tài khoản</Text>
                          </div>
                          <Form.Item name="allowRegistration" valuePropName="checked" className="!mb-0">
                            <Switch size="default" />
                          </Form.Item>
                        </div>

                        <Divider className="!my-4" />

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Text strong>Bật cache</Text>
                            <br />
                            <Text type="secondary">Tăng tốc độ tải trang</Text>
                          </div>
                          <Form.Item name="cacheEnabled" valuePropName="checked" className="!mb-0">
                            <Switch size="default" />
                          </Form.Item>
                        </div>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card 
                      title="Cài đặt thông báo" 
                      className="h-full shadow-sm hover:shadow-md transition-shadow"
                      extra={<BellOutlined className="text-orange-500" />}
                    >
                      <Space direction="vertical" className="w-full">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Text strong>Thông báo email</Text>
                            <br />
                            <Text type="secondary">Gửi thông báo qua email</Text>
                          </div>
                          <Form.Item name="emailNotifications" valuePropName="checked" className="!mb-0">
                            <Switch size="default" />
                          </Form.Item>
                        </div>

                        <Divider className="!my-4" />

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Text strong>Thông báo SMS</Text>
                            <br />
                            <Text type="secondary">Gửi thông báo qua tin nhắn</Text>
                          </div>
                          <Form.Item name="smsNotifications" valuePropName="checked" className="!mb-0">
                            <Switch size="default" />
                          </Form.Item>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </div>
            </TabPane>

            {/* Tab SEO & Marketing */}
            <TabPane 
              tab={
                <span className="flex items-center gap-2">
                  <SearchOutlined />
                  SEO & Marketing
                </span>
              } 
              key="seo"
            >
              <div className="p-6">
                <Row gutter={[24, 24]}>
                  <Col xs={24}>
                    <Card 
                      title="Cài đặt SEO" 
                      className="shadow-sm hover:shadow-md transition-shadow"
                      extra={<SearchOutlined className="text-green-500" />}
                    >
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                          <Form.Item name="seoTitle" label="Tiêu đề SEO">
                            <Input 
                              placeholder="Tiêu đề cho công cụ tìm kiếm" 
                              size="large"
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item name="seoDescription" label="Mô tả SEO">
                            <TextArea 
                              rows={2} 
                              placeholder="Mô tả cho công cụ tìm kiếm" 
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item name="seoKeywords" label="Từ khóa SEO">
                            <Input 
                              placeholder="Từ khóa, cách nhau bởi dấu phẩy" 
                              size="large"
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <Card 
                      title="Mạng xã hội" 
                      className="shadow-sm hover:shadow-md transition-shadow"
                      extra={<ShareAltOutlined className="text-purple-500" />}
                    >
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={8}>
                          <Form.Item name="socialFacebook" label="Facebook">
                            <Input 
                              placeholder="https://facebook.com/yourpage" 
                              size="large"
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item name="socialTwitter" label="Twitter">
                            <Input 
                              placeholder="https://twitter.com/yourpage" 
                              size="large"
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item name="socialInstagram" label="Instagram">
                            <Input 
                              placeholder="https://instagram.com/yourpage" 
                              size="large"
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </div>
            </TabPane>

            {/* Tab Thông tin liên hệ */}
            <TabPane 
              tab={
                <span className="flex items-center gap-2">
                  <PhoneOutlined />
                  Liên hệ
                </span>
              } 
              key="contact"
            >
              <div className="p-6">
                <Card 
                  title="Thông tin liên hệ" 
                  className="shadow-sm hover:shadow-md transition-shadow"
                  extra={<PhoneOutlined className="text-blue-500" />}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item name="contactPhone" label="Số điện thoại">
                        <Input 
                          placeholder="1900 1234" 
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="contactEmail" label="Email liên hệ">
                        <Input 
                          placeholder="contact@example.com" 
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="contactAddress" label="Địa chỉ">
                        <Input 
                          placeholder="123 Đường ABC, Quận 1, TP.HCM" 
                          size="large"
                          className="rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </div>
            </TabPane>
          </Tabs>

          {/* Nút hành động */}
          <Card className="mt-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Text type="secondary">
                  {hasChanges ? "Có thay đổi chưa được lưu" : "Tất cả thay đổi đã được lưu"}
                </Text>
                {lastSaved && (
                  <Text type="secondary" className="text-sm">
                    Lần cuối: {lastSaved.toLocaleString()}
                  </Text>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  size="large"
                  className="rounded-lg"
                >
                  Khôi phục mặc định
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                  className="admin-primary-button rounded-lg"
                >
                  Lưu cài đặt
                </Button>
              </div>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
};

export default SettingsPage;