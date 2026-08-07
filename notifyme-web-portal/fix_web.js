const fs = require('fs');
let code = fs.readFileSync('src/components/SupportCenter.tsx', 'utf8');

// The $ was completely stripped from API_BASE and variables! Let's just fix it manually.
code = code.replace(/axios\.get\(\/tickets\/my, /g, "axios.get(\${API_BASE}/tickets/my\, ");
code = code.replace(/axios\.post\(\/tickets, /g, "axios.post(\${API_BASE}/tickets\, ");
code = code.replace(/axios\.post\(\/tickets\//g, "axios.post(\${API_BASE}/tickets/");
// token headers were ruined as well: Bearer  }
code = code.replace(/Authorization: Bearer  } }/g, "Authorization: \Bearer \\ } }");

fs.writeFileSync('src/components/SupportCenter.tsx', code);
