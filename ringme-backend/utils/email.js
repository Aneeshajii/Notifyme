const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-production-secret-replace-me';

const sendVerificationEmail = async (user) => {
    const token = jwt.sign(
        { userId: user.id, email: user.email, type: 'email_verification' },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    const WEB_URL = process.env.WEB_URL && !process.env.WEB_URL.includes('localhost') ? process.env.WEB_URL : 'https://notifymehh.vercel.app';
    const verificationUrl = `${WEB_URL}/verify-email?token=${token}`;

    const htmlContent = `
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
    `;

    try {
        if (!process.env.SMTP_PASS) {
            console.log('[DEV MODE] Email verification link:', verificationUrl);
            return true;
        }
        
        // Fetch is built into Node.js 18+
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SMTP_PASS}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: process.env.SMTP_FROM || 'GetNotify <onboarding@resend.dev>',
                to: user.email,
                subject: 'Verify your GetNotify email address',
                html: htmlContent
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Resend API error: ${response.status} ${errorText}`);
        }
        
        return true;
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw error;
    }
};

const sendOTPEmail = async (email, otp) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0f172a;">Welcome to GetNotify!</h2>
            <p style="color: #334155; font-size: 16px;">Please enter the following 6-digit code to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f1f5f9; color: #0f172a; padding: 20px; border-radius: 6px; font-weight: bold; font-size: 32px; letter-spacing: 5px;">${otp}</div>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 15 minutes.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
    `;

    try {
        if (!process.env.SMTP_PASS) {
            console.log('[DEV MODE] Email OTP code:', otp);
            return true;
        }
        
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SMTP_PASS}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: process.env.SMTP_FROM || 'GetNotify <onboarding@resend.dev>',
                to: email,
                subject: 'Your GetNotify Verification Code',
                html: htmlContent
            })
        });
        
        if (!response.ok) {
            const errBody = await response.text();
            console.error('Failed to send OTP email via Resend API:', response.status, errBody);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

module.exports = { sendVerificationEmail, sendOTPEmail };
