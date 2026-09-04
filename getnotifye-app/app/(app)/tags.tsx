import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, RefreshControl, Modal, TextInput, ActivityIndicator, Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SCANNER_BASE = 'https://scan.getnotifye.com/scan';

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
    } catch {
      Alert.alert('Error', 'Failed to update tag');
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
    const url = `${SCANNER_BASE}/${tag.tagId}`;
    await Share.share({ message: `Scan my GetNotifye QR: ${url}`, url });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My QR Tags</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        contentContainerStyle={{ padding: 20, paddingTop: 8 }}
      >
        {tags.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🏷️</Text>
            <Text style={styles.emptyTitle}>No QR Tags Yet</Text>
            <Text style={styles.emptySubtitle}>Create your first QR tag and place it on anything you want to protect.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
              <Text style={styles.createBtnText}>+ Create QR Tag</Text>
            </TouchableOpacity>
          </View>
        ) : (
          tags.map((tag: any) => (
            <TouchableOpacity key={tag.id} style={styles.tagCard} onPress={() => setSelectedTag(tag)}>
              <View style={styles.tagLeft}>
                <View style={styles.qrPreview}>
                  <QRCode value={`${SCANNER_BASE}/${tag.tagId}`} size={56} />
                </View>
                <View style={styles.tagInfo}>
                  <Text style={styles.tagName}>{tag.name}</Text>
                  <Text style={styles.tagId}>ID: {tag.tagId}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: tag.isActive ? '#dcfce7' : '#f1f5f9' }]}>
                    <View style={[styles.statusDot, { backgroundColor: tag.isActive ? '#10b981' : '#94a3b8' }]} />
                    <Text style={[styles.statusText, { color: tag.isActive ? '#059669' : '#64748b' }]}>
                      {tag.isActive ? 'Active' : 'Paused'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.tagActions}>
                <TouchableOpacity onPress={() => handleShare(tag)} style={styles.iconBtn}>
                  <Ionicons name="share-outline" size={20} color="#6366f1" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleToggle(tag)} style={styles.iconBtn}>
                  <Ionicons name={tag.isActive ? 'pause-circle-outline' : 'play-circle-outline'} size={20} color="#0891b2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(tag)} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* QR Modal */}
      <Modal visible={!!selectedTag} transparent animationType="slide" onRequestClose={() => setSelectedTag(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedTag?.name}</Text>
            <Text style={styles.modalSubtitle}>ID: {selectedTag?.tagId}</Text>
            <View style={styles.qrContainer}>
              {selectedTag && (
                <QRCode value={`${SCANNER_BASE}/${selectedTag.tagId}`} size={220} />
              )}
            </View>
            <Text style={styles.qrHint}>Show or print this QR code. When scanned, people can message or call you safely.</Text>
            <TouchableOpacity style={styles.shareFullBtn} onPress={() => selectedTag && handleShare(selectedTag)}>
              <Ionicons name="share-outline" size={18} color="white" />
              <Text style={styles.shareFullBtnText}>Share QR Link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedTag(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Modal */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create New Tag</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. My Car, Home, Bike"
              placeholderTextColor="#94a3b8"
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  addBtn: { backgroundColor: '#4f46e5', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 20 },
  createBtn: { backgroundColor: '#4f46e5', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  createBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  tagCard: { backgroundColor: 'white', borderRadius: 18, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  tagLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  qrPreview: { marginRight: 14, padding: 4, backgroundColor: 'white', borderRadius: 8 },
  tagInfo: { flex: 1 },
  tagName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  tagId: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginTop: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  tagActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 24 },
  qrContainer: { padding: 16, backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 },
  qrHint: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  shareFullBtn: { backgroundColor: '#4f46e5', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, flexDirection: 'row', gap: 8, alignItems: 'center', width: '100%', justifyContent: 'center', marginBottom: 10 },
  shareFullBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  closeBtn: { paddingVertical: 12, width: '100%', alignItems: 'center' },
  closeBtnText: { color: '#64748b', fontSize: 15 },
  modalInput: { width: '100%', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', backgroundColor: '#f8fafc', marginBottom: 20 },
});
