import PaymentMethod from "../models/PaymentMethod.js";

// Lấy danh sách phương thức thanh toán của user
export const getMyPaymentMethods = async (req, res) => {
  try {
    const userId = req.user._id;
    const methods = await PaymentMethod.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ methods });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// Thêm phương thức thanh toán mới
export const addPaymentMethod = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, provider, last4, expired, token } = req.body;
    if (!type || !provider || !last4) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    const method = await PaymentMethod.create({ userId, type, provider, last4, expired, token });
    res.status(201).json({ method });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// Xoá phương thức thanh toán
export const deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const method = await PaymentMethod.findOneAndDelete({ _id: id, userId });
    if (!method) {
      return res.status(404).json({ message: "Không tìm thấy phương thức thanh toán" });
    }
    res.status(200).json({ message: "Đã xoá phương thức thanh toán" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// Cập nhật phương thức thanh toán
export const updatePaymentMethod = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { name, last4, expired } = req.body;
    const method = await PaymentMethod.findOneAndUpdate(
      { _id: id, userId },
      { name, last4, expired },
      { new: true }
    );
    if (!method) {
      return res.status(404).json({ message: "Không tìm thấy phương thức thanh toán" });
    }
    res.status(200).json({ method });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
}; 