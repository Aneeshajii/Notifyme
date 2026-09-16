import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ContactScreen() {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    Alert.alert('Success', 'Your support ticket has been submitted successfully! We will contact you soon.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Support Ticket</Text>
          
          <Text style={styles.label}>What do you need help with?</Text>
          <View style={styles.selectBox}>
            <Text style={styles.selectText}>Select an issue...</Text>
            <Ionicons name="chevron-down" size={20} color="#94a3b8" />
          </View>

          <Text style={styles.label}>Please describe your problem</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={6}
            placeholder="Tell us more about the issue you are facing..."
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
            <Text style={styles.btnPrimaryText}>Submit Ticket</Text>
          </TouchableOpacity>
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
  
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 24 },
  
  label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
  
  selectBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 20 },
  selectText: { fontSize: 16, color: '#0f172a' },

  textArea: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', fontSize: 16, minHeight: 120, marginBottom: 24 },

  btnPrimary: { width: '100%', paddingVertical: 16, backgroundColor: '#4f46e5', borderRadius: 8, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});
