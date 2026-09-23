import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { WEB_APP_URL } from '../../constants/config';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* User Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={12} color="#d97706" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Subscription / Plan Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BILLING & PLAN</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/subscriptions')}>
            <View style={styles.menuIconBox}>
              <Ionicons name="card-outline" size={20} color="#0f172a" />
            </View>
            <Text style={styles.menuText}>Subscription Plan</Text>
            <View style={styles.planStatusBox}>
              <Text style={styles.planStatusText}>{user?.isPremium ? 'Pro' : 'Basic'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* Settings Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS & SUPPORT</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/privacy')}>
            <View style={styles.menuIconBox}>
              <Ionicons name="shield-outline" size={20} color="#0f172a" />
            </View>
            <Text style={styles.menuText}>Privacy Center</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/about')}>
            <View style={styles.menuIconBox}>
              <Ionicons name="information-circle-outline" size={20} color="#0f172a" />
            </View>
            <Text style={styles.menuText}>About Us</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/support')}>
            <View style={styles.menuIconBox}>
              <Ionicons name="help-circle-outline" size={20} color="#0f172a" />
            </View>
            <Text style={styles.menuText}>Support Center</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/contact')}>
            <View style={styles.menuIconBox}>
              <Ionicons name="mail-outline" size={20} color="#0f172a" />
            </View>
            <Text style={styles.menuText}>Contact Us</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  scrollContent: { padding: 24 },
  profileCard: { alignItems: 'center', backgroundColor: '#fff', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#4f46e5' },
  name: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  email: { fontSize: 15, color: '#64748b', marginBottom: 12 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
  premiumText: { color: '#d97706', fontSize: 12, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, marginBottom: 12, marginLeft: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  menuIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#0f172a' },
  planStatusBox: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 12 },
  planStatusText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginTop: 16, borderWidth: 1, borderColor: '#fecaca', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
