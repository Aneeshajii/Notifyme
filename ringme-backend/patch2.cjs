
const fs = require('fs');
let code = fs.readFileSync('routes/auth.js', 'utf8');

const newRoutes = \
// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Missing token' });

        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-production-secret-replace-me';
        
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (decoded.type !== 'email_verification') {
            return res.status(400).json({ message: 'Invalid token type' });
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (user.email !== decoded.email) {
            return res.status(400).json({ message: 'Email mismatch. Have you changed your email?' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true }
        });

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', verifyToken, authLimiter, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        await sendVerificationEmail(user);
        res.json({ message: 'Verification email sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
\;

code = code.replace('module.exports = router;', newRoutes);
fs.writeFileSync('routes/auth.js', code);
console.log('Appended verification routes');

