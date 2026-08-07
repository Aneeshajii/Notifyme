const fs = require('fs');
let code = fs.readFileSync('routes/messages.js', 'utf8');
code = code.replace(/io.emit\( \+ \"conversation-\" \+ ,/g, "io.emit(\conversation-\\,");
code = code.replace(/io.emit\( \+ \"user-\" \+ ,/g, "io.emit(\user-\-new-message\,");
code = code.replace(/io.emit\( \+ \"conversation-\" \+ ,/g, "io.emit(\conversation-\\,"); // There's two context of this. Let me just use replace directly for each.
fs.writeFileSync('routes/messages.js', code);
