import React, { useState, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image, Linking } from 'react-native';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function AppLayout() {
  const { messages } = useAuth();
  const router = useRouter();
  const unreadCount = messages.filter((m: any) => m.status !== 'read' && m.senderRole === 'scanner').length;

  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/active');
      if (res.data && res.data.length > 0) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.log('Failed to fetch announcements:', err);
    }
  };

  const handleDismiss = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    // Optionally call an endpoint to mark as seen, but for now just dismiss locally for the session
  };

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="chatbubble-outline" size={size} color={color} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />


      <Tabs.Screen
        name="scanner"
        options={{
          title: '',
          tabBarIcon: () => (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/scanner')}
              style={styles.floatingButtonContainer}
            >
              <LinearGradient
                colors={['#4facfe', '#8E2DE2', '#4A00E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.floatingButton}
              >
                <Ionicons name="scan-outline" size={28} color="white" />
              </LinearGradient>
              <View style={styles.glowEffect} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          title: 'Tags',
          tabBarIcon: ({ color, size }) => <Ionicons name="pricetag-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      


      <Tabs.Screen name="subscriptions" options={{ href: null, title: 'Subscriptions' }} />
      <Tabs.Screen name="privacy" options={{ href: null, title: 'Privacy Center' }} />
      <Tabs.Screen name="about" options={{ href: null, title: 'About Us' }} />
      <Tabs.Screen name="support" options={{ href: null, title: 'Support Center' }} />
      <Tabs.Screen name="contact" options={{ href: null, title: 'Contact Us' }} />
      <Tabs.Screen name="legal" options={{ href: null, title: 'Legal' }} />
        </Tabs>
    {announcements.map(announcement => (
      <Modal key={announcement.id} visible={true} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', width: '100%', borderRadius: 24, padding: 24, maxHeight: '80%' }}>
            {!!announcement.imageUrl && (
              <Image source={{ uri: announcement.imageUrl }} style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: 16 }} resizeMode="cover" />
            )}
            <ScrollView>
              <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 12, color: '#0f172a' }}>{announcement.title}</Text>
              <Text style={{ fontSize: 16, color: '#475569', lineHeight: 24, marginBottom: 24 }}>{announcement.description}</Text>
            </ScrollView>
            {!!announcement.actionUrl && !!announcement.actionButtonText && (
              <TouchableOpacity onPress={() => Linking.openURL(announcement.actionUrl)} style={{ backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{announcement.actionButtonText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleDismiss(announcement.id)} style={{ padding: 16, alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12 }}>
              <Text style={{ color: '#64748b', fontWeight: 'bold', fontSize: 16 }}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    ))}
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 0,
    height: 90,
    paddingBottom: 28,
    paddingTop: 12,
    position: 'absolute', // To allow floating button to break bounds
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 20,
  },
  tabLabel: { fontSize: 11, fontWeight: '500', marginTop: 4 },
  badge: {
    position: 'absolute', top: -6, right: -10,
    backgroundColor: '#007AFF', borderRadius: 10,
    minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: '#fff'
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
  
  floatingButtonContainer: {
    top: -20, // Float above the tab bar
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  glowEffect: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8E2DE2',
    opacity: 0.4,
    transform: [{ scale: 1.4 }],
    zIndex: 1,
    shadowColor: '#8E2DE2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
});


