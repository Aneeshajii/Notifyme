const fs = require('fs');
let code = fs.readFileSync('app/(auth)/login.tsx', 'utf8');

code = code.replace(
  `import * as Google from 'expo-auth-session/providers/google';`,
  `import * as Google from 'expo-auth-session/providers/google';\nimport * as AppleAuthentication from 'expo-apple-authentication';`
);

code = code.replace(
  `const { login, loginWithGoogle } = useAuth();`,
  `const { login, loginWithGoogle, loginWithApple } = useAuth();`
);

const googleBtn = `            <TouchableOpacity 
              style={styles.googleBtn}
              onPress={() => promptAsync()}
            >
              <Ionicons name="logo-google" size={24} color="#ea4335" />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>`;

const newButtons = `            <TouchableOpacity 
              style={styles.googleBtn}
              onPress={() => promptAsync()}
            >
              <Ionicons name="logo-google" size={24} color="#ea4335" />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={{ width: '100%', height: 50, marginBottom: 16 }}
                onPress={async () => {
                  try {
                    const credential = await AppleAuthentication.signInAsync({
                      requestedScopes: [
                        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                        AppleAuthentication.AppleAuthenticationScope.EMAIL,
                      ],
                    });
                    if (credential.identityToken) {
                      await loginWithApple(credential.identityToken);
                    }
                  } catch (e: any) {
                    if (e.code !== 'ERR_REQUEST_CANCELED') {
                      Alert.alert('Apple Sign In Error', 'Failed to sign in with Apple.');
                    }
                  }
                }}
              />
            )}`;

code = code.replace(googleBtn, newButtons);
fs.writeFileSync('app/(auth)/login.tsx', code);
console.log('patched login apple button');
