// Utility để hiển thị trạng thái đơn hàng rõ ràng hơn
export const getOrderStatusDisplay = (order) => {
  const { status, paymentStatus, isPaid, paymentMethod } = order;
  
  // Trạng thái đơn hàng
  const statusMap = {
    'draft': {
      label: 'Đang tạo',
      description: 'Đơn hàng đang được tạo',
      color: 'gray'
    },
    'pending': {
      label: 'Chờ xác nhận',
      description: 'Đơn hàng đang chờ admin xác nhận',
      color: 'blue'
    },
    'confirmed': {
      label: 'Đã xác nhận',
      description: 'Admin đã xác nhận đơn hàng',
      color: 'green'
    },
    'processing': {
      label: 'Đang xử lý',
      description: 'Đơn hàng đang được đóng gói',
      color: 'orange'
    },
    'shipped': {
      label: 'Đang giao hàng',
      description: 'Đơn hàng đang được vận chuyển',
      color: 'purple'
    },
    'delivered_success': {
      label: 'Giao hàng thành công',
      description: 'Đơn hàng đã được giao thành công',
      color: 'green'
    },
    'delivered_failed': {
      label: 'Giao hàng thất bại',
      description: 'Giao hàng không thành công',
      color: 'red'
    },
    'completed': {
      label: 'Hoàn thành',
      description: 'Đơn hàng đã hoàn thành',
      color: 'green'
    },
    'cancelled': {
      label: 'Đã hủy',
      description: 'Đơn hàng đã bị hủy',
      color: 'red'
    },
    'refund_requested': {
      label: 'Yêu cầu hoàn tiền',
      description: 'Đang xử lý yêu cầu hoàn tiền',
      color: 'orange'
    },
    'refunded': {
      label: 'Đã hoàn tiền',
      description: 'Đã hoàn tiền cho khách hàng',
      color: 'blue'
    },
    'payment_failed': {
      label: 'Thanh toán thất bại',
      description: 'Thanh toán không thành công',
      color: 'red'
    }
  };

  // Trạng thái thanh toán
  const paymentStatusMap = {
    'pending': {
      label: 'Chờ thanh toán',
      description: 'Chưa thanh toán',
      color: 'gray'
    },
    'awaiting_payment': {
      label: 'Chờ thanh toán online',
      description: 'Đang chờ thanh toán qua cổng thanh toán',
      color: 'orange'
    },
    'paid': {
      label: 'Đã thanh toán',
      description: 'Thanh toán thành công',
      color: 'green'
    },
    'failed': {
      label: 'Thanh toán thất bại',
      description: 'Thanh toán không thành công',
      color: 'red'
    },
    'cancelled': {
      label: 'Đã hủy',
      description: 'Thanh toán đã bị hủy',
      color: 'red'
    }
  };

  // Lấy thông tin trạng thái
  const orderStatus = statusMap[status] || statusMap['draft'];
  const paymentStatusInfo = paymentStatusMap[paymentStatus] || paymentStatusMap['pending'];

  // Xử lý trường hợp đặc biệt
  let finalStatus = orderStatus;
  let finalDescription = orderStatus.description;

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

  return {
    orderStatus: finalStatus,
    paymentStatus: paymentStatusInfo,
    isPaid,
    paymentMethod
  };
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
