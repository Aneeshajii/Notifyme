const fs = require('fs');
let code = fs.readFileSync('app/(auth)/login.tsx', 'utf8');

// Add states
code = code.replace(
  "const [isRegister, setIsRegister] = useState(false);",
  "const [isRegister, setIsRegister] = useState(false);\n  const [isOtp, setIsOtp] = useState(false);\n  const [otpCode, setOtpCode] = useState('');\n  const [registrationToken, setRegistrationToken] = useState('');"
);

// Replace handleEmailAuth
const oldAuth = `  const handleEmailAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password || (isRegister && (!name || !lastName))) return Alert.alert('Error', 'Please fill in all fields');
    setIsLoading(true);
    try {
      if (isRegister) {
        const apiModule = (await import('../../services/api')).default;
        const res = await apiModule.post('/auth/register', { email: cleanEmail, password, name, lastName });
        const SecureStore = await import('expo-secure-store');
        await SecureStore.setItemAsync('userToken', res.data.accessToken);
        await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
        await login(cleanEmail, password);
      } else {
        await login(cleanEmail, password);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };`;

const newAuth = `  const handleEmailAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();
    
    setIsLoading(true);
    try {
      if (isOtp) {
          if (!otpCode) { setIsLoading(false); return Alert.alert('Error', 'Please enter the OTP'); }
          const apiModule = (await import('../../services/api')).default;
          const res = await apiModule.post('/auth/verify-registration', { registrationToken, otp: otpCode });
          const SecureStore = await import('expo-secure-store');
          await SecureStore.setItemAsync('userToken', res.data.accessToken);
          await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
          await login(cleanEmail, password);
      } else if (isRegister) {
        if (!cleanEmail || !password || !name || !lastName) { setIsLoading(false); return Alert.alert('Error', 'Please fill in all fields'); }
        const apiModule = (await import('../../services/api')).default;
        const res = await apiModule.post('/auth/register', { email: cleanEmail, password, name, lastName });
        
        if (res.data.requiresOtp) {
            setRegistrationToken(res.data.registrationToken);
            setIsOtp(true);
            setIsLoading(false);
            return;
        }
      } else {
        if (!cleanEmail || !password) { setIsLoading(false); return Alert.alert('Error', 'Please fill in all fields'); }
        await login(cleanEmail, password);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };`;

code = code.replace(oldAuth, newAuth);

// Replace UI titles
code = code.replace(
  "{isRegister ? 'Create Account' : 'Login to continue'}",
  "{isOtp ? 'Verify Email' : isRegister ? 'Create Account' : 'Login to continue'}"
);
code = code.replace(
  "{isRegister ? 'Join GetNotifye today' : 'Please log in to use this feature and manage your GetNotifye account.'}",
  "{isOtp ? 'We sent a 6-digit code to your email' : isRegister ? 'Join GetNotifye today' : 'Please log in to use this feature and manage your GetNotifye account.'}"
);

// Replace Form UI
const oldForm = `            {isRegister && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            {isRegister && (
              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#94a3b8"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.mainButton} onPress={handleEmailAuth} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.mainButtonText}>{isRegister ? 'Sign Up' : 'Sign In'}</Text>
              )}
            </TouchableOpacity>`;

const newForm = `            {isOtp ? (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#94a3b8"
                    value={otpCode}
                    onChangeText={setOtpCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <TouchableOpacity style={styles.mainButton} onPress={handleEmailAuth} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.mainButtonText}>Verify & Create Account</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setIsOtp(false)}>
                  <Text style={{ color: '#64748b' }}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {isRegister && (
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="First Name"
                      placeholderTextColor="#94a3b8"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                {isRegister && (
                  <View style={styles.inputContainer}>
                    <Ionicons name="people-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Last Name"
                      placeholderTextColor="#94a3b8"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity style={styles.mainButton} onPress={handleEmailAuth} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.mainButtonText}>{isRegister ? 'Sign Up' : 'Sign In'}</Text>
                  )}
                </TouchableOpacity>
              </>
            )}`;

code = code.replace(oldForm, newForm);

// hide the toggle at the bottom if otp
const oldToggle = `            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
                <Text style={styles.switchLink}>
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>`;

const newToggle = `            {!isOtp && (
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
                  <Text style={styles.switchLink}>
                    {isRegister ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}`;
            
code = code.replace(oldToggle, newToggle);

fs.writeFileSync('app/(auth)/login.tsx', code);
console.log('patched mobile app');
