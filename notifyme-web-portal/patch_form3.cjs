const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\) : \(\s*<>\s*<form onSubmit=\{handleEmailAuth\}[\s\S]*?<\/form>\s*<div[\s\S]*?<span.*?Already have an account.*?<\/div>\s*<\/>\s*\)/;

const replacement = `) : (
                <>
                  {authMode === 'otp' ? (
                    <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>We sent a 6-digit code to</p>
                            <p style={{ color: '#0f172a', fontWeight: 'bold', margin: '4px 0 16px 0' }}>{email}</p>
                        </div>
                        <input type="text" placeholder="Enter 6-digit code" value={otpCode} onChange={e => setOtpCode(e.target.value)} required maxLength={6} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '20px', letterSpacing: '4px', textAlign: 'center', outline: 'none' }} />
                        <button type="submit" disabled={otpCode.length !== 6} style={{ padding: '12px', background: otpCode.length === 6 ? '#4f46e5' : '#94a3b8', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: otpCode.length === 6 ? 'pointer' : 'not-allowed' }}>Verify & Create Account</button>
                        <button type="button" onClick={() => { setAuthMode('register'); setOtpCode(''); }} style={{ padding: '8px', background: 'transparent', color: '#64748b', border: 'none', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                    </form>
                  ) : (
                    <>
                    <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                        <input type="email" placeholder="Email Address" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                        <input type="password" placeholder="Password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                        <button type="submit" style={{ padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</button>
                    </form>
                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        <span style={{ color: '#64748b' }}>Already have an account? </span>
                        <button type="button" onClick={() => setAuthMode('login')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
                    </div>
                    </>
                  )}
                </>
              )`;

if(regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log('patched');
} else {
    console.log('not found');
}
