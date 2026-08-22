import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Mail, Lock, User as UserIcon, ShieldCheck, ChevronLeft, KeyRound } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

type AuthView = 'login' | 'register' | 'forgot' | 'reset';

export default function AuthScreen() {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const { login } = useAuth();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '908105327441-30fotv2b3e8omgono9r41gjqrq4dvo0u.apps.googleusercontent.com',
      androidClientId: '908105327441-5cuskrcaf814tu5l0ude260j3al73qtt.apps.googleusercontent.com',
      iosClientId: '908105327441-e00gugth6nr7sv7ni4a29hni4gfmrtbr.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    clearMessages();
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const token = userInfo.idToken;
      
      if (token) {
        const res = await api.post("/auth/google/verify", { token });
        await login(res.data.accessToken, res.data.user, res.data.refreshToken);
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);
      if (error.code !== 'SIGN_IN_CANCELLED') {
        setErrorMsg("Google Sign-In failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return setErrorMsg("Please enter email and password");
    setLoading(true);
    clearMessages();
    try {
      const res = await api.post("/auth/login", { email, password });
      await login(res.data.accessToken, res.data.user, res.data.refreshToken);
      router.replace("/(tabs)");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) return setErrorMsg("Please fill in all fields");
    if (password !== confirmPassword) return setErrorMsg("Passwords do not match");
    if (password.length < 8) return setErrorMsg("Password must be at least 8 characters");

    setLoading(true);
    clearMessages();
    try {
      const res = await api.post("/auth/register", { name: firstName, lastName, email, password });
      await login(res.data.accessToken, res.data.user, res.data.refreshToken);
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("FRONTEND REGISTER ERROR: ", err);
      if (err.response) {
        console.error("Error Response Data: ", err.response.data);
      }
      setErrorMsg(err.response?.data?.error || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return setErrorMsg("Please enter your email address");
    setLoading(true);
    clearMessages();
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccessMsg("If an account exists, a reset code was sent.");
      setCurrentView('reset');
    } catch (err: any) {
      setErrorMsg("Failed to request reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email || !resetCode || !password) return setErrorMsg("Please fill in all fields");
    if (password !== confirmPassword) return setErrorMsg("Passwords do not match");
    
    setLoading(true);
    clearMessages();
    try {
      await api.post("/auth/reset-password", { email, otp: resetCode, newPassword: password });
      setSuccessMsg("Password reset successfully! You can now log in.");
      setCurrentView('login');
      setPassword("");
      setConfirmPassword("");
      setResetCode("");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {currentView !== 'login' && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            setCurrentView('login');
            clearMessages();
          }}
        >
          <ChevronLeft color="#0f172a" size={28} />
        </TouchableOpacity>
      )}
      <View style={styles.brandContainer}>
        <ShieldCheck color="#1d4ed8" size={32} />
        <Text style={styles.brandText}>NotifyMe</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
          {renderHeader()}

          <View style={styles.content}>
            <Text style={styles.title}>
              {currentView === 'login' ? "Welcome Back" : 
               currentView === 'register' ? "Create Account" : 
               currentView === 'forgot' ? "Reset Password" : "New Password"}
            </Text>
            <Text style={styles.subtitle}>
              {currentView === 'login' ? "Sign in to access your tags and messages" : 
               currentView === 'register' ? "Join NotifyMe to secure your belongings" : 
               currentView === 'forgot' ? "Enter your email to receive a reset code" : "Enter the code and your new password"}
            </Text>

            {errorMsg ? <View style={styles.errorBox}><Text style={styles.errorText}>{errorMsg}</Text></View> : null}
            {successMsg ? <View style={styles.successBox}><Text style={styles.successText}>{successMsg}</Text></View> : null}

            {/* Inputs based on view */}
            {currentView === 'register' && (
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <UserIcon color="#94a3b8" size={20} style={styles.inputIcon} />
                  <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#94a3b8" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#94a3b8" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
                </View>
              </View>
            )}

            {(currentView === 'login' || currentView === 'register' || currentView === 'forgot' || currentView === 'reset') && (
              <View style={styles.inputContainer}>
                <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={currentView !== 'reset'} />
              </View>
            )}

            {currentView === 'reset' && (
              <View style={styles.inputContainer}>
                <KeyRound color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="6-Digit Reset Code" placeholderTextColor="#94a3b8" value={resetCode} onChangeText={setResetCode} keyboardType="number-pad" />
              </View>
            )}

            {(currentView === 'login' || currentView === 'register' || currentView === 'reset') && (
              <View style={styles.inputContainer}>
                <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder={currentView === 'reset' ? "New Password" : "Password"} placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} secureTextEntry />
              </View>
            )}

            {(currentView === 'register' || currentView === 'reset') && (
              <View style={styles.inputContainer}>
                <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#94a3b8" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              </View>
            )}

            {currentView === 'login' && (
              <TouchableOpacity onPress={() => { setCurrentView('forgot'); clearMessages(); }} style={styles.forgotLink}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Primary Action Button */}
            <TouchableOpacity 
              style={styles.primaryBtn} 
              disabled={loading || googleLoading}
              onPress={() => {
                if (currentView === 'login') handleLogin();
                else if (currentView === 'register') handleRegister();
                else if (currentView === 'forgot') handleForgotPassword();
                else if (currentView === 'reset') handleResetPassword();
              }}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text style={styles.primaryBtnText}>
                  {currentView === 'login' ? "Sign In" : currentView === 'register' ? "Create Account" : currentView === 'forgot' ? "Send Code" : "Reset Password"}
                </Text>
              )}
            </TouchableOpacity>

            {currentView === 'login' && (
              <>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} disabled={loading || googleLoading}>
                  {googleLoading ? <ActivityIndicator color="#0f172a" /> : (
                    <>
                      <Image source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} style={styles.googleIcon} />
                      <Text style={styles.googleBtnText}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => { setCurrentView('register'); clearMessages(); }}>
                    <Text style={styles.switchAction}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {currentView === 'register' && (
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => { setCurrentView('login'); clearMessages(); }}>
                  <Text style={styles.switchAction}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  backButton: { marginRight: 16 },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  brandText: { fontSize: 22, fontWeight: '700', color: '#1d4ed8', marginLeft: 8 },
  
  content: { paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#64748b", marginBottom: 32, lineHeight: 24 },
  
  errorBox: { backgroundColor: "#fef2f2", padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#fecaca" },
  errorText: { color: "#ef4444", fontSize: 14, fontWeight: '500' },
  successBox: { backgroundColor: "#f0fdf4", padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#bbf7d0" },
  successText: { color: "#16a34a", fontSize: 14, fontWeight: '500' },
  
  row: { flexDirection: 'row', width: '100%' },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  inputIcon: { marginLeft: 16 },
  input: { flex: 1, paddingVertical: 18, paddingHorizontal: 12, fontSize: 16, color: "#0f172a" },
  
  forgotLink: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#1d4ed8', fontSize: 14, fontWeight: '600' },
  
  primaryBtn: { backgroundColor: "#1d4ed8", paddingVertical: 18, borderRadius: 16, alignItems: "center", shadowColor: "#1d4ed8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  primaryBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { marginHorizontal: 16, color: '#94a3b8', fontWeight: '600', fontSize: 14 },
  
  googleBtn: { flexDirection: 'row', backgroundColor: "white", paddingVertical: 18, borderRadius: 16, alignItems: "center", justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  googleIcon: { width: 24, height: 24, marginRight: 12 },
  googleBtnText: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  
  switchContainer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  switchText: { color: "#64748b", fontSize: 15 },
  switchAction: { color: "#1d4ed8", fontSize: 15, fontWeight: "700" },
});
