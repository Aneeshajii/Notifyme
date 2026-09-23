import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '908105327441-30fotv2b3e8omgono9r41gjqrq4dvo0u.apps.googleusercontent.com',
    androidClientId: '908105327441-30fotv2b3e8omgono9r41gjqrq4dvo0u.apps.googleusercontent.com',
    iosClientId: '908105327441-30fotv2b3e8omgono9r41gjqrq4dvo0u.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'getnotifye'
    })
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken || authentication?.accessToken) {
        handleGoogleLoginWithBackend(authentication.idToken || authentication.accessToken || '');
      }
    } else if (response?.type === 'error') {
      Alert.alert('Authentication Error', response.error?.message || 'Google Sign-In failed');
    }
  }, [response]);

  const handleGoogleLoginWithBackend = async (token: string) => {
    setIsLoading(true);
    try {
      await loginWithGoogle(token);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'Google Sign-In failed on backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return Alert.alert('Error', 'Please fill in all fields');
    setIsLoading(true);
    try {
      if (isRegister) {
        const apiModule = (await import('../../services/api')).default;
        const res = await apiModule.post('/auth/register', { email: cleanEmail, password, name });
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
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="shield" size={48} color="#4f46e5" />
            </View>
            <Text style={styles.logoText}>GetNotifye</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield" size={32} color="#4f46e5" />
            </View>
            <Text style={styles.cardTitle}>{isRegister ? 'Create Account' : 'Login to continue'}</Text>
            <Text style={styles.cardSubtitle}>
              {isRegister ? 'Join GetNotifye today' : 'Please log in to use this feature and manage your GetNotifye account.'}
            </Text>

            {isRegister && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#cbd5e1"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#cbd5e1"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#cbd5e1"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: isRegister ? '#4f46e5' : '#0f172a' }]} 
              onPress={handleEmailAuth} 
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryBtnText}>{isRegister ? 'Create Account' : 'Sign In'}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.googleBtn} 
              onPress={() => promptAsync()}
              disabled={!request || isLoading}
            >
              <Ionicons name="logo-google" size={20} color="#0f172a" />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => setIsRegister(!isRegister)}
            >
              <Text style={styles.switchText}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={styles.switchLink}>{isRegister ? 'Sign In' : 'Sign Up'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    padding: 16, borderRadius: 24,
    backgroundColor: 'white',
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15, shadowRadius: 25, elevation: 10,
    marginBottom: 16
  },
  logoText: { fontSize: 32, fontWeight: '800', color: '#0f172a', letterSpacing: -1 },
  card: {
    backgroundColor: 'white', borderRadius: 24, padding: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.1, shadowRadius: 50, elevation: 12,
    alignItems: 'center'
  },
  cardHeader: { marginBottom: 16 },
  cardTitle: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
  cardSubtitle: { fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center', paddingHorizontal: 10 },
  input: {
    width: '100%', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12,
    padding: 12, fontSize: 16, color: '#0f172a', backgroundColor: 'white',
    marginBottom: 12
  },
  primaryBtn: {
    width: '100%', borderRadius: 12, padding: 12,
    alignItems: 'center', marginTop: 4
  },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { marginHorizontal: 12, color: '#cbd5e1', fontSize: 14 },
  googleBtn: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 12, marginBottom: 16
  },
  googleBtnText: { color: '#0f172a', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  switchBtn: { alignItems: 'center', paddingVertical: 8 },
  switchText: { fontSize: 14, color: '#64748b' },
  switchLink: { color: '#4f46e5', fontWeight: '700' },
});
