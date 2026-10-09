const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `import AuthScreen from './components/AuthScreen';`,
  `import AuthScreen from './components/AuthScreen';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import SupportPage from './components/SupportPage';`
);

const routesCode = `    const isVerifyEmail = window.location.pathname.includes('/verify-email');
    if (isVerifyEmail) {
      return <VerifyEmail />;
    }`;

const newRoutesCode = `    const isVerifyEmail = window.location.pathname.includes('/verify-email');
    if (isVerifyEmail) {
      return <VerifyEmail />;
    }

    if (window.location.pathname.includes('/privacy')) {
      return <PrivacyPolicy />;
    }
    if (window.location.pathname.includes('/terms')) {
      return <TermsOfService />;
    }
    if (window.location.pathname.includes('/support') && !localStorage.getItem('userToken')) {
      return <SupportPage />;
    }`;

code = code.replace(routesCode, newRoutesCode);

fs.writeFileSync('src/App.tsx', code);
console.log('wired up public legal pages');
