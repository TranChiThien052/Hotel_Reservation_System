import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import bookingServiceServices from './bookingServiceServices';
import { ValidationError } from '../middlewares/validateData';

let transporter: Transporter;

export const getTransporter = () => {
  console.log(process.env.SMTP_PORT);
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      family: 4,
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("❌ SMTP connection failed:", error.message);
      } else {
        console.log("✅ SMTP server is ready to send emails");
      }
    });
  }
  return transporter;
}

interface SendEmailOption {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options) => {
  const t = getTransporter();
  await t.sendMail({
    from: `"${process.env.APP_NAME}" <${process.env.FROM_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text ?? options.html.replace(/<[^>]*>/g, ''),
  });
}

export const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  try {
    await sendEmail({
      to,
      subject: `[${process.env.APP_NAME}] Đặt lại mật khẩu`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#333">
          <h2 style="color:#4F46E5">Đặt lại mật khẩu</h2>
          <p>Xin chào <strong>${name}</strong>,</p>
          <p>Nhấn nút bên dưới để đặt lại mật khẩu. Link có hiệu lực trong <strong>30 phút</strong>.</p>
          <div style="margin:28px 0">
            <a href="${resetUrl}"
               style="background:#4F46E5;color:#fff;padding:12px 24px;
                      border-radius:6px;text-decoration:none;font-size:15px">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="color:#999;font-size:13px">
            Nếu bạn không yêu cầu, hãy bỏ qua email này.<br/>
            Link: <a href="${resetUrl}">${resetUrl}</a>
          </p>
        </div>
      `,
    });
  } catch (error: any) {
    console.log(error.message);
    throw new ValidationError('500', 'Failed to send password reset email: ' + error.message);
  }
}

export const sendConfirmBookingEmail = async (to, name, booking) => {
  const bookingServices = await bookingServiceServices.getBookingServicesByBookingId(booking.id);
  const total_amount_services = (await bookingServiceServices.calculateBookingServicesByBookingId(booking.id)).total_amount;
  const bookingServicesHtml = renderBookingServicesHtml(bookingServices);
  await sendEmail({
    to,
    subject: `[${process.env.APP_NAME}] Xác nhận đặt phòng thành công`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#333">
      <h2 style="color:#4F46E5">Xác nhận đặt phòng thành công</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Cảm ơn bạn đã đặt phòng tại khách sạn của chúng tôi! Đơn đặt phòng của bạn đã được xác nhận thành công.</p>
      <h3>Thông tin đặt phòng</h3>
      <div style="background:#F9FAFB;border-radius:8px;padding:16px 20px;margin:20px 0">
        <p style="margin:4px 0"><strong>Mã đơn đặt phòng: #${booking.booking_code.toUpperCase()}</strong></p>
        <p style="margin:4px 0"><strong>Ngày nhận phòng dự kiến:</strong> ${formatDateVN(booking.checkin_at)}</p>
        <p style="margin:4px 0"><strong>Ngày trả phòng dự kiến:</strong> ${formatDateVN(booking.checkout_at)}</p>
        <p style="margin:4px 0"><strong>Tổng tiền phòng dự kiến:</strong> ${formatCurrency(booking.total_amount)}</p>
      </div>
      <h3>Dịch vụ đi kèm</h3>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="border-bottom:2px solid #E5E7EB;text-align:left">
            <th style="padding:8px 0;font-size:14px;color:#666">Dịch vụ</th>
            <th style="padding:8px 0;font-size:14px;color:#666;text-align:right">Đơn giá</th>
            <th style="padding:8px 0;font-size:14px;color:#666;text-align:center">SL</th>
            <th style="padding:8px 0;font-size:14px;color:#666;text-align:right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${bookingServicesHtml}
        </tbody>
      </table>

      <div style="background:#F9FAFB;border-radius:8px;padding:16px 20px;margin:20px 0">
        <p style="margin:4px 0"><strong>Tổng tiền dự kiến:</strong> ${formatCurrency(Number(total_amount_services) + Number(booking.total_amount))}</p>
      </div>

      <p style="font-size:13px;color:#999">Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
    </div>
    `,
  });
}

function formatDateVN(dateInput) {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '0 đ';

  const formatted = Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formatted} đ`;
}

function renderBookingServicesHtml(services) {
  return services
    .map((service) => {
      const total = service.unit_price * service.quantity;
      return `
      <tr style="border-bottom:1px solid #F3F4F6">
        <td style="padding:10px 0;font-size:14px">${service.services.name}</td>
        <td style="padding:10px 0;font-size:14px;text-align:right">${formatCurrency(service.unit_price)}</td>
        <td style="padding:10px 0;font-size:14px;text-align:center">${service.quantity}</td>
        <td style="padding:10px 0;font-size:14px;text-align:right;font-weight:600">${formatCurrency(total)}</td>
      </tr>`;
    })
    .join('');
}
