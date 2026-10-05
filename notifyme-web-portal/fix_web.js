
const fs = require('fs');
let code = fs.readFileSync('src/components/Subscriptions.tsx', 'utf8');
code = code.replace(
  'try { benefits = JSON.parse(plan.benefits || '[]'); } catch (e) {}',
  	ry { benefits = JSON.parse(plan.benefits || \"[]\"); } catch (e) {}
                if (plan.allowAudioCall && !benefits.includes('Audio Calling')) benefits.push('Audio Calling');
                if (plan.allowVideoCall && !benefits.includes('Video Calling')) benefits.push('Video Calling');
                if (plan.allowVoiceNotes && !benefits.includes('Voice Notes (Mic)')) benefits.push('Voice Notes (Mic)');
                if (plan.allowImageUpload && !benefits.includes('Image Upload')) benefits.push('Image Upload');
                if (plan.allowLocationShare && !benefits.includes('Location Sharing')) benefits.push('Location Sharing');
);
fs.writeFileSync('src/components/Subscriptions.tsx', code);
console.log('Fixed web');

