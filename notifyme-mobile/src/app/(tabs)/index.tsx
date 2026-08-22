import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions } from "react-native";
import { QrCode, MessageSquare, Phone, HelpCircle, User, CreditCard, Activity, ChevronRight, Lock, CheckCircle2, ShieldAlert } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { router } from "expo-router";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({ tags: 0, messages: 0, scans: 0 });
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [tagsRes, msgsRes] = await Promise.all([
        api.get(`/tags/user/${user?.id}`),
        api.get(`/messages/user/${user?.id}`)
      ]);
      
      const tags = tagsRes.data;
      const msgs = msgsRes.data;
      
      const totalScans = tags.reduce((sum: number, tag: any) => sum + (tag.scans || 0), 0);
      
      setStats({
        tags: tags.length,
        messages: msgs.length,
        scans: totalScans
      });
      setUnreadCount(msgs.length);
    } catch (e) {
      console.log('Error fetching stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (authLoading || loading) {
    return <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}><ActivityIndicator size="large" color="#1d4ed8" /></View>;
  }

  const planName = user?.subscription?.name || 'No Plan';
  const qrLimit = user?.subscription?.maxQrCodes || 0;
  const qrUsed = stats.tags;

  const actionCards = [
    { icon: <QrCode size={24} color="#4f46e5" />, label: 'Generate QR', bg: '#e0e7ff', route: '/(tabs)/tags' },
    { icon: <MessageSquare size={24} color="#10b981" />, label: 'Messages', bg: '#d1fae5', route: '/(tabs)/messages' },
    { icon: <Phone size={24} color="#f59e0b" />, label: 'Calls', bg: '#fef3c7', route: '/(tabs)/messages' },
    { icon: <HelpCircle size={24} color="#ec4899" />, label: 'Support', bg: '#fce7f3', route: '/account/support' },
    { icon: <User size={24} color="#8b5cf6" />, label: 'My Profile', bg: '#ede9fe', route: '/(tabs)/profile' },
    { icon: <CreditCard size={24} color="#0ea5e9" />, label: 'Subscription', bg: '#e0f2fe', route: '/account/subscriptions' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} bounces={true} showsVerticalScrollIndicator={false}>
        
        {/* Top Greeting Section */}
        <View style={styles.topSection}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.nameText}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </View>
        </View>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          {actionCards.map((card, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.actionCard} 
              onPress={() => router.push(card.route as any)}
            >
              <View style={[styles.actionIconBg, { backgroundColor: card.bg }]}>
                {card.icon}
              </View>
              <Text style={styles.actionCardLabel}>{card.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Communication Preview */}
        <TouchableOpacity style={styles.cardBlock} onPress={() => router.push('/(tabs)/messages')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Communication</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount} Unread</Text>
              </View>
            )}
          </View>
          <View style={styles.communicationPreview}>
            <View style={styles.notifyLogo}>
              <ShieldAlert size={24} color="white" />
            </View>
            <View style={styles.commContent}>
              <Text style={styles.commTitle}>NotifyMe System</Text>
              <Text style={styles.commSub}>Welcome to your new dashboard!</Text>
            </View>
            <ChevronRight color="#cbd5e1" size={20} />
          </View>
        </TouchableOpacity>



        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  
  topSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greetingLeft: { flex: 1 },
  greetingText: { fontSize: 24, color: '#0f172a', fontWeight: '500' },
  nameText: { fontSize: 28, color: '#0f172a', fontWeight: '800', marginBottom: 8 },
  planBadge: { backgroundColor: '#f59e0b', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  planBadgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
  
  qrUsageWidget: { backgroundColor: 'rgba(255,255,255,0.8)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', alignItems: 'flex-end', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  qrUsageLabel: { color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  qrUsageValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  qrUsageSub: { fontSize: 12, color: '#64748b', fontWeight: '400' },
  
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  actionCard: { width: (width - 48) / 3, backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  actionIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionCardLabel: { fontSize: 12, fontWeight: '600', color: '#1e293b', textAlign: 'center' },
  
  cardBlock: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  unreadBadge: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  unreadBadgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
  
  communicationPreview: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  notifyLogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  commContent: { flex: 1 },
  commTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  commSub: { fontSize: 13, color: '#64748b' },
  
  viewAllText: { fontSize: 13, fontWeight: '600', color: '#4f46e5' },
  timelineLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, marginBottom: 8 },
  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 8 },
  activityIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 2 },
  activitySub: { fontSize: 12, color: '#64748b' },
  
  securityList: { gap: 12 },
  securityItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  securityText: { fontSize: 14, fontWeight: '500' }
});
