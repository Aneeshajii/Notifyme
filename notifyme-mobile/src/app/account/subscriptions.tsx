import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { CreditCard, CheckCircle2, Check } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function SubscriptionsScreen() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscriptions');
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      Alert.alert("Error", "Failed to load subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = async (plan: any) => {
    try {
      // Get short-lived handoff token for secure web session
      const res = await api.post('/auth/web-handoff');
      const token = res.data.handoffToken;
      Linking.openURL(`https://notifymehh.vercel.app/account/subscriptions?handoff=${token}`);
    } catch (err) {
      console.error("Handoff failed, falling back to standard URL:", err);
      Linking.openURL('https://notifymehh.vercel.app/account/subscriptions');
    }
  };

  const currentPlanId = user?.subscriptionId;

  if (loading) {
    return <View style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}><ActivityIndicator size="large" color="#1d4ed8" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose your plan</Text>
          <Text style={styles.subtitle}>Simple, transparent pricing for teams of all sizes. Upgrade your tags and protect your privacy today.</Text>
        </View>

        <View style={styles.webBanner}>
          <Text style={styles.webBannerText}>
            <Text style={{fontWeight: '700', fontSize: 16}}>Manage your subscription on the web</Text>{'\n\n'}
            To upgrade, change, or manage your subscription, visit the GetNotifye website. Your subscription is managed securely through your web account.
          </Text>
        </View>

        {plans.map((plan: any) => {
          const isCurrent = currentPlanId === plan.id;
          let benefits = [];
          try { benefits = JSON.parse(plan.benefits || "[]"); } catch (e) {}

          return (
            <View key={plan.id} style={[styles.planCard, isCurrent && styles.currentPlanCard]}>
              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
                </View>
              )}
              
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>₹{plan.price}</Text>
                <Text style={styles.priceMonth}>/mo</Text>
              </View>
              
              <Text style={styles.planDesc}>
                Up to <Text style={{fontWeight: '700'}}>{plan.maxQrCodes}</Text> secure QR tags. Perfect for {plan.name.toLowerCase()} usage.
              </Text>

              <TouchableOpacity 
                style={[styles.upgradeBtn, isCurrent && styles.currentBtn]} 
                onPress={isCurrent ? undefined : () => handleUpgradeClick(plan)}
                disabled={isCurrent}
              >
                <Text style={[styles.upgradeBtnText, isCurrent && styles.currentBtnText]}>
                  {isCurrent ? 'Current Plan' : 'Manage Subscription on Web'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.includesTitle}>WHAT'S INCLUDED</Text>
              
              <View style={styles.featureList}>
                {benefits.map((b: string, i: number) => (
                  <View key={i} style={styles.featureItem}>
                    <View style={styles.checkBg}>
                      <Check size={12} color="#10b981" strokeWidth={3} />
                    </View>
                    <Text style={styles.featureText}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '800', color: '#0f172a', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },
  
  webBanner: { backgroundColor: '#eff6ff', padding: 16, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: '#bfdbfe' },
  webBannerText: { color: '#1e3a8a', fontSize: 14, lineHeight: 20, textAlign: 'center', fontWeight: '500' },
  
  planCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 32, position: 'relative' },
  currentPlanCard: { borderColor: '#0f172a', borderWidth: 2 },
  currentBadge: { position: 'absolute', top: -14, alignSelf: 'center', backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100 },
  currentBadgeText: { color: 'white', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  
  planName: { fontSize: 20, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  planPrice: { fontSize: 48, fontWeight: '800', color: '#0f172a', letterSpacing: -2 },
  priceMonth: { fontSize: 16, fontWeight: '500', color: '#64748b', marginLeft: 4 },
  
  planDesc: { fontSize: 15, color: '#475569', lineHeight: 22, marginBottom: 24 },
  
  upgradeBtn: { backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  currentBtn: { backgroundColor: '#f1f5f9' },
  upgradeBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
  currentBtnText: { color: '#64748b' },
  
  includesTitle: { fontSize: 12, fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  
  featureList: { gap: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingRight: 20 },
  checkBg: { backgroundColor: '#ecfdf5', borderRadius: 12, padding: 4, marginTop: 2 },
  featureText: { fontSize: 15, color: '#475569', lineHeight: 22, flex: 1 },
});
