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
  FaLock,
  FaRegClock,
  FaBell,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import userApi, { User, Address, Order } from "../../services/userApi";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import wishlistApi from "../../services/wishlistApi";
import { WishlistItem } from "../../services/wishlistApi";
import cartApi from "../../services/cartApi";
import { getOrderById, requestRefund } from "../../services/orderApi";
import { Order as OrderDetailType } from "../../interfaces/Order";
import ScrollToTop from "../../components/ScrollToTop";
import Select from 'react-select';

// Tự định nghĩa usePrevious
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab") || "profile";
    setActiveTab(tab);
  }, [location.search]);

  // Tự động cuộn lên đầu khi chuyển tab
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

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
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [showEditAddressForm, setShowEditAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addAddressForm, setAddAddressForm] = useState({
    type: "home",
    fullName: "",
    phone: "",
    address: "",
    city: "79", // Mã tỉnh mặc định cho TP. Hồ Chí Minh
    district: "",
    ward: "",
    postalCode: "70000",
    note: "",
  });
  const [editAddressForm, setEditAddressForm] = useState({
    type: "home",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    postalCode: "",
    note: "",
  });

  // State cho đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // State cho đổi avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // State cho cài đặt thông báo và quyền riêng tư
  const [notificationSettings, setNotificationSettings] = useState({
    orderEmail: true,
    promotionEmail: true,
    sms: false,
  });
  const [privacySettings, setPrivacySettings] = useState({
    shareHistory: true,
    thirdPartyAnalytics: false,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // State cho modal chi tiết đơn hàng
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [orderDetail, setOrderDetail] = useState<OrderDetailType | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

  // State cho xác thực bảo mật khi thay đổi thông tin nhạy cảm
  const [showSensitiveModal, setShowSensitiveModal] = useState(false);
  const [sensitivePassword, setSensitivePassword] = useState("");
  const [sensitiveLoading, setSensitiveLoading] = useState(false);
  const [pendingProfileForm, setPendingProfileForm] = useState<typeof profileForm | null>(null);

  // State cho activity log
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // State cho phương thức thanh toán
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [addPaymentForm, setAddPaymentForm] = useState({ type: 'credit_card', provider: '', last4: '', expired: '', token: '' });
  const [addPaymentLoading, setAddPaymentLoading] = useState(false);

  // State cho thông báo
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Thêm state cho danh sách ngân hàng và ví điện tử
  const [bankList, setBankList] = useState([]);
  const eWalletList = [
    { code: "momo", name: "Momo", logo: "/images/wallets/momo.png" },
    { code: "zalopay", name: "ZaloPay", logo: "/images/wallets/zalopay.png" },
    { code: "vnpay", name: "VNPAY", logo: "/images/wallets/vnpay.png" },
    { code: "shopeepay", name: "ShopeePay", logo: "/images/wallets/shopeepay.png" },
    { code: "viettelmoney", name: "Viettel Money", logo: "/images/wallets/viettelmoney.png" },
    { code: "onepay", name: "OnePay", logo: "/images/wallets/onepay.png" },
    { code: "neox", name: "NeoX", logo: "/images/wallets/neox.png" },
  ];

  const cardList = [
    { code: 'visa', name: 'Visa', logo: '/images/cards/visa.png' },
    { code: 'mastercard', name: 'MasterCard', logo: '/images/cards/mastercard.png' },
    { code: 'jcb', name: 'JCB', logo: '/images/cards/jcb.png' },
    { code: 'amex', name: 'American Express', logo: '/images/cards/amex.png' },
    { code: 'unionpay', name: 'UnionPay', logo: '/images/cards/unionpay.png' },
  ];

  useEffect(() => {
    // Fetch danh sách ngân hàng Việt Nam từ API VietQR (chuẩn code + tên tiếng Việt)
    fetch("https://api.vietqr.io/v2/banks")
      .then(res => res.json())
      .then(data => {
        const banks = data.data.map((b: any) => ({
          code: b.code.toLowerCase(), // mã chuẩn, ví dụ: vcb, bidv, tcb, ...
          name: b.name, // tên tiếng Việt có dấu
          logo: `/images/banks/${b.code.toLowerCase()}.png`
        }));
        setBankList(banks);
      })
      .catch(() => setBankList([]));
  }, []);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Khi load user, đồng bộ state cài đặt
  useEffect(() => {
    if (user) {
      setNotificationSettings({
        orderEmail: user.notificationSettings?.orderEmail ?? true,
        promotionEmail: user.notificationSettings?.promotionEmail ?? true,
        sms: user.notificationSettings?.sms ?? false,
      });
      setPrivacySettings({
        shareHistory: user.privacySettings?.shareHistory ?? true,
        thirdPartyAnalytics: user.privacySettings?.thirdPartyAnalytics ?? false,
      });
    }
  }, [user]);

  // Load activity log khi vào tab
  useEffect(() => {
    if (activeTab === 'activity') {
      setActivityLoading(true);
      userApi.getMyActivityLogs()
        .then(res => setActivityLogs(res.logs))
        .catch(() => setActivityLogs([]))
        .finally(() => setActivityLoading(false));
    }
  }, [activeTab]);

  // Load payment methods khi vào tab
  useEffect(() => {
    if (activeTab === 'payment') {
      setPaymentLoading(true);
      userApi.getMyPaymentMethods()
        .then(res => setPaymentMethods(res.methods))
        .catch(() => setPaymentMethods([]))
        .finally(() => setPaymentLoading(false));
    }
  }, [activeTab]);

  // Load notifications khi vào tab
  useEffect(() => {
    if (activeTab === 'notification') {
      setNotificationLoading(true);
      userApi.getNotifications()
        .then(res => setNotifications(res))
        .catch(() => setNotifications([]))
        .finally(() => setNotificationLoading(false));
      userApi.getUnreadNotificationCount().then(setUnreadCount).catch(() => setUnreadCount(0));
    }
  }, [activeTab]);

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

  // Sửa lại handleProfileUpdate để kiểm tra nếu thay đổi email hoặc phone thì yêu cầu xác thực
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const isSensitive = profileForm.email !== user.email || profileForm.phone !== user.phone;
    if (isSensitive) {
      setPendingProfileForm(profileForm);
      setShowSensitiveModal(true);
      return;
    }
    try {
      const updatedUser = await userApi.updateProfile(user._id, profileForm);
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
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
      const newAddress = await userApi.createAddress(addAddressForm);
      setAddresses([...addresses, newAddress]);
      setShowAddAddressForm(false);
      setAddAddressForm({
        type: "home",
        fullName: "",
        phone: "",
        address: "",
        city: "79", // Mã tỉnh mặc định cho TP. Hồ Chí Minh
        district: "",
        ward: "",
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
        editAddressForm
      );
      setAddresses(
        addresses.map((addr) =>
          addr._id === editingAddress._id ? updatedAddress : addr
        )
      );
      setShowEditAddressForm(false);
      setEditingAddress(null);
      setEditAddressForm({
        type: "home",
        fullName: "",
        phone: "",
        address: "",
        city: "",
        district: "",
        ward: "",
        postalCode: "",
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
    } catch (error: any) {
      console.error("Error deleting address:", error);
      const errorMessage = error?.response?.data?.message || "Không thể xóa địa chỉ";
      toast.error(errorMessage);
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

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await userApi.changePassword(passwordForm);
      toast.success('Đổi mật khẩu thành công');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Xử lý chọn file avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Xử lý upload avatar lên Cloudinary và cập nhật profile
  const handleUploadAvatar = async () => {
    if (!avatarFile || !user) return;
    setAvatarLoading(true);
    try {
      // Upload lên Cloudinary
      const formData = new FormData();
      formData.append('file', avatarFile);
      formData.append('upload_preset', 'ml_default'); // Thay bằng preset của bạn nếu có
      const res = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error('Upload thất bại');
      // Cập nhật avatar qua API
      const updatedUser = await userApi.updateProfile(user._id, { avatar: data.secure_url });
      setUser(updatedUser);
      toast.success('Cập nhật avatar thành công');
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      toast.error('Cập nhật avatar thất bại');
    } finally {
      setAvatarLoading(false);
    }
  };

  // Xử lý lưu cài đặt
  const handleSaveSettings = async () => {
    if (!user) return;
    setSettingsLoading(true);
    try {
      const updatedUser = await userApi.updateProfile(user._id, {
        notificationSettings,
        privacySettings,
      });
      setUser(updatedUser);
      toast.success('Lưu cài đặt thành công');
    } catch (error) {
      toast.error('Lưu cài đặt thất bại');
    } finally {
      setSettingsLoading(false);
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
      case "pending":
        return "text-gray-700 bg-yellow-100"; // Chờ xác nhận - vàng nhạt
      case "confirmed":
        return "text-blue-700 bg-blue-100"; // Đã xác nhận - xanh dương
      case "processing":
        return "text-indigo-700 bg-indigo-100"; // Đang xử lý - tím
      case "shipped":
        return "text-orange-700 bg-orange-100"; // Đang giao hàng - cam
      case "delivered_success":
        return "text-green-700 bg-green-100"; // Giao hàng thành công - xanh lá
      case "delivered_failed":
        return "text-red-700 bg-red-100"; // Giao hàng thất bại - đỏ
      case "completed":
        return "text-green-800 bg-green-200"; // Thành công - xanh lá đậm
      case "cancelled":
        return "text-red-600 bg-red-100"; // Đã hủy - đỏ
      case "returned":
        return "text-purple-700 bg-purple-100"; // Hoàn hàng - tím
      case "refund_requested":
        return "text-pink-700 bg-pink-100"; // Yêu cầu hoàn tiền - hồng
      case "refunded":
        return "text-pink-900 bg-pink-200"; // Hoàn tiền thành công - hồng đậm
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao hàng";
      case "delivered_success":
        return "Giao hàng thành công";
      case "delivered_failed":
        return "Giao hàng thất bại";
      case "completed":
        return "Thành công";
      case "cancelled":
        return "Đã hủy";
      case "returned":
        return "Hoàn hàng";
      case "refund_requested":
        return "Yêu cầu hoàn tiền";
      case "refunded":
        return "Hoàn tiền thành công";
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
    { id: "payment", label: "Phương thức thanh toán", icon: FaCreditCard },
    { id: "notification", label: `Thông báo${unreadCount > 0 ? ' (' + unreadCount + ')' : ''}`, icon: FaBell },
    { id: "settings", label: "Cài đặt", icon: FaCog },
    { id: "password", label: "Đổi mật khẩu", icon: FaLock },
    { id: "activity", label: "Lịch sử hoạt động", icon: FaRegClock },
  ];

  // Xử lý mở modal chi tiết đơn hàng
  const handleShowOrderDetail = async (orderId: string) => {
    setOrderDetailLoading(true);
    setShowOrderDetail(true);
    try {
      const data = await getOrderById(orderId);
      setOrderDetail(data);
    } catch (error) {
      toast.error('Không thể tải chi tiết đơn hàng');
      setOrderDetail(null);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  // Xử lý đóng modal
  const handleCloseOrderDetail = () => {
    setShowOrderDetail(false);
    setOrderDetail(null);
  };

  // Xử lý submit thông tin nhạy cảm
  const handleSensitiveProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pendingProfileForm) return;
    setSensitiveLoading(true);
    try {
      // Gọi API xác thực mật khẩu (dùng endpoint đổi mật khẩu với oldPassword, newPassword = oldPassword)
      await userApi.changePassword({ oldPassword: sensitivePassword, newPassword: sensitivePassword, confirmPassword: sensitivePassword });
      // Nếu xác thực thành công, cập nhật thông tin
      const updatedUser = await userApi.updateProfile(user._id, pendingProfileForm);
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công");
      setShowSensitiveModal(false);
      setSensitivePassword("");
      setPendingProfileForm(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Mật khẩu xác thực không đúng");
    } finally {
      setSensitiveLoading(false);
    }
  };

  // Thêm phương thức thanh toán
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddPaymentLoading(true);
    try {
      await userApi.addPaymentMethod(addPaymentForm);
      toast.success('Thêm phương thức thanh toán thành công');
      setShowAddPayment(false);
      setAddPaymentForm({ type: 'credit_card', provider: '', last4: '', expired: '', token: '' });
      // Reload
      setPaymentLoading(true);
      const res = await userApi.getMyPaymentMethods();
      setPaymentMethods(res.methods);
    } catch (error) {
      toast.error('Thêm phương thức thanh toán thất bại');
    } finally {
      setAddPaymentLoading(false);
      setPaymentLoading(false);
    }
  };

  // Xoá phương thức thanh toán
  const handleDeletePaymentMethod = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá phương thức này?')) return;
    try {
      await userApi.deletePaymentMethod(id);
      toast.success('Đã xoá phương thức thanh toán');
      setPaymentMethods(methods => methods.filter(m => m._id !== id));
    } catch (error) {
      toast.error('Xoá thất bại');
    }
  };

  // Đánh dấu đã đọc
  const handleMarkAsRead = async (id: string) => {
    try {
      await userApi.markNotificationAsRead(id);
      setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };
  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await userApi.markAllNotificationsAsRead();
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };
  // Xoá thông báo
  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá thông báo này?')) return;
    try {
      await userApi.deleteNotification(id);
      setNotifications(n => n.filter(x => x._id !== id));
    } catch {}
  };

  // State cho địa chỉ động
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);

  // Lấy danh sách tỉnh/thành phố khi mở form địa chỉ
  useEffect(() => {
    if (showAddAddressForm || showEditAddressForm || editingAddress) {
      setProvinceLoading(true);
      fetch('/api/provinces')
        .then(res => res.json())
        .then(data => {
          setProvinces(data);
        })
        .catch(err => {
          setProvinces([]);
          toast.error('Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại hoặc kiểm tra kết nối mạng.');
          console.error('Lỗi fetch tỉnh/thành phố:', err);
        })
        .finally(() => setProvinceLoading(false));
    }
  }, [showAddAddressForm, showEditAddressForm, editingAddress]);

  const centrallyGovernedCities = [
    "Thành phố Hà Nội",
    "Thành phố Hồ Chí Minh",
    "Thành phố Hải Phòng",
    "Thành phố Đà Nẵng",
    "Thành phố Cần Thơ"
  ];
  const [districts, setDistricts] = useState<any[]>([]);
  const [districtLoading, setDistrictLoading] = useState(false);

  // useEffect cho form thêm mới
  useEffect(() => {
    if (!addAddressForm.city) {
      setDistricts([]);
      setWards([]);
      return;
    }
    fetch(`/api/districts?provinceCode=${addAddressForm.city}`)
      .then(res => res.json())
      .then(districtsData => {
        setDistricts(districtsData);
        if (!districtsData || districtsData.length === 0) {
          // Không có quận/huyện, fetch luôn toàn bộ phường/xã của tỉnh
          fetch(`/api/wards?provinceCode=${addAddressForm.city}`)
            .then(res => res.json())
            .then(wardsData => setWards(wardsData));
        } else {
          setWards([]);
        }
      });
  }, [addAddressForm.city]);

  // useEffect khi chọn quận/huyện ở form thêm mới
  useEffect(() => {
    if (!addAddressForm.city || !addAddressForm.district) return;
    if (districts.length === 0) return; // Không có quận/huyện thì không fetch theo quận
    fetch(`/api/wards?provinceCode=${addAddressForm.city}&districtCode=${addAddressForm.district}`)
      .then(res => res.json())
      .then(data => setWards(data));
  }, [addAddressForm.district, addAddressForm.city, districts.length]);

  // Khi chọn tỉnh trong form edit, nếu là TP trực thuộc TW thì fetch quận/huyện, ngược lại fetch xã/phường luôn
  useEffect(() => {
    const selectedProvince = provinces.find((p: any) => p.code === editAddressForm.city);
    if (!editAddressForm.city) {
      setDistricts([]); setWards([]);
      setEditAddressForm(f => ({ ...f, district: '', ward: '' }));
      return;
    }
    if (selectedProvince && centrallyGovernedCities.includes(selectedProvince.name)) {
      setDistrictLoading(true);
      fetch(`/api/districts?provinceCode=${editAddressForm.city}`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data);
          setEditAddressForm(f => ({ ...f, district: '', ward: '' }));
          setWards([]);
        })
        .catch(() => setDistricts([]))
        .finally(() => setDistrictLoading(false));
    } else {
      setDistricts([]);
      setDistrictLoading(false);
      setWardLoading(true);
      fetch(`/api/wards?provinceCode=${editAddressForm.city}`)
        .then(res => res.json())
        .then(data => {
          setWards(data);
          setEditAddressForm(f => ({ ...f, ward: '' }));
        })
        .catch(() => setWards([]))
        .finally(() => setWardLoading(false));
    }
  }, [editAddressForm.city, provinces]);

  // useEffect khi chọn quận/huyện ở form sửa địa chỉ
  useEffect(() => {
    if (!editAddressForm.city || !editAddressForm.district) return;
    if (districts.length === 0) return; // Không có quận/huyện thì không fetch theo quận
    fetch(`/api/wards?provinceCode=${editAddressForm.city}&districtCode=${editAddressForm.district}`)
        .then(res => res.json())
      .then(data => setWards(data));
  }, [editAddressForm.district, editAddressForm.city, districts.length]);

  useEffect(() => {
    if (editAddressForm.city) {
      fetchWardsByProvinceCode(editAddressForm.city);
    } else {
      setWards([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editAddressForm.city, provinces]);

  const handleEditAddress = (address: Address) => {
    setShowEditAddressForm(true);
          setEditingAddress(address);
    setEditAddressForm({
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
    if (address.city) {
      fetch(`/api/districts?provinceCode=${address.city}`)
        .then(res => res.json())
        .then(data => setDistricts(data));
      fetch(`/api/wards?provinceCode=${address.city}${address.district ? `&districtCode=${address.district}` : ''}`)
        .then(res => res.json())
        .then(data => setWards(data));
    }
  };

  const [showEditPayment, setShowEditPayment] = useState(false);
  const [editPaymentForm, setEditPaymentForm] = useState<any>(null);
  const [editPaymentLoading, setEditPaymentLoading] = useState(false);

  const handleEditPaymentMethod = (method: any) => {
    setEditPaymentForm({ ...method });
    setShowEditPayment(true);
  };

  const handleUpdatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditPaymentLoading(true);
    try {
      await userApi.updatePaymentMethod(editPaymentForm._id, editPaymentForm);
      setShowEditPayment(false);
      setEditPaymentForm(null);
      setPaymentLoading(true);
      const res = await userApi.getMyPaymentMethods();
      setPaymentMethods(res.methods);
      toast.success("Cập nhật phương thức thanh toán thành công!");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Cập nhật phương thức thất bại';
      toast.error(msg);
    } finally {
      setEditPaymentLoading(false);
      setPaymentLoading(false);
    }
  };

  const getBankLogo = (bank) => `/images/banks/${(bank.code || bank.value || '').toLowerCase().replace(/\s+/g, '')}.png`;
  const getEWalletLogo = (wallet) => `/images/wallets/${(wallet.code || wallet.value || '').toLowerCase().replace(/\s+/g, '')}.png`;

  // State cho modal hủy đơn hàng
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const handleOpenCancelModal = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelReason("");
    setShowCancelModal(true);
  };
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelOrderId(null);
    setCancelReason("");
  };
  const handleCancelOrder = () => {
    if (cancelOrderId && cancelReason.trim()) {
      console.log('Hủy đơn hàng:', cancelOrderId, 'Lý do:', cancelReason);
      // TODO: Gọi API hủy đơn hàng ở đây
      handleCloseCancelModal();
    }
  };

  // State cho modal hoàn tiền
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const handleOpenRefundModal = (orderId: string) => {
    setRefundOrderId(orderId);
    setRefundReason("");
    setShowRefundModal(true);
  };
  const handleCloseRefundModal = () => {
    setShowRefundModal(false);
    setRefundOrderId(null);
    setRefundReason("");
  };
  const handleRefundOrder = async () => {
    if (refundOrderId && refundReason.trim()) {
      try {
        await requestRefund(refundOrderId, refundReason);
        toast.success('Gửi yêu cầu hoàn tiền thành công!');
        loadUserData();
      } catch (err: any) {
        toast.error(err.message || 'Gửi yêu cầu hoàn tiền thất bại!');
      }
      handleCloseRefundModal();
    }
  };

  const prevOrders = usePrevious(orders);
  useEffect(() => {
    if (!prevOrders) return;
    orders.forEach((order, idx) => {
      const prevOrder = prevOrders[idx];
      if (!prevOrder) return;
      // Thông báo hoàn tiền thành công
      if (prevOrder.status === 'refund_requested' && order.status === 'refunded') {
        toast.success('Yêu cầu hoàn tiền của bạn đã được chấp nhận và xử lý thành công!');
      }
      // Thông báo bị từ chối hoàn tiền
      if (prevOrder.status === 'refund_requested' && order.status === 'delivered_success') {
        toast.error('Yêu cầu hoàn tiền của bạn đã bị từ chối. Vui lòng liên hệ CSKH nếu cần hỗ trợ thêm.');
      }
    });
  }, [orders, prevOrders]);

  // Thêm state phân trang cho notifications
  const [notificationPage, setNotificationPage] = useState(1);
  const notificationsPerPage = 5;
  const totalNotificationPages = Math.ceil(notifications.length / notificationsPerPage);
  const paginatedNotifications = notifications.slice((notificationPage - 1) * notificationsPerPage, notificationPage * notificationsPerPage);

  // Thêm state phân trang cho lịch sử trạng thái đơn hàng
  const [orderHistoryPage, setOrderHistoryPage] = useState(1);
  const orderHistoryPerPage = 5;
  const orderDetailHistory = orderDetail?.statusHistory || [];
  const totalOrderHistoryPages = Math.ceil(orderDetailHistory.length / orderHistoryPerPage);
  const paginatedOrderHistory = orderDetailHistory.slice((orderHistoryPage - 1) * orderHistoryPerPage, orderHistoryPage * orderHistoryPerPage);

  // Thêm state phân trang cho lịch sử đơn hàng chung (tab orders)
  const [ordersPage, setOrdersPage] = useState(1);
  const ordersPerPage = 5;
  const totalOrdersPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage);

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
    <>
      <ScrollToTop trigger={activeTab} />
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-8 w-80 min-w-[260px] max-w-[340px] flex-shrink-0 mx-auto lg:mx-0">
                <div className="text-center mb-6">
                  <img
                    src={avatarPreview || user.avatar || "https://i.pravatar.cc/150?img=3"}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                  />
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {avatarPreview && (
                      <button
                        onClick={handleUploadAvatar}
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                        disabled={avatarLoading}
                      >
                        {avatarLoading ? 'Đang cập nhật...' : 'Lưu ảnh đại diện'}
                      </button>
                    )}
                  </div>
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
            <div className="lg:col-span-3 lg:pl-12 w-full">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl mx-auto transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Thông tin cá nhân
                    </h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-sm border border-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <FaEdit className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                      </button>
                    ) : null}
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                          />
                        ) : (
                          <div className="text-gray-900 font-medium px-2 py-2 bg-gray-50 rounded-lg border border-transparent min-h-[48px] flex items-center">{profileForm.name}</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700">Địa chỉ email</label>
                        <div className="text-gray-900 font-medium px-2 py-2 bg-gray-50 rounded-lg border border-transparent min-h-[48px] flex items-center">{profileForm.email}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                          />
                        ) : (
                          <div className="text-gray-900 font-medium px-2 py-2 bg-gray-50 rounded-lg border border-transparent min-h-[48px] flex items-center">{profileForm.phone}</div>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-4 mt-4">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold shadow-sm"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm disabled:opacity-60"
                          disabled={loading}
                        >
                          {loading ? <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> : <FaSave className="w-4 h-4" />}
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
                    <div className="space-y-6 max-h-[85vh] overflow-y-auto">
                      {paginatedOrders.map((order) => (
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
                                Đặt hàng ngày {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 md:mt-0">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                                {order.status === 'refund_requested' && (
                                  <span className="ml-2 text-pink-700 font-semibold">(Đang xử lý yêu cầu hoàn tiền)</span>
                                )}
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
                          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-4">
                            <button className="text-blue-600 hover:text-blue-700 font-medium" onClick={() => handleShowOrderDetail(order._id)}>
                              Xem chi tiết
                            </button>
                            {order.status === 'delivered_success' && order.isPaid && (
                              <button
                                className="ml-4 text-pink-700 hover:text-white hover:bg-pink-600 border border-pink-300 rounded px-4 py-1 font-medium transition"
                                onClick={() => handleOpenRefundModal(order._id)}
                              >
                                Yêu cầu hoàn tiền
                              </button>
                            )}
                            {order.status === 'pending' && (
                              <button
                                className="ml-4 text-gray-600 hover:text-white hover:bg-red-600 border border-red-300 rounded px-4 py-1 font-medium transition"
                                onClick={() => handleOpenCancelModal(order._id)}
                              >
                                Hủy đơn hàng
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* Phân trang */}
                      {totalOrdersPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                          <button
                            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                            onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                            disabled={ordersPage === 1}
                          >
                            Trước
                          </button>
                          <span className="mx-2 text-sm">Trang {ordersPage} / {totalOrdersPages}</span>
                          <button
                            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                            onClick={() => setOrdersPage(p => Math.min(totalOrdersPages, p + 1))}
                            disabled={ordersPage === totalOrdersPages}
                          >
                            Sau
                          </button>
                        </div>
                      )}
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
                      onClick={() => {
                        setShowAddAddressForm(true);
                        setEditingAddress(null);
                        setAddAddressForm({
                          type: "home",
                          fullName: "",
                          phone: "",
                          address: "",
                          city: "",
                          district: "",
                          ward: "",
                          postalCode: "70000",
                          note: "",
                        });
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      <span>Thêm địa chỉ mới</span>
                    </button>
                  </div>

                  {/* Add Address Form */}
                  {showAddAddressForm && (
                    <div className="mb-6 p-6 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">
                        Thêm địa chỉ mới
                      </h3>
                      <form
                        onSubmit={handleCreateAddress}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Loại địa chỉ
                            </label>
                            <select
                              value={addAddressForm.type}
                              onChange={(e) =>
                                setAddAddressForm({
                                  ...addAddressForm,
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
                              value={addAddressForm.fullName}
                              onChange={(e) =>
                                setAddAddressForm({
                                  ...addAddressForm,
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
                              value={addAddressForm.phone}
                              onChange={(e) =>
                                setAddAddressForm({
                                  ...addAddressForm,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Địa chỉ (số nhà, tên đường...)
                            </label>
                            <input
                              type="text"
                              value={addAddressForm.address}
                              onChange={(e) => setAddAddressForm({ ...addAddressForm, address: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tỉnh/Thành phố
                            </label>
                              <Select
                                options={provinces.map((p: any) => ({ value: p.code, label: p.name }))}
                                isLoading={provinceLoading}
                              value={provinces.find((p: any) => p.code === addAddressForm.city) ? { value: addAddressForm.city, label: provinces.find((p: any) => p.code === addAddressForm.city)?.name } : null}
                                onChange={option => {
                                setAddAddressForm({ ...addAddressForm, city: option?.value || '', district: '', ward: '' });
                                }}
                                placeholder="Chọn tỉnh/thành phố..."
                                isClearable
                                classNamePrefix="react-select"
                                noOptionsMessage={() => "Không tìm thấy"}
                              />
                          </div>
                          {(() => {
                            const selectedProvince = provinces.find((p: any) => p.code === addAddressForm.city);
                            if (selectedProvince && centrallyGovernedCities.includes(selectedProvince.name)) {
                              return (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                                  <Select
                                    options={districts.map((d: any) => ({ value: d.code, label: d.name }))}
                                    isLoading={districtLoading}
                                    value={districts.find((d: any) => d.code === addAddressForm.district) ? { value: addAddressForm.district, label: districts.find((d: any) => d.code === addAddressForm.district)?.name } : null}
                                    onChange={option => setAddAddressForm({ ...addAddressForm, district: option?.value || '', ward: '' })}
                                    placeholder="Chọn quận/huyện..."
                                    isClearable
                                    isDisabled={!addAddressForm.city}
                                    classNamePrefix="react-select"
                                    noOptionsMessage={() => addAddressForm.city ? "Không tìm thấy" : "Chọn tỉnh/thành phố trước"}
                                  />
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Xã/Phường/Thị trấn</label>
                              <Select
                                options={wards.map((w: any) => ({ value: w.code, label: w.name }))}
                                isLoading={wardLoading}
                              value={wards.find((w: any) => w.code === addAddressForm.ward) ? { value: addAddressForm.ward, label: wards.find((w: any) => w.code === addAddressForm.ward)?.name } : null}
                                onChange={option => {
                                setAddAddressForm({ ...addAddressForm, ward: option?.value || '' });
                                }}
                                placeholder="Chọn xã/phường/thị trấn..."
                                isClearable
                                classNamePrefix="react-select"
                                noOptionsMessage={() => "Không tìm thấy"}
                              />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddAddressForm(false);
                              setAddAddressForm({
                                type: "home",
                                fullName: "",
                                phone: "",
                                address: "",
                                city: "",
                                district: "",
                                ward: "",
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
                            Thêm
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Edit Address Form */}
                  {showEditAddressForm && editingAddress && (
                    <div className="mb-6 p-6 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">
                        Chỉnh sửa địa chỉ
                      </h3>
                      <form
                        onSubmit={handleUpdateAddress}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Loại địa chỉ
                            </label>
                            <select
                              value={editAddressForm.type}
                              onChange={(e) =>
                                setEditAddressForm({
                                  ...editAddressForm,
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
                              value={editAddressForm.fullName}
                              onChange={(e) =>
                                setEditAddressForm({
                                  ...editAddressForm,
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
                              value={editAddressForm.phone}
                              onChange={(e) =>
                                setEditAddressForm({
                                  ...editAddressForm,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Địa chỉ (số nhà, tên đường...)
                            </label>
                            <input
                              type="text"
                              value={editAddressForm.address}
                              onChange={(e) => setEditAddressForm({ ...editAddressForm, address: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tỉnh/Thành phố
                            </label>
                            <Select
                              options={provinces.map((p: any) => ({ value: p.code, label: p.name }))}
                              isLoading={provinceLoading}
                              value={provinces.find((p: any) => p.code === editAddressForm.city) ? { value: editAddressForm.city, label: provinces.find((p: any) => p.code === editAddressForm.city)?.name } : null}
                              onChange={option => {
                                setEditAddressForm({ ...editAddressForm, city: option?.value || '', district: '', ward: '' });
                              }}
                              placeholder="Chọn tỉnh/thành phố..."
                              isClearable
                              classNamePrefix="react-select"
                              noOptionsMessage={() => "Không tìm thấy"}
                            />
                          </div>
                          {(() => {
                            const selectedProvince = provinces.find((p: any) => p.code === editAddressForm.city);
                            if (selectedProvince && centrallyGovernedCities.includes(selectedProvince.name)) {
                              return (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
                                  <Select
                                    options={districts.map((d: any) => ({ value: d.code, label: d.name }))}
                                    isLoading={districtLoading}
                                    value={districts.find((d: any) => d.code === editAddressForm.district) ? { value: editAddressForm.district, label: districts.find((d: any) => d.code === editAddressForm.district)?.name } : null}
                                    onChange={option => setEditAddressForm({ ...editAddressForm, district: option?.value || '', ward: '' })}
                                    placeholder="Chọn quận/huyện..."
                                    isClearable
                                    isDisabled={!editAddressForm.city}
                                    classNamePrefix="react-select"
                                    noOptionsMessage={() => editAddressForm.city ? "Không tìm thấy" : "Chọn tỉnh/thành phố trước"}
                                  />
                                </div>
                              );
                            }
                            return null;
                          })()}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Xã/Phường/Thị trấn</label>
                            <Select
                              options={wards.map((w: any) => ({ value: w.code, label: w.name }))}
                              isLoading={wardLoading}
                              value={wards.find((w: any) => w.code === editAddressForm.ward) ? { value: editAddressForm.ward, label: wards.find((w: any) => w.code === editAddressForm.ward)?.name } : null}
                              onChange={option => {
                                setEditAddressForm({ ...editAddressForm, ward: option?.value || '' });
                              }}
                              placeholder="Chọn xã/phường/thị trấn..."
                              isClearable
                              classNamePrefix="react-select"
                              noOptionsMessage={() => "Không tìm thấy"}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowEditAddressForm(false);
                              setEditingAddress(null);
                              setEditAddressForm({
                                type: "home",
                                fullName: "",
                                phone: "",
                                address: "",
                                city: "",
                                district: "",
                                ward: "",
                                postalCode: "",
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
                            Cập nhật
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
                                onClick={() => handleEditAddress(address)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              {!address.isDefault && (
                              <button
                                onClick={() => handleDeleteAddress(address._id)}
                                className="text-red-400 hover:text-red-600"
                                  title="Xóa địa chỉ"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                              )}
                              {address.isDefault && (
                                <span 
                                  className="text-gray-300 cursor-not-allowed" 
                                  title="Không thể xóa địa chỉ mặc định"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="font-medium">{address.fullName}</p>
                            <p className="text-gray-600">{address.phone}</p>
                            <p className="text-gray-600">{address.address}</p>
                            <p className="text-gray-600">
                              {/* Hiển thị tên tỉnh/thành, quận/huyện, phường/xã từ backend */}
                              {[address.wardName, address.districtName, address.cityName].filter(Boolean).join(", ")}
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
                            checked={notificationSettings.orderEmail}
                            onChange={e => setNotificationSettings(ns => ({ ...ns, orderEmail: e.target.checked }))}
                          />
                          <span>Thông báo email cho đơn hàng</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-3"
                            checked={notificationSettings.promotionEmail}
                            onChange={e => setNotificationSettings(ns => ({ ...ns, promotionEmail: e.target.checked }))}
                          />
                          <span>Email khuyến mãi</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-3"
                            checked={notificationSettings.sms}
                            onChange={e => setNotificationSettings(ns => ({ ...ns, sms: e.target.checked }))}
                          />
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
                            checked={privacySettings.shareHistory}
                            onChange={e => setPrivacySettings(ps => ({ ...ps, shareHistory: e.target.checked }))}
                          />
                          <span>Chia sẻ lịch sử mua hàng để gợi ý</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-3"
                            checked={privacySettings.thirdPartyAnalytics}
                            onChange={e => setPrivacySettings(ps => ({ ...ps, thirdPartyAnalytics: e.target.checked }))}
                          />
                          <span>Cho phép phân tích bên thứ ba</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveSettings}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={settingsLoading}
                      >
                        {settingsLoading ? 'Đang lưu...' : 'Lưu cài đặt'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === "password" && (
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg mx-auto">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Đổi mật khẩu</h2>
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu cũ</label>
                      <input
                        type="password"
                        value={passwordForm.oldPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === "payment" && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                    <span>Phương thức thanh toán</span>
                    <button
                      onClick={() => setShowAddPayment(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      Thêm mới
                    </button>
                  </h2>
                  {paymentLoading ? (
                    <div className="text-center py-8">Đang tải...</div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Chưa có phương thức thanh toán nào.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {paymentMethods.map((m, idx) => {
                        let icon = null;
                        let typeLabel = '';
                        let cardMeta = null;
                        if (m.type === 'credit_card') {
                          icon = <img src={cardList.find(c => c.code === m.provider)?.logo || '/images/cards/visa.png'} alt={m.provider} className="w-12 h-12 mr-4 object-contain" />;
                          typeLabel = 'Thẻ tín dụng';
                          cardMeta = cardList.find(c => c.code === m.provider);
                        } else if (m.type === 'e_wallet') {
                          const eWalletMeta = eWalletList.find(w => w.code === m.provider || w.name === m.provider);
                          icon = <img src={eWalletMeta?.logo || '/images/wallets/default.png'} alt={m.provider} className="w-12 h-12 mr-4 object-contain" />;
                          typeLabel = 'Ví điện tử';
                        } else {
                          const bankMeta = bankList.find(b => b.code === m.provider || b.name === m.provider);
                          icon = <img src={bankMeta?.logo || '/images/banks/default.png'} alt={m.provider} className="w-16 h-16 mr-4 object-contain" />;
                          typeLabel = 'Tài khoản ngân hàng';
                        }
                        return (
                          <div key={idx} className="flex items-center justify-between bg-white rounded-2xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition group relative">
                            <div className="flex items-center">
                              {icon}
                              <div>
                                <div className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                                  {typeLabel}
                                  {m.isDefault && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">Mặc định</span>}
                                </div>
                                <div className="text-gray-700 text-base">
                                  {m.type === 'credit_card' && cardMeta ? (
                                    <span className="font-semibold">{cardMeta.name} <span className="ml-2 text-gray-500">**** {m.last4}</span></span>
                                  ) : (
                                    <span>{m.provider} <span className="ml-2 text-gray-500">**** {m.last4}</span></span>
                                  )}
                                </div>
                                {m.expired && <div className="text-xs text-gray-400 mt-1">Hết hạn: {m.expired}</div>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleEditPaymentMethod(m)}
                                className="ml-2 p-2 rounded-full hover:bg-yellow-100 transition group"
                                title="Xem/Sửa phương thức thanh toán"
                              >
                                <svg className="w-6 h-6 text-yellow-500 group-hover:text-yellow-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" /></svg>
                              </button>
                            <button onClick={() => handleDeletePaymentMethod(m._id)}
                                className="ml-2 p-2 rounded-full hover:bg-red-100 transition group"
                              title="Xoá phương thức thanh toán"
                            >
                              <svg className="w-6 h-6 text-red-500 group-hover:text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Modal thêm phương thức thanh toán */}
                  {showAddPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-16 relative border border-gray-100">
                        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowAddPayment(false)}>&times;</button>
                        <h2 className="text-xl font-bold mb-6 text-center">Thêm phương thức thanh toán</h2>
                        <form onSubmit={handleAddPaymentMethod} className="space-y-5">
                          {/* Nút chọn loại phương thức (UI cũ) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại phương thức</label>
                            <div className="flex gap-3 mb-6">
                              <button type="button" onClick={() => setAddPaymentForm(f => ({ ...f, type: 'credit_card', provider: '' }))} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${addPaymentForm.type === 'credit_card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>
                                Thẻ tín dụng
                              </button>
                              <button type="button" onClick={() => setAddPaymentForm(f => ({ ...f, type: 'e_wallet', provider: '' }))} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${addPaymentForm.type === 'e_wallet' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="3"/><path d="M7 7V5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2"/></svg>
                                Ví điện tử
                              </button>
                              <button type="button" onClick={() => setAddPaymentForm(f => ({ ...f, type: 'bank_account', provider: '' }))} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${addPaymentForm.type === 'bank_account' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="3"/><path d="M6 7V5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2"/></svg>
                                Tài khoản ngân hàng
                              </button>
                            </div>
                          </div>
                          {/* Nếu là credit_card thì hiển thị dropdown loại thẻ ngay dưới các nút chọn phương thức */}
                          {addPaymentForm.type === 'credit_card' && (
                            <div className="mb-6">
                              <label className="block font-medium mb-2">Loại thẻ</label>
                              <Select
                                options={cardList.map(c => ({ value: c.code, label: c.name, logo: c.logo }))}
                                value={cardList.map(c => ({ value: c.code, label: c.name, logo: c.logo })).find(opt => opt.value === addPaymentForm.provider) || null}
                                onChange={option => setAddPaymentForm(f => ({ ...f, provider: option?.value || '' }))}
                                placeholder="Chọn loại thẻ..."
                                isClearable
                                classNamePrefix="react-select"
                                formatOptionLabel={option => (
                                  <div className="flex items-center gap-4">
                                    <img
                                      src={option.logo}
                                      alt="logo"
                                      className="w-12 h-12 object-contain"
                                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = ''; }}
                                    />
                                    <span className="text-lg font-medium text-gray-900">{option.label}</span>
                                  </div>
                                )}
                                styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                required
                              />
                            </div>
                          )}
                          {/* Dropdown nhà cung cấp/ngân hàng/ví sẽ nằm dưới loại thẻ */}
                          {addPaymentForm.type === 'bank_account' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Nhà cung cấp</label>
                              <Select
                                options={bankList.map((b: any) => ({ value: b.code, label: b.name, logo: getBankLogo(b) }))}
                                value={bankList.map((b: any) => ({ value: b.code, label: b.name, logo: getBankLogo(b) })).find(opt => opt.value === addPaymentForm.provider) || null}
                                onChange={option => setAddPaymentForm(f => ({ ...f, provider: option?.value || '' }))}
                                placeholder="Chọn ngân hàng..."
                                isClearable
                                classNamePrefix="react-select"
                                formatOptionLabel={option => (
                                  <div className="flex items-center gap-4">
                                    <img
                                      src={option.logo}
                                      alt="logo"
                                      className="w-12 h-12 object-contain"
                                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = option.fallbackLogo || ''; }}
                                    />
                                    <span className="text-lg font-medium text-gray-900">{option.label}</span>
                                  </div>
                                )}
                                styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                required
                              />
                            </div>
                          )}
                          {addPaymentForm.type === 'e_wallet' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Nhà cung cấp</label>
                              <Select
                                options={eWalletList.map(w => ({ value: w.name, label: w.name, logo: getEWalletLogo(w), fallbackLogo: w.logo || '' }))}
                                value={eWalletList.map(w => ({ value: w.name, label: w.name, logo: getEWalletLogo(w), fallbackLogo: w.logo || '' })).find(opt => opt.value === addPaymentForm.provider) || null}
                                onChange={option => setAddPaymentForm(f => ({ ...f, provider: option?.value || '' }))}
                                placeholder="Chọn ví điện tử..."
                                isClearable
                                classNamePrefix="react-select"
                                formatOptionLabel={option => (
                                  <div className="flex items-center gap-4">
                                    <img
                                      src={option.logo}
                                      alt="logo"
                                      className="w-12 h-12 object-contain"
                                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = option.fallbackLogo || ''; }}
                                    />
                                    <span className="text-lg font-medium text-gray-900">{option.label}</span>
                                  </div>
                                )}
                                styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                required
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">4 số cuối</label>
                            <input type="text" value={addPaymentForm.last4} onChange={e => setAddPaymentForm(f => ({ ...f, last4: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={4} required />
                          </div>
                          {addPaymentForm.type === 'credit_card' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Hết hạn (MM/YY)</label>
                              <input type="text" value={addPaymentForm.expired} onChange={e => setAddPaymentForm(f => ({ ...f, expired: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="MM/YY" />
                            </div>
                          )}
                          <div className="flex justify-end">
                            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow" disabled={addPaymentLoading}>
                              {addPaymentLoading ? 'Đang thêm...' : 'Thêm phương thức'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Activity Log Tab */}
              {activeTab === "activity" && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử hoạt động</h2>
                  {activityLoading ? (
                    <div className="text-center py-8">Đang tải...</div>
                  ) : activityLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Chưa có hoạt động nào.</div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {activityLogs.map((log, idx) => (
                        <li key={idx} className="py-3">
                          <div className="font-medium">{log.content}</div>
                          <div className="text-xs text-gray-500">{log.actorName ? `Thực hiện bởi: ${log.actorName}` : ''} {new Date(log.createdAt).toLocaleString('vi-VN')}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {/* Notification Tab */}
              {activeTab === "notification" && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Thông báo</h2>
                    <button onClick={handleMarkAllAsRead} className="text-blue-600 hover:underline">Đánh dấu tất cả đã đọc</button>
                  </div>
                  {notificationLoading ? (
                    <div className="text-center py-8">Đang tải...</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Không có thông báo nào.</div>
                  ) : (
                    <>
                      <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {paginatedNotifications.map((n, idx) => (
                          <li key={n._id || idx} className={`py-3 flex items-center justify-between ${n.isRead ? '' : 'bg-blue-50'}`}>
                            <div>
                              <div className="font-medium">{n.title}</div>
                              <div className="text-sm text-gray-600">{n.message}</div>
                              <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('vi-VN')}</div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {!n.isRead && <button onClick={() => handleMarkAsRead(n._id)} className="text-blue-600 hover:underline text-sm">Đánh dấu đã đọc</button>}
                              <button onClick={() => handleDeleteNotification(n._id)} className="text-red-600 hover:underline text-sm">Xoá</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      {/* Phân trang */}
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <button
                          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                          onClick={() => setNotificationPage(p => Math.max(1, p - 1))}
                          disabled={notificationPage === 1}
                        >
                          Trước
                        </button>
                        <span className="mx-2 text-sm">Trang {notificationPage} / {totalNotificationPages}</span>
                        <button
                          className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                          onClick={() => setNotificationPage(p => Math.min(totalNotificationPages, p + 1))}
                          disabled={notificationPage === totalNotificationPages}
                        >
                          Sau
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal chi tiết đơn hàng */}
      {showOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative">
            {/* Nút thoát thiết kế như ban đầu, chỉ to hơn */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-4 text-3xl font-bold"
              onClick={handleCloseOrderDetail}
              aria-label="Đóng"
            >
              &times;
            </button>
            <div className="max-h-[80vh] overflow-y-auto pr-2">
              {orderDetailLoading ? (
                <div className="flex items-center justify-center h-40">Đang tải...</div>
              ) : orderDetail ? (
                <div>
                  <h2 className="text-xl font-bold mb-2">Chi tiết đơn hàng #{orderDetail._id.slice(-6)}</h2>
                  <div className="mb-4 text-sm text-gray-600">Ngày đặt: {new Date(orderDetail.createdAt).toLocaleString('vi-VN')}</div>
                  <div className="mb-4">
                    <div className="font-semibold mb-1">Sản phẩm:</div>
                    <ul className="divide-y divide-gray-100">
                      {orderDetail.orderItems.map((item, idx) => (
                        <li key={idx} className="py-2 flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">x{item.quantity}</div>
                          </div>
                          <div className="font-semibold">{item.price.toLocaleString()}₫</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold mb-1">Địa chỉ giao hàng:</div>
                    <div>{orderDetail.shippingAddress.fullName} - {orderDetail.shippingAddress.phone}</div>
                    <div>{orderDetail.shippingAddress.address}, {orderDetail.shippingAddress.city}</div>
                  </div>
                  {/* Mapping trạng thái tiếng Việt */}
                  {(() => {
                    const statusMap: Record<string, string> = {
                      pending: "Chờ xác nhận",
                      confirmed: "Đã xác nhận",
                      processing: "Đang xử lý",
                      shipped: "Đang giao hàng",
                      delivered_success: "Giao hàng thành công",
                      delivered_failed: "Giao hàng thất bại",
                      completed: "Hoàn thành",
                      cancelled: "Đã hủy",
                      returned: "Hoàn hàng",
                      refund_requested: "Yêu cầu hoàn tiền",
                      refunded: "Hoàn tiền thành công",
                      paid_cod: "Đã thanh toán COD"
                    };
                    return (
                      <div className="mb-4">
                        <div className="font-semibold mb-1">Trạng thái đơn hàng:</div>
                        <div>{statusMap[orderDetail.status] || orderDetail.status}</div>
                        <div className="mt-2 text-xs text-gray-500">Lịch sử trạng thái:</div>
                        <ul className="text-xs text-gray-600 max-h-48 overflow-y-auto">
                          {paginatedOrderHistory.map((s, idx) => (
                            <li key={idx}>- {statusMap[s.status] || s.status} ({new Date(s.date).toLocaleString('vi-VN')}) {s.note && `- ${s.note}`}</li>
                          ))}
                        </ul>
                        {/* Phân trang lịch sử trạng thái */}
                        {totalOrderHistoryPages > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-2">
                            <button
                              className="px-2 py-1 rounded border text-xs disabled:opacity-50"
                              onClick={() => setOrderHistoryPage(p => Math.max(1, p - 1))}
                              disabled={orderHistoryPage === 1}
                            >
                              Trước
                            </button>
                            <span className="mx-1 text-xs">Trang {orderHistoryPage} / {totalOrderHistoryPages}</span>
                            <button
                              className="px-2 py-1 rounded border text-xs disabled:opacity-50"
                              onClick={() => setOrderHistoryPage(p => Math.min(totalOrderHistoryPages, p + 1))}
                              disabled={orderHistoryPage === totalOrderHistoryPages}
                            >
                              Sau
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div className="mb-4">
                    <div className="font-semibold mb-1">Phương thức thanh toán:</div>
                    <div>{orderDetail.paymentMethod}</div>
                    <div>Trạng thái thanh toán: <span className={orderDetail.isPaid ? 'text-green-600' : 'text-red-600'}>{orderDetail.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></div>
                  </div>
                  <div className="mb-2 font-bold text-right">Tổng cộng: <span className="text-red-600">{orderDetail.totalPrice.toLocaleString()}₫</span></div>
                </div>
              ) : (
                <div className="text-red-600">Không tìm thấy đơn hàng</div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal xác thực bảo mật khi thay đổi thông tin nhạy cảm */}
      {showSensitiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowSensitiveModal(false)}>&times;</button>
            <h2 className="text-lg font-bold mb-4">Xác thực mật khẩu</h2>
            <form onSubmit={handleSensitiveProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nhập mật khẩu để xác nhận thay đổi</label>
                <input
                  type="password"
                  value={sensitivePassword}
                  onChange={e => setSensitivePassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={sensitiveLoading}
                >
                  {sensitiveLoading ? 'Đang xác thực...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal xem/sửa phương thức thanh toán */}
      {showEditPayment && editPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-10 relative border border-gray-100">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowEditPayment(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-6 text-center">Xem/Sửa phương thức thanh toán</h2>
            <form onSubmit={handleUpdatePaymentMethod} className="space-y-5">
              {editPaymentForm.type === 'credit_card' && (
                <div className="flex flex-col items-center mb-4">
                  <img src={cardList.find(c => c.code === editPaymentForm.provider)?.logo || '/images/cards/visa.png'} alt={editPaymentForm.provider} className="w-20 h-20 object-contain mb-2" />
                  <div className="font-semibold text-lg mb-1">{cardList.find(c => c.code === editPaymentForm.provider)?.name || editPaymentForm.provider}</div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên chủ thẻ</label>
                <input type="text" value={editPaymentForm.name || ''} onChange={e => setEditPaymentForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">4 số cuối</label>
                <input type="text" value={editPaymentForm.last4 || ''} onChange={e => setEditPaymentForm(f => ({ ...f, last4: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" maxLength={4} required />
              </div>
              {editPaymentForm.type === 'credit_card' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hết hạn (MM/YY)</label>
                  <input type="text" value={editPaymentForm.expired || ''} onChange={e => setEditPaymentForm(f => ({ ...f, expired: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="MM/YY" />
                </div>
              )}
              <div className="flex justify-end">
                <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow" disabled={editPaymentLoading}>
                  {editPaymentLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal hủy đơn hàng */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={handleCloseCancelModal}>&times;</button>
            <h2 className="text-lg font-bold mb-4">Hủy đơn hàng</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Lý do hủy đơn hàng</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseCancelModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
                disabled={!cancelReason.trim()}
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal hoàn tiền */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={handleCloseRefundModal}>&times;</button>
            <h2 className="text-lg font-bold mb-4">Yêu cầu hoàn tiền</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Lý do yêu cầu hoàn tiền</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                rows={3}
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                placeholder="Nhập lý do hoàn tiền..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseRefundModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRefundOrder}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-60"
                disabled={!refundReason.trim()}
              >
                Xác nhận yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
