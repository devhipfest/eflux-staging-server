require('dotenv').config()
const nodemailer = require('nodemailer')

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER, // Gmail address
      pass: process.env.SMTP_PASSWORD, // App Password (16 ký tự)
    },
  })
}

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"EV Charging Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Chào mừng đến với Nền tảng Sạc xe điện',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Chào mừng ${name}!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản trên nền tảng sạc xe điện của chúng tôi.</p>
          <p>Bạn có thể bắt đầu sử dụng dịch vụ để tìm và đặt chỗ sạc xe điện gần bạn.</p>
          <br>
          <p>Trân trọng,<br>Đội ngũ EV Charging Platform</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Welcome email sent to:', email)
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (email, name, paymentDetails) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"EV Charging Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Xác nhận thanh toán thành công',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thanh toán thành công!</h2>
          <p>Kính chào ${name},</p>
          <p>Giao dịch thanh toán của bạn đã được xử lý thành công.</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Số tiền:</strong> ${paymentDetails.amount} VND</p>
            <p><strong>Phương thức:</strong> ${paymentDetails.method}</p>
            <p><strong>Mã giao dịch:</strong> ${paymentDetails.transactionId}</p>
            <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
          </div>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          <br>
          <p>Trân trọng,<br>Đội ngũ EV Charging Platform</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Payment confirmation email sent to:', email)
  } catch (error) {
    console.error('Error sending payment confirmation email:', error)
  }
}

// Send station owner notification
const sendStationOwnerNotification = async (email, stationName, message) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"EV Charging Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thông báo từ Nền tảng Sạc xe điện',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thông báo cho trạm ${stationName}</h2>
          <p>${message}</p>
          <br>
          <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết.</p>
          <br>
          <p>Trân trọng,<br>Đội ngũ EV Charging Platform</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log('Station owner notification sent to:', email)
  } catch (error) {
    console.error('Error sending station owner notification:', error)
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPaymentConfirmationEmail,
  sendStationOwnerNotification,
}
