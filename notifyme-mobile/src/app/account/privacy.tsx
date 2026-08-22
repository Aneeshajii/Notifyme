import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Shield, Smartphone, Laptop, Trash2, Ban, EyeOff, Eye, MessageSquare, PhoneCall, Video, Image as ImageIcon } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function PrivacyScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState({
    hideEmail: true,
    hidePhone: true,
    allowMessages: true,
    allowAudioCalls: true,
    allowVideoCalls: true,
    allowImageSharing: true
  });
  
  const [sessions, setSessions] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    fetchPrivacyData();
  }, []);

  const fetchPrivacyData = async () => {
    try {
      setLoading(true);
      const [privRes, sessRes, blockRes] = await Promise.all([
        api.get('/auth/privacy'),
        api.get('/auth/sessions'),
        api.get('/auth/blocked')
      ]);
      
      setSettings(privRes.data);
      setSessions(sessRes.data);
      setBlockedUsers(blockRes.data);
    } catch (e) {
      console.error("Failed to load privacy settings", e);
      Alert.alert("Error", "Could not load privacy settings.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: string, value: boolean) => {
    // Optimistic UI update
    setSettings(prev => ({ ...prev, [key]: value }));
    try {
      await api.put('/auth/privacy', { [key]: value });
    } catch (e) {
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !value }));
      Alert.alert("Error", "Failed to update setting.");
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (e) {
      Alert.alert("Error", "Failed to terminate session.");
    }
  };

  const unblockUser = async (scannerId: string) => {
    try {
      await api.delete(`/auth/blocked/${scannerId}`);
      setBlockedUsers(prev => prev.filter(b => b.scannerId !== scannerId));
    } catch (e) {
      Alert.alert("Error", "Failed to unblock user.");
    }
  };

  if (loading) {
    return <View style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}><ActivityIndicator size="large" color="#1d4ed8" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconBg}>
            <Shield size={32} color="#1d4ed8" />
          </View>
          <Text style={styles.title}>Privacy Center</Text>
          <Text style={styles.subtitle}>Manage your visibility and security</Text>
        </View>

        <Text style={styles.sectionTitle}>Visibility</Text>
        <View style={styles.card}>
          <SettingToggle 
            icon={<EyeOff size={20} color="#64748b" />}
            title="Hide Email Address" 
            desc="Don't show email on QR scan page" 
            value={settings.hideEmail} 
            onValueChange={(v) => toggleSetting('hideEmail', v)} 
          />
          <View style={styles.divider} />
          <SettingToggle 
            icon={<EyeOff size={20} color="#64748b" />}
            title="Hide Phone Number" 
            desc="Don't show phone on QR scan page" 
            value={settings.hidePhone} 
            onValueChange={(v) => toggleSetting('hidePhone', v)} 
          />
        </View>

        <Text style={styles.sectionTitle}>Communication</Text>
        <View style={styles.card}>
          <SettingToggle 
            icon={<MessageSquare size={20} color="#64748b" />}
            title="Allow Messages" 
            desc="Receive chat messages from scans" 
            value={settings.allowMessages} 
            onValueChange={(v) => toggleSetting('allowMessages', v)} 
          />
          <View style={styles.divider} />
          <SettingToggle 
            icon={<PhoneCall size={20} color="#64748b" />}
            title="Allow Audio Calls" 
            desc="Receive voice calls from scans" 
            value={settings.allowAudioCalls} 
            onValueChange={(v) => toggleSetting('allowAudioCalls', v)} 
          />
          <View style={styles.divider} />
          <SettingToggle 
            icon={<Video size={20} color="#64748b" />}
            title="Allow Video Calls" 
            desc="Receive video calls from scans" 
            value={settings.allowVideoCalls} 
            onValueChange={(v) => toggleSetting('allowVideoCalls', v)} 
          />
          <View style={styles.divider} />
          <SettingToggle 
            icon={<ImageIcon size={20} color="#64748b" />}
            title="Allow Image Sharing" 
            desc="Allow users to send you images" 
            value={settings.allowImageSharing} 
            onValueChange={(v) => toggleSetting('allowImageSharing', v)} 
          />
        </View>

        <Text style={styles.sectionTitle}>Blocked Users</Text>
        <View style={styles.card}>
          {blockedUsers.length === 0 ? (
            <Text style={styles.emptyText}>No blocked users.</Text>
          ) : (
            blockedUsers.map((b: any, index) => (
              <View key={b.id} style={[styles.listItem, index > 0 && styles.listBorder]}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
                    <Ban size={18} color="#ef4444" />
                  </View>
                  <View>
                    <Text style={styles.itemTitle}>Anonymous Scanner</Text>
                    <Text style={styles.itemDesc}>ID: {b.scannerId.substring(0, 8)}...</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => unblockUser(b.scannerId)} style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Unblock</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Active Sessions</Text>
        <View style={styles.card}>
          {sessions.length === 0 ? (
            <Text style={styles.emptyText}>No active sessions.</Text>
          ) : (
            sessions.map((s: any, index) => (
              <View key={s.id} style={[styles.listItem, index > 0 && styles.listBorder]}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconCircle}>
                    {s.deviceInfo?.toLowerCase().includes('mobile') ? (
                      <Smartphone size={18} color="#1d4ed8" />
                    ) : (
                      <Laptop size={18} color="#1d4ed8" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.itemTitle} numberOfLines={1}>{s.deviceInfo || 'Unknown Device'}</Text>
                    <Text style={styles.itemDesc}>{s.ipAddress || 'Unknown IP'} • {new Date(s.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => terminateSession(s.id)} style={styles.iconActionBtn}>
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingToggle({ icon, title, desc, value, onValueChange }: any) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.rowLeft}>
        <View style={styles.settingIcon}>{icon}</View>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDesc}>{desc}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#e2e8f0", true: "#1d4ed8" }}
        thumbColor={"#ffffff"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  iconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4, marginTop: 8 },
  
  card: { backgroundColor: 'white', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 24 },
  
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 2 },
  settingDesc: { fontSize: 13, color: '#64748b' },
  
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
  
  emptyText: { color: '#94a3b8', fontStyle: 'italic', paddingVertical: 12, textAlign: 'center' },
  
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  listBorder: { borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 2, maxWidth: 200 },
  itemDesc: { fontSize: 12, color: '#64748b' },
  
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f1f5f9', borderRadius: 8 },
  actionBtnText: { color: '#0f172a', fontSize: 12, fontWeight: '600' },
  iconActionBtn: { padding: 8, backgroundColor: '#fef2f2', borderRadius: 8 }
});
