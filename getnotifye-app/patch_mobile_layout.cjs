const fs = require('fs');

let layoutCode = fs.readFileSync('app/_layout.tsx', 'utf8');

layoutCode = layoutCode.replace(
  `import { ActivityIndicator, View, Text, DeviceEventEmitter, TouchableOpacity, Linking } from 'react-native';`,
  `import { ActivityIndicator, View, Text, DeviceEventEmitter, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';\nimport api from '../services/api';`
);

const oldState = `  const [isBlocked, setIsBlocked] = useState(false);`;
const newState = `  const [isBlocked, setIsBlocked] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportDescription, setSupportDescription] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  const handleSupportSubmit = async () => {
    if (!supportDescription.trim()) {
      Alert.alert('Error', 'Please provide a description of the issue');
      return;
    }
    setIsSubmittingSupport(true);
    try {
      await api.post('/tickets', {
        subject: 'Account Blocked Issue',
        description: supportDescription,
        priority: 'high'
      });
      Alert.alert('Success', 'Your support ticket has been submitted. We will review your account soon.', [
        { text: 'OK', onPress: () => { setShowSupportForm(false); setSupportDescription(''); } }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmittingSupport(false);
    }
  };`;

layoutCode = layoutCode.replace(oldState, newState);

const oldUi = `  if (isBlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#ef4444', padding: 20, borderRadius: 50, marginBottom: 20 }}>
          <Text style={{ fontSize: 40 }}>🚫</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 }}>Account Suspended</Text>
        <Text style={{ fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 10 }}>
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
        </TouchableOpacity>
      </View>
    );
  }`;

const newUi = `  if (isBlocked) {
    if (showSupportForm) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0f172a', padding: 20, paddingTop: 60 }}>
          <TouchableOpacity onPress={() => setShowSupportForm(false)} style={{ marginBottom: 24 }}>
            <Text style={{ color: '#94a3b8', fontSize: 16, fontWeight: 'bold' }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>Contact Support</Text>
          <Text style={{ color: '#94a3b8', marginBottom: 8, fontSize: 16 }}>Please describe why you think your account should be unblocked:</Text>
          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 16, minHeight: 150, fontSize: 16, marginBottom: 24 }}
            multiline
            textAlignVertical="top"
            placeholder="Type your message here..."
            value={supportDescription}
            onChangeText={setSupportDescription}
          />
          <TouchableOpacity 
            style={{ backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, alignItems: 'center' }}
            onPress={handleSupportSubmit}
            disabled={isSubmittingSupport}>
            {isSubmittingSupport ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Submit Ticket</Text>}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#ef4444', padding: 20, borderRadius: 50, marginBottom: 20 }}>
          <Text style={{ fontSize: 40 }}>🚫</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 }}>Account Suspended</Text>
        <Text style={{ fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 10 }}>
          Your account has been blocked by the administration. You can no longer access the app.
        </Text>
        <Text style={{ fontSize: 14, color: '#f87171', textAlign: 'center', marginBottom: 30, fontWeight: 'bold' }}>
          Let us know if you think we made a mistake.
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginBottom: 16, width: '100%', alignItems: 'center' }}
          onPress={() => setShowSupportForm(true)}>
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
        </TouchableOpacity>
      </View>
    );
  }`;

layoutCode = layoutCode.replace(oldUi, newUi);

fs.writeFileSync('app/_layout.tsx', layoutCode);
console.log('patched mobile layout');
