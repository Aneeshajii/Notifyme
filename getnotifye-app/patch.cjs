const fs = require('fs');

let apiCode = fs.readFileSync('services/api.ts', 'utf8');
apiCode = `import { DeviceEventEmitter } from 'react-native';\n` + apiCode;
apiCode = apiCode.replace(
  `return Promise.reject(error);`,
  `if (error.response?.status === 403) {
      if (error.response.data?.message === 'Account suspended. Contact support.' || error.response.data?.message === 'Account is blocked') {
        DeviceEventEmitter.emit('user-blocked');
      }
    }
    return Promise.reject(error);`
);
fs.writeFileSync('services/api.ts', apiCode);

let layoutCode = fs.readFileSync('app/_layout.tsx', 'utf8');
layoutCode = layoutCode.replace(
  `import { ActivityIndicator, View } from 'react-native';`,
  `import { ActivityIndicator, View, Text, DeviceEventEmitter, TouchableOpacity } from 'react-native';\nimport * as SecureStore from 'expo-secure-store';`
);

const stateCode = `  const [isBlocked, setIsBlocked] = useState(false);
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('user-blocked', () => setIsBlocked(true));
    return () => sub.remove();
  }, []);
`;
layoutCode = layoutCode.replace(`function RootLayoutNav() {`, `function RootLayoutNav() {\n` + stateCode);

const uiCode = `  if (isBlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#ef4444', padding: 20, borderRadius: 50, marginBottom: 20 }}>
          <Text style={{ fontSize: 40 }}>🚫</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 }}>Account Suspended</Text>
        <Text style={{ fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 30 }}>
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
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {`;
layoutCode = layoutCode.replace(`  if (isLoading) {`, uiCode);
fs.writeFileSync('app/_layout.tsx', layoutCode);
console.log('patched mobile app');
