const fs = require('fs');
let code = fs.readFileSync('routes/tags.js', 'utf8');

code = code.replace(
  '            email: true,\n            isBlocked: true,',
  '            email: true,\n            emailVerified: true,\n            isBlocked: true,'
);
code = code.replace(
  '            email: true,\r\n            isBlocked: true,',
  '            email: true,\r\n            emailVerified: true,\r\n            isBlocked: true,'
);

code = code.replace(
  '    if (tag.owner.isBlocked) {\n      return res.status(403).json({ message: \'This account is currently unavailable.\' });\n    }',
  '    if (tag.owner.isBlocked) {\n      return res.status(403).json({ message: \'This account is currently unavailable.\' });\n    }\n\n    if (tag.owner.emailVerified === false) {\n      return res.status(403).json({ message: \'The owner of this QR code has not verified their account yet.\' });\n    }'
);
code = code.replace(
  '    if (tag.owner.isBlocked) {\r\n      return res.status(403).json({ message: \'This account is currently unavailable.\' });\r\n    }',
  '    if (tag.owner.isBlocked) {\r\n      return res.status(403).json({ message: \'This account is currently unavailable.\' });\r\n    }\r\n\r\n    if (tag.owner.emailVerified === false) {\r\n      return res.status(403).json({ message: \'The owner of this QR code has not verified their account yet.\' });\r\n    }'
);

fs.writeFileSync('routes/tags.js', code);
console.log('patched tag scan route');
