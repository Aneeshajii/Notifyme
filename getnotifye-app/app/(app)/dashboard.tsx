import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user, tags, messages, refreshUserData } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const unread = messages.filter((m: any) => m.status !== 'read' && m.senderRole === 'scanner').length;
  const activeTags = tags.filter((t: any) => t.isActive).length;
  const totalScans = tags.reduce((acc: number, t: any) => acc + (t.scans?.length || 0), 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  }, []);

  const recentMessages = messages.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'there'} 👋</Text>
            <Text style={styles.subGreeting}>Here's what's happening today</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
            <View style={styles.avatar}>
              {user?.profilePicUrl ? (
                <Image source={{ uri: user.profilePicUrl }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#eef2ff' }]}>
            <Ionicons name="qr-code" size={22} color="#4f46e5" />
            <Text style={styles.statNum}>{activeTags}</Text>
            <Text style={styles.statLabel}>Active Tags</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="chatbubbles" size={22} color="#d97706" />
            <Text style={styles.statNum}>{unread}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="scan" size={22} color="#16a34a" />
            <Text style={styles.statNum}>{totalScans}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(app)/tags')}>
            <Ionicons name="add-circle" size={28} color="#4f46e5" />
            <Text style={styles.actionLabel}>Add Tag</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(app)/inbox')}>
            <Ionicons name="mail" size={28} color="#0891b2" />
            <Text style={styles.actionLabel}>Inbox</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(app)/scanner')}>
            <Ionicons name="scan-circle" size={28} color="#059669" />
            <Text style={styles.actionLabel}>Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(app)/profile')}>
            <Ionicons name="settings" size={28} color="#7c3aed" />
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* My Tags */}
        <Text style={styles.sectionTitle}>My QR Tags</Text>
        {tags.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🏷️</Text>
            <Text style={styles.emptyText}>No QR tags yet. Create your first one!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(app)/tags')}>
              <Text style={styles.emptyBtnText}>Create Tag</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tags.slice(0, 3).map((tag: any) => (
            <TouchableOpacity key={tag.id} style={styles.tagCard} onPress={() => router.push('/(app)/tags')}>
              <View style={[styles.tagDot, { backgroundColor: tag.isActive ? '#10b981' : '#94a3b8' }]} />
              <View style={styles.tagInfo}>
                <Text style={styles.tagName}>{tag.name}</Text>
                <Text style={styles.tagId}>ID: {tag.tagId}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ))
        )}

        {/* Recent Messages */}
        {recentMessages.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Messages</Text>
            {recentMessages.map((msg: any) => (
              <TouchableOpacity key={msg.id} style={styles.msgCard} onPress={() => router.push('/(app)/inbox')}>
                <View style={styles.msgAvatar}>
                  <Ionicons name="person" size={18} color="#6366f1" />
                </View>
                <View style={styles.msgInfo}>
                  <Text style={styles.msgSender}>{msg.senderInfo || 'Anonymous'}</Text>
                  <Text style={styles.msgContent} numberOfLines={1}>{msg.content}</Text>
                </View>
                <Text style={styles.msgTime}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subGreeting: { fontSize: 14, color: '#64748b', marginTop: 2 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 46, height: 46 },
  avatarText: { color: 'white', fontSize: 18, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 6 },
  statNum: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', paddingHorizontal: 20, marginBottom: 12, marginTop: 4 },
  quickActions: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  actionBtn: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: '#374151' },
  emptyBox: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0', borderStyle: 'dashed' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 16 },
  emptyBtn: { backgroundColor: '#4f46e5', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: 'white', fontWeight: '700' },
  tagCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, marginBottom: 10, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  tagDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  tagInfo: { flex: 1 },
  tagName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  tagId: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  msgCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, marginBottom: 8, borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  msgAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  msgInfo: { flex: 1 },
  msgSender: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  msgContent: { fontSize: 13, color: '#64748b', marginTop: 2 },
  msgTime: { fontSize: 11, color: '#94a3b8' },
});
