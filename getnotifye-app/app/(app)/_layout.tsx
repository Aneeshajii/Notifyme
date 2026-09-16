import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function AppLayout() {
  const { messages } = useAuth();
  const router = useRouter();
  const unreadCount = messages.filter((m: any) => m.status !== 'read' && m.senderRole === 'scanner').length;

  return (
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
      {/* Custom Scanner Button */}
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
      
      {/* Hidden Screens */}
      <Tabs.Screen name="subscriptions" options={{ href: null, title: 'Subscriptions' }} />
      <Tabs.Screen name="privacy" options={{ href: null, title: 'Privacy Center' }} />
      <Tabs.Screen name="about" options={{ href: null, title: 'About Us' }} />
      <Tabs.Screen name="support" options={{ href: null, title: 'Support Center' }} />
      <Tabs.Screen name="contact" options={{ href: null, title: 'Contact Us' }} />
    </Tabs>
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
