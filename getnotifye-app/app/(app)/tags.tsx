import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, RefreshControl, Modal, TextInput, ActivityIndicator, Share, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { WEB_APP_URL } from '../../constants/config';

const SCANNER_BASE = 'https://notifyme-pztc.vercel.app/scan';

// Animated Button Component for "Liquid" Press Effect
const AnimatedTouchable = ({ onPress, style, children }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 30, bounciness: 10 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function TagsScreen() {
  const { user, tags, fetchTagsAndMessages } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user) await fetchTagsAndMessages(user.id);
    setRefreshing(false);
  }, [user]);

  const handleCreate = async () => {
    if (!newTagName.trim()) return Alert.alert('Required', 'Enter a tag name');
    setCreating(true);
    try {
      await api.post('/tags/create', { ownerId: user?.id, name: newTagName });
      setNewTagName('');
      setShowCreate(false);
      if (user) await fetchTagsAndMessages(user.id);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (tag: any) => {
    try {
      await api.put(`/tags/${tag.id}`, {
        isActive: !tag.isActive,
        status: tag.isActive ? 'paused' : 'active'
      });
      if (user) await fetchTagsAndMessages(user.id);
    } catch (err: any) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      Alert.alert('Error', serverMsg || 'Failed to update tag');
    }
  };

  const handleDelete = (tag: any) => {
    Alert.alert('Delete Tag', `Delete "${tag.name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/tags/${tag.id}`);
            if (user) await fetchTagsAndMessages(user.id);
          } catch {
            Alert.alert('Error', 'Failed to delete tag');
          }
        }
      }
    ]);
  };

  const handleShare = async (tag: any) => {
    const url = `${SCANNER_BASE}/${tag.id}`;
    await Share.share({ message: `Scan my GetNotifye QR: ${url}`, url });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My QR Tags</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 120 }}
      >
        {tags.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>Ã°Å¸ÂÂ·Ã¯Â¸Â</Text>
            <Text style={styles.emptyTitle}>No QR Tags Yet</Text>
            <Text style={styles.emptySubtitle}>Create your first QR tag and place it on anything you want to protect.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
              <Text style={styles.createBtnText}>+ Create QR Tag</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tags.map((tag: any) => (
            <AnimatedTouchable key={tag.id} onPress={() => setSelectedTag(tag)}>
              <View style={styles.tagCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={styles.tagLeft}>
                    <View style={styles.qrPreview}>
                      <QRCode value={`${SCANNER_BASE}/${tag.id}`} size={56} />
                    </View>
                    <View style={styles.tagInfo}>
                      <Text style={styles.tagName}>{tag.name}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: tag.isActive ? '#dcfce7' : '#f2f2f7' }]}>
                        <View style={[styles.statusDot, { backgroundColor: tag.isActive ? '#34C759' : '#8e8e93' }]} />
                        <Text style={[styles.statusText, { color: tag.isActive ? '#34C759' : '#8e8e93' }]}>
                          {tag.status === 'deleted' ? 'Deleted' : (tag.isActive ? 'Active' : 'Paused')}
                        </Text>
                      </View>
                    </View>
                  </View>


                </View>

                {!tag.isActive && !!tag.adminReason && (
                  <View style={{ backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, marginTop: 12, borderColor: '#fecaca', borderWidth: 1 }}>
                    <Text style={{ color: '#991b1b', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>Notice from Admin:</Text>
                    <Text style={{ color: '#7f1d1d', fontSize: 14, lineHeight: 20 }}>{tag.adminReason}</Text>
                  </View>
                )}
              </View>
            </AnimatedTouchable>
          ))
        )}
      </ScrollView>



      <Modal visible={!!selectedTag} transparent animationType="fade" onRequestClose={() => setSelectedTag(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>


            <View style={{ width: 48, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginBottom: 24 }} />
            
            <Text style={styles.modalTitle}>{selectedTag?.name}</Text>
            
            <View style={styles.qrContainer}>
              {selectedTag && (
                <QRCode value={`${SCANNER_BASE}/${selectedTag.id}`} size={220} />
              )}
            </View>

            {selectedTag && !selectedTag.isActive && !!selectedTag.adminReason && (
              <View style={{ backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, width: '100%', marginBottom: 20, borderColor: '#fecaca', borderWidth: 1 }}>
                <Text style={{ color: '#991b1b', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>Notice from Admin:</Text>
                <Text style={{ color: '#7f1d1d', fontSize: 14, lineHeight: 20 }}>{selectedTag.adminReason}</Text>
              </View>
            )}

            <Text style={styles.qrHint}>Show or print this QR code. When scanned, people can message or call you safely.</Text>
            


            <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginBottom: 16 }}>
              {selectedTag?.status !== 'deleted' && (
                <TouchableOpacity 
                  style={[styles.actionModalBtn, { flex: 1, backgroundColor: '#f1f5f9' }]} 
                  onPress={async () => {
                    await handleToggle(selectedTag);
                    setSelectedTag(null);
                  }}
                >
                  <Ionicons name={selectedTag?.isActive ? 'pause-outline' : 'play-outline'} size={22} color="#0f172a" />
                  <Text style={{ color: '#0f172a', fontWeight: '700', marginLeft: 8, fontSize: 16 }}>
                    {selectedTag?.isActive ? 'Pause' : 'Resume'}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.actionModalBtn, { flex: 1, backgroundColor: '#fef2f2' }]} 
                onPress={() => {
                  handleDelete(selectedTag);
                  setSelectedTag(null);
                }}
              >
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                <Text style={{ color: '#ef4444', fontWeight: '700', marginLeft: 8, fontSize: 16 }}>Delete</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedTag(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>



      <Modal visible={showCreate} transparent animationType="fade" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create New Tag</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. My Car, Home, Bike"
              placeholderTextColor="#8e8e93"
              value={newTagName}
              onChangeText={setNewTagName}
              autoFocus
            />
            <TouchableOpacity style={styles.shareFullBtn} onPress={handleCreate} disabled={creating}>
              {creating ? <ActivityIndicator color="white" /> : <Text style={styles.shareFullBtnText}>Create Tag</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCreate(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 32, fontWeight: '800', color: '#000', letterSpacing: -1 },
  addBtn: { backgroundColor: '#e5e5ea', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  emptyBox: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#8e8e93', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 20 },
  createBtn: { backgroundColor: '#007AFF', borderRadius: 18, paddingHorizontal: 28, paddingVertical: 14 },
  createBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
  
  tagCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 16, marginBottom: 16, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
  tagLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  qrPreview: { marginRight: 14, padding: 4, backgroundColor: '#ffffff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tagInfo: { flex: 1 },
  tagName: { fontSize: 18, fontWeight: '600', color: '#000', letterSpacing: -0.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#ffffff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 4, letterSpacing: -0.5 },
  qrContainer: { padding: 16, backgroundColor: '#ffffff', borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4, marginBottom: 24 },
  qrHint: { fontSize: 15, color: '#8e8e93', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  shareFullBtn: { backgroundColor: '#007AFF', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 32, flexDirection: 'row', gap: 8, alignItems: 'center', width: '100%', justifyContent: 'center', marginBottom: 12 },
  shareFullBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
  actionModalBtn: { borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { paddingVertical: 14, width: '100%', alignItems: 'center' },
  closeBtnText: { color: '#007AFF', fontSize: 16, fontWeight: '500' },
  modalInput: { width: '100%', borderWidth: 1, borderColor: '#e5e5ea', borderRadius: 16, padding: 16, fontSize: 16, color: '#000', backgroundColor: '#f2f2f7', marginBottom: 24 },
});

