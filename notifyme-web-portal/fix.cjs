const fs = require('fs');
let buf = fs.readFileSync('src/components/NotificationCampaigns.tsx');
let content = buf.toString('utf16le');
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}
content = content.replace(/\\n/g, '\n');
content = content.replace(/\\"/g, '\"');
content = content.replace(/\\/g, '\"');

fs.writeFileSync('src/components/NotificationCampaigns.tsx', content, 'utf8');
console.log('Fixed NotificationCampaigns.tsx');
