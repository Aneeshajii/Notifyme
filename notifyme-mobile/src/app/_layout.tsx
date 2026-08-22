import { Stack } from "expo-router";
import { useAuth, AuthProvider } from "../context/AuthContext";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import MobileLoadingScreen from "../components/MobileLoadingScreen";

function MainLayout() {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <MobileLoadingScreen />;
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
