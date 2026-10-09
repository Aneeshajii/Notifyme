const fs = require('fs');
let code = fs.readFileSync('app/(auth)/login.tsx', 'utf8');

const switchUi = `            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => setIsRegister(!isRegister)}
            >
              <Text style={styles.switchText}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.switchLink}>{isRegister ? 'Sign In' : 'Sign Up'}</Text>
              </Text>
            </TouchableOpacity>`;

const newSwitchUi = `            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => setIsRegister(!isRegister)}
            >
              <Text style={styles.switchText}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.switchLink}>{isRegister ? 'Sign In' : 'Sign Up'}</Text>
              </Text>
            </TouchableOpacity>

            <View style={{ marginTop: 24, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 18 }}>
                By continuing, you agree to our{' '}
                <Text 
                  style={{ color: '#4f46e5', textDecorationLine: 'underline' }}
                  onPress={() => Linking.openURL('https://getnotifye.com/terms')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text 
                  style={{ color: '#4f46e5', textDecorationLine: 'underline' }}
                  onPress={() => Linking.openURL('https://getnotifye.com/privacy')}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>`;

code = code.replace(switchUi, newSwitchUi);

code = code.replace(
  `ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image`,
  `ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, Linking`
);

fs.writeFileSync('app/(auth)/login.tsx', code);
console.log('patched login.tsx EULA');
