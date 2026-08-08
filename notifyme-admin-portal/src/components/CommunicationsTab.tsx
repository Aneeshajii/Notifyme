import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Tag, Clock, MessageSquare } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

interface Conversation {
    id: string;
    tagId: string;
    scannerId: string;
    status: string;
    startedAt: string;
    tag: {
        id: string;
        tagId: string;
        name: string;
    };
    messages: Message[];
    ownerName?: string;
}

interface Message {
    id: string;
    content: string;
    senderInfo: string;
    senderRole: string;
    createdAt: string;
}

const CommunicationsTab: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAllConversations();
        
        // Connect to Socket.IO
        socketRef.current = io(SOCKET_URL);
        
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    // Auto-scroll when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Listen for new messages for the active conversation
    useEffect(() => {
        if (!activeConv || !socketRef.current) return;
        
        const handleNewMessage = (msg: Message) => {
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        };
        
        const eventName = `conversation-${activeConv.id}`;
        socketRef.current.on(eventName, handleNewMessage);
        
        return () => {
            socketRef.current?.off(eventName, handleNewMessage);
        };
    }, [activeConv]);

    const fetchAllConversations = async () => {
        try {
            // We'll fetch all users first, then map to get their conversations.
            const usersRes = await axios.get(`${API_BASE}/auth/users`);
            const allConvs: Conversation[] = [];
            for (const user of usersRes.data) {
                const convRes = await axios.get(`${API_BASE}/messages/conversations/user/${user.id}`);
                const userConvs = convRes.data.map((conv: any) => ({
                    ...conv,
                    ownerName: `${user.name} ${user.lastName || ''}`.trim()
                }));
                allConvs.push(...userConvs);
            }
            setConversations(allConvs);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
            setLoading(false);
        }
    };

    const handleSelectConv = async (conv: Conversation) => {
        setActiveConv(conv);
        try {
            const res = await axios.get(`${API_BASE}/messages/conversation/${conv.id}`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages for conversation", err);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !activeConv) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post(`${API_BASE}/messages/admin/direct`, {
                userId: activeConv.tag.ownerId, // For simplicity using ownerId
                content: replyText,
                conversationId: activeConv.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReplyText('');
        } catch (err) {
            console.error("Failed to send reply", err);
        }
    };

    const handleEndConversation = async () => {
        if (!activeConv) return;
        if (!window.confirm('Are you sure you want to end this conversation?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post(`${API_BASE}/messages/conversation/${activeConv.id}/status`, { status: 'closed' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Conversation closed');
            fetchAllConversations();
            setActiveConv(prev => prev ? { ...prev, status: 'closed' } : null);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ padding: '24px' }}>Loading Communications...</div>;

    return (
        <div className="tab-content" style={{ animation: 'fadeIn 0.3s', display: 'flex', gap: '24px', height: 'calc(100vh - 120px)' }}>
            
            {/* Left Pane: Conversation List */}
            <div style={{ flex: '1', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>Inbox Threads</h3>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.map(conv => (
                        <div 
                            key={conv.id} 
                            onClick={() => handleSelectConv(conv)}
                            style={{ 
                                padding: '16px', 
                                borderBottom: '1px solid #f1f5f9', 
                                cursor: 'pointer',
                                background: activeConv?.id === conv.id ? '#eff6ff' : 'white',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <strong style={{ color: '#0f172a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={14} /> {conv.scannerId === 'ADMIN' ? (conv.ownerName || 'User') : `Scanner: ${conv.scannerId.substring(0,6)}...`}
                                </strong>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    {new Date(conv.startedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <Tag size={12} /> {conv.tag.name} ({conv.tag.tagId})
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {conv.messages && conv.messages.length > 0 ? conv.messages[0].content : 'No messages yet'}
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No conversations found.</div>
                    )}
                </div>
            </div>

            {/* Right Pane: Chat Window */}
            <div style={{ flex: '2', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {activeConv ? (
                    <>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px', color: '#0f172a' }}>Thread with: {activeConv.scannerId === 'ADMIN' ? (activeConv.ownerName || 'User') : activeConv.scannerId}</h3>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Regarding Tag: {activeConv.tag.name}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: activeConv.status === 'closed' ? '#fef2f2' : '#ecfdf5', color: activeConv.status === 'closed' ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                                    {activeConv.status?.toUpperCase() || 'OPEN'}
                                </span>
                                {(!activeConv.status || activeConv.status === 'open') && (
                                    <button onClick={handleEndConversation} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>End Chat</button>
                                )}
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
                            {messages.map(msg => {
                                const isAdmin = msg.senderRole === 'owner'; // In this context, owner/admin are on the right
                                return (
                                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start' }}>
                                        <div style={{ 
                                            background: isAdmin ? '#4f46e5' : 'white', 
                                            color: isAdmin ? 'white' : '#0f172a',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            borderBottomRightRadius: isAdmin ? '4px' : '12px',
                                            borderBottomLeftRadius: !isAdmin ? '4px' : '12px',
                                            maxWidth: '70%',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            border: isAdmin ? 'none' : '1px solid #e2e8f0'
                                        }}>
                                            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', fontWeight: 'bold' }}>
                                                {msg.senderInfo}
                                            </div>
                                            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                                {msg.content}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={10} /> {new Date(msg.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input 
                                    type="text" 
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendReply()}
                                    placeholder="Type a message as Admin..." 
                                    style={{ flex: 1, padding: '12px 16px', borderRadius: '100px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} 
                                />
                                <button onClick={handleSendReply} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '100px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>Select a conversation to view thread</p>
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default CommunicationsTab;
