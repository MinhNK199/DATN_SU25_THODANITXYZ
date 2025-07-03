import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { User, UserRole } from "../../../interfaces/User";
import {
  ArrowLeftOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Spin,
  message,
  Modal,
  Descriptions,
  Space,
  Image,
} from "antd";

const { Title, Text } = Typography;

const API_URL = "http://localhost:9000/api/auth/users";

const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Khách hàng",
  staff: "Nhân viên",
  admin: "Quản trị viên",
  superadmin: "Super Admin",
};

function getCurrentUser() {
  const stored = localStorage.getItem("user");
  try {
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [provinceMap, setProvinceMap] = useState<Record<number, string>>({});
  const [districtMap, setDistrictMap] = useState<Record<number, string>>({});
  const [wardMap, setWardMap] = useState<Record<number, string>>({});
  const [avatarError, setAvatarError] = useState(false);

  const currentUser = getCurrentUser();

  const defaultAddress =
    user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi khi tải user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const provinces = await axios.get(
          "https://provinces.open-api.vn/api/?depth=1"
        );
        const provinceObj: Record<number, string> = {};
        provinces.data.forEach((p: any) => {
          provinceObj[p.code] = p.name;
        });
        setProvinceMap(provinceObj);
      } catch {}
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!defaultAddress?.province_code) return;
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(
          `https://provinces.open-api.vn/api/p/${defaultAddress.province_code}?depth=2`
        );
        const districtObj: Record<number, string> = {};
        res.data.districts.forEach((d: any) => {
          districtObj[d.code] = d.name;
        });
        setDistrictMap(districtObj);
      } catch {}
    };
    fetchDistricts();
  }, [defaultAddress?.province_code]);

  useEffect(() => {
    if (!defaultAddress?.district_code) return;
    const fetchWards = async () => {
      try {
        const res = await axios.get(
          `https://provinces.open-api.vn/api/d/${defaultAddress.district_code}?depth=2`
        );
        const wardObj: Record<number, string> = {};
        res.data.wards.forEach((w: any) => {
          wardObj[w.code] = w.name;
        });
        setWardMap(wardObj);
      } catch {}
    };
    fetchWards();
  }, [defaultAddress?.district_code]);

  const canToggleStatus = () => {
    if (!currentUser || !user) return false;
    if (currentUser._id === user._id) return false;
    if (currentUser.role === "superadmin") return true;
    if (
      currentUser.role === "admin" &&
      user.role !== "admin" &&
      user.role !== "superadmin"
    )
      return true;
    return false;
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    Modal.confirm({
      title: user.active ? "Vô hiệu hóa tài khoản?" : "Kích hoạt tài khoản?",
      icon: user.active ? <LockOutlined /> : <UnlockOutlined />,
      content: user.active
        ? "Bạn có chắc muốn vô hiệu hóa tài khoản này?"
        : "Bạn có chắc muốn kích hoạt lại tài khoản này?",
      okText: user.active ? "Vô hiệu hóa" : "Kích hoạt",
      okType: user.active ? "danger" : "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.patch(
            `${API_URL}/${user._id}/status`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          message.success(
            res.data.message || "Cập nhật trạng thái thành công!"
          );
          setUser({ ...user, active: !user.active });
        } catch (err: any) {
          message.error(
            err.response?.data?.message || "Cập nhật trạng thái thất bại!"
          );
        }
      },
    });
  };

  const canViewEmail = (viewer: User | null, target: User) => {
    if (!viewer) return false;
    if (viewer.role === "superadmin") return true;
    if (viewer.role === "admin") {
      const isSelf = viewer._id === target._id;
      const isHigherOrSame = ["admin", "superadmin"].includes(target.role);
      return isSelf || !isHigherOrSame;
    }
    return false;
  };

  const roleTagColor = (role: string) => {
    switch (role) {
      case "customer":
        return "blue";
      case "staff":
        return "cyan";
      case "admin":
        return "orange";
      case "superadmin":
        return "red";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Text type="danger">{error}</Text>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Text>Không tìm thấy người dùng</Text>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="bg-white shadow-lg rounded-xl mb-6">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} className="!m-0">
              Chi tiết người dùng
            </Title>
            <Text type="secondary">{user.name}</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ArrowLeftOutlined />} onClick={() => nav(-1)}>
                Quay lại
              </Button>
              {canToggleStatus() && (
                <Button
                  type={user.active ? "default" : "primary"}
                  danger={user.active}
                  icon={user.active ? <LockOutlined /> : <UnlockOutlined />}
                  onClick={handleToggleStatus}
                >
                  {user.active ? "Vô hiệu hóa" : "Kích hoạt"}
                </Button>
              )}
              {currentUser && currentUser._id === user._id && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => nav(`/admin/users/edit/${user._id}`)}
                >
                  Sửa thông tin
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]} align="stretch">
        {/* Left Column */}
        <Col xs={24} lg={8}>
          <Card
            className="bg-white shadow-lg rounded-xl flex flex-col items-center"
            style={{
              height: "100%",
              display: "flex",
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
            <Title
              level={3}
              style={{
                marginBottom: 24,
                textAlign: "center",
                fontWeight: 700,
                color: "#222",
                width: "100%",
                wordBreak: "break-word",
              }}
            >
              {user.name}
            </Title>
            {user.avatar &&
            user.avatar.trim() !== "" &&
            user.avatar !== "null" &&
            user.avatar !== "undefined" &&
            !avatarError ? (
              <Image
                src={user.avatar}
                width={160}
                height={160}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: 24,
                  border: "2px solid #f0f0f0",
                  boxShadow: "0 2px 8px #eee",
                }}
                alt="Avatar"
                onError={() => setAvatarError(true)}
                preview
              />
            ) : (
              <div
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                  fontSize: 40,
                  color: "#bbb",
                  border: "2px solid #f0f0f0",
                }}
              >
                <span>No Avatar</span>
              </div>
            )}
            <Space
              direction="horizontal"
              size="middle"
              style={{ marginTop: 32 }}
            >
              <Tag
                color={roleTagColor(user.role)}
                  style={{ fontWeight: 700, fontSize: 18, padding: "4px 16px" }}
              >
                {ROLE_LABELS[user.role]}
              </Tag>
              <Tag
                color={user.active ? "success" : "error"}
                  style={{ fontWeight: 700, fontSize: 18, padding: "4px 16px" }}
              >
                {user.active ? "Hoạt động" : "Đã khóa"}
              </Tag>
            </Space>
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={16}>
          <Card
            className="bg-white shadow-lg rounded-xl h-full"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            bodyStyle={{ height: "100%" }}
          >
            <Descriptions
              title="Thông tin chi tiết"
              bordered
              column={1}
              size="middle"
              labelStyle={{ width: 180, fontWeight: 500 }}
            >
              <Descriptions.Item label="Email">
                {canViewEmail(currentUser, user) ? (
                  user.email
                ) : (
                  <Text type="warning" italic strong>
                    Không thể xem
                  </Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {user.phone || <Text type="secondary">chưa cập nhật</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {user.createdAt ? (
                  new Date(user.createdAt).toLocaleDateString("vi-VN")
                ) : (
                  <Text type="secondary">chưa cập nhật</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {defaultAddress ? (
                  <div>
                    <div>
                      <Text strong>Tỉnh/Thành:</Text>{" "}
                      {defaultAddress.province_code &&
                      provinceMap[defaultAddress.province_code] ? (
                        provinceMap[defaultAddress.province_code]
                      ) : (
                        <Text type="secondary">chưa cập nhật</Text>
                      )}
                    </div>
                    <div>
                      <Text strong>Quận/Huyện:</Text>{" "}
                      {defaultAddress.district_code &&
                      districtMap[defaultAddress.district_code] ? (
                        districtMap[defaultAddress.district_code]
                      ) : (
                        <Text type="secondary">chưa cập nhật</Text>
                      )}
                    </div>
                    <div>
                      <Text strong>Phường/Xã:</Text>{" "}
                      {defaultAddress.ward_code &&
                      wardMap[defaultAddress.ward_code] ? (
                        wardMap[defaultAddress.ward_code]
                      ) : (
                        <Text type="secondary">chưa cập nhật</Text>
                      )}
                    </div>
                    <div>
                      <Text strong>Đường/Số nhà:</Text>{" "}
                      {defaultAddress.street ? (
                        defaultAddress.street
                      ) : (
                        <Text type="secondary">chưa cập nhật</Text>
                      )}
                    </div>
                  </div>
                ) : (
                  <Text type="secondary">chưa cập nhật</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserDetail;
