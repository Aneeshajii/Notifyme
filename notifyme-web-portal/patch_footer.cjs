const fs = require('fs');
let code = fs.readFileSync('src/components/PublicHomepage.tsx', 'utf8');

code = code.replace(
  `<li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '15px' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>Terms & Conditions</a></li>`,
  `<li><a href="/terms" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '15px' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>Terms & Conditions</a></li>`
);

code = code.replace(
  `<li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '15px' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>Privacy Policy</a></li>`,
  `<li><a href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '15px' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>Privacy Policy</a></li>`
);

// add support link if it doesn't exist
if (!code.includes('href="/support"')) {
    code = code.replace(
        `<li><a href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '15px' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>Privacy Policy</a></li>`,
        `<li><a href="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '15px' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>Privacy Policy</a></li>\n              <li><a href="/support" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '15px' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>Support & Contact</a></li>`
    );
}

fs.writeFileSync('src/components/PublicHomepage.tsx', code);
console.log('patched footer links');
