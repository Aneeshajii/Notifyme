import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, Text, DeviceEventEmitter, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Note: expo-notifications is removed here because it breaks Expo Go on Android SDK 53+.
// Push notifications will require a custom EAS development build.

function RootLayoutNav() {
  const [isBlocked, setIsBlocked] = useState(false);
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('user-blocked', () => setIsBlocked(true));
    return () => sub.remove();
  }, []);

  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const secondSegment = (segments as string[])[1];

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      const needsOnboarding = user && (!user.tags || user.tags.length === 0);
      if (needsOnboarding && secondSegment !== 'onboarding') {
        router.replace('/(auth)/onboarding');
      } else if (!needsOnboarding && !inAppGroup) {
        router.replace('/(app)/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, segments]);

  if (isBlocked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#ef4444', padding: 20, borderRadius: 50, marginBottom: 20 }}>
          <Text style={{ fontSize: 40 }}>🚫</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 10 }}>Account Suspended</Text>
        <Text style={{ fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 30 }}>
          Your account has been blocked by the administration. You can no longer access the app.
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
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
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" />
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
