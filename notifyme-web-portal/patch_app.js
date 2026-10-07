const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add states
code = code.replace(
  "const [authMode, setAuthMode] = useState<'login' | 'register'>('login');",
  "const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp'>('login');\n  const [otpCode, setOtpCode] = useState('');\n  const [registrationToken, setRegistrationToken] = useState('');"
);

// 2. Modify handleEmailAuth
const oldAuth = `
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

const newAuth = `
      try {
        if (authMode === 'otp') {
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
          const res = await axios.post(\`\${API_BASE}/auth/register\`, { email, password, name });
          if (res.data.requiresOtp) {
              setRegistrationToken(res.data.registrationToken);
              setAuthMode('otp');
              return;
          }
        } else {`;

code = code.replace(oldAuth, newAuth);

// 3. Render the OTP form
const oldForm = `
                      <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {authMode === 'register' && (
                              <div style={{ position: 'relative' }}>`;

const newForm = `
                      <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {authMode === 'otp' ? (
                              <div style={{ position: 'relative' }}>
                                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#64748b' }}>
                                      <Lock size={20} />
                                  </div>
                                  <input type="text" placeholder="Enter 6-digit OTP code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', background: '#f8fafc', letterSpacing: '4px', textAlign: 'center' }} required maxLength={6} />
                                  <p style={{textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '10px'}}>We sent a code to {email}. Check your spam folder if you don't see it.</p>
                              </div>
                          ) : (
                          <>
                          {authMode === 'register' && (
                              <div style={{ position: 'relative' }}>`;

code = code.replace(oldForm, newForm);

// Also need to close the <> block and fix the button text
const oldSubmitButton = `</button>
                      </form>`;

const newSubmitButton = `</button>
                          {authMode !== 'otp' && <></>}</>
                          )}
                      </form>`;

// Wait, doing string replacement on JSX is brittle.
// I will just read the file, find the form, and replace it completely.
`;

fs.writeFileSync('patch_app.js', code);
