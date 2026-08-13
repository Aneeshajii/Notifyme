const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/anees/OneDrive/Desktop/email/notifyme-web-portal/src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const interceptorCode = 
// Setup Axios Interceptor for seamless token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(\\/auth/refresh\, { refreshToken });
          if (res.data.accessToken) {
            localStorage.setItem('userToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            axios.defaults.headers.common['Authorization'] = \\\Bearer \\\\;
            originalRequest.headers['Authorization'] = \\\Bearer \\\\;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, forcefully logout
        localStorage.removeItem('userToken');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
;

if (!content.includes('axios.interceptors.response.use')) {
  content = content.replace('function App() {', interceptorCode + '\nfunction App() {');
  
  // also fix login/register handling of refresh tokens
  content = content.replace(/localStorage\.setItem\('userToken', token\);/g, 
    "localStorage.setItem('userToken', token);\n          if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);");
    
  // fix logout to remove refreshToken
  content = content.replace(/localStorage\.removeItem\('userToken'\);/g, 
    "localStorage.removeItem('userToken');\n            localStorage.removeItem('refreshToken');");
    
  // fix Onboarding logic: user.tags.length === 0 instead of !user.isOnboarded
  content = content.replace(/!user\.isOnboarded/g, "(!user.tags || user.tags.length === 0)");

  fs.writeFileSync(filePath, content);
  console.log('Successfully updated App.tsx interceptors and onboarding logic');
} else {
  console.log('Interceptors already exist in App.tsx');
}
