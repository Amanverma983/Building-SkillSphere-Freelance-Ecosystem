const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP configs are mock/empty, log the email to console and succeed
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST.includes('mock') || !process.env.SMTP_USER || process.env.SMTP_USER.includes('mock')) {
    console.log('====== MOCK EMAIL SENT ======');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.message}`);
    console.log('==============================');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_EMAIL || 'noreply@skillsphere.com'}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
