const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<input\s+type="email"\s+placeholder="Admin Email"/, '<input type="email" placeholder="Admin Email" autoComplete="username"');
code = code.replace(/<input\s+type="password"\s+placeholder="Password"/, '<input type="password" placeholder="Password" autoComplete="current-password"');

fs.writeFileSync('src/App.tsx', code);
