import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { HelpCircle, Send, Plus, AlertTriangle, Book, ChevronRight, X, MessageSquare } from 'lucide-react-native';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SupportScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [createVisible, setCreateVisible] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Modal State
  const [viewVisible, setViewVisible] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets/my');
      setTickets(res.data);
    } catch (error) {
      console.log('Error fetching tickets', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Error', 'Subject and description are required.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/tickets', {
        subject,
        description,
        priority: isUrgent ? 'urgent' : 'medium'
      });
      
      setCreateVisible(false);
      setSubject('');
      setDescription('');
      setIsUrgent(false);
      Alert.alert('Success', 'Your support ticket has been submitted.');
      fetchTickets();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCloseTicket = async (id: string) => {
      try {
          await api.post(`/tickets/${id}/close`);
          Alert.alert('Success', 'Ticket has been closed.');
          fetchTickets();
          if (activeTicket?.id === id) {
              setActiveTicket(null);
              setViewVisible(false);
          }
      } catch (error) {
          Alert.alert('Error', 'Failed to close ticket.');
      }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return { bg: '#dbeafe', text: '#1d4ed8' };
      case 'in_progress':
      case 'responded': return { bg: '#fef9c3', text: '#ca8a04' };
      case 'closed': return { bg: '#f1f5f9', text: '#475569' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={styles.iconBg}>
            <HelpCircle size={32} color="#4f46e5" />
          </View>
          <Text style={styles.title}>Support Center</Text>
          <Text style={styles.subtitle}>Get help and manage your support tickets.</Text>
        </View>

        <Text style={styles.sectionTitle}>KNOWLEDGE BASE</Text>
        <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('Coming Soon', 'Knowledge Base is currently being updated.')}>
          <View style={styles.rowLeft}>
            <View style={[styles.actionIconBg, {backgroundColor: '#e0e7ff'}]}>
              <Book size={20} color="#4f46e5" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Browse Articles</Text>
              <Text style={styles.actionDesc}>Guides on using NotifyMe</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>CONTACT US</Text>
        <TouchableOpacity style={styles.actionCard} onPress={() => { setIsUrgent(false); setCreateVisible(true); }}>
          <View style={styles.rowLeft}>
            <View style={[styles.actionIconBg, {backgroundColor: '#dcfce7'}]}>
              <MessageSquare size={20} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Contact Customer Care</Text>
              <Text style={styles.actionDesc}>Submit a support ticket</Text>
            </View>
          </View>
          <Plus size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => { setIsUrgent(true); setCreateVisible(true); }}>
          <View style={styles.rowLeft}>
            <View style={[styles.actionIconBg, {backgroundColor: '#fee2e2'}]}>
              <AlertTriangle size={20} color="#ef4444" />
            </View>
            <View>
              <Text style={styles.actionTitle}>Report Abuse</Text>
              <Text style={styles.actionDesc}>Report spam or suspicious activity</Text>
            </View>
          </View>
          <Plus size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>YOUR RECENT TICKETS</Text>
        {loading ? (
          <ActivityIndicator color="#4f46e5" style={{margin: 20}} />
        ) : tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>You haven't submitted any tickets yet.</Text>
          </View>
        ) : (
          tickets.map((t: any) => {
            const colors = getStatusColor(t.status);
            return (
              <TouchableOpacity 
                key={t.id} 
                style={styles.ticketCard}
                onPress={() => { setActiveTicket(t); setViewVisible(true); }}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketId}>#{t.id.substring(0,8).toUpperCase()}</Text>
                  <View style={[styles.statusBadge, {backgroundColor: colors.bg}]}>
                    <Text style={[styles.statusText, {color: colors.text}]}>{t.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.ticketSubject} numberOfLines={1}>{t.subject}</Text>
                <Text style={styles.ticketDate}>{new Date(t.createdAt).toLocaleDateString()}</Text>
              </TouchableOpacity>
            )
          })
        )}
        
        <View style={{height: 60}} />
      </ScrollView>

      {/* CREATE TICKET MODAL */}
      <Modal visible={createVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isUrgent ? 'Report Abuse' : 'New Ticket'}</Text>
              <TouchableOpacity onPress={() => setCreateVisible(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="What is this regarding?"
              />
              
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { minHeight: 120 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Please provide details..."
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && {opacity: 0.7}, isUrgent && {backgroundColor: '#ef4444'}]} 
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color="white" /> : (
                  <>
                    <Send size={18} color="white" />
                    <Text style={styles.submitText}>Submit Ticket</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* VIEW TICKET MODAL */}
      <Modal visible={viewVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            {activeTicket && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ticket Details</Text>
                  <TouchableOpacity onPress={() => setViewVisible(false)}>
                    <X color="#64748b" size={24} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketId}>#{activeTicket.id.substring(0,8).toUpperCase()}</Text>
                    <View style={[styles.statusBadge, {backgroundColor: getStatusColor(activeTicket.status).bg}]}>
                      <Text style={[styles.statusText, {color: getStatusColor(activeTicket.status).text}]}>{activeTicket.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.viewSubject}>{activeTicket.subject}</Text>
                  <Text style={styles.viewDate}>{new Date(activeTicket.createdAt).toLocaleString()}</Text>
                  
                  <View style={styles.chatBubbleUser}>
                    <Text style={styles.chatLabel}>You wrote:</Text>
                    <Text style={styles.chatText}>{activeTicket.description}</Text>
                  </View>

                  {activeTicket.adminReply && (
                    <View style={styles.chatBubbleAdmin}>
                      <Text style={styles.chatLabelAdmin}>Admin Support replied:</Text>
                      <Text style={styles.chatTextAdmin}>{activeTicket.adminReply}</Text>
                    </View>
                  )}

                  {activeTicket.status === 'closed' && (
                    <View style={styles.closedBanner}>
                      <Text style={styles.closedBannerText}>This ticket is CLOSED.</Text>
                    </View>
                  )}
                  
                  {activeTicket.status !== 'closed' && (
                      <TouchableOpacity 
                        style={styles.closeBtn} 
                        onPress={() => {
                            Alert.alert("Close Ticket", "Are you sure you want to close this ticket? You will not be able to send more messages.", [
                                { text: "Cancel", style: "cancel" },
                                { text: "Close Ticket", onPress: () => handleCloseTicket(activeTicket.id), style: "destructive" }
                            ]);
                        }}
                      >
                        <Text style={styles.closeBtnText}>Mark as Resolved</Text>
                      </TouchableOpacity>
                  )}

                  <View style={{height: 40}} />
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  iconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 12, marginTop: 12, textTransform: 'uppercase', letterSpacing: 1 },
  
  actionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  actionIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  actionDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  
  emptyState: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic' },
  
  ticketCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketId: { fontWeight: '700', color: '#64748b', fontSize: 13 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 11, fontWeight: '700' },
  ticketSubject: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  ticketDate: { fontSize: 12, color: '#94a3b8' },
  
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  modalBody: {},
  
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', marginBottom: 16 },
  
  submitButton: { backgroundColor: '#4f46e5', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, gap: 8, marginTop: 8 },
  submitText: { color: 'white', fontSize: 16, fontWeight: '600' },

  // View Ticket specific
  viewSubject: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  viewDate: { fontSize: 13, color: '#94a3b8', marginBottom: 24 },
  
  chatBubbleUser: { backgroundColor: '#f1f5f9', padding: 16, borderRadius: 16, borderBottomRightRadius: 4, alignSelf: 'flex-end', width: '85%', marginBottom: 16 },
  chatLabel: { fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: '600' },
  chatText: { fontSize: 15, color: '#0f172a', lineHeight: 22 },
  
  chatBubbleAdmin: { backgroundColor: '#eff6ff', padding: 16, borderRadius: 16, borderBottomLeftRadius: 4, alignSelf: 'flex-start', width: '85%', marginBottom: 16, borderWidth: 1, borderColor: '#bfdbfe' },
  chatLabelAdmin: { fontSize: 12, color: '#1d4ed8', marginBottom: 4, fontWeight: '700' },
  chatTextAdmin: { fontSize: 15, color: '#1e3a8a', lineHeight: 22 },
  
  closedBanner: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  closedBannerText: { color: '#64748b', fontWeight: '600' },
  
  closeBtn: { marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  closeBtnText: { color: '#64748b', fontWeight: '600', fontSize: 15 }
});
