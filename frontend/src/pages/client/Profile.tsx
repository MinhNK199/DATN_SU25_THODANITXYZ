import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaShoppingBag,
  FaHeart,
  FaCog,
  FaSignOutAlt,
  FaCreditCard,
  FaTruck,
  FaCheckCircle,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import userApi, { User, Address, Order } from "../../services/userApi";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import wishlistApi from "../../services/wishlistApi";
import { WishlistItem } from "../../services/wishlistApi";
import cartApi from "../../services/cartApi";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab") || "profile";
    setActiveTab(tab);
  }, [location.search]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    type: "home",
    fullName: "",
    phone: "",
    address: "",
    city: "TP. Hồ Chí Minh",
    district: "Quận 1",
    ward: "Phường Bến Nghé",
    postalCode: "70000",
    note: "",
  });

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userData, addressesData, ordersData, wishlistData] =
        await Promise.all([
          userApi.getCurrentUser(),
          userApi.getAddresses(),
          userApi.getMyOrders(),
          wishlistApi.getFavorites(),
        ]);

      setUser(userData);
      setAddresses(addressesData);
      setOrders(ordersData);
      setWishlist(wishlistData.data.favorites);

      // Gán giá trị form
      setProfileForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Không thể tải dữ liệu người dùng");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updatedUser = await userApi.updateProfile(user._id, profileForm);
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };
  const handleRemoveFavorite = async (productId: string) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm yêu thích:", error);
      toast.error("Không thể xóa sản phẩm khỏi danh sách yêu thích");
    }
  };

  const handleAddToCartFromWishlist = async (productId: string) => {
    try {
      await cartApi.addToCart(productId, 1);
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };
  // Handle address operations
  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAddress = await userApi.createAddress(addressForm);
      setAddresses([...addresses, newAddress]);
      setShowAddressForm(false);
      setAddressForm({
        type: "home",
        fullName: "",
        phone: "",
        address: "",
        city: "TP. Hồ Chí Minh",
        district: "Quận 1",
        ward: "Phường Bến Nghé",
        postalCode: "70000",
        note: "",
      });
      toast.success("Thêm địa chỉ thành công");
    } catch (error) {
      console.error("Error creating address:", error);
      toast.error("Không thể thêm địa chỉ");
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;

    try {
      const updatedAddress = await userApi.updateAddress(
        editingAddress._id,
        addressForm
      );
      setAddresses(
        addresses.map((addr) =>
          addr._id === editingAddress._id ? updatedAddress : addr
        )
      );
      setEditingAddress(null);
      setAddressForm({
        type: "home",
        fullName: "",
        phone: "",
        address: "",
        city: "TP. Hồ Chí Minh",
        district: "Quận 1",
        ward: "Phường Bến Nghé",
        postalCode: "70000",
        note: "",
      });
      toast.success("Cập nhật địa chỉ thành công");
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Không thể cập nhật địa chỉ");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      await userApi.deleteAddress(addressId);
      setAddresses(addresses.filter((addr) => addr._id !== addressId));
      toast.success("Xóa địa chỉ thành công");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Không thể xóa địa chỉ");
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const updatedAddress = await userApi.setDefaultAddress(addressId);
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefault: addr._id === addressId,
        }))
      );
      toast.success("Đặt địa chỉ mặc định thành công");
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Không thể đặt địa chỉ mặc định");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Đăng xuất thành công");
    navigate("/login");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
      case "delivered":
        return "text-green-600 bg-green-100";
      case "Đang giao":
      case "shipped":
        return "text-blue-600 bg-blue-100";
      case "Đang xử lý":
      case "processing":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Đã giao";
      case "shipped":
        return "Đang giao";
      case "processing":
        return "Đang xử lý";
      case "pending":
        return "Chờ xử lý";
      default:
        return status;
    }
  };

  const getAddressTypeText = (type: string) => {
    switch (type) {
      case "home":
        return "Nhà riêng";
      case "work":
        return "Văn phòng";
      case "other":
        return "Khác";
      default:
        return type;
    }
  };

  const tabs = [
    { id: "profile", label: "Hồ sơ", icon: FaUser },
    { id: "orders", label: "Đơn hàng", icon: FaShoppingBag },
    { id: "wishlist", label: "Yêu thích", icon: FaHeart },
    { id: "addresses", label: "Địa chỉ", icon: FaMapMarkerAlt },
    { id: "settings", label: "Cài đặt", icon: FaCog },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không thể tải thông tin người dùng</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tài khoản của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý hồ sơ, đơn hàng và tùy chọn của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-8">
              <div className="text-center mb-6">
                <img
                  src={user.avatar || "https://i.pravatar.cc/150?img=3"}
                  alt="avatar"
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                />
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center px-4 py-3 space-x-2 rounded-lg transition ${
                      activeTab === id
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
              <div className="pt-6 mt-6 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Thông tin hồ sơ
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? (
                      <FaTimes className="w-4 h-4" />
                    ) : (
                      <FaEdit className="w-4 h-4" />
                    )}
                    <span>{isEditing ? "Hủy" : "Chỉnh sửa"}</span>
                  </button>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            name: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaSave className="w-4 h-4" />
                        <span>Lưu thay đổi</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Lịch sử đơn hàng
                </h2>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <FaShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {order._id}
                            </h3>
                            <p className="text-gray-600">
                              Đặt hàng ngày{" "}
                              {new Date(order.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(order.totalPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.orderItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.name} x{item.quantity}
                              </span>
                              <span>{formatPrice(item.price)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                          <button className="text-blue-600 hover:text-blue-700 font-medium">
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Wishlist tab */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Danh sách yêu thích
                </h2>
                {wishlist.length === 0 ? (
                  <p className="text-gray-600">
                    Chưa có sản phẩm nào trong danh sách yêu thích.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div key={item._id} className="border rounded-lg p-4">
                        <img
                          src={
                            item.images?.[0] ||
                            "https://via.placeholder.com/150"
                          }
                          alt={item.name}
                          className="w-full h-40 object-cover rounded mb-3"
                        />
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="text-blue-600 font-semibold mb-3">
                          {formatPrice(item.price)}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleAddToCartFromWishlist(item._id)
                            }
                            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                          >
                            Thêm vào giỏ
                          </button>
                          <button
                            onClick={() => handleRemoveFavorite(item._id)}
                            className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-100"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Địa chỉ giao hàng
                  </h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Thêm địa chỉ mới</span>
                  </button>
                </div>

                {/* Address Form */}
                {(showAddressForm || editingAddress) && (
                  <div className="mb-6 p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      {editingAddress
                        ? "Chỉnh sửa địa chỉ"
                        : "Thêm địa chỉ mới"}
                    </h3>
                    <form
                      onSubmit={
                        editingAddress
                          ? handleUpdateAddress
                          : handleCreateAddress
                      }
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại địa chỉ
                          </label>
                          <select
                            value={addressForm.type}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                type: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="home">Nhà riêng</option>
                            <option value="work">Văn phòng</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ tên
                          </label>
                          <input
                            type="text"
                            value={addressForm.fullName}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                fullName: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ
                          </label>
                          <input
                            type="text"
                            value={addressForm.address}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                address: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thành phố
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                city: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quận/Huyện
                          </label>
                          <input
                            type="text"
                            value={addressForm.district}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                district: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phường/Xã
                          </label>
                          <input
                            type="text"
                            value={addressForm.ward}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                ward: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã bưu điện
                          </label>
                          <input
                            type="text"
                            value={addressForm.postalCode}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                postalCode: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú
                          </label>
                          <input
                            type="text"
                            value={addressForm.note}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                note: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                            setAddressForm({
                              type: "home",
                              fullName: "",
                              phone: "",
                              address: "",
                              city: "TP. Hồ Chí Minh",
                              district: "Quận 1",
                              ward: "Phường Bến Nghé",
                              postalCode: "70000",
                              note: "",
                            });
                          }}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {editingAddress ? "Cập nhật" : "Thêm"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Addresses List */}
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <FaMapMarkerAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Bạn chưa có địa chỉ nào</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                              {getAddressTypeText(address.type)}
                            </span>
                            {address.isDefault && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingAddress(address);
                                setAddressForm({
                                  type: address.type,
                                  fullName: address.fullName,
                                  phone: address.phone,
                                  address: address.address,
                                  city: address.city,
                                  district: address.district,
                                  ward: address.ward,
                                  postalCode: address.postalCode,
                                  note: address.note,
                                });
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium">{address.fullName}</p>
                          <p className="text-gray-600">{address.phone}</p>
                          <p className="text-gray-600">{address.address}</p>
                          <p className="text-gray-600">
                            {address.city}, {address.district}{" "}
                            {address.postalCode}
                          </p>
                        </div>
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address._id)}
                            className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Cài đặt tài khoản
                </h2>
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tùy chọn thông báo
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-3"
                          defaultChecked
                        />
                        <span>Thông báo email cho đơn hàng</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-3"
                          defaultChecked
                        />
                        <span>Email khuyến mãi</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span>Thông báo SMS</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Cài đặt quyền riêng tư
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-3"
                          defaultChecked
                        />
                        <span>Chia sẻ lịch sử mua hàng để gợi ý</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span>Cho phép phân tích bên thứ ba</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Lưu cài đặt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
