import React, { useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Animated, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

// Animated Button Component for "Liquid" Press Effect
const AnimatedTouchable = ({ onPress, style, children }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function DashboardScreen() {
  const { user, tags, refreshUserData } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const activeTags = tags.filter((t: any) => t.isActive).length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        contentContainerStyle={{ paddingBottom: 100 }} // Extra padding for the floating tab bar scanner
      >


        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{user?.name || 'Guest'},</Text>
            <Text style={styles.subGreeting}>GetNotifye Welcomes you</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/profile')} activeOpacity={0.8}>
            <Image 
              source={{ uri: user?.profilePicUrl || 'https://ui-avatars.com/api/?name=' + (user?.name || 'Guest') + '&background=random' }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>



        <View style={styles.centerContainer}>
          <View style={styles.bigTagCard}>
            <View style={styles.qrIconWrapper}>
              <Ionicons name="qr-code-outline" size={42} color="#000" />
            </View>
            <Text style={styles.bigTagText}>{activeTags} {activeTags === 1 ? 'Tag' : 'Tags'}</Text>
          </View>
        </View>



        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <AnimatedTouchable style={styles.gridCard} onPress={() => router.push('/(app)/tags')}>
              <Ionicons name="add-outline" size={32} color="#000" style={styles.gridIcon} />
              <Text style={styles.gridText}>Add Tag</Text>
            </AnimatedTouchable>
            
            <AnimatedTouchable style={styles.gridCard} onPress={() => router.push('/(app)/inbox')}>
              <Ionicons name="chatbubble-outline" size={32} color="#000" style={styles.gridIcon} />
              <Text style={styles.gridText}>Messages</Text>
            </AnimatedTouchable>
          </View>

          <View style={styles.gridRow}>
            <AnimatedTouchable style={styles.gridCard} onPress={() => router.push('/(app)/profile')}>
              <Ionicons name="person-outline" size={32} color="#000" style={styles.gridIcon} />
              <Text style={styles.gridText}>Profile</Text>
            </AnimatedTouchable>
            
            <AnimatedTouchable style={styles.gridCard} onPress={() => router.push('/(app)/subscriptions')}>
              <Ionicons name="card-outline" size={32} color="#000" style={styles.gridIcon} />
              <Text style={styles.gridText}>Subscription</Text>
            </AnimatedTouchable>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' }, // Apple standard light gray background
  header: { 
    padding: 24, 
    paddingBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greeting: { fontSize: 28, fontWeight: '800', color: '#000', letterSpacing: -1, marginBottom: 4 },
  subGreeting: { fontSize: 20, color: '#000', fontWeight: '400', letterSpacing: -0.5 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
  },
  
  centerContainer: { alignItems: 'center', marginBottom: 40 },
  bigTagCard: {
    backgroundColor: '#ffffff',
    width: 160,
    height: 160,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  qrIconWrapper: {
    backgroundColor: '#f2f2f7',
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  bigTagText: { fontSize: 22, fontWeight: '600', color: '#000', letterSpacing: -0.5 },

  gridContainer: { paddingHorizontal: 24, gap: 16 },
  gridRow: { flexDirection: 'row', gap: 16 },
  gridCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: 130,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  gridIcon: { marginBottom: 12 },
  gridText: { fontSize: 16, fontWeight: '500', color: '#000', letterSpacing: -0.3 },
});
