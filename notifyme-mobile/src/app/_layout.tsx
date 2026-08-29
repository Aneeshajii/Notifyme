import { Stack } from "expo-router";
import { useAuth, AuthProvider } from "../context/AuthContext";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import MobileLoadingScreen from "../components/MobileLoadingScreen";

import { Modal, Image, Linking, TouchableOpacity } from "react-native";
import { useState } from "react";
import api from "../services/api";

function MainLayout() {
  const { isLoading, user } = useAuth();
  const [activeInAppAnnouncement, setActiveInAppAnnouncement] = useState<any | null>(null);

  useEffect(() => {
      if (user?.id) {
          api.get(`/announcements/active`).then(res => {
              const inApp = res.data.find((a: any) => a.deliveryTypes.includes('IN_APP'));
              if (inApp) {
                  setActiveInAppAnnouncement(inApp);
              }
          }).catch(err => console.log('Error fetching announcements in layout', err));
      } else {
          setActiveInAppAnnouncement(null);
      }
  }, [user]);
  
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

      {/* In-App Announcement Modal (Global) */}
      <Modal visible={!!activeInAppAnnouncement} transparent={true} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 24, width: '100%', overflow: 'hidden' }}>
                {!!activeInAppAnnouncement?.imageUrl && (
                    <Image source={{ uri: activeInAppAnnouncement.imageUrl }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
                )}
                <View style={{ padding: 24 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 }}>{activeInAppAnnouncement?.title}</Text>
                    <Text style={{ fontSize: 16, color: '#475569', lineHeight: 24, marginBottom: 24 }}>{activeInAppAnnouncement?.description}</Text>
                    
                    {!!activeInAppAnnouncement?.actionButtonText && !!activeInAppAnnouncement?.actionUrl && (
                        <TouchableOpacity 
                            onPress={() => {
                                Linking.openURL(activeInAppAnnouncement.actionUrl);
                                api.post(`/announcements/${activeInAppAnnouncement.id}/dismiss`);
                                setActiveInAppAnnouncement(null);
                            }}
                            style={{ backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{activeInAppAnnouncement.actionButtonText}</Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                        onPress={() => {
                            api.post(`/announcements/${activeInAppAnnouncement?.id}/dismiss`);
                            setActiveInAppAnnouncement(null);
                        }}
                        style={{ backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, alignItems: 'center' }}
                    >
                        <Text style={{ color: '#475569', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
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
