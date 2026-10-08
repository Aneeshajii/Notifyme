const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/localStorage\.getItem\('token'\)/g, "localStorage.getItem('adminToken')");

const target = 'const handleLogout = async () => {';
const interceptorCode = `    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.warn("401 intercepted");
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

code = code.replace(target, interceptorCode + target);
fs.writeFileSync('src/App.tsx', code);
console.log('patched successfully');
