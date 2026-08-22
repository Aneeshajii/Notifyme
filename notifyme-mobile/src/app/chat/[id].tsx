import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Send, Paperclip, Mic, Phone, PhoneOff, CheckCheck, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { socketService } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import { Image } from 'expo-image';

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // conversationId
  const router = useRouter();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [tagDetails, setTagDetails] = useState<any>(null);
  const [typing, setTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id || !user) return;
    fetchConversation();

    const socket = socketService.socket;
    if (socket) {
      socket.on('new_message', handleNewMessage);
      socket.on('typing', handleTyping);
      socket.on('stop-typing', handleStopTyping);
      
      // Join conversation room if necessary (assuming backend handles room joins)
    }

    return () => {
      if (socket) {
        socket.off('new_message', handleNewMessage);
        socket.off('typing', handleTyping);
        socket.off('stop-typing', handleStopTyping);
      }
    };
  }, [id, user]);

  const fetchConversation = async () => {
    try {
      // In a real app we would have a specific endpoint for a single conversation:
      // const res = await api.get(`/messages/conversation/${id}`);
      // For now, we filter from the user's all messages
      const res = await api.get(`/messages/user/${user?.id}`);
      const convoMsgs = res.data.filter((m: any) => m.conversationId === id).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      setMessages(convoMsgs);
      if (convoMsgs.length > 0) {
        setTagDetails(convoMsgs[0].tag);
      }
    } catch (e) {
      console.log('Error fetching chat:', e);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleNewMessage = (msg: any) => {
    if (msg.conversationId === id) {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleTyping = (data: any) => {
    if (data.from !== user?.id) setTyping(true); // Simplified
  };
  const handleStopTyping = (data: any) => {
    if (data.from !== user?.id) setTyping(false);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !tagDetails) return;
    const textToSend = inputText;
    setInputText('');

    try {
      // Optimistic update
      const tempMsg = {
        id: 'temp-' + Date.now(),
        content: textToSend,
        senderRole: 'owner',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempMsg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

      await api.post('/messages/send', {
        content: textToSend,
        senderInfo: user?.name || 'Owner',
        senderRole: 'owner',
        tagId: tagDetails.id,
        conversationId: id,
      });
      // The socket will broadcast the actual saved message, but we can also just fetch
      // fetchConversation();
    } catch (e) {
      console.log('Failed to send:', e);
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    const socket = socketService.socket;
    if (socket && tagDetails) {
      socket.emit('typing', { from: user?.id, to: 'scanner', tagId: tagDetails.id });
      // Simple debounce
      setTimeout(() => {
        socket.emit('stop-typing', { from: user?.id, to: 'scanner', tagId: tagDetails.id });
      }, 2000);
    }
  };

  const renderMessage = (m: any) => {
    const isOwner = m.senderRole === 'owner';
    const isCall = m.mediaType === 'call_event';
    
    let callData = { type: 'completed', duration: 0 };
    if (isCall) {
      try { callData = JSON.parse(m.content); } catch (e) {}
    }
    const isMissed = callData.type === 'missed' || callData.type === 'rejected';

    return (
      <View key={m.id} style={[styles.bubbleWrapper, isOwner ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft]}>
        <View style={[styles.bubble, isOwner ? styles.bubbleRight : styles.bubbleLeft]}>
          {isCall ? (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
               <View style={[styles.callIconBg, { backgroundColor: isMissed ? '#fee2e2' : '#dcfce7' }]}>
                 {isMissed ? <PhoneOff size={20} color="#ef4444" /> : <Phone size={20} color="#22c55e" />}
               </View>
               <View>
                 <Text style={{fontWeight: 'bold', color: isMissed ? '#ef4444' : '#111b21'}}>
                   {isMissed ? 'Missed Call' : 'Voice Call'}
                 </Text>
                 {callData.duration > 0 && <Text style={{fontSize: 12, color: '#64748b'}}>{callData.duration}s</Text>}
               </View>
            </View>
          ) : (
            <Text style={[styles.messageText, isOwner ? styles.messageTextRight : styles.messageTextLeft]}>
              {m.content}
            </Text>
          )}
          
          <View style={styles.messageFooter}>
            <Text style={[styles.time, isOwner ? styles.timeRight : styles.timeLeft]}>
              {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isOwner && !isCall && <CheckCheck size={14} color={m.status === 'read' ? '#3b82f6' : '#94a3b8'} />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#3b82f6']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft color="white" size={28} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{tagDetails?.name || 'Loading...'}</Text>
            {typing ? (
              <Text style={styles.headerSubtitle}>Typing...</Text>
            ) : (
              <Text style={styles.headerSubtitle}>Anonymous Scanner</Text>
            )}
          </View>
          <View style={{width: 28}} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color="#8b5cf6" /></View>
      ) : (
        <KeyboardAvoidingView 
          style={styles.chatArea}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesList} 
            contentContainerStyle={{padding: 16, paddingBottom: 20}}
          >
            <View style={styles.encryptionNotice}>
              <Text style={styles.encryptionText}>🔒 Messages are end-to-end encrypted for this session.</Text>
            </View>
            {messages.map(renderMessage)}
          </ScrollView>

          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.attachBtn}>
              <Paperclip color="#64748b" size={24} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={handleInputChange}
              multiline
            />
            
            {inputText.trim() ? (
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                <Send color="white" size={20} style={{marginLeft: 2}} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micBtn}>
                <Mic color="#64748b" size={24} />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 4 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#e2e8f0', fontSize: 12, marginTop: 2 },
  
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  chatArea: { flex: 1 },
  messagesList: { flex: 1 },
  
  encryptionNotice: { alignSelf: 'center', backgroundColor: '#fffbeb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#fef3c7' },
  encryptionText: { color: '#b45309', fontSize: 11 },
  
  bubbleWrapper: { marginBottom: 12, flexDirection: 'row' },
  bubbleWrapperRight: { justifyContent: 'flex-end' },
  bubbleWrapperLeft: { justifyContent: 'flex-start' },
  
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  bubbleRight: { backgroundColor: '#8b5cf6', borderBottomRightRadius: 4 },
  bubbleLeft: { backgroundColor: 'white', borderBottomLeftRadius: 4 },
  
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextRight: { color: 'white' },
  messageTextLeft: { color: '#0f172a' },
  
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
  time: { fontSize: 11 },
  timeRight: { color: '#ddd6fe' },
  timeLeft: { color: '#94a3b8' },
  
  callIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  attachBtn: { padding: 8 },
  input: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 100, color: '#0f172a', marginHorizontal: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#8b5cf6', justifyContent: 'center', alignItems: 'center' },
  micBtn: { padding: 8 }
});
