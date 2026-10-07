const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldFormStart = \`                      <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>\`;

const oldFormEnd = \`                      </form>\`;

const formRegex = /<form onSubmit=\\{handleEmailAuth\\}[\\s\\S]*?<\\/form>/g;

const matchedForm = code.match(formRegex)[0];

let newForm = matchedForm.replace(
    \`{authMode === 'register' && (\`,
    \`{authMode === 'otp' ? (
                              <div style={{ position: 'relative' }}>
                                  <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#64748b' }}>
                                      <Lock size={20} />
                                  </div>
                                  <input type="text" placeholder="Enter 6-digit code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', background: '#f8fafc', letterSpacing: '4px', textAlign: 'center' }} required maxLength={6} />
                                  <p style={{textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '10px'}}>Code sent to {email}</p>
                              </div>
                          ) : (
                          <>
                          {authMode === 'register' && (\`
);

newForm = newForm.replace(
    \`</button>
                      </form>\`,
    \`</button>
                          </>
                          )}
                      </form>\`
);

newForm = newForm.replace(
    "{authMode === 'register' ? 'Create Account' : 'Sign In'}",
    "{authMode === 'otp' ? 'Verify & Create Account' : authMode === 'register' ? 'Create Account' : 'Sign In'}"
);

code = code.replace(matchedForm, newForm);

// Fix the toggle button text at the bottom
code = code.replace(
    \`<button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}\`,
    \`{authMode !== 'otp' && <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}\`
);

code = code.replace(
    \`{authMode === 'login' ? 'Sign up' : 'Sign in'}
                          </button>\`,
    \`{authMode === 'login' ? 'Sign up' : 'Sign in'}
                          </button>}\`
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched form');
