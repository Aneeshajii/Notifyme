const fs = require('fs');
let code = fs.readFileSync('context/AuthContext.tsx', 'utf8');

code = code.replace(
  `loginWithGoogle: (idToken: string) => Promise<void>;`,
  `loginWithGoogle: (idToken: string) => Promise<void>;\n    loginWithApple: (identityToken: string) => Promise<void>;`
);

const googleCode = `  const loginWithGoogle = async (token: string) => {
    const res = await api.post('/auth/google/verify', { token });
    await SecureStore.setItemAsync('userToken', res.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
    if (res.data.user.isBlocked) {
      const { DeviceEventEmitter } = require('react-native');
      DeviceEventEmitter.emit('user-blocked');
    }
    setUser(res.data.user);
    setIsAuthenticated(true);
    
    if (socketRef.current) {
      connectSocket(res.data.user.id, res.data.accessToken);
    }
  };`;

const newAppleCode = `  const loginWithGoogle = async (token: string) => {
    const res = await api.post('/auth/google/verify', { token });
    await SecureStore.setItemAsync('userToken', res.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
    if (res.data.user.isBlocked) {
      const { DeviceEventEmitter } = require('react-native');
      DeviceEventEmitter.emit('user-blocked');
    }
    setUser(res.data.user);
    setIsAuthenticated(true);
    
    if (socketRef.current) {
      connectSocket(res.data.user.id, res.data.accessToken);
    }
  };

  const loginWithApple = async (identityToken: string) => {
    const res = await api.post('/auth/apple/verify', { identityToken });
    await SecureStore.setItemAsync('userToken', res.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
    if (res.data.user.isBlocked) {
      const { DeviceEventEmitter } = require('react-native');
      DeviceEventEmitter.emit('user-blocked');
    }
    setUser(res.data.user);
    setIsAuthenticated(true);
    
    if (socketRef.current) {
      connectSocket(res.data.user.id, res.data.accessToken);
    }
  };`;

code = code.replace(googleCode, newAppleCode);

code = code.replace(
  `login, loginWithGoogle, logout, refreshUserData, fetchTagsAndMessages`,
  `login, loginWithGoogle, loginWithApple, logout, refreshUserData, fetchTagsAndMessages`
);

fs.writeFileSync('context/AuthContext.tsx', code);
console.log('patched AuthContext with Apple Login');
