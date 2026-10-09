const fs = require('fs');
let code = fs.readFileSync('context/AuthContext.tsx', 'utf8');

code = code.replace(
  `const loginWithGoogle = async (token: string) => {
    const res = await api.post('/auth/google/verify', { token });
    await SecureStore.setItemAsync('userToken', res.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
    setUser(res.data.user);
    setIsAuthenticated(true);`,
  `const loginWithGoogle = async (token: string) => {
    const res = await api.post('/auth/google/verify', { token });
    await SecureStore.setItemAsync('userToken', res.data.accessToken);
    await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
    if (res.data.user.isBlocked) {
      const { DeviceEventEmitter } = require('react-native');
      DeviceEventEmitter.emit('user-blocked');
    }
    setUser(res.data.user);
    setIsAuthenticated(true);`
);

fs.writeFileSync('context/AuthContext.tsx', code);
console.log('patched google auth check');
