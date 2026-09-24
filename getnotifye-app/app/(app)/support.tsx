import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Center</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.subtitle}>Get help and manage your support tickets.</Text>

        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
            <Ionicons name="book" size={24} color="#4f46e5" />
          </View>
          <Text style={styles.cardTitle}>Knowledge Base</Text>
          <Text style={styles.cardDesc}>Browse articles and guides to learn how to use GetNotifye.</Text>
          <TouchableOpacity style={styles.btnOutline}>
            <Text style={styles.btnOutlineText}>View Articles</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
            <Ionicons name="chatbubbles" size={24} color="#10b981" />
          </View>
          <Text style={styles.cardTitle}>Contact Customer Care</Text>
          <Text style={styles.cardDesc}>Submit a ticket directly to our support team.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(app)/contact')}>
            <Text style={styles.btnPrimaryText}>Create Ticket</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
          </View>
          <Text style={styles.cardTitle}>Report Abuse</Text>
          <Text style={styles.cardDesc}>Report suspicious activity or spam messages.</Text>
          <TouchableOpacity style={styles.btnDanger}>
            <Text style={styles.btnDangerText}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentBox}>
          <Text style={styles.recentTitle}>Your Recent Support Tickets</Text>
          <Text style={styles.emptyText}>You haven't submitted any support tickets yet.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  content: { padding: 24 },
  
  subtitle: { fontSize: 16, color: '#64748b', marginBottom: 24 },

  card: { backgroundColor: '#fff', padding: 24, borderRadius: 16, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  
  btnOutline: { width: '100%', paddingVertical: 12, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  btnOutlineText: { color: '#0f172a', fontWeight: '700', fontSize: 14 },

  btnPrimary: { width: '100%', paddingVertical: 12, backgroundColor: '#10b981', borderRadius: 8, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  btnDanger: { width: '100%', paddingVertical: 12, backgroundColor: '#fef2f2', borderRadius: 8, borderWidth: 1, borderColor: '#fecaca', alignItems: 'center' },
  btnDangerText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },

  recentBox: { backgroundColor: '#fff', padding: 24, borderRadius: 16, marginTop: 16 },
  recentTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  emptyText: { color: '#94a3b8', textAlign: 'center', padding: 24 }
});
