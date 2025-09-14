import { sendMail } from './mailer.js';

// Template email cho shipper
const createShipperEmailTemplate = (type, data) => {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Thông báo từ TECHTREND</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1890ff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .button { 
          display: inline-block; 
          padding: 10px 20px; 
          background: #1890ff; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 10px 0;
        }
        .order-info { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .status-active { color: #52c41a; font-weight: bold; }
        .status-suspended { color: #ff4d4f; font-weight: bold; }
        .status-inactive { color: #faad14; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 TECHTREND - Thông báo Shipper</h1>
        </div>
        <div class="content">
  `;

  let content = '';
  
  switch (type) {
    case 'account_approved':
      content = `
        <h2>🎉 Tài khoản của bạn đã được phê duyệt!</h2>
        <p>Xin chào <strong>${data.shipperName}</strong>,</p>
        <p>Tài khoản shipper của bạn đã được admin phê duyệt và kích hoạt thành công.</p>
        <p>Bạn có thể đăng nhập và bắt đầu nhận đơn hàng ngay bây giờ.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/shipper/login" class="button">
          Đăng nhập ngay
        </a>
      `;
      break;
      
    case 'account_suspended':
      content = `
        <h2>⚠️ Tài khoản của bạn đã bị tạm khóa</h2>
        <p>Xin chào <strong>${data.shipperName}</strong>,</p>
        <p>Tài khoản shipper của bạn đã bị tạm khóa bởi admin.</p>
        <p><strong>Lý do:</strong> ${data.reason || 'Vi phạm quy định'}</p>
        <p>Vui lòng liên hệ admin để được hỗ trợ.</p>
      `;
      break;
      
    case 'order_assigned':
      content = `
        <h2>📦 Bạn có đơn hàng mới!</h2>
        <p>Xin chào <strong>${data.shipperName}</strong>,</p>
        <p>Bạn vừa được phân công một đơn hàng mới:</p>
        <div class="order-info">
          <p><strong>Mã đơn hàng:</strong> ${data.orderId}</p>
          <p><strong>Khách hàng:</strong> ${data.customerName}</p>
          <p><strong>Số điện thoại:</strong> ${data.customerPhone}</p>
          <p><strong>Địa chỉ giao hàng:</strong> ${data.deliveryAddress}</p>
          <p><strong>Thời gian giao hàng dự kiến:</strong> ${data.estimatedDelivery}</p>
          <p><strong>Ghi chú:</strong> ${data.notes || 'Không có'}</p>
        </div>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/shipper/orders" class="button">
          Xem chi tiết đơn hàng
        </a>
      `;
      break;
      
    case 'order_cancelled':
      content = `
        <h2>❌ Đơn hàng đã bị hủy</h2>
        <p>Xin chào <strong>${data.shipperName}</strong>,</p>
        <p>Đơn hàng <strong>${data.orderId}</strong> đã bị hủy.</p>
        <p><strong>Lý do:</strong> ${data.reason || 'Khách hàng hủy đơn'}</p>
      `;
      break;
      
    case 'status_updated':
      content = `
        <h2>🔄 Trạng thái tài khoản đã được cập nhật</h2>
        <p>Xin chào <strong>${data.shipperName}</strong>,</p>
        <p>Trạng thái tài khoản của bạn đã được cập nhật:</p>
        <p class="status-${data.newStatus}">Trạng thái mới: ${getStatusText(data.newStatus)}</p>
        ${data.reason ? `<p><strong>Lý do:</strong> ${data.reason}</p>` : ''}
      `;
      break;
      
      
    case 'delivery_completed':
      content = `
        <h2>🎉 Giao hàng thành công!</h2>
        <p>Xin chào <strong>${data.shipperName}</strong>,</p>
        <p>Chúc mừng! Bạn đã giao hàng thành công đơn hàng:</p>
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p><strong>📦 Mã đơn hàng:</strong> #${data.orderId}</p>
          <p><strong>👤 Khách hàng:</strong> ${data.customerName}</p>
          <p><strong>📍 Địa chỉ giao:</strong> ${data.deliveryAddress}</p>
          <p><strong>💰 Tổng tiền:</strong> ${data.totalPrice}</p>
          <p><strong>⏰ Thời gian giao:</strong> ${data.deliveryTime}</p>
        </div>
        <p><strong>🎯 Cảm ơn bạn đã hoàn thành tốt công việc!</strong></p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/shipper/dashboard" class="button">
          Xem dashboard
        </a>
      `;
      break;
      
    case 'delivery_failed':
      content = `
        <h2>⚠️ Giao hàng thất bại</h2>
        <p>Xin chào <strong>${data.shipperName}</strong>,</p>
        <p>Đơn hàng sau đã giao thất bại:</p>
        <div style="background: #fef2f2; border: 1px solid #f87171; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p><strong>📦 Mã đơn hàng:</strong> #${data.orderId}</p>
          <p><strong>👤 Khách hàng:</strong> ${data.customerName}</p>
          <p><strong>📍 Địa chỉ giao:</strong> ${data.deliveryAddress}</p>
          <p><strong>❌ Lý do thất bại:</strong> ${data.failureReason}</p>
          <p><strong>🔄 Số lần giao lại:</strong> ${data.retryCount}/3</p>
          ${data.notes ? `<p><strong>📝 Ghi chú:</strong> ${data.notes}</p>` : ''}
        </div>
        <p><strong>💡 Lưu ý:</strong> Bạn có thể giao lại đơn hàng này. Vui lòng liên hệ khách hàng để sắp xếp thời gian giao hàng phù hợp.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/shipper/dashboard" class="button">
          Xem dashboard
        </a>
      `;
      break;
      
    case 'refund_completed':
      content = `
        <h2>💸 Hoàn tiền thành công</h2>
        <p>Xin chào <strong>${data.shipperName}</strong>,</p>
        <p>Đơn hàng mà bạn đã giao có yêu cầu hoàn tiền và đã được xử lý thành công:</p>
        <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p><strong>📦 Mã đơn hàng:</strong> #${data.orderId}</p>
          <p><strong>👤 Khách hàng:</strong> ${data.customerName}</p>
          <p><strong>💰 Số tiền hoàn:</strong> ${data.refundAmount}</p>
          <p><strong>📅 Ngày hoàn tiền:</strong> ${data.refundDate}</p>
          <p><strong>📝 Lý do:</strong> ${data.reason}</p>
        </div>
        <p><strong>ℹ️ Thông tin:</strong> Đơn hàng này đã được hoàn tiền thành công. Bạn không cần thực hiện thêm hành động nào.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/shipper/dashboard" class="button">
          Xem dashboard
        </a>
      `;
      break;
      
    default:
      content = `
        <h2>📢 Thông báo từ TECHTREND</h2>
        <p>Xin chào <strong>${data.shipperName}</strong>,</p>
        <p>${data.message || 'Bạn có thông báo mới từ hệ thống.'}</p>
      `;
  }

  const footer = `
        </div>
        <div class="footer">
          <p>© 2024 TECHTREND. Tất cả quyền được bảo lưu.</p>
          <p>Đây là email tự động, vui lòng không trả lời email này.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return baseTemplate + content + footer;
};

const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Hoạt động';
    case 'inactive': return 'Không hoạt động';
    case 'suspended': return 'Tạm khóa';
    default: return status;
  }
};

// Gửi thông báo cho shipper
export const sendShipperNotification = async (shipperEmail, type, data) => {
  try {
    const subject = getEmailSubject(type);
    const html = createShipperEmailTemplate(type, data);
    
    await sendMail({
      to: shipperEmail,
      subject,
      html
    });
    
    console.log(`✅ Email sent to shipper ${shipperEmail}: ${type}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to shipper ${shipperEmail}:`, error);
    return false;
  }
};

const getEmailSubject = (type) => {
  switch (type) {
    case 'delivery_completed':
      return '🎉 Giao hàng thành công - TECHTREND';
    case 'delivery_failed':
      return '⚠️ Giao hàng thất bại - TECHTREND';
    case 'refund_completed':
      return '💸 Hoàn tiền thành công - TECHTREND';
    case 'account_approved':
      return '🎉 Tài khoản shipper đã được phê duyệt - TECHTREND';
    case 'account_suspended':
      return '⚠️ Tài khoản shipper bị tạm khóa - TECHTREND';
    case 'order_assigned':
      return '📦 Bạn có đơn hàng mới - TECHTREND';
    case 'order_cancelled':
      return '❌ Đơn hàng đã bị hủy - TECHTREND';
    case 'status_updated':
      return '🔄 Trạng thái tài khoản đã cập nhật - TECHTREND';
    default:
      return '📢 Thông báo từ TECHTREND';
  }
};

// Gửi thông báo hàng loạt
export const sendBulkShipperNotification = async (shipperEmails, type, data) => {
  const results = await Promise.allSettled(
    shipperEmails.map(email => sendShipperNotification(email, type, data))
  );
  
  const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
  const failCount = results.length - successCount;
  
  console.log(`📧 Bulk notification sent: ${successCount} success, ${failCount} failed`);
  return { successCount, failCount };
};
