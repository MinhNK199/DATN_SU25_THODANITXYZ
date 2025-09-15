import { sendMail } from '../utils/mailer.js';

// Gửi email liên hệ từ client đến admin
export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ email không hợp lệ'
      });
    }

    // Tạo nội dung email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">📧 Tin nhắn liên hệ mới</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Từ trang web TechTrend Store</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">📋 Thông tin khách hàng</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Họ tên:</td>
                <td style="padding: 8px 0; color: #1f2937;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #1f2937;">
                  <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Chủ đề:</td>
                <td style="padding: 8px 0; color: #1f2937;">${subject}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">💬 Nội dung tin nhắn</h2>
            <div style="background-color: white; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              📅 Thời gian: ${new Date().toLocaleString('vi-VN', { 
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">
              🔗 Phản hồi trực tiếp: <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>Email này được gửi tự động từ hệ thống TechTrend Store</p>
        </div>
      </div>
    `;

    // Gửi email đến admin
    await sendMail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Email admin
      subject: `[LIÊN HỆ] ${subject} - ${name}`,
      html: emailHtml
    });

    // Gửi email xác nhận cho khách hàng
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">✅ Cảm ơn bạn đã liên hệ!</h1>
            <p style="color: #666; margin: 10px 0 0 0;">TechTrend Store</p>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #065f46; font-weight: 500;">
              Xin chào <strong>${name}</strong>,
            </p>
            <p style="margin: 10px 0 0 0; color: #065f46;">
              Cảm ơn bạn đã gửi tin nhắn liên hệ đến TechTrend Store. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.
            </p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">📋 Thông tin tin nhắn của bạn</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 100px;">Chủ đề:</td>
                <td style="padding: 8px 0; color: #1f2937;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Nội dung:</td>
                <td style="padding: 8px 0; color: #1f2937; white-space: pre-wrap;">${message}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0;">⏰ Thời gian phản hồi</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li>Tin nhắn thường: 24-48 giờ</li>
              <li>Tin nhắn khẩn cấp: 2-4 giờ</li>
              <li>Hotline: 1900-xxxx (24/7)</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              📅 Thời gian gửi: ${new Date().toLocaleString('vi-VN', { 
                timeZone: 'Asia/Ho_Chi_Minh',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>Email này được gửi tự động từ hệ thống TechTrend Store</p>
        </div>
      </div>
    `;

    // Gửi email xác nhận cho khách hàng
    await sendMail({
      to: email,
      subject: `[XÁC NHẬN] Cảm ơn bạn đã liên hệ - TechTrend Store`,
      html: confirmationHtml
    });

    res.json({
      success: true,
      message: 'Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.'
    });

  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.'
    });
  }
};
