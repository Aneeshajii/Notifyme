const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix handleSendEmergency
code = code.replace(
    `localStorage.getItem('token')`,
    `localStorage.getItem('adminToken')`
);

// 2. Add an interceptor
// We can add it right after handleLogout is defined.
const handleLogoutCode = `  const handleLogout = async () => {
        try {
            await axios.post(\`\${API_BASE}/auth/logout\`);
        } catch (err) {
            console.error("Logout API failed", err);
        } finally {
            localStorage.removeItem('adminToken');
            setToken(null);
            setIsAuthenticated(false);
            setIsMfaStep(false);
            setIsCheckingSession(false);
        }
    };`;

const interceptorCode = `
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token likely expired, force logout
                    console.warn("401 Unauthorized intercepted, logging out...");
                    localStorage.removeItem('adminToken');
                    setToken(null);
                    setIsAuthenticated(false);
                    setIsMfaStep(false);
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);
`;

if (code.includes(handleLogoutCode)) {
    code = code.replace(handleLogoutCode, handleLogoutCode + interceptorCode);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Successfully patched admin portal.');
} else {
    console.log('Failed to find handleLogout block.');
}
