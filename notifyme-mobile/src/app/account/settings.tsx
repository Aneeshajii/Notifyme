import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Phone, Mail } from 'lucide-react-native';

export default function ContactUsScreen() {
  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/916238774181');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:notifymeowner@gmail.com');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Owner Section */}
        <View style={styles.card}>
          <Text style={styles.label}>OWNER</Text>
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoText}>Photo Area</Text>
          </View>
          <Text style={styles.name}>Aneesh . A</Text>
          
          <View style={styles.partnerArea}>
            <Text style={styles.label}>PARTNERS</Text>
            <View style={styles.partnerPlaceholder}>
              <Text style={styles.partnerText}>Partner Photos / Logos Area</Text>
            </View>
          </View>
        </View>

        {/* Contact Us Section */}
        <View style={styles.card}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          
          <TouchableOpacity style={[styles.contactBtn, styles.whatsappBtn]} onPress={handleWhatsApp}>
            <Phone color="#166534" size={20} />
            <Text style={styles.whatsappText}>+91 6238774181</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
            <Mail color="#0f172a" size={20} />
            <Text style={styles.emailText}>notifymeowner@gmail.com</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16, flexGrow: 1 },
  card: { 
    width: '100%',
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 24, 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2, 
    borderWidth: 1, 
    borderColor: '#f1f5f9',
    marginBottom: 20
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 16,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8fafc',
    borderWidth: 3,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  partnerArea: {
    width: '100%',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  partnerPlaceholder: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 24,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  whatsappBtn: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  whatsappText: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '600',
  },
  emailText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  }
});
