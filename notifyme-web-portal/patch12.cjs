const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const banner = `
      {user && user.emailVerified === false && (
        <div style={{ backgroundColor: '#fef3c7', borderBottom: '1px solid #f59e0b', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TriangleAlert size={18} color="#d97706" />
            <span style={{ color: '#92400e', fontSize: '14px', fontWeight: '500' }}>
              Please verify your email address to unlock full access to GetNotify features.
            </span>
          </div>
          <button 
            onClick={() => {
              axios.post(\\\`\${API_BASE}/auth/resend-verification\\\`, {}, {
                headers: { Authorization: \\\`Bearer \${localStorage.getItem('userToken')}\\\` }
              }).then(() => alert('Verification email sent! Check your inbox.')).catch(err => alert(err.response?.data?.message || 'Failed to resend.'));
            }}
            style={{ backgroundColor: '#d97706', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
          >
            Resend Email
          </button>
        </div>
      )}
`;

const oldBannerRegex = /[ \t]*\{user && user\.emailVerified === false && \([\s\S]*?\)\}[\r\n]*/;
code = code.replace(oldBannerRegex, '');

code = code.replace(
  '<main className="main-content">',
  '<main className="main-content">' + banner
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed banner alignment');
