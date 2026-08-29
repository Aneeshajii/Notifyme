const fs = require('fs');
let c = fs.readFileSync('notifyme-web-portal/src/App.tsx', 'utf8');

// 1. Imports
c = c.replace(/import '\.\/ [skipping rest, see below...]