const fs = require('fs');
let content = fs.readFileSync('routes/messages.js', 'utf16le');
if (content.includes('const express')) {
  // It was utf16le
} else {
  content = fs.readFileSync('routes/messages.js', 'utf8');
}
content = content.replace(/^\uFEFF/, '');
// Strip out any weird null bytes
content = content.replace(/\0/g, '');
fs.writeFileSync('routes/messages.js', content, 'utf8');
