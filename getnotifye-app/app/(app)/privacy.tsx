import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function PrivacyScreen() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  
  const [settings, setSettings] = useState({
    hideEmail: true,
    hidePhone: true,
    allowAnonymousMsg: true,
    allowAudioCalls: true,
    allowVideoCalls: true,
    allowImageSharing: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      setLoadingBlocked(true);
      const res = await api.get('/auth/blocked');
      setBlockedUsers(res.data);
    } catch (error) {
      console.log('Error fetching blocked users:', error);
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleUnblock = async (scannerId: string) => {
    try {
      await api.delete(`/auth/blocked/${scannerId}`);
      Alert.alert('Success', 'User unblocked.');
      fetchBlockedUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to unblock user.');
    }
  };

  const SeniorToggle = ({ title, description, checked, onChange }: any) => (
    <View style={styles.toggleContainer}>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch value={checked} onValueChange={onChange} trackColor={{ false: '#cbd5e1', true: '#10b981' }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Center</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionHeader}>Visibility Privacy</Text>
        <SeniorToggle 
          title="Hide Email Address" 
          description="Your email will not be visible to people who scan your QR. They can only message you through the app." 
          checked={settings.hideEmail} 
          onChange={() => toggleSetting('hideEmail')} 
        />
        <SeniorToggle 
          title="Hide Phone Number" 
          description="Your phone number stays private. People can still contact you through GetNotifye's secure calling." 
          checked={settings.hidePhone} 
          onChange={() => toggleSetting('hidePhone')} 
        />

        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Communication Permissions</Text>
        <SeniorToggle 
          title="Allow Anonymous Messages" 
          description="Allow people to message you without creating an account." 
          checked={settings.allowAnonymousMsg} 
          onChange={() => toggleSetting('allowAnonymousMsg')} 
        />
        <SeniorToggle 
          title="Allow Audio Calls" 
          description="Allow people to call you securely over the internet." 
          checked={settings.allowAudioCalls} 
          onChange={() => toggleSetting('allowAudioCalls')} 
        />
        <SeniorToggle 
          title="Allow Video Calls" 
          description="Allow people to request video calls." 
          checked={settings.allowVideoCalls} 
          onChange={() => toggleSetting('allowVideoCalls')} 
        />
        <SeniorToggle 
          title="Allow Image Sharing" 
          description="Allow scanners to send you photos." 
          checked={settings.allowImageSharing} 
          onChange={() => toggleSetting('allowImageSharing')} 
        />

        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Legal & Compliance</Text>
        <View style={styles.legalBox}>
          {[
            { name: 'Privacy Policy', key: 'privacy-policy' },
            { name: 'Terms & Conditions', key: 'terms' },
            { name: 'Cookie Policy', key: 'cookie-policy' },
            { name: 'Data & Privacy Practices', key: 'data-privacy' },
            { name: 'Disclaimer', key: 'disclaimer' }
          ].map((item, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.legalBtn}
              onPress={() => router.push(`/(app)/legal?page=${item.key}` as any)}
            >
              <Text style={styles.legalBtnText}>{item.name}</Text>
              <Ionicons name="arrow-forward" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Blocked Users</Text>
        <View style={styles.legalBox}>
          {loadingBlocked ? (
            <ActivityIndicator size="small" color="#0f172a" style={{ padding: 16 }} />
          ) : blockedUsers.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#64748b', padding: 16 }}>No blocked users found.</Text>
          ) : (
            blockedUsers.map((bu, index) => (
              <View key={bu.id} style={[styles.legalBtn, index === blockedUsers.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.legalBtnText}>
                    {bu.scannerId === 'anonymous' ? 'Anonymous Scanner' : `Scanner: ${bu.scannerId}`}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Blocked on: {new Date(bu.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                  onPress={() => handleUnblock(bu.scannerId)}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>Unblock</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  content: { padding: 24 },
  sectionHeader: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  toggleContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  toggleTextContainer: { flex: 1, paddingRight: 16 },
  toggleTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  toggleDesc: { fontSize: 14, color: '#64748b' },
  legalBox: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  legalBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  legalBtnText: { fontSize: 16, fontWeight: '600', color: '#334155' }
});
