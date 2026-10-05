
const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    'email: string;',
    'email: string;\n  emailVerified?: boolean;'
);

fs.writeFileSync('src/App.tsx', code);

