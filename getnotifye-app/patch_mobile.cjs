const fs = require('fs');
let code = fs.readFileSync('app/_layout.tsx', 'utf8');

code = code.replace(
  `import { ActivityIndicator, View, Text, DeviceEventEmitter, TouchableOpacity } from 'react-native';`,
  `import { ActivityIndicator, View, Text, DeviceEventEmitter, TouchableOpacity, Linking } from 'react-native';`
);

const oldUiSearch = `<Text style={{ fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 30 }}>
          Your account has been blocked by the administration. You can no longer access the app.
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
          onPress={async () => {
             await SecureStore.deleteItemAsync('userToken');
             await SecureStore.deleteItemAsync('refreshToken');
             setIsBlocked(false);
             router.replace('/(auth)/login');
          }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Return to Login</Text>
        </TouchableOpacity>`;

const newUiReplace = `<Text style={{ fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 10 }}>
          Your account has been blocked by the administration. You can no longer access the app.
        </Text>
        <Text style={{ fontSize: 14, color: '#f87171', textAlign: 'center', marginBottom: 30, fontWeight: 'bold' }}>
          Let us know if you think we made a mistake.
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginBottom: 16, width: '100%', alignItems: 'center' }}
          onPress={() => Linking.openURL('mailto:support@getnotifye.com')}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ backgroundColor: '#334155', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, width: '100%', alignItems: 'center' }}
          onPress={async () => {
             await SecureStore.deleteItemAsync('userToken');
             await SecureStore.deleteItemAsync('refreshToken');
             setIsBlocked(false);
             router.replace('/(auth)/login');
          }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Return to Login</Text>
        </TouchableOpacity>`;

code = code.replace(oldUiSearch, newUiReplace);
fs.writeFileSync('app/_layout.tsx', code);
console.log('patched mobile portal');
