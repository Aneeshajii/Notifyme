import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.heroBox}>
          <View style={styles.iconWrapper}>
            <Ionicons name="shield-checkmark" size={40} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>About GetNotifye</Text>
          <Text style={styles.heroSubtitle}>Simple. Private. Secure.</Text>
          <Text style={styles.heroDesc}>
            GetNotifye is a privacy-first communication platform that allows people to connect securely through smart QR codes without exposing their personal contact information.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={24} color="#4f46e5" />
            <Text style={styles.cardTitle}>Our Story</Text>
          </View>
          <Text style={styles.cardText}>
            GetNotifye was built with a simple idea: people should be reachable when necessary without exposing their personal phone numbers or email addresses.{'\n\n'}
            Whether someone finds your wallet, keys, vehicle, luggage, or any valuable item, GetNotifye makes it easy for them to contact you securely while keeping you in complete control of your privacy.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="compass" size={24} color="#10b981" />
            <Text style={styles.cardTitle}>Our Mission</Text>
          </View>
          <Text style={styles.cardText}>
            Our mission is to make communication safer, smarter, and more private for everyone through innovative QR-based technology.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="eye" size={24} color="#f59e0b" />
            <Text style={styles.cardTitle}>Our Vision</Text>
          </View>
          <Text style={styles.cardText}>
            Our vision is to become one of the world's most trusted privacy-first QR communication platforms by delivering secure, simple, and reliable experiences for everyone.
          </Text>
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
  
  heroBox: { alignItems: 'center', backgroundColor: '#fff', padding: 32, borderRadius: 24, marginBottom: 24 },
  iconWrapper: { backgroundColor: '#0f172a', padding: 20, borderRadius: 24, marginBottom: 24 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 12, textAlign: 'center' },
  heroSubtitle: { fontSize: 18, color: '#4f46e5', fontWeight: '700', marginBottom: 16 },
  heroDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22 },

  card: { backgroundColor: '#fff', padding: 24, borderRadius: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginLeft: 12 },
  cardText: { fontSize: 15, color: '#64748b', lineHeight: 24 }
});
