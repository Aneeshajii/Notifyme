const fs = require('fs');
let code = fs.readFileSync('app/(app)/_layout.tsx', 'utf8');

const replacement = `  const { messages, user } = useAuth();`;
code = code.replace(
  'const { messages } = useAuth();',
  replacement
);

const bannerCode = `
    <>
    {user && user.emailVerified === false && (
      <View style={{ backgroundColor: '#fef3c7', padding: 12, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#f59e0b', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 }}>
          <Ionicons name="warning" size={20} color="#d97706" />
          <Text style={{ color: '#92400e', marginLeft: 8, fontSize: 13, fontWeight: '500', flexShrink: 1 }}>
            Please verify your email to unlock all features.
          </Text>
        </View>
        <TouchableOpacity 
          style={{ backgroundColor: '#d97706', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}
          onPress={() => {
            api.post('/auth/resend-verification', {})
              .then(() => alert('Verification email sent! Check your inbox.'))
              .catch(err => alert(err?.response?.data?.message || 'Failed to resend.'));
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>Resend</Text>
        </TouchableOpacity>
      </View>
    )}
    <Tabs
`;

code = code.replace(
  '    <>\n    <Tabs',
  bannerCode
);
code = code.replace(
  '    <>\r\n    <Tabs',
  bannerCode
);

fs.writeFileSync('app/(app)/_layout.tsx', code);
console.log('mobile app layout patched');
