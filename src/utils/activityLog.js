import ActivityLog from "../models/activityLog";

export const getActivityLogs = async (req, res) => {
  try {
    if (req.user.role !== "superadmin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được xem nhật ký hoạt động" });
    }

    const { from, to, type } = req.query;
    const query = {};

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    if (type) {
      const typeMap = {
        register: /đăng ký/i,
        login: /đăng nhập/i,
        check: /vai trò|phân quyền/i,
        unlock: /kích hoạt/i,
        lock: /vô hiệu hóa|khóa/i
      };
      if (typeMap[type]) {
        query.content = typeMap[type];
      }
    }

    const logs = await ActivityLog.find(query).sort({ createdAt: -1 });
    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

export const logActivity = async ({ content, userName, userId }) => {
  try {
    await ActivityLog.create({ content, userName, userId });
  } catch (err) {
    console.error("Lỗi ghi nhật ký hoạt động:", err.message);
  }
};