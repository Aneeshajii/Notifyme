import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from "react-native";
import { LogOut, User, CreditCard, Bell, Shield, ChevronRight, ChevronLeft, Lock, Info, HelpCircle, Settings, Phone } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color="#0f172a" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.container} bounces={true} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileSection}>
          <Image 
            source={{uri: `https://api.dicebear.com/6.x/initials/png?seed=${user?.name || 'User'}`}} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          <Text style={styles.email}>{user?.email || 'Sign in to access'}</Text>
        </View>

        <View style={styles.menuGroup}>
          <TouchableOpacity style={[styles.menuItem, {borderBottomWidth: 0}]}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBg}><Bell color="#475569" size={20} /></View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>ACCOUNT & SECURITY</Text>
        
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/profile')}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBg}><User color="#475569" size={20} /></View>
              <Text style={styles.menuText}>Profile Edit</Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/subscriptions')}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBg}><CreditCard color="#475569" size={20} /></View>
              <Text style={styles.menuText}>Subscriptions</Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, {borderBottomWidth: 0}]} onPress={() => router.push('/account/privacy')}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBg}><Shield color="#475569" size={20} /></View>
              <Text style={styles.menuText}>Privacy Center</Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/about')}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBg}><Info color="#475569" size={20} /></View>
              <Text style={styles.menuText}>About Us</Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/support')}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBg}><HelpCircle color="#475569" size={20} /></View>
              <Text style={styles.menuText}>Support Center</Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, {borderBottomWidth: 0}]} onPress={() => router.push('/account/settings')}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBg}><Phone color="#475569" size={20} /></View>
              <Text style={styles.menuText}>Contact Us</Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>
        
        {user ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut color="#ef4444" size={20} />
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.logoutBtn, {backgroundColor: '#eff6ff', borderWidth: 0}]} onPress={() => router.replace('/auth')}>
            <Text style={[styles.logoutBtnText, {color: '#1d4ed8'}]}>Sign In</Text>
          </TouchableOpacity>
        )}
        
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    marginBottom: 16,
  },
  name: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  email: {
    color: '#64748b',
    fontSize: 15,
  },
  subscriptionCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  subDesc: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  upgradeBtn: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  upgradeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  menuGroup: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fee2e2',
    padding: 18,
    borderRadius: 16,
    gap: 8,
    marginBottom: 20,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  }
});
