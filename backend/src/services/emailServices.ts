import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
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
}