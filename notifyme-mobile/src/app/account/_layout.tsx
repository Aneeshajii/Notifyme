import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitleVisible: false,
        animation: 'slide_from_right',
        presentation: 'card',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        contentStyle: { backgroundColor: '#f8fafc' },
        headerStyle: { backgroundColor: '#f8fafc' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="subscriptions" options={{ title: 'Subscriptions' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile Edit' }} />

      <Stack.Screen name="privacy" options={{ title: 'Privacy Center' }} />
      <Stack.Screen name="about" options={{ title: 'About Us' }} />
      <Stack.Screen name="support" options={{ title: 'Support Center' }} />
      <Stack.Screen name="settings" options={{ title: 'Contact Us' }} />
    </Stack>
  );
}
