const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const appSearch = `function App() {
  const [isBlockedScreen, setIsBlockedScreen] = useState<boolean>(false);
  useEffect(() => {
    const handleBlocked = () => setIsBlockedScreen(true);
    window.addEventListener('user-blocked', handleBlocked);
    return () => window.removeEventListener('user-blocked', handleBlocked);
  }, []);`;
const appReplace = `function App() {
  const [isBlockedScreen, setIsBlockedScreen] = useState<boolean>(false);
  const [showSupportOnly, setShowSupportOnly] = useState<boolean>(false);
  useEffect(() => {
    const handleBlocked = () => setIsBlockedScreen(true);
    window.addEventListener('user-blocked', handleBlocked);
    return () => window.removeEventListener('user-blocked', handleBlocked);
  }, []);`;
code = code.replace(appSearch, appReplace);

const uiSearch = `if (isBlockedScreen) {
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
  }`;
const uiReplace = `if (isBlockedScreen) {
    if (showSupportOnly) {
        return (
            <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <button onClick={() => setShowSupportOnly(false)} style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                          ← Back
                      </button>
                      <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Log Out
                      </button>
                    </div>
                    {user ? <SupportCenter user={user} /> : <p>Loading support...</p>}
                </div>
            </div>
        );
    }
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ backgroundColor: '#ef4444', padding: '20px', borderRadius: '50%', marginBottom: '20px' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '10px', textAlign: 'center' }}>Account Suspended</h1>
        <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '400px', textAlign: 'center', marginBottom: '10px' }}>
          Your account has been blocked by the administration. You can no longer access this portal or any associated tags.
        </p>
        <p style={{ fontSize: '16px', color: '#f87171', maxWidth: '400px', textAlign: 'center', marginBottom: '30px', fontWeight: 'bold' }}>
          Let us know if you think we made a mistake.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => setShowSupportOnly(true)} style={{ padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Contact Support
            </button>
            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={{ padding: '12px 24px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Return to Login
            </button>
        </div>
      </div>
    );
  }`;
code = code.replace(uiSearch, uiReplace);

fs.writeFileSync('src/App.tsx', code);
console.log('patched web portal');
