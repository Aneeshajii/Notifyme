import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, Switch, Linking } from "react-native";
import { Plus, Search, Settings, MoreVertical, X, QrCode } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function TagsScreen() {
  const { user } = useAuth();
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagType, setNewTagType] = useState("personal");
  const [newTagPlateNumber, setNewTagPlateNumber] = useState("");
  const [creating, setCreating] = useState(false);

  // Tag Management Modal State
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagActive, setEditTagActive] = useState(true);
  const [savingTag, setSavingTag] = useState(false);
  const [deletingTag, setDeletingTag] = useState(false);

  useEffect(() => {
    if (user?.id) fetchTags();
  }, [user]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tags/user/${user?.id}`);
      setTags(res.data);
    } catch (e) {
      console.log('Error fetching tags:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setCreating(true);
    try {
      await api.post("/tags/create", {
        name: newTagName,
        type: newTagType,
        plateNumber: newTagType === "vehicle" ? newTagPlateNumber : undefined,
        ownerId: user?.id,
      });
      setModalVisible(false);
      setNewTagName("");
      setNewTagType("personal");
      setNewTagPlateNumber("");
      fetchTags(); // Refresh list
    } catch (e) {
      console.log("Error creating tag", e);
      alert("Failed to create tag. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const tagLimit = user?.subscription?.maxQrCodes || 0;
  const tagCount = tags.length;
  const progressPercent = tagLimit > 0 ? Math.min((tagCount / tagLimit) * 100, 100) : 0;

  const openManageModal = (tag: any) => {
    setSelectedTag(tag);
    setEditTagName(tag.name);
    setEditTagActive(tag.isActive !== false);
    setManageModalVisible(true);
  };

  const handleUpdateTag = async () => {
    if (!selectedTag) return;
    setSavingTag(true);
    try {
      await api.put(`/tags/${selectedTag.id}`, {
        name: editTagName,
        isActive: editTagActive
      });
      setManageModalVisible(false);
      fetchTags();
    } catch (e) {
      console.log('Error updating tag:', e);
      alert('Failed to update tag.');
    } finally {
      setSavingTag(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;
    if (confirm("Are you sure you want to delete this QR code? This action cannot be undone.")) {
        setDeletingTag(true);
        try {
            await api.delete(`/tags/${selectedTag.id}`);
            setManageModalVisible(false);
            fetchTags();
        } catch (e) {
            console.log('Error deleting tag:', e);
            alert('Failed to delete tag.');
        } finally {
            setDeletingTag(false);
        }
    }
  };

  const handleDownloadQr = () => {
    if (!selectedTag?.qrCodeDataUrl) return;
    // Download using standard HTML link for web
    if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = selectedTag.qrCodeDataUrl;
        link.download = `QR_${selectedTag.name.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('Long-press the QR code image to save it to your device photos.');
    }
  };

  const handleUpgradeClick = async () => {
    try {
      const res = await api.post('/auth/web-handoff');
      const token = res.data.handoffToken;
      Linking.openURL(`https://notifymehh.vercel.app/account/subscriptions?handoff=${token}`);
    } catch (err) {
      Linking.openURL('https://notifymehh.vercel.app/account/subscriptions');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tags</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.iconBtn, { backgroundColor: '#1d4ed8' }]} 
            onPress={() => {
              if (tagCount >= tagLimit) {
                alert(`Maximum QR generation reached for ${user?.subscription?.name || 'your'} plan. Upgrade to create more.`);
              } else {
                setModalVisible(true);
              }
            }}
          >
            <Plus color="white" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Search color="#0f172a" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Settings color="#0f172a" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} bounces={true} showsVerticalScrollIndicator={false}>
        
        {/* Usage Card */}
        <View style={styles.usageCard}>
          <View style={styles.usageTop}>
            <View>
              <Text style={styles.usageTitle}>{user?.subscription?.name || 'No Plan'}</Text>
              <Text style={styles.usageCount}>{`${tagCount}/${tagLimit} Tags Used`}</Text>
            </View>
            <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgradeClick}>
              <Text style={styles.upgradeText}>Manage Plan</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: progressPercent >= 100 ? '#ef4444' : '#1d4ed8' }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Active Tags</Text>

        {loading ? (
          <View style={{padding: 40}}><ActivityIndicator size="large" color="#1d4ed8" /></View>
        ) : (
          <View style={styles.list}>
            {tags.map((tag) => (
              <TouchableOpacity key={tag.id} style={styles.listItem} onPress={() => openManageModal(tag)}>
                <View style={styles.qrContainer}>
                  <QrCode color="#1d4ed8" size={32} />
                </View>
                
                <View style={styles.itemContent}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{tag.name}</Text>
                    <MoreVertical color="#94a3b8" size={20} />
                  </View>
                  
                  <Text style={styles.itemSub}>{tag.scans || 0} scans • {new Date(tag.createdAt).toLocaleDateString()}</Text>
                  
                  <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: tag.isActive !== false ? '#16a34a' : '#94a3b8' }]} />
                    <Text style={[styles.statusText, { color: tag.isActive !== false ? '#16a34a' : '#94a3b8' }]}>{tag.isActive !== false ? 'Active & Routing' : 'Inactive'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {tags.length === 0 && <Text style={{padding: 20, color: '#64748b'}}>No tags found.</Text>}
          </View>
        )}
        <View style={{height: 100}} /> 
      </ScrollView>



      {/* Create Tag Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Tag</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Tag Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Car Dashboard, Keys"
                placeholderTextColor="#94a3b8"
                value={newTagName}
                onChangeText={setNewTagName}
              />
              
              <Text style={styles.inputLabel}>Tag Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity 
                  style={[styles.typeBtn, newTagType === "personal" && styles.typeBtnActive]}
                  onPress={() => setNewTagType("personal")}
                >
                  <Text style={[styles.typeBtnText, newTagType === "personal" && styles.typeBtnTextActive]}>Personal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, newTagType === "vehicle" && styles.typeBtnActive]}
                  onPress={() => setNewTagType("vehicle")}
                >
                  <Text style={[styles.typeBtnText, newTagType === "vehicle" && styles.typeBtnTextActive]}>Vehicle</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, newTagType === "pet" && styles.typeBtnActive]}
                  onPress={() => setNewTagType("pet")}
                >
                  <Text style={[styles.typeBtnText, newTagType === "pet" && styles.typeBtnTextActive]}>Pet</Text>
                </TouchableOpacity>
              </View>

              {newTagType === "vehicle" && (
                <>
                  <Text style={styles.inputLabel}>Vehicle Plate Number (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. MH12AB1234"
                    placeholderTextColor="#94a3b8"
                    value={newTagPlateNumber}
                    onChangeText={setNewTagPlateNumber}
                  />
                </>
              )}

              <TouchableOpacity 
                style={styles.createBtn} 
                onPress={handleCreateTag}
                disabled={creating}
              >
                {creating ? <ActivityIndicator color="white" /> : <Text style={styles.createBtnText}>Generate QR Code</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Manage Tag Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={manageModalVisible}
        onRequestClose={() => setManageModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Tag</Text>
              <TouchableOpacity onPress={() => setManageModalVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedTag && (
                <View style={styles.manageBody}>
                  {selectedTag.qrCodeDataUrl ? (
                    <View style={styles.qrDisplayCard}>
                      <img src={selectedTag.qrCodeDataUrl} style={{ width: 160, height: 160 }} alt="QR Code" />
                      <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadQr}>
                        <Text style={styles.downloadBtnText}>Download QR Code</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={[styles.qrDisplayCard, { backgroundColor: '#f1f5f9' }]}>
                        <QrCode color="#cbd5e1" size={64} />
                        <Text style={{color: '#94a3b8', marginTop: 12}}>QR Code Not Available</Text>
                    </View>
                  )}

                  <Text style={styles.inputLabel}>Tag Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editTagName}
                    onChangeText={setEditTagName}
                  />

                  <View style={styles.toggleRow}>
                    <View>
                      <Text style={styles.toggleTitle}>Active Status</Text>
                      <Text style={styles.toggleDesc}>When off, scanners cannot contact you.</Text>
                    </View>
                    <Switch
                        value={editTagActive}
                        onValueChange={setEditTagActive}
                        trackColor={{ false: "#cbd5e1", true: "#1d4ed8" }}
                    />
                  </View>

                  <View style={styles.statsCard}>
                    <Text style={styles.statsTitle}>Tag Analytics</Text>
                    <Text style={styles.statsValue}>{selectedTag.scans || 0} Total Scans</Text>
                    <Text style={styles.statsSub}>Created on {new Date(selectedTag.createdAt).toLocaleDateString()}</Text>
                  </View>

                  <View style={styles.manageActionsRow}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.deleteBtn]} 
                        onPress={handleDeleteTag}
                        disabled={deletingTag}
                      >
                        {deletingTag ? <ActivityIndicator color="white" /> : <Text style={styles.deleteBtnText}>Delete Tag</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.saveBtn]} 
                        onPress={handleUpdateTag}
                        disabled={savingTag}
                      >
                        {savingTag ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                      </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  
  container: { flex: 1, paddingHorizontal: 20 },
  
  usageCard: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  usageTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  usageTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  usageCount: { fontSize: 13, color: '#64748b' },
  upgradeBtn: { backgroundColor: '#1d4ed8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  upgradeText: { color: 'white', fontSize: 13, fontWeight: '700' },
  progressBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  
  list: { paddingBottom: 20 },
  listItem: { flexDirection: 'row', backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  qrContainer: { width: 64, height: 64, backgroundColor: '#eff6ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemContent: { flex: 1, justifyContent: 'center' },
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1 },
  itemSub: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  
  fab: { position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#1d4ed8', justifyContent: 'center', alignItems: 'center', shadowColor: '#1d4ed8', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  modalBody: {},
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a', marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  typeBtnActive: { backgroundColor: '#eff6ff', borderColor: '#1d4ed8', borderWidth: 2 },
  typeBtnText: { color: '#64748b', fontWeight: '600' },
  typeBtnTextActive: { color: '#1d4ed8', fontWeight: '700' },
  createBtn: { backgroundColor: '#1d4ed8', paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#1d4ed8', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  createBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  
  // Manage Modal Styles
  manageBody: { paddingBottom: 20 },
  qrDisplayCard: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  downloadBtn: { marginTop: 16, backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  downloadBtnText: { color: '#1d4ed8', fontWeight: '700', fontSize: 14 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 24 },
  toggleTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  toggleDesc: { fontSize: 13, color: '#64748b', marginTop: 4 },
  statsCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 24 },
  statsTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  statsValue: { fontSize: 24, fontWeight: '800', color: '#1d4ed8' },
  statsSub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  manageActionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  deleteBtn: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  deleteBtnText: { color: '#ef4444', fontWeight: '700' },
  saveBtn: { backgroundColor: '#1d4ed8' },
  saveBtnText: { color: 'white', fontWeight: '700' }
});
