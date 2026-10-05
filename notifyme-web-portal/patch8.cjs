const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleCreateTag = async \(\) => {/g;
const replacement = `const handleCreateTag = async () => {
    if (user && user.emailVerified === false) {
      alert('Please verify your email address to create QR codes.');
      return;
    }`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log('regex patched');
