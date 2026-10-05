
const fs = require('fs');
let code = fs.readFileSync('routes/tags.js', 'utf8');

code = code.replace(
    'router.post(\'/create\', verifyToken, async (req, res) => {',
    'router.post(\'/create\', verifyToken, requireVerifiedEmail, async (req, res) => {'
);

fs.writeFileSync('routes/tags.js', code);

