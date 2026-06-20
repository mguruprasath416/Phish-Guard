const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send email verification link to the user
 * @param {string} toEmail - recipient email
 * @param {string} name - recipient name
 * @param {string} token - secure verification token
 */
const sendVerificationEmail = async (toEmail, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email/${token}`;
  const subject = '🔐 Verify Your Email – PhishGuard';
  const htmlContent = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f172a;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#14532d 0%,#16a34a 100%);padding:40px 32px;text-align:center;">
          <div style="font-size:52px;margin-bottom:12px;">🛡️</div>
          <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Verify Your Email</h1>
          <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;">PhishGuard Security Platform</p>
        </div>

        <!-- Body -->
        <div style="padding:40px 32px;background:#1e293b;">
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 8px;">Hi <strong style="color:#f1f5f9;">${name}</strong>,</p>
          <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 28px;">
            Welcome to PhishGuard! Click the button below to verify your email address and activate your account.
            This link will expire in <strong style="color:#4ade80;">24 hours</strong>.
          </p>

          <!-- CTA Button -->
          <div style="text-align:center;margin:0 0 32px;">
            <a href="${verifyUrl}"
               style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#14532d,#16a34a);
                      color:#fff;text-decoration:none;border-radius:10px;font-size:15px;
                      font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 20px rgba(22,163,74,0.4);">
              ✓ Verify My Email
            </a>
          </div>

          <!-- Fallback link -->
          <div style="background:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px;margin:0 0 24px;">
            <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Or copy this link into your browser:</p>
            <p style="color:#4ade80;font-size:12px;word-break:break-all;margin:0;">${verifyUrl}</p>
          </div>

          <p style="color:#475569;font-size:13px;line-height:1.6;margin:0;">
            If you didn't create a PhishGuard account, you can safely ignore this email. Never share this link with anyone.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#0f172a;padding:20px 32px;text-align:center;border-top:1px solid #1e293b;">
          <p style="color:#334155;font-size:12px;margin:0;">© 2026 PhishGuard Security Platform. All rights reserved.</p>
        </div>
      </div>
    `;

  if (process.env.BREVO_API_KEY) {
    console.log('Using Brevo API to send email...');
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'no-reply@phishguard.com';
    const senderName = 'PhishGuard Security';
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: name }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API failed: ${response.status} - ${errorText}`);
    }
    console.log('Email sent successfully via Brevo API');
  } else if (process.env.RESEND_API_KEY) {
    console.log('Using Resend API to send email...');
    // Free Resend account defaults to onboarding@resend.dev if custom domain is not verified
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `PhishGuard Security <${fromEmail}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API failed: ${response.status} - ${errorText}`);
    }
    console.log('Email sent successfully via Resend API');
  } else {
    console.log('Using Nodemailer (SMTP) to send email...');
    const transporter = createTransporter();
    const mailOptions = {
      from: `"PhishGuard Security" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent
    };
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Nodemailer');
  }
};

/**
 * Send resend verification email
 */
const sendResendEmail = async (toEmail, name, token) => {
  return sendVerificationEmail(toEmail, name, token);
};

module.exports = { sendVerificationEmail, sendResendEmail };
