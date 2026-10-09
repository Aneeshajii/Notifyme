const fs = require('fs');
let code = fs.readFileSync('app/(app)/profile.tsx', 'utf8');

code = code.replace(
  `import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { WEB_APP_URL } from '../../constants/config';
import { useRouter } from 'expo-router';`,
  `import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { WEB_APP_URL } from '../../constants/config';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import * as SecureStore from 'expo-secure-store';`
);

const logoutFunc = `  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout }
    ]);
  };`;

const newFuncs = `  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to permanently delete your account? This action cannot be undone and all your data, tags, and messages will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await api.delete('/auth/me');
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.deleteItemAsync('refreshToken');
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };`;

code = code.replace(logoutFunc, newFuncs);

const buttonsUi = `        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <View style={{ height: 120 }} />`;

const newButtonsUi = `        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.logoutBtn, { marginTop: 8, borderColor: '#f87171', backgroundColor: '#fef2f2' }]} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color="#b91c1c" />
          <Text style={[styles.logoutText, { color: '#b91c1c' }]}>Delete Account</Text>
        </TouchableOpacity>
        <View style={{ height: 120 }} />`;

code = code.replace(buttonsUi, newButtonsUi);
fs.writeFileSync('app/(app)/profile.tsx', code);
console.log('Patched profile.tsx');
