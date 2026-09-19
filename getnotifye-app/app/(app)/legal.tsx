import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#c6c6c8' },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 4, width: 80 },
  backBtnText: { fontSize: 17, color: '#007AFF', marginLeft: -4 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#000', textAlign: 'center', flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  subheading: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 24, marginBottom: 12 },
  paragraph: { fontSize: 15, color: '#334155', lineHeight: 24, marginBottom: 16 },
});

const LEGAL_CONTENT: Record<string, { title: string, renderContent: () => React.ReactNode }> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    renderContent: () => (
      <>
        <Text style={styles.paragraph}>Last Updated: September 2026</Text>
        <Text style={styles.paragraph}>At GetNotifye, your privacy is our top priority. This Privacy Policy outlines how we collect, use, and protect your personal information in compliance with the App Store (iOS) and Google Play Store regulations.</Text>
        
        <Text style={styles.subheading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>- Account Information: Name, email address, and profile picture provided during registration.</Text>
        <Text style={styles.paragraph}>- Usage Data: Device identifiers, IP addresses, and app interaction data to ensure security and improve performance.</Text>
        <Text style={styles.paragraph}>- Communication Data: Messages sent between QR scanners and tag owners. We do not read your private messages unless explicitly reported for abuse.</Text>
        
        <Text style={styles.subheading}>2. How We Use Your Data</Text>
        <Text style={styles.paragraph}>Your data is strictly used to facilitate the core functionality of GetNotifye-connecting people who scan your QR codes with you securely and anonymously. We do NOT sell your data to third-party brokers.</Text>
        
        <Text style={styles.subheading}>3. Your Rights & Data Deletion</Text>
        <Text style={styles.paragraph}>Under GDPR and CCPA, you have the right to request access to or deletion of your data. You can delete your account and all associated tags/messages permanently from the app settings at any time.</Text>
      </>
    )
  },
  'terms': {
    title: 'Terms & Conditions',
    renderContent: () => (
      <>
        <Text style={styles.paragraph}>Welcome to GetNotifye. By using our application, you agree to the following terms and conditions.</Text>
        
        <Text style={styles.subheading}>1. User Conduct & Abuse Policy</Text>
        <Text style={styles.paragraph}>GetNotifye strictly prohibits the transmission of abusive, harassing, or illegal content. Users found violating these terms will be immediately and permanently banned from the platform.</Text>
        
        <Text style={styles.subheading}>2. QR Code Usage</Text>
        <Text style={styles.paragraph}>You are solely responsible for where you place your physical QR tags. GetNotifye is not liable for physical damages or incidents arising from the physical placement of tags.</Text>
        
        <Text style={styles.subheading}>3. Service Limitations</Text>
        <Text style={styles.paragraph}>While we strive for 99.9% uptime, GetNotifye is provided "as-is" without warranty. We do not guarantee delivery of notifications in areas without cellular/internet service.</Text>
      </>
    )
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    renderContent: () => (
      <>
        <Text style={styles.paragraph}>GetNotifye uses strict, essential cookies and authentication tokens (JWT) to keep you logged into the app securely.</Text>
        <Text style={styles.paragraph}>We do not use tracking cookies to follow your activity across other apps or websites (zero cross-site tracking). Any local storage used by the app is heavily encrypted and required solely for the app's offline functionality and performance caching.</Text>
      </>
    )
  },
  'data-privacy': {
    title: 'Data & Privacy Practices',
    renderContent: () => (
      <>
        <Text style={styles.subheading}>App Store & Play Store Compliance</Text>
        <Text style={styles.paragraph}>GetNotifye is built from the ground up with a privacy-first architecture:</Text>
        <Text style={styles.paragraph}>- Zero-Knowledge Routing: Scanners cannot see your phone number or email address unless you explicitly share them.</Text>
        <Text style={styles.paragraph}>- End-to-End Encryption (E2EE): Our audio and video calls are transmitted securely using WebRTC standard encryption.</Text>
        <Text style={styles.paragraph}>- User-Generated Content (UGC): To comply with App Store policies, all users have the ability to instantly block scanners and report malicious messages directly to the Master Admin team.</Text>
        <Text style={styles.paragraph}>- Minimum Data Retention: If you delete a QR tag, all scanning history and messages associated with it are instantly soft-deleted and permanently wiped within 30 days.</Text>
      </>
    )
  },
  'disclaimer': {
    title: 'Disclaimer',
    renderContent: () => (
      <>
        <Text style={styles.paragraph}>The GetNotifye service is designed to help you recover lost items and communicate securely. However, it is not a replacement for emergency services, legal documentation, or professional security tracking systems.</Text>
        <Text style={styles.paragraph}>Users utilize this platform at their own risk. GetNotifye, its parent company, and developers bear no liability for lost property, missed communications, or interactions with anonymous scanners.</Text>
      </>
    )
  }
};

export default function LegalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ page: string }>();
  
  const contentKey = params.page || 'privacy-policy';
  const data = LEGAL_CONTENT[contentKey] || LEGAL_CONTENT['privacy-policy'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.title}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
            {data.renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
