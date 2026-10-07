
const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  'allowImageSharing?: boolean;',
  'allowImageSharing?: boolean;\n  allowVoiceNotes?: boolean;\n  allowLocationShare?: boolean;'
);
code = code.replace(
  '<button onClick={toggleRecording} style={{ background: isRecording ? \'#ef4444\' : \'transparent\', borderRadius: \'50%\', padding: \'6px\', border: \'none\', cursor: \'pointer\', color: isRecording ? \'white\' : \'#64748b\' }}>',
  '{tagData.allowVoiceNotes !== false && (<button onClick={toggleRecording} style={{ background: isRecording ? \'#ef4444\' : \'transparent\', borderRadius: \'50%\', padding: \'6px\', border: \'none\', cursor: \'pointer\', color: isRecording ? \'white\' : \'#64748b\' }}>'
);
code = code.replace(
  '{isRecording ? <MicOff size={22} /> : <Mic size={22} />}\n                                  </button>',
  '{isRecording ? <MicOff size={22} /> : <Mic size={22} />}\n                                  </button>)}'
);
fs.writeFileSync('src/App.tsx', code);

