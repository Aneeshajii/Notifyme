const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `setUser(res.data);
              setProfileData(res.data);
              setIsAuthenticated(true);`,
  `if (res.data.isBlocked) window.dispatchEvent(new Event('user-blocked'));
              setUser(res.data);
              setProfileData(res.data);
              setIsAuthenticated(true);`
);

code = code.replace(
  `const res = await axios.get(\`\${API_BASE}/auth/me\`);
                setUser(res.data);
                setProfileData(res.data);`,
  `const res = await axios.get(\`\${API_BASE}/auth/me\`);
                if (res.data.isBlocked) window.dispatchEvent(new Event('user-blocked'));
                setUser(res.data);
                setProfileData(res.data);`
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched web portal auth checks');
