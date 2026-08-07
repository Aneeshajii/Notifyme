const fs = require('fs');
let code = fs.readFileSync('index.js', 'utf8');
code = code.replace(/app\.use\(globalLimiter\);/, '// app.use(globalLimiter);');
fs.writeFileSync('index.js', code);
