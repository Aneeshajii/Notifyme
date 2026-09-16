import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE, WEB_APP_URL } from '../../constants/config';
import api from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function SubscriptionsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/subscriptions');
        setPlans(res.data);
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleUpgradeClick = async (plan: any) => {
    setIsProcessing(true);
    try {
      // Generate a secure short-lived handoff token so the web app can auto-login
      const res = await api.post('/auth/web-handoff/generate');
      const handoffToken = res.data.handoffToken;
      const url = `${WEB_APP_URL}?handoff=${encodeURIComponent(handoffToken)}&tab=subscriptions`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', "Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to securely redirect to billing. Please try again.');
      // Fallback: open subscriptions page without auto-login
      Linking.openURL(`${WEB_APP_URL}?tab=subscriptions`);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPlanId = user?.subscription?.planId || user?.subscriptionId;
  const currentPlan = plans.find(p => p.id === currentPlanId);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Choose your plan</Text>
          <Text style={styles.subtitle}>Simple, transparent pricing for teams of all sizes. Upgrade your tags and protect your privacy today.</Text>
          
          <View style={styles.infoBox}>
            <Ionicons name="lock-closed" size={20} color="#0f172a" style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTextBold}>Subscriptions are managed on the GetNotifye website.</Text>
              <Text style={styles.infoText}>Tapping a plan will open the GetNotifye web app in your browser where you can securely complete your purchase using your existing account.</Text>
            </View>
          </View>
        </View>

        {currentPlan && (
          <View style={styles.currentPlanCard}>
            <Text style={styles.currentPlanTitle}>Your Current Subscription</Text>
            
            <View style={styles.currentPlanRow}>
              <View style={styles.currentPlanCol}>
                <Text style={styles.currentPlanLabel}>PLAN NAME</Text>
                <Text style={styles.currentPlanValue}>{currentPlan.name}</Text>
              </View>
              <View style={styles.currentPlanCol}>
                <Text style={styles.currentPlanLabel}>STATUS</Text>
                <View style={styles.statusRow}>
                  {user?.isPremium && <Ionicons name="checkmark-circle" size={16} color="#10b981" />}
                  <Text style={[styles.statusText, { color: user?.isPremium ? '#10b981' : '#64748b' }]}>
                    {user?.isPremium ? 'Active' : 'Basic / Inactive'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.currentPlanRow}>
              <View style={styles.currentPlanCol}>
                <Text style={styles.currentPlanLabel}>RENEWAL / EXPIRY</Text>
                <Text style={styles.currentPlanValue}>
                  {user?.premiumExpiresAt ? new Date(user.premiumExpiresAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.plansContainer}>
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            let benefits: string[] = [];
            try { benefits = JSON.parse(plan.benefits || "[]"); } catch (e) {}

            return (
              <View key={plan.id} style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
                  </View>
                )}
                
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>₹{plan.price}</Text>
                  <Text style={styles.period}>/mo</Text>
                </View>
                
                <Text style={styles.planDesc}>
                  Up to <Text style={styles.planDescBold}>{plan.maxQrCodes}</Text> secure QR tags. Perfect for {plan.name.toLowerCase()} usage.
                </Text>

                <TouchableOpacity 
                  style={[
                    styles.upgradeBtn, 
                    isCurrent && styles.upgradeBtnCurrent,
                    isProcessing && styles.upgradeBtnDisabled
                  ]}
                  disabled={isCurrent || isProcessing}
                  onPress={() => handleUpgradeClick(plan)}
                >
                  <Text style={[styles.upgradeBtnText, isCurrent && styles.upgradeBtnTextCurrent]}>
                    {isProcessing ? 'Redirecting...' : (isCurrent ? 'Current Plan' : (user?.isPremium ? 'Downgrade' : `Upgrade to ${plan.name}`))}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.benefitsTitle}>WHAT'S INCLUDED</Text>
                <View style={styles.benefitsList}>
                  {benefits.map((b, i) => (
                    <View key={i} style={styles.benefitRow}>
                      <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={14} color="#10b981" />
                      </View>
                      <Text style={styles.benefitText}>{b}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
        
        <TouchableOpacity 
          style={styles.manageWebBtn}
          onPress={() => handleUpgradeClick(currentPlan || plans[0])}
          disabled={isProcessing}
        >
          <Ionicons name="globe-outline" size={20} color="#fff" />
          <Text style={styles.manageWebBtnText}>Manage Subscription on Web</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  scrollContent: { padding: 20 },
  headerContent: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  infoBox: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', width: '100%' },
  infoIcon: { marginTop: 2, marginRight: 12 },
  infoTextContainer: { flex: 1 },
  infoTextBold: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  currentPlanCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  currentPlanTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  currentPlanRow: { flexDirection: 'row', marginBottom: 16 },
  currentPlanCol: { flex: 1 },
  currentPlanLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 4, letterSpacing: 0.5 },
  currentPlanValue: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 15, fontWeight: '700', marginLeft: 6 },
  plansContainer: { gap: 24 },
  planCard: { backgroundColor: '#fff', padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  planCardCurrent: { borderColor: '#0f172a', borderWidth: 2 },
  currentBadge: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: '#0f172a', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  currentBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  planName: { fontSize: 18, fontWeight: '600', color: '#64748b', marginBottom: 12, marginTop: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  price: { fontSize: 40, fontWeight: '800', color: '#0f172a', letterSpacing: -1 },
  period: { fontSize: 15, fontWeight: '500', color: '#64748b', marginLeft: 4 },
  planDesc: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 24 },
  planDescBold: { fontWeight: '700', color: '#0f172a' },
  upgradeBtn: { backgroundColor: '#0f172a', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 24 },
  upgradeBtnCurrent: { backgroundColor: '#f1f5f9' },
  upgradeBtnDisabled: { opacity: 0.7 },
  upgradeBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  upgradeBtnTextCurrent: { color: '#64748b' },
  benefitsTitle: { fontSize: 11, fontWeight: '700', color: '#0f172a', letterSpacing: 1, marginBottom: 16 },
  benefitsList: { gap: 12 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkCircle: { backgroundColor: '#ecfdf5', borderRadius: 12, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  benefitText: { fontSize: 14, color: '#475569', lineHeight: 20, flex: 1 },
  manageWebBtn: { backgroundColor: '#3b82f6', flexDirection: 'row', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 32, gap: 8, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  manageWebBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
