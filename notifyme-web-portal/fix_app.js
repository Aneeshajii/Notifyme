const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The login form
code = code.replace(/<input type="email" placeholder="Email Address" value=\{email\} onChange=\{e => setEmail\(e.target.value\)\} required style=\{\{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' \}\} \/>/, '<input type="email" placeholder="Email Address" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: \'16px\', borderRadius: \'12px\', border: \'1px solid #cbd5e1\', fontSize: \'16px\', outline: \'none\' }} />');

code = code.replace(/<input type="password" placeholder="Password" value=\{password\} onChange=\{e => setPassword\(e.target.value\)\} required style=\{\{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' \}\} \/>/, '<input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: \'16px\', borderRadius: \'12px\', border: \'1px solid #cbd5e1\', fontSize: \'16px\', outline: \'none\' }} />');

// The register form (the second password input match)
code = code.replace(/<input type="password" placeholder="Password" value=\{password\} onChange=\{e => setPassword\(e.target.value\)\} required style=\{\{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' \}\} \/>/, '<input type="password" placeholder="Password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: \'16px\', borderRadius: \'12px\', border: \'1px solid #cbd5e1\', fontSize: \'16px\', outline: \'none\' }} />');

fs.writeFileSync('src/App.tsx', code);
