const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-production-secret-replace-me';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_PORT == '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendVerificationEmail = async (user) => {
    const token = jwt.sign(
        { userId: user.id, email: user.email, type: 'email_verification' },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
    const verificationUrl = `${WEB_URL}/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.SMTP_FROM || '"GetNotify" <noreply@getnotify.com>',
        to: user.email,
        subject: 'Verify your GetNotify email address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #0f172a;">Welcome to GetNotify!</h2>
                <p style="color: #334155; font-size: 16px;">Please verify your email address to unlock full access to GetNotify features.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
                </div>
                <p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="color: #64748b; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you didn't create this account, you can safely ignore this email.</p>
            </div>
        `
    };

    try {
        if (!process.env.SMTP_USER) {
            console.log('[DEV MODE] Email verification link:', verificationUrl);
            return true;
        }
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Failed to send verification email:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail };
