const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /axios\.post\(\\`\$\{API_BASE\}\/auth\/resend-verification\\`, \{\}, \{\s*headers: \{ Authorization: \\`Bearer \$\{localStorage\.getItem\('userToken'\)\}\\` \}/;

code = code.replace(regex, 'axios.post(`${API_BASE}/auth/resend-verification`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem(\'userToken\')}` }');

fs.writeFileSync('src/App.tsx', code);
console.log('done');
