import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { User, UserForm } from "../../../interfaces/User";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Spin,
  Select,
  Typography,
  message,
  Image,
  Space,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const API_URL = "http://localhost:8000/api/auth/users";

interface Province {
  code: number;
  name: string;
}
interface District {
  code: number;
  name: string;
}
interface Ward {
  code: number;
  name: string;
}

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [form] = Form.useForm<UserForm>();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = res.data.user;
        setUser(u);

        const defaultAddress = u.addresses?.find((a: any) => a.isDefault) || {};

        form.setFieldsValue({
          name: u.name,
          phone: u.phone,
          avatar: u.avatar,
          province_code: defaultAddress.province_code,
          district_code: defaultAddress.district_code,
          ward_code: defaultAddress.ward_code,
          street: defaultAddress.street || "",
        });
      } catch (err: any) {
        message.error(err.response?.data?.message || "Lỗi khi tải user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    axios
      .get<Province[]>("https://provinces.open-api.vn/api/?depth=1")
      .then((r) => setProvinces(r.data))
      .catch(() => message.error("Không tải được danh sách tỉnh"));
  }, []);

  useEffect(() => {
    const province_code = form.getFieldValue("province_code");
    if (province_code) {
      axios
        .get<{ districts: District[] }>(
          `https://provinces.open-api.vn/api/p/${province_code}?depth=2`
        )
        .then((r) => setDistricts(r.data.districts))
        .catch(() => {});
    } else {
      setDistricts([]);
      form.setFieldsValue({ district_code: undefined, ward_code: undefined });
    }
    // eslint-disable-next-line
  }, [form.getFieldValue("province_code")]);

  useEffect(() => {
    const district_code = form.getFieldValue("district_code");
    if (district_code) {
      axios
        .get<{ wards: Ward[] }>(
          `https://provinces.open-api.vn/api/d/${district_code}?depth=2`
        )
        .then((r) => setWards(r.data.wards))
        .catch(() => {});
    } else {
      setWards([]);
      form.setFieldsValue({ ward_code: undefined });
    }
    // eslint-disable-next-line
  }, [form.getFieldValue("district_code")]);

  const handleSubmit = async (values: UserForm) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Cập nhật thông tin thành công!");
      setTimeout(() => nav(-1), 1200);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="h-full"
      >
        <Row gutter={24} align="stretch">
          {/* Left Column: Avatar + Actions */}
          <Col xs={24} lg={8}>
            <Card
              className="shadow-lg rounded-xl h-full flex flex-col items-center justify-center"
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              bodyStyle={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                padding: 32,
              }}
            >
              <Title level={4} style={{ textAlign: "center", width: "100%" }}>
                Ảnh đại diện
              </Title>
              {form.getFieldValue("avatar") ? (
                <Image
                  src={form.getFieldValue("avatar")}
                  width={140}
                  height={140}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: 24,
                    border: "2px solid #f0f0f0",
                    boxShadow: "0 2px 8px #eee",
                  }}
                  alt="Avatar"
                  fallback="https://ui-avatars.com/api/?name=User"
                  preview
                />
              ) : (
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                    fontSize: 32,
                    color: "#bbb",
                    border: "2px solid #f0f0f0",
                  }}
                >
                  <span>No Avatar</span>
                </div>
              )}
              <Space
                direction="vertical"
                className="w-full"
                style={{ marginTop: 24 }}
              >
                <Button
                  block
                  icon={<ArrowLeftOutlined />}
                  onClick={() => nav(-1)}
                >
                  Quay lại
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  icon={<SaveOutlined />}
                  loading={submitting}
                >
                  Lưu thay đổi
                </Button>
              </Space>
            </Card>
          </Col>

          {/* Right Column: Form */}
          <Col xs={24} lg={16}>
            <Card className="shadow-lg rounded-xl h-full">
              <Title level={3} style={{ marginBottom: 24 }}>
                Chỉnh sửa thông tin người dùng
              </Title>
              <Form.Item
                name="name"
                label="Tên"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input placeholder="Nhập tên người dùng" />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  {
                    pattern: /^[0-9]{8,15}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
              <Form.Item
                name="avatar"
                label="Avatar (URL)"
                rules={[
                  {
                    type: "url",
                    message: "Đường dẫn ảnh không hợp lệ",
                    warningOnly: true,
                  },
                ]}
              >
                <Input placeholder="Dán link ảnh đại diện..." />
              </Form.Item>
              <Title level={5} style={{ marginTop: 24 }}>
                Địa chỉ
              </Title>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item
                    name="province_code"
                    label="Tỉnh/Thành"
                    rules={[{ required: true, message: "Chọn tỉnh/thành" }]}
                  >
                    <Select
                      placeholder="Chọn tỉnh/thành"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        String(option?.children)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {provinces.map((p) => (
                        <Option key={p.code} value={p.code}>
                          {p.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="district_code"
                    label="Quận/Huyện"
                    rules={[{ required: true, message: "Chọn quận/huyện" }]}
                  >
                    <Select
                      placeholder="Chọn quận/huyện"
                      disabled={!districts.length}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        String(option?.children)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {districts.map((d) => (
                        <Option key={d.code} value={d.code}>
                          {d.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="ward_code"
                    label="Phường/Xã"
                    rules={[{ required: true, message: "Chọn phường/xã" }]}
                  >
                    <Select
                      placeholder="Chọn phường/xã"
                      disabled={!wards.length}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        String(option?.children)
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {wards.map((w) => (
                        <Option key={w.code} value={w.code}>
                          {w.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="street"
                label="Số nhà, tên đường"
                rules={[{ required: true, message: "Nhập số nhà, tên đường" }]}
              >
                <Input placeholder="Số nhà, tên đường..." />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default UserEdit;
