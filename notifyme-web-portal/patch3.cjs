
const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    'import PublicHomepage from \'./components/PublicHomepage\';',
    'import PublicHomepage from \'./components/PublicHomepage\';\nimport VerifyEmail from \'./pages/VerifyEmail\';'
);

code = code.replace(
    'function App() {',
    'function App() {\n  const isVerifyEmail = window.location.pathname.includes(\'/verify-email\');\n  if (isVerifyEmail) {\n    return <VerifyEmail />;\n  }'
);

fs.writeFileSync('src/App.tsx', code);

