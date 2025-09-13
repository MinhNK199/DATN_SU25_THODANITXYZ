import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Checkbox, message, Tag, Space, Typography, Spin, Upload, Image } from "antd";
import type { Brand } from "../../../interfaces/Brand";
import { FaEdit, FaTrash } from "react-icons/fa";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useErrorNotification } from "../../../hooks/useErrorNotification";

const API_URL = "http://localhost:8000/api/brand";

const BrandList: React.FC = () => {
  const { handleError } = useErrorNotification();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [newBrand, setNewBrand] = useState<Partial<Brand>>({
    name: "",
    description: "",
    logo: "",
    isActive: true,
  });
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);
  const [editLogoFileList, setEditLogoFileList] = useState<UploadFile[]>([]);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleLogoUpload = async (fileList: UploadFile[]) => {
    setLogoFileList(fileList);
    
    if (fileList.length > 0) {
      const latestFile = fileList[fileList.length - 1];
      
      if (latestFile.originFileObj) {
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
              setLogoFileList(updatedFileList);
              form.setFieldsValue({ logo: fullUrl });
              messageApi.success("Upload logo thành công!");
            }
          } else {
            messageApi.error("Upload logo thất bại!");
          }
        } catch (error) {
          console.error("Upload error:", error);
          handleError(error, "Lỗi khi upload logo!");
        }
      }
    }
  };

  const handleEditLogoUpload = async (fileList: UploadFile[]) => {
    setEditLogoFileList(fileList);
    
    if (fileList.length > 0) {
      const latestFile = fileList[fileList.length - 1];
      
      if (latestFile.originFileObj) {
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
              setEditLogoFileList(updatedFileList);
              editForm.setFieldsValue({ logo: fullUrl });
              messageApi.success("Upload logo thành công!");
            }
          } else {
            messageApi.error("Upload logo thất bại!");
          }
        } catch (error) {
          console.error("Upload error:", error);
          handleError(error, "Lỗi khi upload logo!");
        }
      }
    }
  };

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { headers: getAuthHeader() });
      if (!res.ok) throw new Error("Failed to fetch brands");
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (error) {
      handleError(error, "Lỗi khi tải thương hiệu!");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa thương hiệu này?",
      onOk: async () => {
        try {
          const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeader(),
          });

          if (res.ok) {
            messageApi.success("Xóa thành công!");
            fetchBrands();
          } else {
            const errorData = await res.json();
            throw new Error(errorData.message || "Xóa thất bại!");
          }
        } catch (error) {
          handleError(error, "Xóa thất bại!");
        }
      },
    });
  };

  const handleAdd = async (values: any) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(values),
      });

      if (res.ok) {
        messageApi.success("Thêm thương hiệu thành công!");
        setIsAdding(false);
        form.resetFields();
        setLogoFileList([]);
        fetchBrands();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add brand");
      }
    } catch (error) {
      handleError(error, "Thêm thất bại!");
    }
  };

  const handleEdit = async (values: any) => {
    if (!editingBrand?._id) return;

    try {
      const res = await fetch(`${API_URL}/${editingBrand._id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(values),
      });

      if (res.ok) {
        messageApi.success("Cập nhật thương hiệu thành công!");
        setEditingBrand(null);
        setEditLogoFileList([]);
        fetchBrands();
      } else {
        throw new Error("Failed to update brand");
      }
    } catch (error) {
      handleError(error, "Cập nhật thương hiệu thất bại!");
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      render: (logo: string) => (
        <img src={logo} alt="Logo" style={{ width: 40, height: 40, objectFit: "contain" }} />
      ),
    },
    {
      title: "Tên thương hiệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text: string) => text || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green">Đang hiển thị</Tag>
        ) : (
          <Tag color="default">Đang ẩn</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: Brand) => (
        <Space>
          <Button
            type="primary"
            className="admin-primary-button"
            icon={<FaEdit />}
            onClick={() => {
              setEditingBrand(record);
              editForm.setFieldsValue(record);
              // Load ảnh hiện tại vào edit form
              if (record.logo) {
                setEditLogoFileList([{
                  uid: '1',
                  name: 'logo',
                  status: 'done',
                  url: record.logo,
                  thumbUrl: record.logo,
                }]);
              } else {
                setEditLogoFileList([]);
              }
            }}
          >
            
          </Button>
          <Button danger icon={<FaTrash />} onClick={() => handleDelete(record._id!)}>
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <div className="flex justify-between items-center mb-4">
        <Typography.Title level={3}>Danh sách Thương hiệu</Typography.Title>
        <Button type="primary" className="admin-primary-button" onClick={() => setIsAdding(true)}>
          + Thêm mới
        </Button>
      </div>

      {loading ? (
        <Spin tip="Đang tải..." size="large" />
      ) : (
        <Table
          dataSource={brands}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Modal Add */}
      <Modal
        open={isAdding}
        title="Thêm thương hiệu mới"
        onCancel={() => {
          setIsAdding(false);
          setLogoFileList([]);
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} initialValues={newBrand}>
          <Form.Item
            label="Tên thương hiệu"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Logo thương hiệu"
            name="logo"
            rules={[{ required: true, message: "Vui lòng upload logo!" }]}
          >
            <div className="space-y-2">
              <Upload
                listType="picture-card"
                fileList={logoFileList}
                onChange={handleLogoUpload}
                beforeUpload={() => false}
                multiple={false}
                showUploadList={false}
              >
                {logoFileList.length < 1 && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                    <div className="text-sm text-gray-500">Upload Logo</div>
                  </div>
                )}
              </Upload>
              
              {/* Hiển thị preview logo đã upload */}
              <div className="flex gap-3 flex-wrap mt-3">
                {logoFileList.length > 0 && logoFileList.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <Image
                      src={file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "")}
                      alt={`Logo ${idx + 1}`}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                    <Button
                      type="text"
                      danger
                      size="small"
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newFileList = logoFileList.filter((_, index) => index !== idx);
                        setLogoFileList(newFileList);
                        form.setFieldsValue({ logo: "" });
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>Hiển thị thương hiệu</Checkbox>
          </Form.Item>
          <Form.Item>
            <Space className="flex justify-end">
              <Button onClick={() => setIsAdding(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Edit */}
      <Modal
        open={!!editingBrand}
        title="Cập nhật thương hiệu"
        onCancel={() => {
          setEditingBrand(null);
          setEditLogoFileList([]);
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            label="Tên thương hiệu"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Logo thương hiệu"
            name="logo"
            rules={[{ required: true, message: "Vui lòng upload logo!" }]}
          >
            <div className="space-y-2">
              <Upload
                listType="picture-card"
                fileList={editLogoFileList}
                onChange={handleEditLogoUpload}
                beforeUpload={() => false}
                multiple={false}
                showUploadList={false}
              >
                {editLogoFileList.length < 1 && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                    <div className="text-sm text-gray-500">Upload Logo</div>
                  </div>
                )}
              </Upload>
              
              {/* Hiển thị preview logo đã upload */}
              <div className="flex gap-3 flex-wrap mt-3">
                {editLogoFileList.length > 0 && editLogoFileList.map((file, idx) => (
                  <div key={idx} className="relative group">
                    <Image
                      src={file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "")}
                      alt={`Logo ${idx + 1}`}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                    <Button
                      type="text"
                      danger
                      size="small"
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        const newFileList = editLogoFileList.filter((_, index) => index !== idx);
                        setEditLogoFileList(newFileList);
                        editForm.setFieldsValue({ logo: "" });
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>Hiển thị thương hiệu</Checkbox>
          </Form.Item>
          <Form.Item>
            <Space className="flex justify-end">
              <Button onClick={() => setEditingBrand(null)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandList;
