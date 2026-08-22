import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
             <ShieldCheck size={48} color="white" />
          </View>
          <Text style={styles.title}>NotifyMe</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            NotifyMe is a revolutionary privacy-first communication platform that bridges the physical and digital worlds. 
          </Text>
          <Text style={styles.paragraph}>
            Using our secure QR codes, you can place a tag on your vehicle, your keys, your luggage, or your home, allowing anyone to contact you instantly and anonymously.
          </Text>
          <Text style={styles.paragraph}>
            Whether it's an emergency, a lost item, or just a friendly notification, NotifyMe ensures you stay connected without ever compromising your personal privacy.
          </Text>
        </View>

        <Text style={styles.copyright}>© 2026 NotifyMe Inc. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 40 },
  logoContainer: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#1d4ed8', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  version: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  
  content: { backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  paragraph: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 16 },
  
  copyright: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 32 }
});
