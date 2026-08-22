import { Stack } from "expo-router";
import { useAuth, AuthProvider } from "../context/AuthContext";
import { View, Text, StyleSheet, Animated } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { useEffect, useRef } from "react";

function MainLayout() {
  const { isLoading } = useAuth();
  
  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const fadeOutValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle breathing animation (scale and opacity)
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleValue, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacityValue, { toValue: 0.7, duration: 1500, useNativeDriver: true })
        ]),
        Animated.parallel([
          Animated.timing(scaleValue, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacityValue, { toValue: 1, duration: 1500, useNativeDriver: true })
        ])
      ])
    ).start();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ transform: [{ scale: scaleValue }], opacity: opacityValue }}>
          <ShieldCheck size={80} color="#4f46e5" />
        </Animated.View>
        <Animated.Text style={[styles.loadingText, { opacity: opacityValue }]}>
          Please wait, NotifyMe is getting things ready for you…
        </Animated.Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade', // Much smoother than slide for initial load
          presentation: 'card',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="account" />
      </Stack>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 24,
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  }
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
