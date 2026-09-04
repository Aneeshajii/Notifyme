import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function OnboardingScreen() {
  const { user, refreshUserData } = useAuth();
  const [step, setStep] = useState(1);
  const [tagName, setTagName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTag = async () => {
    if (!tagName.trim()) return Alert.alert('Required', 'Please enter a name for your QR tag');
    setIsLoading(true);
    try {
      await api.post('/tags/create', { ownerId: user?.id, name: tagName });
      await refreshUserData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create tag');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.stepText}>Step {step} of 2</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]} />
          </View>
        </View>

        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>Welcome to GetNotifye!</Text>
            <Text style={styles.subtitle}>
              GetNotifye lets you place QR codes on your car, bike, luggage, or any personal item. When someone scans it, they can message or call you — without knowing your number.
            </Text>
            <View style={styles.featureList}>
              {['🔒 Complete privacy — your number stays hidden', '⚡ Instant notifications when someone scans', '💬 Real-time messaging and voice calls', '📊 See who scanned and when'].map((f, i) => (
                <Text key={i} style={styles.featureItem}>{f}</Text>
              ))}
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)}>
              <Text style={styles.primaryBtnText}>Let's Get Started →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.emoji}>🏷️</Text>
            <Text style={styles.title}>Create Your First QR Tag</Text>
            <Text style={styles.subtitle}>Give your QR tag a name so you can recognise it. For example: "My Car", "Home Door", "Bike"</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Tag Name</Text>
              <TextInput
                style={styles.input}
                placeholder='e.g. My Car, Bike, Home'
                placeholderTextColor="#94a3b8"
                value={tagName}
                onChangeText={setTagName}
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateTag} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Create QR Tag ✨</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  stepText: { color: '#94a3b8', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#6366f1', borderRadius: 2 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 28, alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  featureList: { width: '100%', marginBottom: 28 },
  featureItem: { fontSize: 14, color: '#374151', paddingVertical: 6 },
  inputWrapper: { width: '100%', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    padding: 14, fontSize: 15, color: '#0f172a', backgroundColor: '#f8fafc', width: '100%'
  },
  primaryBtn: {
    backgroundColor: '#4f46e5', borderRadius: 14, padding: 16,
    alignItems: 'center', width: '100%',
    shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6
  },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  backBtn: { marginTop: 16, padding: 12 },
  backBtnText: { color: '#94a3b8', fontSize: 14 },
});
