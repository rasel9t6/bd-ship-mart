import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  verificationToken: string
) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your BD Shipmart Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a 
          href="${verificationLink}" 
          style="display: inline-block; background-color: #1a56db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;"
        >
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset',
    html: `
      <p>Click the link to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
    `,
  });
}
