import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { User as UserIcon, Phone, QrCode, ArrowRight, CheckCircle2, ShieldCheck, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function OnboardingScreen() {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [firstName, setFirstName] = useState(user?.name || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Step 2 State
  const [tagName, setTagName] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNextStep = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("First name and Last name are required.");
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleCreateQR = async () => {
    if (!tagName.trim()) {
      setErrorMsg("QR Code Name is required.");
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Create the Tag
      await api.post('/tags/create', {
        ownerId: user?.id,
        name: tagName
      });
      
      // 2. Mark User as Onboarded and update details
      await api.post('/auth/onboard', {
        firstName,
        lastName,
        phone
      });

      setStep(3);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        // User already hit QR code limit (e.g., they restarted onboarding). Skip QR generation.
        try {
          await api.post('/auth/onboard', { firstName, lastName, phone });
          setStep(3);
        } catch (onboardErr) {
          setErrorMsg("Failed to finalize setup. Please try again.");
        }
      } else {
        setErrorMsg(err.response?.data?.error || err.response?.data?.message || "Failed to create QR code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const finishOnboarding = async () => {
    try {
      setIsLoading(true);
      // Fetch fresh user data to update the context with isOnboarded: true
      const res = await api.get('/auth/me');
      if (res.data.user) {
        await updateUser(res.data.user);
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert("Error", "Could not complete setup. Please restart the app.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header Branding */}
          <View style={styles.headerBranding}>
            <ShieldCheck size={28} color="#4f46e5" />
            <Text style={styles.brandText}>NotifyMe</Text>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* STEP 1: Profile Setup */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Welcome to NotifyMe!</Text>
                <Text style={styles.subtitle}>Let's set up your profile so people know who they are contacting securely.</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name *</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name *</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <Text style={styles.hintText}>Your number is kept completely private and hidden from scanners.</Text>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleNextStep}>
                <Text style={styles.primaryBtnText}>Continue</Text>
                <ArrowRight size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Create QR Code */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Create Your QR Code</Text>
                <Text style={styles.subtitle}>This is what people will see when they scan your code. They can message or call you securely.</Text>
              </View>

              {/* Mobile "Preview" Card UI */}
              <View style={styles.previewCard}>
                <View style={styles.previewAvatar}>
                  <Text style={styles.previewAvatarText}>
                    {firstName.charAt(0)}{lastName.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.previewName}>{firstName} {lastName}</Text>
                <Text style={styles.previewRole}>Owner</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>QR Code Name *</Text>
                <TextInput
                  style={[styles.input, { paddingLeft: 16 }]}
                  placeholder="e.g., My Tesla, Home Keys"
                  value={tagName}
                  onChangeText={setTagName}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, isLoading && styles.disabledBtn]} 
                onPress={handleCreateQR}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Create QR Code</Text>
                    <QrCode size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryBtn} 
                onPress={() => setStep(1)}
                disabled={isLoading}
              >
                <ChevronLeft size={20} color="#64748b" />
                <Text style={styles.secondaryBtnText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <View style={[styles.stepContainer, { alignItems: 'center', paddingTop: 40 }]}>
              <View style={styles.successCircle}>
                <CheckCircle2 size={50} color="#10b981" />
              </View>
              
              <Text style={styles.successTitle}>You're all set!</Text>
              <Text style={styles.successSubtitle}>
                Your secure QR code has been created. You can now access your dashboard to print or manage your tags.
              </Text>

              <TouchableOpacity 
                style={[styles.primaryBtn, { width: '100%' }]} 
                onPress={finishOnboarding}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryBtnText}>Enter NotifyMe</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 8,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 44,
    fontSize: 16,
    color: '#0f172a',
  },
  hintText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: 'transparent',
  },
  secondaryBtnText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  previewCard: {
    backgroundColor: '#4f46e5',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  previewAvatar: {
    width: 64,
    height: 64,
    backgroundColor: 'white',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  previewAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  previewName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  previewRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  successCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#ecfdf5',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
  }
});
