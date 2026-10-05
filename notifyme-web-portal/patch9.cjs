const fs = require('fs');
let code = fs.readFileSync('src/components/Subscriptions.tsx', 'utf8');

const regex = /const handlePurchase = async \(planId: string\) => {/g;
const replacement = `const handlePurchase = async (planId: string) => {
    if (user && user.emailVerified === false) {
      alert('Please verify your email address to purchase a subscription.');
      return;
    }`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/Subscriptions.tsx', code);
console.log('subscriptions patched');
