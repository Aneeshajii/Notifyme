const fs = require('fs');
let code = fs.readFileSync('routes/auth.js', 'utf8');

const appleCode = `// Future: Apple/Google Login validation can go here
router.get('/apple', (req, res) => {
    res.json({ message: 'Apple OAuth flow started (Scaffolding)' });
});

router.post('/apple/callback', async (req, res) => {
    res.json({ message: 'Apple OAuth callback hit (Scaffolding)' });
});`;

const newAppleCode = `const appleSignin = require('apple-signin-auth');

router.post('/apple/verify', async (req, res) => {
    try {
        const { identityToken } = req.body;
        
        // Verify the Apple identity token
        const appleIdTokenClaims = await appleSignin.verifyIdToken(identityToken, {
            // We ignore audience for now to allow both web and iOS clients
            ignoreExpiration: false,
        });

        const email = appleIdTokenClaims.email;
        const sub = appleIdTokenClaims.sub; // The Apple ID

        if (!email) {
            return res.status(400).json({ error: 'Apple Sign In did not return an email.' });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create user
            user = await prisma.user.create({
                data: {
                    email,
                    name: 'Apple User',
                    isVerified: true
                }
            });
            // Automatically assign basic plan
            await prisma.user.update({
                where: { id: user.id },
                data: { maxTags: 5 }
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Account suspended' });
        }

        // Generate JWTs
        const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

        // Save session
        const deviceName = req.headers['user-agent'] || 'Unknown Device';
        await prisma.session.create({
            data: {
                userId: user.id,
                refreshToken,
                deviceName,
                ipAddress: req.ip || req.socket.remoteAddress
            }
        });

        const userResponse = { ...user };
        delete userResponse.password;
        delete userResponse.mfaSecret;

        res.json({
            message: 'Apple Login successful',
            accessToken,
            refreshToken,
            user: userResponse
        });
    } catch (error) {
        console.error('Apple Sign In Error:', error);
        res.status(401).json({ error: 'Invalid Apple Identity Token' });
    }
});`;

code = code.replace(appleCode, newAppleCode);
fs.writeFileSync('routes/auth.js', code);
console.log('patched backend apple signin');
