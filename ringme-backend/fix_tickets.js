const fs = require('fs');
let code = fs.readFileSync('routes/tickets.js', 'utf8');
code = code.replace(/io.emit\( \+ \"user-\" \+ ,/g, "io.emit(\user-\-notification\,");
fs.writeFileSync('routes/tickets.js', code);
