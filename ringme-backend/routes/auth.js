const express = require('express');
const axios = require('axios');
const router = express.Router();
const prisma = require('../prismaClient');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const { JWT_SECRET, verifyToken, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

// Setup Multer for Profile Picture Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: Images Only (jpeg, jpg, png, webp)!'));
        }
    }
});

// Helper to create tokens
const generateTokens = (user) => {
    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' }); // 15 min access
    const refreshToken = crypto.randomBytes(40).toString('hex'); // simple secure random string
    return { accessToken, refreshToken };
};

// POST /api/auth/register
// Registers a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, googleId, phone } = req.body;
    
    // Check if user exists
    let user = await prisma.user.findUnique({ 
        where: { email },
        include: { subscription: true }
    });
    if (user) {
      const tokens = generateTokens(user);
      return res.status(400).json({ message: 'User already exists', user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    }

    let hashedPassword = null;
    if (password) {
        hashedPassword = await argon2.hash(password);
    }

    // Find default Basic plan
    let basicPlan = await prisma.subscriptionPlan.findFirst({
        where: { name: { contains: 'Basic' }, isActive: true }
    });
    // Fallback to the cheapest plan if no Basic plan exists
    if (!basicPlan) {
        basicPlan = await prisma.subscriptionPlan.findFirst({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
    }

    // Create new user
    user = await prisma.user.create({
      data: { 
          email, 
          name, 
          password: hashedPassword, 
          googleId, 
          phone,
          isPremium: false,
          subscriptionId: basicPlan ? basicPlan.id : null,
          premiumGrantType: basicPlan ? basicPlan.name : null
      },
      include: { subscription: true }
    });
    
    const tokens = generateTokens(user);
    
    await prisma.auditLog.create({
      data: {
          adminId: user.id,
          action: 'ACCOUNT_CREATED',
          entityId: user.id,
          ipAddress: req.ip || req.connection.remoteAddress
      }
    });

    res.status(201).json({ message: 'User created successfully', user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, deviceInfo } = req.body;
        
        const user = await prisma.user.findUnique({ 
            where: { email },
            include: { subscription: true }
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Account suspended. Contact support.' });
        }
        if (password) {
            if (!user.password) {
                return res.status(401).json({ message: 'Please sign in with Google or reset password.' });
            }
            const isValid = await argon2.verify(user.password, password);
            if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

            if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked' });

            // Check if MFA is enabled
            if (user.mfaEnabled) {
                // Generate a temporary JWT for the MFA verification step
                const mfaTempToken = jwt.sign(
                    { id: user.id, role: user.role, mfaPending: true },
                    JWT_SECRET,
                    { expiresIn: '5m' }
                );
                return res.status(200).json({
                    message: 'MFA required',
                    mfaRequired: true,
                    mfaTempToken
                });
            }
        } else {
             // Future: Apple/Google Login validation can go here
        }

        const { accessToken, refreshToken } = generateTokens(user);
        
        // Save refresh token as a Session
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await prisma.session.create({
            data: {
                userId: user.id,
                token: refreshToken,
                deviceInfo: deviceInfo || req.headers['user-agent'] || 'Unknown Device',
                ipAddress: req.ip || req.connection.remoteAddress,
                expiresAt
            }
        });
        
        await prisma.notification.create({
            data: {
                userId: user.id,
                title: 'New Login Alert',
                message: `Your account was accessed from a new device (${deviceInfo || req.headers['user-agent']}) on IP ${req.ip || req.connection.remoteAddress}.`,
                type: 'security'
            }
        });

        await prisma.auditLog.create({
            data: {
                adminId: user.id,
                action: 'USER_LOGIN',
                entityId: user.id,
                ipAddress: req.ip || req.connection.remoteAddress
            }
        });

        res.json({ message: 'Login successful', accessToken, refreshToken, user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/onboard
router.post('/onboard', verifyToken, async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        
        if (!firstName || !lastName) {
            return res.status(400).json({ error: 'First name and last name are required.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: firstName,
                lastName: lastName,
                phone: phone || null,
                isOnboarded: true
            }
        });

        res.json({ message: 'Onboarding completed successfully', user: updatedUser });
    } catch (error) {
        console.error("Onboarding Error:", error);
        res.status(500).json({ error: 'Failed to save onboarding details.' });
    }
});

// ==========================================
// MFA (Multi-Factor Authentication) Routes
// ==========================================

// POST /api/auth/mfa/setup
router.post('/mfa/setup', verifyToken, async (req, res) => {
    try {
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(req.user.email, 'NotifyMe Admin', secret);
        
        const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
        
        // Save secret temporarily (or update user but don't enable yet)
        await prisma.user.update({
            where: { id: req.user.id },
            data: { mfaSecret: secret }
        });

        res.json({ qrCodeDataUrl, secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/mfa/verify-setup
router.post('/mfa/verify-setup', verifyToken, async (req, res) => {
    try {
        const { token } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        
        if (!user || !user.mfaSecret) return res.status(400).json({ message: 'MFA not initiated' });

        const isValid = authenticator.verify({ token, secret: user.mfaSecret });
        if (!isValid) return res.status(401).json({ message: 'Invalid MFA token' });

        await prisma.user.update({
            where: { id: user.id },
            data: { mfaEnabled: true }
        });

        res.json({ message: 'MFA enabled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/login/verify-mfa
router.post('/login/verify-mfa', async (req, res) => {
    try {
        const { mfaTempToken, token } = req.body;
        if (!mfaTempToken || !token) return res.status(400).json({ message: 'Missing token or temp token' });

        const decoded = jwt.verify(mfaTempToken, JWT_SECRET);
        if (!decoded.mfaPending) return res.status(401).json({ message: 'Invalid temp token' });

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user || !user.mfaSecret) return res.status(400).json({ message: 'User not found or MFA not setup' });

        const isValid = authenticator.verify({ token, secret: user.mfaSecret });
        if (!isValid) return res.status(401).json({ message: 'Invalid MFA token' });

        const tokens = generateTokens(user);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        await prisma.session.create({
            data: { 
                userId: user.id, 
                token: tokens.refreshToken, 
                ipAddress: req.ip || req.connection.remoteAddress, 
                deviceInfo: req.headers['user-agent'],
                expiresAt
            }
        });
        
        await prisma.notification.create({
            data: {
                userId: user.id,
                title: 'MFA Login Alert',
                message: `Your account was accessed via MFA from a new device (${req.headers['user-agent']}) on IP ${req.ip || req.connection.remoteAddress}.`,
                type: 'security'
            }
        });

        await prisma.auditLog.create({
            data: {
                adminId: user.id,
                action: 'USER_LOGIN_MFA',
                entityId: user.id,
                ipAddress: req.ip || req.connection.remoteAddress
            }
        });

        res.json({ message: 'Login successful', ...tokens, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// Social Authentication Scaffolding Routes
// ==========================================

// POST /api/auth/google/verify
router.post('/google/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Missing token' });

        // Use the access token to fetch user profile from Google
        const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });

        const { email, name, sub: googleId } = googleRes.data;

        if (!email) {
            return res.status(400).json({ message: 'Invalid Google token' });
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true }
        });

        if (!user) {
            // Find default Basic plan
            let basicPlan = await prisma.subscriptionPlan.findFirst({
                where: { name: { contains: 'Basic' }, isActive: true }
            });
            if (!basicPlan) {
                basicPlan = await prisma.subscriptionPlan.findFirst({
                    where: { isActive: true },
                    orderBy: { price: 'asc' }
                });
            }

            // Register new user
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    googleId,
                    isPremium: false,
                    subscriptionId: basicPlan ? basicPlan.id : null,
                    premiumGrantType: basicPlan ? basicPlan.name : null
                },
                include: { subscription: true }
            });
        } else if (!user.googleId) {
            // Link google account to existing user
            user = await prisma.user.update({
                where: { email },
                data: { googleId },
                include: { subscription: true }
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Account suspended. Contact support.' });
        }

        const tokens = generateTokens(user);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await prisma.session.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                deviceInfo: req.headers['user-agent'] || 'Unknown Device via Google Auth',
                ipAddress: req.ip || req.connection.remoteAddress,
                expiresAt
            }
        });

        await prisma.auditLog.create({
            data: {
                adminId: user.id,
                action: 'USER_LOGIN_GOOGLE',
                entityId: user.id,
                ipAddress: req.ip || req.connection.remoteAddress
            }
        });

        res.json({ message: 'Google login successful', user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ error: error.message || 'Google authentication failed' });
    }
});

router.post('/google/callback', async (req, res) => {
    res.json({ message: 'Google OAuth callback hit (Scaffolding)' });
});

router.get('/apple', (req, res) => {
    res.json({ message: 'Apple OAuth flow started (Scaffolding)' });
});

router.post('/apple/callback', async (req, res) => {
    res.json({ message: 'Apple OAuth callback hit (Scaffolding)' });
});

router.post('/phone/request-otp', (req, res) => {
    res.json({ message: 'OTP request sent (Scaffolding)' });
});

router.post('/phone/verify-otp', (req, res) => {
    res.json({ message: 'OTP verified (Scaffolding)' });
});

// POST /api/auth/logout
router.post('/logout', verifyToken, async (req, res) => {
    try {
        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'USER_LOGOUT',
                entityId: req.user.id,
                ipAddress: req.ip || req.connection.remoteAddress
            }
        });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/me
// Returns the currently logged in user profile
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { subscription: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// Advanced Session & Device Management
// ==========================================

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });

        const session = await prisma.session.findUnique({ where: { token: refreshToken }, include: { user: true } });
        if (!session || session.expiresAt < new Date()) {
            return res.status(401).json({ message: 'Session expired or invalid' });
        }

        // Token Rotation: Issue new tokens and delete the old session
        const tokens = generateTokens(session.user);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.session.delete({ where: { id: session.id } });
        await prisma.session.create({
            data: {
                userId: session.user.id,
                token: tokens.refreshToken,
                deviceInfo: req.headers['user-agent'],
                ipAddress: req.ip || req.connection.remoteAddress,
                expiresAt
            }
        });

        res.json({ message: 'Token refreshed successfully', ...tokens });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/sessions
router.get('/sessions', verifyToken, async (req, res) => {
    try {
        const sessions = await prisma.session.findMany({ where: { userId: req.user.id } });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/auth/sessions/:sessionId
router.delete('/sessions/:sessionId', verifyToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        if (!session || session.userId !== req.user.id) {
            return res.status(404).json({ message: 'Session not found' });
        }
        await prisma.session.delete({ where: { id: sessionId } });
        res.json({ message: 'Session terminated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/auth/sessions/all
router.delete('/sessions/all', verifyToken, async (req, res) => {
    try {
        // Delete all except the current one? The prompt says "revoke all sessions" or log out everywhere.
        // If we want to keep current, we need the token. For now, delete all.
        await prisma.session.deleteMany({ where: { userId: req.user.id } });
        res.json({ message: 'All sessions terminated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/users
// (Admin Route) Get all users for the Master Admin Panel
router.get('/users', verifyToken, requireRole('MASTER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    let users = await prisma.user.findMany();
    
    // Check for expired free premiums and auto-revoke
    const now = new Date();
    let madeChanges = false;
    for (const u of users) {
        if (u.isPremium && u.premiumExpiresAt && new Date(u.premiumExpiresAt) < now) {
            await prisma.user.update({
                where: { id: u.id },
                data: { isPremium: false, premiumGrantType: null, premiumExpiresAt: null }
            });
            madeChanges = true;
            // Optionally log auto-revoke? Not strictly an admin action.
        }
    }
    
    if (madeChanges) {
        users = await prisma.user.findMany();
    }
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile/:id
// Update user profile fields
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, lastName, email, phone, address, pincode, city, state } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, lastName, email, phone, address, pincode, city, state }
    });
    
    const io = req.app.get('io');
    if (io) io.to(`user-room-${req.params.id}`).emit('account-updated');

    await prisma.auditLog.create({
        data: {
            adminId: req.params.id,
            action: 'PROFILE_UPDATED',
            entityId: req.params.id,
            ipAddress: req.ip || req.connection.remoteAddress
        }
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', verifyToken, async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;
    
    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins
    
    // Upsert to invalidate old OTPs for this phone
    // Actually, create many or findFirst is better for simplicity. Let's just create.
    await prisma.otpVerification.create({
      data: {
        userId,
        phone,
        otp,
        expiresAt
      }
    });

    console.log(`[MOCK SMS] Sent OTP ${otp} to ${phone}`);
    res.json({ message: 'OTP sent successfully (check backend console)' });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyToken, async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    const verification = await prisma.otpVerification.findFirst({
      where: {
        userId: req.user.id,
        phone,
        otp,
        expiresAt: { gt: new Date() } // Not expired
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    let updateData = { phone, phoneVerified: true };
    
    // If there's a pending subscription, activate it!
    if (user.pendingSubscriptionId) {
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: user.pendingSubscriptionId } });
        if (plan) {
            const isGold = plan.name.toLowerCase().includes('gold');
            updateData.isPremium = isGold;
            updateData.subscriptionId = plan.id;
            updateData.premiumGrantType = plan.name;
            updateData.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            updateData.pendingSubscriptionId = null;
        }
    }

    // Mark user phone as verified by updating the user record and activate plan
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: { subscription: true }
    });

    // Notify user room of update
    const io = req.app.get('io');
    if (io) io.to(`user-room-${req.user.id}`).emit('account-updated');

    res.json({ message: 'Phone verified and subscription activated successfully', user: updatedUser });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/upgrade
router.post('/upgrade', async (req, res) => {
  try {
    const { userId } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true }
    });
    res.json({ message: 'Upgraded to Premium', user: updatedUser });
  } catch (error) {
    console.error("Upgrade Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/users/:id/profile-pic
router.put('/users/:id/profile-pic', verifyToken, requireRole('MASTER_ADMIN', 'ADMIN'), upload.single('profilePic'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const profilePicUrl = `/uploads/${req.file.filename}`;
        
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { profilePicUrl }
        });

        const io = req.app.get('io');
        if (io) io.to(`user-room-${req.params.id}`).emit('account-updated');

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'UPDATE_PROFILE_PIC',
                entityId: req.params.id,
                details: profilePicUrl,
                ipAddress: req.ip || req.connection.remoteAddress
            }
        });

        res.json({ message: 'Profile picture updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/auth/users/:id/profile-pic
router.delete('/users/:id/profile-pic', verifyToken, requireRole('MASTER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: { profilePicUrl: null }
        });
        
        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'REMOVE_PROFILE_PIC',
                entityId: req.params.id,
                ipAddress: req.ip || req.connection.remoteAddress
            }
        });

        res.json({ message: 'Profile picture removed successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/users/:id/block
router.post('/users/:id/block', verifyToken, requireRole('MASTER_ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const { isBlocked, reason } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBlocked }
    });
    
    // If reason is provided, send a system message to the user's active tag(s)
    if (isBlocked && reason) {
        const userTags = await prisma.tag.findMany({ where: { ownerId: req.params.id } });
        if (userTags.length > 0) {
            // Just send it to the first tag as a system inbox message
            await prisma.message.create({
                data: {
                    content: `SYSTEM NOTIFICATION: Your account has been suspended. Reason: ${reason}`,
                    senderInfo: 'NotifyMe Administration',
                    tagId: userTags[0].id
                }
            });
        }
    }
    
    await prisma.auditLog.create({
        data: {
            adminId: req.user.id,
            action: isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER',
            entityId: req.params.id,
            details: JSON.stringify({ reason }),
            ipAddress: req.ip || req.connection.remoteAddress
        }
    });

    const io = req.app.get('io');
    if (io) io.to(`user-room-${req.params.id}`).emit('account-updated');

    res.json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/auth/users/:id/terminate
router.delete('/users/:id/terminate', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {
  try {
    const userId = req.params.id;
    // SQLite requires manual cascading if foreign keys aren't set to cascade.
    // 1. Delete all OTP codes for user
    await prisma.otpVerification.deleteMany({ where: { userId } });
    // 2. Delete all tags (and their messages/scans)
    const userTags = await prisma.tag.findMany({ where: { ownerId: userId } });
    for (const tag of userTags) {
        await prisma.message.deleteMany({ where: { tagId: tag.id } });
        await prisma.scanHistory.deleteMany({ where: { tagId: tag.id } });
        await prisma.tag.delete({ where: { id: tag.id } });
    }
    
    // Finally delete user
    await prisma.user.delete({
      where: { id: userId }
    });
    
    const io = req.app.get('io');
    if (io) io.to(`user-room-${userId}`).emit('account-updated');
    
    await prisma.auditLog.create({
        data: {
            adminId: req.user.id,
            action: 'TERMINATE_USER',
            entityId: userId,
            ipAddress: req.ip || req.connection.remoteAddress
        }
    });

    res.json({ message: 'User permanently terminated.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/users/:id/grant-premium
router.post('/users/:id/grant-premium', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {
    try {
      const { subscriptionId, premiumExpiresAt } = req.body;
      
      let expiresDate = null;
      if (premiumExpiresAt) {
        expiresDate = new Date(premiumExpiresAt);
      }
      
      let plan = null;
      if (subscriptionId) {
          plan = await prisma.subscriptionPlan.findUnique({ where: { id: subscriptionId } });
          if (!plan) return res.status(404).json({ error: "Subscription plan not found." });
      }

      const isGold = plan && plan.name.toLowerCase().includes('gold');
      
      const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: { 
            isPremium: isGold, 
            subscriptionId: plan ? plan.id : null,
            premiumGrantType: plan ? plan.name : null, 
            premiumExpiresAt: expiresDate 
        }
      });
      
      // Notify the user client via socket
      const io = req.app.get('io');
      if (io) io.to(`user-room-${req.params.id}`).emit('account-updated');

      await prisma.auditLog.create({
          data: {
              adminId: req.user.id,
              action: 'GRANT_PREMIUM',
              entityId: req.params.id,
              details: JSON.stringify({ subscriptionId, premiumExpiresAt: expiresDate }),
              ipAddress: req.ip || req.connection.remoteAddress
          }
      });
      
      res.json({ message: `User granted premium (${plan ? plan.name : 'Unknown'})`, user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/users/:id/revoke-premium
router.post('/users/:id/revoke-premium', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: { isPremium: false, subscriptionId: null, premiumGrantType: null, premiumExpiresAt: null }
      });
      
      // Notify the user client via socket
      const io = req.app.get('io');
      if (io) io.to(`user-room-${req.params.id}`).emit('account-updated');

      await prisma.auditLog.create({
          data: {
              adminId: req.user.id,
              action: 'REVOKE_PREMIUM',
              entityId: req.params.id,
              ipAddress: req.ip || req.connection.remoteAddress
          }
      });
  
      res.json({ message: `Subscription revoked for user`, user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/users/:id/audit-logs
router.get('/users/:id/audit-logs', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { entityId: req.params.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/audit-logs
router.get('/audit-logs', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit to last 100 logs
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

