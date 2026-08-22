import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, SafeAreaView } from "react-native";
import { Search, Edit, Settings, Phone, MessageSquare, Check, Plus } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { socketService } from "../../services/socket";
import { useRouter } from "expo-router";

export default function MessagesScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'chats' | 'calls'>('chats');
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      fetchMessages();
      
      const socket = socketService.socket;
      if (socket) {
        socket.on('new_message', handleNewMessage);
        socket.on('call_event', handleNewMessage);
        
        return () => {
          socket.off('new_message', handleNewMessage);
          socket.off('call_event', handleNewMessage);
        };
      }
    }
  }, [user]);

  const handleNewMessage = (msg: any) => {
    fetchMessages(); // Simple approach: refetch on new activity
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/user/${user?.id}`);
      
      // Basic grouping by tagId (in a real app, group by conversationId)
      const grouped = res.data.reduce((acc: any, curr: any) => {
        if (!acc[curr.conversationId] || new Date(curr.createdAt) > new Date(acc[curr.conversationId].createdAt)) {
          acc[curr.conversationId] = curr;
        }
        return acc;
      }, {});
      
      setMessages(Object.values(grouped));
    } catch (e) {
      console.log('Error fetching messages:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMsgs = messages.filter(msg => 
    (msg.content?.toLowerCase().includes(search.toLowerCase()) || 
    msg.tag?.name?.toLowerCase().includes(search.toLowerCase())) &&
    (activeTab === 'calls' ? msg.type === 'call_event' : msg.type !== 'call_event')
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Search color="#0f172a" size={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Settings color="#0f172a" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chats' && styles.tabActive]} 
          onPress={() => setActiveTab('chats')}
        >
          <Text style={[styles.tabText, activeTab === 'chats' && styles.tabTextActive]}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'calls' && styles.tabActive]} 
          onPress={() => setActiveTab('calls')}
        >
          <Text style={[styles.tabText, activeTab === 'calls' && styles.tabTextActive]}>Calls</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer} bounces={true} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{padding: 40}}><ActivityIndicator size="large" color="#1d4ed8" /></View>
        ) : (
          <View style={styles.list}>
            {filteredMsgs.map((msg: any) => (
              <TouchableOpacity key={msg.id} style={styles.messageRow} onPress={() => router.push(`/chat/${msg.conversationId}`)}>
                <View style={styles.avatarContainer}>
                  <Image source={{uri: `https://api.dicebear.com/6.x/initials/png?seed=${msg.senderId || 'Anon'}`}} style={styles.avatar} />
                </View>
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <View style={styles.nameRow}>
                      <Text style={styles.senderName} numberOfLines={1}>{msg.tag?.name || 'Anonymous'}</Text>
                    </View>
                    <Text style={[styles.time, !msg.read && styles.timeUnread]}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </View>
                  <View style={styles.messageFooter}>
                    <Text style={[styles.preview, !msg.read && styles.previewUnread]} numberOfLines={1}>
                      {msg.type === 'call_event' ? '📞 Incoming Call' : msg.content}
                    </Text>
                    {!msg.read ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>1</Text>
                      </View>
                    ) : (
                      <Check color="#1d4ed8" size={16} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {filteredMsgs.length === 0 && <Text style={{padding: 20, color: '#64748b', textAlign: 'center'}}>No {activeTab} found.</Text>}
          </View>
        )}
        <View style={{height: 100}} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Plus color="white" size={28} />
      </TouchableOpacity>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  tabActive: {
    backgroundColor: '#1d4ed8',
  },
  tabText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 20,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  senderName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  time: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  timeUnread: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    fontSize: 15,
    color: '#64748b',
    flex: 1,
    paddingRight: 16,
  },
  previewUnread: {
    color: '#0f172a',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#1d4ed8',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1d4ed8',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
