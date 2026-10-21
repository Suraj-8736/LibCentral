const nodemailer = require('nodemailer');

/**
 * Send Email utility with robust support for Gmail SMTP and console fallback
 * @param {Object} options - { to, subject, html, text, otp, type }
 */
const sendEmail = async (options) => {
  const { to, subject, html, text, otp } = options;

  console.log(`\n======================================================`);
  console.log(`📧 [EMAIL OTP DISPATCH]`);
  console.log(`📬 Recipient: ${to}`);
  console.log(`🔑 Verification OTP: ${otp || 'N/A'}`);
  console.log(`⏰ Valid for: 10 Minutes`);
  console.log(`======================================================\n`);

  // Check if SMTP credentials are configured in .env
  const rawEmailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const rawEmailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!rawEmailUser || !rawEmailPass) {
    console.log('ℹ️ Gmail/SMTP credentials not configured in backend/.env');
    console.log('👉 To send real emails: add EMAIL_USER and EMAIL_PASS (Google App Password) to backend/.env');
    console.log(`👉 OTP for [${to}] is logged above in terminal for instant testing.`);
    return {
      success: true,
      delivered: false,
      mode: 'console_logged',
    };
  }

  const emailUser = rawEmailUser.trim();
  // Strip any accidental spaces from Google 16-character App Passwords (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const emailPass = rawEmailPass.replace(/\s+/g, '');

  try {
    let transporter;

    // Use Gmail service if configured or if domain is gmail.com
    if (process.env.EMAIL_SERVICE === 'gmail' || emailUser.endsWith('@gmail.com') || !process.env.EMAIL_HOST) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    const senderName = process.env.EMAIL_FROM_NAME || 'LibCentral Academic Library';
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"${senderName}" <${emailUser}>`,
      to,
      subject,
      text: text || `Your LibCentral verification OTP is: ${otp}. This code is valid for 10 minutes.`,
      html,
    });

    console.log('✅ Email successfully delivered to Gmail inbox! Message ID:', info.messageId);
    return {
      success: true,
      delivered: true,
      messageId: info.messageId,
    };
  } catch (err) {
    console.error('⚠️ SMTP Delivery Failed:', err.message);
    console.log('👉 If using Gmail: ensure 2-Step Verification is enabled and you generated an App Password.');
    console.log(`👉 In development, use the OTP printed above in the terminal.`);
    return {
      success: true,
      delivered: false,
      error: err.message,
    };
  }
};

/**
 * Generate formatted HTML template for OTP verification
 * @param {string} otp
 * @param {string} userName
 * @param {string} type - 'reset' or 'login'
 */
const generateOtpHtml = (otp, userName = 'Scholar', type = 'reset') => {
  const isLogin = type === 'login';
  const title = isLogin ? 'Instant Sign In OTP' : 'Password Reset OTP';
  const actionText = isLogin
    ? 'Use the 6-digit One-Time Password (OTP) below to securely sign in to your LibCentral account without a password.'
    : 'We received a request to reset the password for your LibCentral library account. Use the 6-digit One-Time Password (OTP) below to proceed.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - LibCentral</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .otp-box { background: #f1f5f9; border: 2px dashed #6366f1; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 12px; text-transform: uppercase; font-weight: 700; color: #6366f1; letter-spacing: 1px; margin-bottom: 8px; }
    .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1e1b4b; font-family: monospace; }
    .otp-expiry { font-size: 12px; color: #64748b; margin-top: 8px; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; font-size: 12px; color: #92400e; margin-bottom: 24px; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LibCentral Academic Library</h1>
      <p>Institutional Security & Verification Service</p>
    </div>
    <div class="body">
      <div class="greeting">Hello, ${userName}</div>
      <div class="text">
        ${actionText}
      </div>
      
      <div class="otp-box">
        <div class="otp-label">Your 6-Digit Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">⏳ Valid for the next 10 minutes only</div>
      </div>

      <div class="warning">
        <strong>⚠️ Security Advisory:</strong> Never share this OTP with anyone. Library staff will never ask for your password or verification OTP.
      </div>

      <div class="text" style="margin-bottom: 0; font-size: 13px;">
        If you did not request this OTP, you can safely ignore this email. Your account remains secure.
      </div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} LibCentral Academic Library System. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = {
  sendEmail,
  generateOtpHtml,
};
