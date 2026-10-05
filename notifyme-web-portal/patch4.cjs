
const fs = require('fs');
let code = fs.readFileSync('src/pages/VerifyEmail.tsx', 'utf8');

code = code.replace(
    'import { useNavigate, useSearchParams } from \\'react-router-dom\\';',
    ''
);

code = code.replace(
    '  const [searchParams] = useSearchParams();\n  const token = searchParams.get(\\'token\\');\n  const navigate = useNavigate();',
    '  const urlParams = new URLSearchParams(window.location.search);\n  const token = urlParams.get(\\'token\\');'
);

code = code.replace(
    'navigate(\\'/account/dashboard\\');',
    'window.location.href = \\'/account/dashboard\\';'
);
code = code.replace(
    'navigate(\\'/account/dashboard\\')',
    'window.location.href = \\'/account/dashboard\\''
);

code = code.replace(
    '[token, navigate]',
    '[token]'
);

fs.writeFileSync('src/pages/VerifyEmail.tsx', code);

