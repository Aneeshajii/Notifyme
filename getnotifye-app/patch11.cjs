const fs = require('fs');

// Patch dashboard.tsx
let dashboardCode = fs.readFileSync('app/(app)/dashboard.tsx', 'utf8');

const handleCreateTagRegex = /const handleCreateTag = async \(\) => {/g;
const handleCreateTagReplacement = `const handleCreateTag = async () => {
    if (user && user.emailVerified === false) {
      alert('Please verify your email address to create QR codes.');
      return;
    }`;

dashboardCode = dashboardCode.replace(handleCreateTagRegex, handleCreateTagReplacement);
fs.writeFileSync('app/(app)/dashboard.tsx', dashboardCode);
console.log('dashboard patched');

// Patch subscriptions.tsx
let subsCode = fs.readFileSync('app/(app)/subscriptions.tsx', 'utf8');

const handlePurchaseRegex = /const handlePurchase = async \(planId: string\) => {/g;
const handlePurchaseReplacement = `const handlePurchase = async (planId: string) => {
    if (user && user.emailVerified === false) {
      alert('Please verify your email address to purchase a subscription.');
      return;
    }`;

subsCode = subsCode.replace(handlePurchaseRegex, handlePurchaseReplacement);
fs.writeFileSync('app/(app)/subscriptions.tsx', subsCode);
console.log('subscriptions patched');
