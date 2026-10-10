const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>`;

const replaceStr = `<div style={{ marginTop: '24px', fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
                  By continuing, you agree to our{' '}
                  <a href="/terms" target="_blank" style={{ color: '#4f46e5', textDecoration: 'underline' }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" style={{ color: '#4f46e5', textDecoration: 'underline' }}>Privacy Policy</a>.
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replaceStr);
    fs.writeFileSync('src/App.tsx', code);
    console.log('patched login modal with EULA links');
} else {
    console.log('Target string not found');
}
