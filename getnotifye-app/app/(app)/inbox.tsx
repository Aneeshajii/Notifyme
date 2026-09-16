import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, KeyboardAvoidingView, Platform, RefreshControl, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Helper for relative time (e.g., "10m ago")
const getRelativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

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

export default function InboxScreen() {
  const { user, tags, messages, fetchTagsAndMessages, socket } = useAuth();
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [convMessages, setConvMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Group messages by conversation
  const conversations = React.useMemo(() => {
    const convMap: Record<string, any> = {};
    messages.forEach((m: any) => {
      const key = m.conversationId || m.tagId;
      if (!convMap[key]) {
        convMap[key] = {
          id: key,
          tagId: m.tagId,
          tagName: tags.find((t: any) => t.id === m.tagId)?.name || 'Unknown Tag',
          lastMessage: m,
          unread: 0,
          messages: [],
        };
      }
      convMap[key].messages.push(m);
      if (m.senderRole === 'scanner' && m.status !== 'read') {
        convMap[key].unread++;
      }
      if (new Date(m.createdAt) > new Date(convMap[key].lastMessage.createdAt)) {
        convMap[key].lastMessage = m;
      }
    });
    return Object.values(convMap).sort(
      (a: any, b: any) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }, [messages, tags]);

  // Real-time: listen for new messages on socket
  useEffect(() => {
    if (!socket || !selectedConv) return;
    const handler = (msg: any) => {
      if (msg.conversationId === selectedConv.id || msg.tagId === selectedConv.tagId) {
        setConvMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    };
    socket.on(`user-${user?.id}-new-message`, handler);
    return () => { socket.off(`user-${user?.id}-new-message`, handler); };
  }, [socket, selectedConv, user]);

  const openConversation = async (conv: any) => {
    setSelectedConv(conv);
    const msgs = conv.messages.sort(
      (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setConvMessages(msgs);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedConv) return;
    setSending(true);
    const text = replyText;
    setReplyText('');
    try {
      const res = await api.post('/messages/reply', {
        conversationId: selectedConv.id,
        tagId: selectedConv.tagId,
        content: text,
        senderRole: 'owner',
        senderInfo: user?.name || 'Owner',
      });
      setConvMessages((prev) => [...prev, res.data]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setReplyText(text);
    } finally {
      setSending(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user) await fetchTagsAndMessages(user.id);
    setRefreshing(false);
  }, [user]);

  // --- Conversation List View ---
  if (!selectedConv) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {conversations.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>When someone scans your QR and messages you, it will appear here.</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
            renderItem={({ item }) => (
              <AnimatedTouchable onPress={() => openConversation(item)}>
                <View style={styles.convRow}>
                  {/* Unread Indicator */}
                  <View style={styles.unreadIndicatorContainer}>
                    {item.unread > 0 && <View style={styles.unreadDot} />}
                  </View>
                  
                  {/* Avatar */}
                  <View style={styles.convAvatar}>
                    <Ionicons name="person" size={24} color="#6366f1" />
                  </View>
                  
                  {/* Info */}
                  <View style={styles.convInfo}>
                    <View style={styles.convTop}>
                      <Text style={styles.convName} numberOfLines={1}>
                        {item.lastMessage.senderInfo || 'Anonymous'}
                      </Text>
                      <Text style={[styles.convTime, item.unread > 0 && { color: '#007AFF', fontWeight: '600' }]}>
                        {getRelativeTime(item.lastMessage.createdAt)}
                      </Text>
                    </View>
                    <Text style={styles.convPreview} numberOfLines={2}>
                      {item.lastMessage.content}
                    </Text>
                  </View>
                </View>
              </AnimatedTouchable>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  // --- Chat View ---
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setSelectedConv(null)} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatName}>{selectedConv.lastMessage.senderInfo || 'Anonymous'}</Text>
          <Text style={styles.chatTag}>Tag: {selectedConv.tagName}</Text>
        </View>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={convMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          renderItem={({ item }) => {
            const isOwner = item.senderRole === 'owner';
            return (
              <View style={[styles.bubble, isOwner ? styles.bubbleOwner : styles.bubbleScanner]}>
                <Text style={[styles.bubbleText, isOwner && styles.bubbleTextOwner]}>{item.content}</Text>
              </View>
            );
          }}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type a message..."
            placeholderTextColor="#94a3b8"
            value={replyText}
            onChangeText={setReplyText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
            onPress={sendReply}
            disabled={!replyText.trim() || sending}
          >
            <Ionicons name="arrow-up" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' }, // Clean white background for iOS lists
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#8e8e93', textAlign: 'center', lineHeight: 20 },
  
  convRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ffffff', 
    paddingRight: 20,
    paddingVertical: 12,
  },
  unreadIndicatorContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF', // Standard iOS blue
  },
  convAvatar: { 
    width: 52, 
    height: 52, 
    borderRadius: 16, 
    backgroundColor: '#f2f2f7', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 14 
  },
  convInfo: { 
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#c6c6c8',
    paddingBottom: 16,
    paddingTop: 4,
  },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { fontSize: 16, fontWeight: '600', color: '#000', flex: 1, marginRight: 8, letterSpacing: -0.3 },
  convTime: { fontSize: 14, color: '#8e8e93' },
  convPreview: { fontSize: 15, color: '#8e8e93', lineHeight: 20, paddingRight: 20 },
  
  // Chat View Styles
  chatHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 8, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#c6c6c8' },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 4 },
  backBtnText: { fontSize: 17, color: '#007AFF', marginLeft: -4 },
  chatHeaderInfo: { flex: 1, alignItems: 'center', marginRight: 40 },
  chatName: { fontSize: 17, fontWeight: '600', color: '#000' },
  chatTag: { fontSize: 12, color: '#8e8e93', marginTop: 2 },
  
  chatContent: { padding: 16, gap: 12, flexGrow: 1, backgroundColor: '#f2f2f7' },
  bubble: { maxWidth: '75%', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  bubbleScanner: { backgroundColor: '#e5e5ea', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleOwner: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 16, color: '#000', lineHeight: 22 },
  bubbleTextOwner: { color: 'white' },
  
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f7', paddingHorizontal: 16, paddingVertical: 10, paddingBottom: 24, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#c6c6c8', gap: 10 },
  chatInput: { flex: 1, backgroundColor: '#ffffff', borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 16, color: '#000', maxHeight: 100, borderWidth: 1, borderColor: '#e5e5ea' },
  sendBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#c7c7cc' },
});
