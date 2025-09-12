// Utility để hiển thị trạng thái đơn hàng rõ ràng hơn
export const getOrderStatusDisplay = (order) => {
    const { status, paymentStatus, isPaid, paymentMethod } = order;

    // ✅ CẬP NHẬT: Trạng thái đơn hàng với các trạng thái mới
    const statusMap = {
        draft: {
            label: 'Đang tạo',
            description: 'Đơn hàng đang được tạo',
            color: 'gray'
        },
        pending: {
            label: 'Chờ xác nhận',
            description: 'Đơn hàng đang chờ admin xác nhận',
            color: 'blue'
        },
        confirmed: {
            label: 'Đã xác nhận',
            description: 'Admin đã xác nhận đơn hàng',
            color: 'green'
        },
        processing: {
            label: 'Đang xử lý',
            description: 'Đơn hàng đang được đóng gói',
            color: 'orange'
        },
        shipped: {
            label: 'Đang giao hàng',
            description: 'Đơn hàng đang được vận chuyển',
            color: 'purple'
        },
        delivered_success: {
            label: 'Giao hàng thành công',
            description: 'Đơn hàng đã được giao thành công',
            color: 'green'
        },
        delivered_failed: {
            label: 'Giao hàng thất bại',
            description: 'Giao hàng không thành công',
            color: 'red'
        },
        partially_delivered: {
            label: 'Giao hàng một phần',
            description: 'Một phần đơn hàng đã được giao',
            color: 'orange'
        },
        returned: {
            label: 'Hoàn hàng',
            description: 'Đơn hàng đã được hoàn về',
            color: 'purple'
        },
        on_hold: {
            label: 'Tạm dừng',
            description: 'Đơn hàng tạm thời bị dừng xử lý',
            color: 'gray'
        },
        completed: {
            label: 'Hoàn thành',
            description: 'Đơn hàng đã hoàn thành',
            color: 'green'
        },
        cancelled: {
            label: 'Đã hủy',
            description: 'Đơn hàng đã bị hủy',
            color: 'red'
        },
        refund_requested: {
            label: 'Yêu cầu hoàn tiền',
            description: 'Đang xử lý yêu cầu hoàn tiền',
            color: 'orange'
        },
        refunded: {
            label: 'Đã hoàn tiền',
            description: 'Đã hoàn tiền cho khách hàng',
            color: 'blue'
        },
        payment_failed: {
            label: 'Thanh toán thất bại',
            description: 'Thanh toán không thành công',
            color: 'red'
        }
    };

    // ✅ CẬP NHẬT: Trạng thái thanh toán
    const paymentStatusMap = {
        pending: {
            label: 'Chờ thanh toán',
            description: 'Chưa thanh toán',
            color: 'gray'
        },
        awaiting_payment: {
            label: 'Chờ thanh toán online',
            description: 'Đang chờ thanh toán qua cổng thanh toán',
            color: 'orange'
        },
        paid: {
            label: 'Đã thanh toán',
            description: 'Thanh toán thành công',
            color: 'green'
        },
        failed: {
            label: 'Thanh toán thất bại',
            description: 'Thanh toán không thành công',
            color: 'red'
        },
        cancelled: {
            label: 'Đã hủy',
            description: 'Thanh toán đã bị hủy',
            color: 'red'
        }
    };

    // Lấy thông tin trạng thái
    const orderStatus = statusMap[status] || statusMap['draft'];
    const paymentStatusInfo = paymentStatusMap[paymentStatus] || paymentStatusMap['pending'];

    // ✅ CẬP NHẬT: Xử lý trường hợp đặc biệt
    let finalStatus = orderStatus;

    // Nếu đơn hàng đã thanh toán online thành công
    if (isPaid && paymentStatus === 'paid' && status === 'pending') {
        finalStatus = {
            label: 'Chờ xác nhận',
            description: 'Đã thanh toán thành công - Chờ admin xác nhận',
            color: 'blue'
        };
    }

    // Nếu đơn hàng đang chờ thanh toán online
    if (!isPaid && paymentStatus === 'awaiting_payment' && status === 'draft') {
        finalStatus = {
            label: 'Chờ thanh toán',
            description: `Đơn hàng đã được tạo - Chờ thanh toán qua ${paymentMethod}`,
            color: 'orange'
        };
    }

    // ✅ THÊM: Xử lý trường hợp giao hàng thất bại
    if (status === 'delivered_failed') {
        finalStatus = {
            label: 'Giao hàng thất bại',
            description: `Giao hàng không thành công (Lần thử: ${order.retryDeliveryCount || 0}/3)`,
            color: 'red'
        };
    }

    // ✅ THÊM: Xử lý trường hợp tạm dừng
    if (status === 'on_hold') {
        finalStatus = {
            label: 'Tạm dừng xử lý',
            description: 'Đơn hàng tạm thời bị dừng - Liên hệ admin để biết thêm chi tiết',
            color: 'gray'
        };
    }

    return {
        orderStatus: finalStatus,
        paymentStatus: paymentStatusInfo,
        isPaid,
        paymentMethod
    };
};

// ✅ THÊM: Hàm kiểm tra trạng thái có thể chuyển đổi
export const canTransitionTo = (currentStatus, targetStatus) => {
    const validTransitions = {
        draft: ["pending", "cancelled"],
        pending: ["confirmed", "cancelled", "on_hold"],
        confirmed: ["processing", "cancelled", "on_hold"],
        processing: ["shipped", "cancelled", "on_hold"],
        shipped: ["delivered_success", "delivered_failed", "partially_delivered"],
        delivered_success: ["completed", "returned"],
        delivered_failed: ["shipped", "cancelled"],
        partially_delivered: ["shipped", "delivered_success"],
        returned: ["refund_requested", "refunded"],
        on_hold: ["processing", "cancelled"],
        refund_requested: ["refunded", "delivered_success"],
        completed: [],
        cancelled: [],
        refunded: [],
        payment_failed: ["cancelled"],
    };

    return validTransitions[currentStatus]?.includes(targetStatus) || false;
};

// ✅ THÊM: Hàm lấy danh sách trạng thái có thể chuyển đổi
export const getAvailableTransitions = (currentStatus) => {
    const validTransitions = {
        draft: ["pending", "cancelled"],
        pending: ["confirmed", "cancelled", "on_hold"],
        confirmed: ["processing", "cancelled", "on_hold"],
        processing: ["shipped", "cancelled", "on_hold"],
        shipped: ["delivered_success", "delivered_failed", "partially_delivered"],
        delivered_success: ["completed", "returned"],
        delivered_failed: ["shipped", "cancelled"],
        partially_delivered: ["shipped", "delivered_success"],
        returned: ["refund_requested", "refunded"],
        on_hold: ["processing", "cancelled"],
        refund_requested: ["refunded", "delivered_success"],
        completed: [],
        cancelled: [],
        refunded: [],
        payment_failed: ["cancelled"],
    };

    return validTransitions[currentStatus] || [];
};

// Hàm để tạo message cho frontend
export const getOrderStatusMessage = (order) => {
    const statusInfo = getOrderStatusDisplay(order);

    return {
        title: statusInfo.orderStatus.label,
        description: statusInfo.orderStatus.description,
        paymentStatus: statusInfo.paymentStatus.label,
        paymentDescription: statusInfo.paymentStatus.description,
        color: statusInfo.orderStatus.color,
        isPaid: statusInfo.isPaid
    };
};
