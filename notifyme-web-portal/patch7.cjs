
const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const handleCreateTag = async () => {\\n    const tagName = prompt(\\'Enter a name for this tag (e.g., My Tesla):\\');',
  'const handleCreateTag = async () => {\\n    if (user && user.emailVerified === false) {\\n      alert(\\'Please verify your email address to create QR codes.\\');\\n      return;\\n    }\\n    const tagName = prompt(\\'Enter a name for this tag (e.g., My Tesla):\\');'
);

code = code.replace(
  'const handleCreateTag = async () => {\\r\\n    const tagName = prompt(\\'Enter a name for this tag (e.g., My Tesla):\\');',
  'const handleCreateTag = async () => {\\r\\n    if (user && user.emailVerified === false) {\\r\\n      alert(\\'Please verify your email address to create QR codes.\\');\\r\\n      return;\\r\\n    }\\r\\n    const tagName = prompt(\\'Enter a name for this tag (e.g., My Tesla):\\');'
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched');

