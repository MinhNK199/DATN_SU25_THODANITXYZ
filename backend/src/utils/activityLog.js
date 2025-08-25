import ActivityLog from "../models/activityLog.js";

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

export const getMyActivityLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    // Lấy log mà user là đối tượng bị tác động hoặc là người thực hiện
    const logs = await ActivityLog.find({
      $or: [
        { userId: userId },
        { actorId: userId }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json({ logs });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

export const logActivity = async ({ content, userName, userId, actorName, actorId }) => {
  try {
    await ActivityLog.create({ content, userName, userId, actorName, actorId });
  } catch (err) {
    console.error("Lỗi ghi nhật ký hoạt động:", err.message);
  }
};
