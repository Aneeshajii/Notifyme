import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, KeyboardAvoidingView, Platform, RefreshControl, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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
        <View style={styles.header}>
          <Text style={styles.title}>Inbox</Text>
        </View>
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.convRow} onPress={() => openConversation(item)}>
                <View style={styles.convAvatar}>
                  <Ionicons name="person" size={20} color="#6366f1" />
                </View>
                <View style={styles.convInfo}>
                  <View style={styles.convTop}>
                    <Text style={styles.convName} numberOfLines={1}>{item.lastMessage.senderInfo || 'Anonymous'}</Text>
                    <Text style={styles.convTime}>
                      {new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.convBottom}>
                    <Text style={styles.convPreview} numberOfLines={1}>{item.lastMessage.content}</Text>
                    {item.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.convTag}>🏷️ {item.tagName}</Text>
                </View>
              </TouchableOpacity>
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
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatName}>{selectedConv.lastMessage.senderInfo || 'Anonymous'}</Text>
          <Text style={styles.chatTag}>🏷️ {selectedConv.tagName}</Text>
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
                <Text style={[styles.bubbleTime, isOwner && styles.bubbleTimeOwner]}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
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
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  convRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  convAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  convInfo: { flex: 1 },
  convTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  convName: { fontSize: 15, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
  convTime: { fontSize: 12, color: '#94a3b8' },
  convBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convPreview: { fontSize: 13, color: '#64748b', flex: 1, marginRight: 8 },
  unreadBadge: { backgroundColor: '#6366f1', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  unreadText: { color: 'white', fontSize: 11, fontWeight: '700' },
  convTag: { fontSize: 11, color: '#94a3b8', marginTop: 3 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 8, marginRight: 4 },
  chatHeaderInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  chatTag: { fontSize: 12, color: '#94a3b8' },
  chatContent: { padding: 16, gap: 8, flexGrow: 1 },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleScanner: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  bubbleOwner: { backgroundColor: '#4f46e5', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, color: '#0f172a', lineHeight: 21 },
  bubbleTextOwner: { color: 'white' },
  bubbleTime: { fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'right' },
  bubbleTimeOwner: { color: 'rgba(255,255,255,0.7)' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 10 },
  chatInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#0f172a', maxHeight: 100, borderWidth: 1, borderColor: '#e2e8f0' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#c7d2fe' },
});
