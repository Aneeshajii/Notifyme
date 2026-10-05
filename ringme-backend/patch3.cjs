const fs = require('fs');
let code = fs.readFileSync('routes/tags.js', 'utf8');

code = code.replace(
  'router.post(\'/create\', verifyToken, requireVerifiedEmail, async (req, res) => {',
  'router.post(\'/create\', verifyToken, async (req, res) => {'
);

code = code.replace(
  '      if (existingTagsCount >= maxQrCodes) {',
  '      // Allow 1 tag without email verification for onboarding\n      if (existingTagsCount >= 1 && !user.emailVerified) {\n          return res.status(403).json({ message: \'Email verification required to create additional QR codes.\' });\n      }\n\n      if (existingTagsCount >= maxQrCodes) {'
);

fs.writeFileSync('routes/tags.js', code);
console.log('Fixed tags route');
