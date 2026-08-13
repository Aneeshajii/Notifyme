const fs = require('fs');

function fixAppTsx() {
  const path = 'C:/Users/anees/OneDrive/Desktop/email/notifyme-admin-portal/src/App.tsx';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace('isPremium?: boolean;', 'isPremium?: boolean;\n  subscription?: any;');
  content = content.replace('createdAt: string;', 'createdAt: string;\n  _count?: any;');
  fs.writeFileSync(path, content);
}

function fixCommunicationsTab() {
  const path = 'C:/Users/anees/OneDrive/Desktop/email/notifyme-admin-portal/src/components/CommunicationsTab.tsx';
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/interface Message \{([\s\S]*?)\}/, (match, p1) => {
    return 'interface Message {' + p1 + '\n  mediaType?: string;\n  mediaUrl?: string;\n  latitude?: number;\n  longitude?: number;\n}';
  });
  
  content = content.replace(/tag: \{([^}]+)\}/g, 'tag: { id: string; tagId: string; name: string; ownerId?: string; }');
  
  fs.writeFileSync(path, content);
}

fixAppTsx();
fixCommunicationsTab();
console.log('Fixed types');
