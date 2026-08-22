import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, 
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Easing
} from 'react-native';
import { Bot, X, Send, ShieldCheck, Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isError?: boolean;
}

export default function AiAssistant() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi there! I'm your NotifyMe Assistant. How can I help you manage your QR codes or account today?", sender: 'ai', timestamp: new Date() }
  ]);
  const [currentQuickActions, setCurrentQuickActions] = useState<{label: string, action: string}[]>([
    { label: 'Create a QR', action: 'OPEN_QR' },
    { label: 'Privacy Center', action: 'OPEN_PRIVACY' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isOpen) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    }
  }, [isOpen]);

  const handleSend = async (textToSend: string = inputValue) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history = messages.map(m => ({ text: m.text, sender: m.sender }));

      const res = await api.post(`/ai/chat`, {
        message: userMsg.text,
        conversationHistory: history
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: res.data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      setCurrentQuickActions(res.data.quickActions || []);

      if (res.data.action && res.data.action !== 'NONE') {
        setTimeout(() => handleAction(res.data.action), 1500);
      }

    } catch (err: any) {
      console.log("Chat error:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "I'm having trouble connecting right now.";
      const aiMsg: Message = {
        id: Date.now().toString(),
        text: errorMessage === 'Invalid Token' ? 'Your session has expired. Please sign in again.' : errorMessage,
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleAction = (action: string) => {
    setIsOpen(false);
    switch(action) {
      case 'OPEN_QR': router.push('/(tabs)/tags'); break;
      case 'OPEN_SUPPORT': router.push('/(tabs)/profile'); break;
      case 'OPEN_SUBSCRIPTION': router.push('/(tabs)/profile'); break;
      case 'OPEN_PRIVACY': router.push('/account/privacy'); break;
      case 'OPEN_SETTINGS': router.push('/account/settings'); break;
    }
  };

  if (!user) return null;

  return (
    <>
      {!isOpen && (
        <View style={styles.fabContainer}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
          <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => setIsOpen(true)}>
            <Shield size={28} color="white" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={isOpen} animationType="slide" transparent={true}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            
            <LinearGradient colors={['#4f46e5', '#3b82f6']} style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.botIconWrapper}>
                  <Bot size={24} color="white" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>NotifyMe Assistant</Text>
                  <View style={styles.headerStatus}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Online & Secure</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeBtn}>
                <X size={20} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.chatArea}>
              <View style={styles.secureNotice}>
                <ShieldCheck size={14} color="#94a3b8" />
                <Text style={styles.secureNoticeText}>End-to-end encrypted session</Text>
              </View>

              <ScrollView 
                ref={scrollViewRef}
                style={styles.messagesList}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <View key={msg.id} style={[styles.messageWrapper, isUser ? styles.messageWrapperRight : styles.messageWrapperLeft]}>
                      <View style={[styles.messageBubble, isUser ? styles.messageBubbleRight : styles.messageBubbleLeft, msg.isError && styles.messageBubbleError]}>
                        <Text style={[styles.messageText, isUser ? styles.messageTextRight : styles.messageTextLeft]}>{msg.text}</Text>
                      </View>
                      <Text style={styles.timestamp}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  );
                })}

                {isTyping && (
                  <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color="#64748b" />
                    <Text style={styles.typingText}>Assistant is typing...</Text>
                  </View>
                )}
              </ScrollView>

              {!isTyping && messages[messages.length-1]?.sender === 'ai' && currentQuickActions.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsContainer} contentContainerStyle={styles.quickActionsContent}>
                  {currentQuickActions.map(qa => (
                    <TouchableOpacity key={qa.label} style={styles.quickActionBtn} onPress={() => { qa.action !== 'NONE' ? handleAction(qa.action) : handleSend(qa.label); }}>
                      <Text style={styles.quickActionText}>{qa.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="Ask me anything..." placeholderTextColor="#94a3b8" value={inputValue} onChangeText={setInputValue} onSubmitEditing={() => handleSend(inputValue)} returnKeyType="send" />
              <TouchableOpacity style={[styles.sendBtn, !inputValue.trim() || isTyping ? styles.sendBtnDisabled : null]} onPress={() => handleSend(inputValue)} disabled={!inputValue.trim() || isTyping}>
                <Send size={18} color="white" style={{marginLeft: 2}} />
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 100 : 90, right: 20, width: 64, height: 64, justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  pulseRing: { position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(79, 70, 229, 0.4)' },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  badge: { position: 'absolute', top: 0, right: 0, width: 14, height: 14, backgroundColor: '#ef4444', borderWidth: 2, borderColor: 'white', borderRadius: 7 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#f8fafc', height: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 30 : 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 8, height: 8, backgroundColor: '#10b981', borderRadius: 4 },
  statusText: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  chatArea: { flex: 1, backgroundColor: '#f8fafc' },
  secureNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  secureNoticeText: { fontSize: 12, color: '#94a3b8' },
  messagesList: { flex: 1 },
  messageWrapper: { marginBottom: 16, maxWidth: '85%' },
  messageWrapperRight: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  messageWrapperLeft: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageBubble: { padding: 14, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  messageBubbleRight: { backgroundColor: '#4f46e5', borderBottomRightRadius: 4 },
  messageBubbleLeft: { backgroundColor: 'white', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  messageBubbleError: { borderColor: '#fca5a5', borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextRight: { color: 'white' },
  messageTextLeft: { color: '#0f172a' },
  timestamp: { fontSize: 11, color: '#94a3b8', marginTop: 6, marginHorizontal: 4 },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'white', padding: 12, borderRadius: 20, borderBottomLeftRadius: 4, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  typingText: { fontSize: 13, color: '#64748b' },
  quickActionsContainer: { borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#f8fafc', maxHeight: 60 },
  quickActionsContent: { padding: 12, gap: 8 },
  quickActionBtn: { backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  quickActionText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e2e8f0', gap: 12 },
  input: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, maxHeight: 100, color: '#0f172a' },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#e2e8f0' }
});
