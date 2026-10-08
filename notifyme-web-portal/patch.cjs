const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add 403 handling to the interceptor
const interceptorSearch = `return Promise.reject(error);`;
const interceptorReplace = `if (error.response && error.response.status === 403) {
      if (error.response.data && (error.response.data.message === 'Account suspended. Contact support.' || error.response.data.message === 'Account is blocked')) {
         window.dispatchEvent(new Event('user-blocked'));
      }
    }
    return Promise.reject(error);`;
code = code.replace(interceptorSearch, interceptorReplace);

// 2. Add state and effect in App()
const appSearch = `function App() {`;
const appReplace = `function App() {
  const [isBlockedScreen, setIsBlockedScreen] = useState<boolean>(false);
  useEffect(() => {
    const handleBlocked = () => setIsBlockedScreen(true);
    window.addEventListener('user-blocked', handleBlocked);
    return () => window.removeEventListener('user-blocked', handleBlocked);
  }, []);`;
code = code.replace(appSearch, appReplace);

// 3. Add UI block in App()
const returnSearch = `const isVerifyEmail = window.location.pathname.includes('/verify-email');`;
const returnReplace = `if (isBlockedScreen) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ backgroundColor: '#ef4444', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '10px', textAlign: 'center' }}>Account Suspended</h1>
        <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '400px', textAlign: 'center', marginBottom: '30px' }}>
          Your account has been blocked by the administration. You can no longer access this portal or any associated tags.
        </p>
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Return to Home
        </button>
      </div>
    );
  }
  const isVerifyEmail = window.location.pathname.includes('/verify-email');`;
code = code.replace(returnSearch, returnReplace);

fs.writeFileSync('src/App.tsx', code);
console.log('patched');
