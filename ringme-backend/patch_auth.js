const fs = require('fs');
let code = fs.readFileSync('routes/auth.js', 'utf8');

const registerStart = code.indexOf("router.post('/register', authLimiter, async (req, res) => {");
const nextRoute = code.indexOf('// POST /api/auth/login');
const registerBlock = code.substring(registerStart, nextRoute);

const newRegisterBlock = `router.post('/register', authLimiter, async (req, res) => {
    try {
      const { email, password, name, lastName, googleId, phone } = req.body;
      
      // Check if user exists
      let user = await prisma.user.findUnique({ 
          where: { email },
          include: { subscription: true, tags: true }
      });
      
      if (user) {
        if (googleId) {
            // Already exists, just log them in if google
            const tokens = generateTokens(user);
            return res.json({ message: 'User already exists', user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
        }
        return res.status(400).json({ message: 'User already exists' });
      }

      // If it's a Google Signup, verify and create immediately
      if (googleId) {
          let basicPlan = await prisma.subscriptionPlan.findFirst({
              where: { name: { contains: 'Basic' }, isActive: true }
          });
          if (!basicPlan) {
              basicPlan = await prisma.subscriptionPlan.findFirst({
                  where: { isActive: true },
                  orderBy: { price: 'asc' }
              });
          }

          const newUser = await prisma.user.create({
              data: {
                  email,
                  name,
                  lastName,
                  googleId,
                  phone,
                  emailVerified: true,
                  isPremium: false,
                  subscriptionId: basicPlan?.id || null
              },
              include: { subscription: true, tags: true }
          });
          const tokens = generateTokens(newUser);
          return res.json({ message: 'Registration successful', user: newUser, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      }

      // If manual signup (email/password), initiate OTP flow
      if (!password) {
          return res.status(400).json({ message: 'Password is required' });
      }

      const hashedPassword = await argon2.hash(password);
      
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send OTP to email
      const emailSent = await sendOTPEmail(email, otp);
      if (!emailSent) {
          return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
      }

      // Create a temporary JWT holding the registration data
      const registrationToken = jwt.sign(
          { email, passwordHash: hashedPassword, name, lastName, phone, otp },
          JWT_SECRET,
          { expiresIn: '15m' }
      );

      // Return token so frontend can submit it with the OTP
      return res.json({ 
          message: 'OTP sent successfully', 
          requiresOtp: true, 
          registrationToken 
      });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/verify-registration
router.post('/verify-registration', authLimiter, async (req, res) => {
    try {
        const { registrationToken, otp } = req.body;
        if (!registrationToken || !otp) {
            return res.status(400).json({ message: 'Missing token or OTP' });
        }

        let decoded;
        try {
            decoded = jwt.verify(registrationToken, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Registration session expired or invalid. Please sign up again.' });
        }

        if (decoded.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP code. Please check your email and try again.' });
        }

        // OTP is valid! Create the user in the database
        const { email, passwordHash, name, lastName, phone } = decoded;

        let user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let basicPlan = await prisma.subscriptionPlan.findFirst({
            where: { name: { contains: 'Basic' }, isActive: true }
        });
        if (!basicPlan) {
            basicPlan = await prisma.subscriptionPlan.findFirst({
                where: { isActive: true },
                orderBy: { price: 'asc' }
            });
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                password: passwordHash,
                name,
                lastName: lastName || undefined,
                phone: phone || undefined,
                emailVerified: true,
                isPremium: false,
                subscriptionId: basicPlan?.id || null
            },
            include: { subscription: true, tags: true }
        });

        const tokens = generateTokens(newUser);
        return res.json({ message: 'Registration verified successfully', user: newUser, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

`;

code = code.replace(registerBlock, newRegisterBlock);
fs.writeFileSync('routes/auth.js', code);
console.log('Patched routes/auth.js successfully.');
