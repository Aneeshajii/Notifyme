const fs = require('fs');
let code = fs.readFileSync('context/AuthContext.tsx', 'utf8');

code = code.replace(
  `const res = await api.get('/auth/me');
      setUser(res.data);`,
  `const res = await api.get('/auth/me');
      if (res.data.isBlocked) {
        const { DeviceEventEmitter } = require('react-native');
        DeviceEventEmitter.emit('user-blocked');
      }
      setUser(res.data);`
);

code = code.replace(
  `setUser(res.data.user);
      setIsAuthenticated(true);`,
  `if (res.data.user.isBlocked) {
        const { DeviceEventEmitter } = require('react-native');
        DeviceEventEmitter.emit('user-blocked');
      }
      setUser(res.data.user);
      setIsAuthenticated(true);`
);

fs.writeFileSync('context/AuthContext.tsx', code);
console.log('patched mobile app auth checks');
