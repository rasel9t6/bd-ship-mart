import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  // Configure your email service
});

export async function sendVerificationEmail(
  email: string,
  verificationToken: string
) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <p>Click the link to verify your email:</p>
      <a href="${verificationLink}">Verify Email</a>
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
