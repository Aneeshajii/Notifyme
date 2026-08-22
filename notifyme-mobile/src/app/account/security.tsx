import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Lock, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react-native';

export default function SecurityScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconBg}>
            <Lock size={32} color="#16a34a" />
          </View>
          <Text style={styles.title}>Security Center</Text>
          <Text style={styles.subtitle}>Manage your account security and verification.</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.itemLeft}>
              <CheckCircle2 size={24} color="#16a34a" />
              <View>
                <Text style={styles.itemTitle}>Email Verification</Text>
                <Text style={styles.itemSub}>Verified</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.itemLeft}>
              <CheckCircle2 size={24} color="#16a34a" />
              <View>
                <Text style={styles.itemTitle}>Phone Verification</Text>
                <Text style={styles.itemSub}>Verified</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.itemLeft}>
              <ShieldAlert size={24} color="#f59e0b" />
              <View>
                <Text style={styles.itemTitle}>Two-Factor Authentication (2FA)</Text>
                <Text style={styles.itemSub}>Recommended for extra security</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.footerText}>
          You can enable Two-Factor Authentication via the NotifyMe Web Portal.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  iconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  
  card: { backgroundColor: 'white', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 24 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  itemSub: { fontSize: 13, color: '#64748b' },
  divider: { height: 1, backgroundColor: '#f1f5f9' },
  
  footerText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 }
});
