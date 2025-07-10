import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email gửi đi
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App password)
  },
});

export const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
}; 