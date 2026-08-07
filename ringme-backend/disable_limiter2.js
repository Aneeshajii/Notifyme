const fs = require('fs');
let code = fs.readFileSync('index.js', 'utf8');
code = code.replace(/app\.use\('\/api', globalLimiter\);/, '// app.use(\'/api\', globalLimiter);');
fs.writeFileSync('index.js', code);
