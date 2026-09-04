import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, ActivityIndicator, Switch, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { WEB_APP_URL } from '../../constants/config';

export default function ProfileScreen() {
  const { user, logout, refreshUserData } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/auth/profile/${user?.id}`, { name, phone });
      await refreshUserData();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout }
    ]);
  };

  const openWebPage = (tab: string) => {
    Linking.openURL(`${WEB_APP_URL}?tab=${tab}`);
  };

  const menuItems = [
    { icon: 'card-outline', label: 'Subscription & Billing', tab: 'subscriptions', color: '#4f46e5' },
    { icon: 'analytics-outline', label: 'Analytics', tab: 'analytics', color: '#0891b2' },
    { icon: 'time-outline', label: 'Scan History', tab: 'scan_history', color: '#059669' },
    { icon: 'notifications-outline', label: 'Notifications', tab: 'notifications', color: '#d97706' },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', tab: 'privacy', color: '#7c3aed' },
    { icon: 'people-outline', label: 'Family Sharing', tab: 'family', color: '#db2777' },
    { icon: 'help-circle-outline', label: 'Support Center', tab: 'support', color: '#64748b' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar + Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{(user?.name || user?.email || 'U')[0].toUpperCase()}</Text>
          </View>
          {!editing ? (
            <>
              <Text style={styles.userName}>{user?.name || 'No name set'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={12} color="#d97706" />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.editFields}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user?.tags?.length || 0}</Text>
            <Text style={styles.statLabel}>QR Tags</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
            <Text style={styles.statNum}>{user?.isPremium ? '⭐' : 'Free'}</Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user?.phoneVerified ? '✅' : '❌'}</Text>
            <Text style={styles.statLabel}>Phone</Text>
          </View>
        </View>

        {/* Menu Items — open in browser */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.tab}
              style={[styles.menuRow, idx < menuItems.length - 1 && styles.menuBorder]}
              onPress={() => openWebPage(item.tab)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="open-outline" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>GetNotifye v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  editBtn: { fontSize: 15, fontWeight: '600', color: '#4f46e5' },
  avatarSection: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24, backgroundColor: 'white', marginBottom: 16 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarText: { fontSize: 36, fontWeight: '700', color: 'white' },
  userName: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  userEmail: { fontSize: 14, color: '#64748b', marginTop: 4 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 10 },
  premiumText: { fontSize: 12, fontWeight: '700', color: '#d97706' },
  editFields: { width: '100%', gap: 12, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', backgroundColor: '#f8fafc' },
  saveBtn: { backgroundColor: '#4f46e5', borderRadius: 12, padding: 15, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  statsRow: { flexDirection: 'row', backgroundColor: 'white', marginBottom: 16 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f1f5f9' },
  statNum: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 3, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#94a3b8', paddingHorizontal: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 18, marginBottom: 16, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 12 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0f172a' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 8, backgroundColor: '#fff1f2', borderRadius: 14, padding: 16 },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
  version: { textAlign: 'center', color: '#cbd5e1', fontSize: 12, marginTop: 20 },
});
