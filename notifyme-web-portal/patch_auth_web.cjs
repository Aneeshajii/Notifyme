const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldAuth = `  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      if (authMode === 'register') {
        const res = await axios.post(\`\${API_BASE}/auth/register\`, { email, password, name });
        if (!res.data.accessToken) throw new Error("Registration succeeded but no token provided.");
        const token = res.data.accessToken;
        localStorage.setItem('userToken', token);
        if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
        axios.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
        setUser(res.data.user);
        setProfileData(res.data.user);
        setIsAuthenticated(true);
        fetchTagsAndMessages(res.data.user.id);
      } else {`;

const newAuth = `  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === 'otp') {
        if (!otpCode) return;
        const res = await axios.post(\`\${API_BASE}/auth/verify-registration\`, { registrationToken, otp: otpCode });
        if (!res.data.accessToken) throw new Error("Verification succeeded but no token provided.");
        const token = res.data.accessToken;
        localStorage.setItem('userToken', token);
        if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
        axios.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
        setUser(res.data.user);
        setProfileData(res.data.user);
        setIsAuthenticated(true);
        fetchTagsAndMessages(res.data.user.id);
      } else if (authMode === 'register') {
        if (!email || !password) return;
        const res = await axios.post(\`\${API_BASE}/auth/register\`, { email, password, name });
        if (res.data.requiresOtp) {
            setRegistrationToken(res.data.registrationToken);
            setAuthMode('otp');
            setAuthError('');
            return;
        }
      } else {
        if (!email || !password) return;`;

code = code.replace(oldAuth, newAuth);

fs.writeFileSync('src/App.tsx', code);
console.log('patched handleEmailAuth');
