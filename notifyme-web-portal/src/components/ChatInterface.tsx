import React, { useState } from 'react';
import axios from 'axios';
import { Send, Image, Mic, Check, CheckCheck, Trash2, Ban, BadgeCheck, ShieldCheck, ChevronLeft, MicOff, Paperclip, MapPin } from 'lucide-react';

const NotifyMeLogo = ({ size = 48 }: { size?: number }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #1d9bf0 0%, #005bb5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <ShieldCheck size={size * 0.55} color="white" />
    </div>
);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ChatInterface({ messages, user, fetchTagsAndMessages }: any) {
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [showBlocked, setShowBlocked] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
    
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const audioChunksRef = React.useRef<Blob[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchBlockedUsers = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.get(`${API_BASE}/messages/blocked`, { headers: { Authorization: `Bearer ${token}` } });
            setBlockedUsers(res.data);
        } catch (err) {}
    };

    const handleUnblock = async (scannerId: string) => {
        try {
            const token = localStorage.getItem('userToken');
            await axios.post(`${API_BASE}/messages/unblock`, { scannerId }, { headers: { Authorization: `Bearer ${token}` } });
            fetchBlockedUsers();
        } catch (err) {}
    };

    // Group messages by Conversation
    const chats = messages.reduce((acc: any, msg: any) => {
        if (!msg.tag || !msg.conversationId) return acc;
        
        const key = msg.conversationId;
        if (!acc[key]) {
            acc[key] = { 
                conversationId: msg.conversationId, 
                tag: msg.tag, 
                scanner: msg.conversation?.scannerId || 'Anonymous',
                msgs: [] 
            };
        }
        // Use scanner's senderInfo for display name if available
        if (msg.senderRole !== 'owner' && msg.senderInfo && msg.senderInfo !== 'Anonymous') {
            acc[key].scanner = msg.senderInfo;
        }
        acc[key].msgs.push(msg);
        return acc;
    }, {});

    // Sort msgs in each chat by time, and create chatList sorted by latest message time
    const chatList = Object.keys(chats).map(k => {
        const sortedMsgs = chats[k].msgs.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const lastMsg = sortedMsgs[sortedMsgs.length - 1];
        return { 
            key: k, 
            ...chats[k], 
            msgs: sortedMsgs,
            lastMsg,
            lastMsgTime: new Date(lastMsg.createdAt).getTime()
        };
    }).sort((a, b) => b.lastMsgTime - a.lastMsgTime);
    const activeChat = selectedChat ? chats[selectedChat] : null;

    const handleBlockUser = async () => {
        if (!activeChat) return;
        if (activeChat.scanner === 'ADMIN') {
            alert('Cannot block Master Admin');
            return;
        }
        if (!window.confirm(`Are you sure you want to block ${activeChat.scanner}?`)) return;
        try {
            const token = localStorage.getItem('userToken');
            await axios.post(`${API_BASE}/messages/block`, { scannerId: activeChat.scanner }, { headers: { Authorization: `Bearer ${token}` } });
            alert('User blocked');
            setSelectedChat(null);
            fetchTagsAndMessages(user.id);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to block user');
        }
    };

    const handleDeleteChat = async () => {
        if (!activeChat) return;
        if (!window.confirm('Are you sure you want to delete this chat?')) return;
        try {
            const token = localStorage.getItem('userToken');
            await axios.delete(`${API_BASE}/messages/conversation/${activeChat.conversationId}`, { headers: { Authorization: `Bearer ${token}` } });
            alert('Chat deleted');
            setSelectedChat(null);
            fetchTagsAndMessages(user.id);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete chat');
        }
    };

    const handleSendReply = async (text: string = replyText, type: 'text'|'image'|'audio'|'location' = 'text', mediaUrl: string|null = null, lat: number|null = null, lng: number|null = null) => {
        if (!text.trim() && !mediaUrl && !lat) return;
        if (!activeChat) return;
        try {
            await axios.post(`${API_BASE}/messages/send`, {
                content: text,
                senderInfo: user.name || 'Owner',
                senderRole: 'owner',
                tagId: activeChat.tag.id,
                conversationId: activeChat.conversationId,
                mediaUrl,
                mediaType: type !== 'text' && type !== 'location' ? type : null,
                latitude: lat,
                longitude: lng
            });
            if (text === replyText) setReplyText('');
            fetchTagsAndMessages(user.id);
        } catch (error) {
            alert('Failed to send reply');
        }
    };

    const uploadMedia = async (file: File | Blob, ext: string = 'jpg'): Promise<string|null> => {
        const formData = new FormData();
        formData.append('media', file, `upload.${ext}`);
        try {
            const res = await axios.post(`${API_BASE}/messages/upload`, formData);
            return res.data.url;
        } catch (err) {
            alert('Failed to upload media.');
            return null;
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = await uploadMedia(file, file.name.split('.').pop() || 'jpg');
            if (url) {
                await handleSendReply('', 'image', url);
            }
        }
    };

    const shareLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                await handleSendReply("My Location", 'location', null, position.coords.latitude, position.coords.longitude);
            }, () => {
                alert('Location access denied.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];
                
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunksRef.current.push(e.data);
                };
                
                mediaRecorder.onstop = async () => {
                    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
                    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                    stream.getTracks().forEach(t => t.stop());
                    const url = await uploadMedia(audioBlob, ext);
                    if (url) await handleSendReply('Voice Message', 'audio', url);
                };
                
                mediaRecorder.start();
                setIsRecording(true);
                setRecordingTime(0);
            } catch (err) {
                alert('Microphone access denied.');
            }
        }
    };

    React.useEffect(() => {
        let interval: any;
        if (isRecording) interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [isRecording]);

    return (
        <div className="chat-layout">
            {/* Sidebar (Chat List) */}
            <div className={`chat-sidebar ${selectedChat ? 'mobile-hidden' : ''}`}>
                <div style={{ padding: '12px 16px', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #d1d7db' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dfe5e7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#54656f' }}>
                            {user?.name?.charAt(0) || 'O'}
                        </div>
                        <span style={{ fontWeight: '500', color: '#111b21' }}>Chats</span>
                    </div>
                    <button onClick={() => { fetchBlockedUsers(); setShowBlocked(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#54656f' }} title="Blocked Users">
                        <Ban size={20} />
                    </button>
                </div>
                
                <div style={{ overflowY: 'auto', flex: 1, background: 'white' }}>
                    {chatList.map((chat: any) => (
                        <div 
                            key={chat.key} 
                            onClick={() => setSelectedChat(chat.key)}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                padding: '12px 16px', 
                                cursor: 'pointer', 
                                background: selectedChat === chat.key ? '#f0f2f5' : 'white',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => { if(selectedChat !== chat.key) e.currentTarget.style.background = '#f5f6f6' }}
                            onMouseOut={(e) => { if(selectedChat !== chat.key) e.currentTarget.style.background = 'white' }}
                        >
                            <div style={{ flexShrink: 0, marginRight: '12px' }}>
                                {chat.scanner === 'ADMIN' ? (
                                    <NotifyMeLogo size={48} />
                                ) : (
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dfe5e7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        <img src={`https://api.dicebear.com/6.x/initials/svg?seed=${chat.scanner}&backgroundColor=00a884`} alt="avatar" style={{ width: '100%', height: '100%' }} />
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1, borderBottom: '1px solid #f2f2f2', paddingBottom: '12px', minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                    <span style={{ fontWeight: '500', color: '#111b21', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {chat.scanner === 'ADMIN' ? 'NotifyMe' : chat.scanner}
                                        {chat.scanner === 'ADMIN' && <BadgeCheck size={16} color="#1d9bf0" style={{ flexShrink: 0 }} />}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#667781' }}>{new Date(chat.lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {chat.lastMsg.senderRole === 'owner' && (
                                        <CheckCheck size={16} color={chat.lastMsg.status === 'read' ? '#53bdeb' : '#8696a0'} />
                                    )}
                                    <span style={{ fontSize: '14px', color: '#667781', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {chat.lastMsg.content}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {chatList.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: '#8696a0' }}>No active conversations.</div>}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`chat-main ${!selectedChat ? 'mobile-hidden' : ''}`}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '10px 16px', background: '#f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #d1d7db' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button className="chat-back-btn" onClick={() => setSelectedChat(null)}><ChevronLeft size={24} /></button>
                                {activeChat.scanner === 'ADMIN' ? (
                                    <NotifyMeLogo size={40} />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
                                        <img src={`https://api.dicebear.com/6.x/initials/svg?seed=${activeChat.scanner}&backgroundColor=00a884`} alt="avatar" style={{ width: '100%', height: '100%' }} />
                                    </div>
                                )}
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px', color: '#111b21', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {activeChat.scanner === 'ADMIN' ? 'NotifyMe' : activeChat.scanner}
                                        {activeChat.scanner === 'ADMIN' && <BadgeCheck size={16} color="#1d9bf0" />}
                                    </h3>
                                    <div style={{ fontSize: '13px', color: '#667781' }}>{activeChat.scanner === 'ADMIN' ? 'Official Business Account' : `Tag: ${activeChat.tag.name}`}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button onClick={handleBlockUser} style={{ background: 'transparent', color: '#54656f', border: 'none', cursor: 'pointer' }} title="Block"><Ban size={20} /></button>
                                <button onClick={handleDeleteChat} style={{ background: 'transparent', color: '#54656f', border: 'none', cursor: 'pointer' }} title="Delete Chat"><Trash2 size={20} /></button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: 'contain', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(255,255,255,0.7)' }}>
                            <div style={{ alignSelf: 'center', background: '#ffeecd', color: '#54656f', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px', boxShadow: '0 1px 0.5px rgba(11,20,26,.13)' }}>
                                Messages are end-to-end encrypted for this session.
                            </div>
                            {activeChat.msgs.map((m: any, index: number) => {
                                const isOwner = m.senderRole === 'owner';
                                // Simple logic to determine tail
                                const prevMsg = index > 0 ? activeChat.msgs[index-1] : null;
                                const isFirstInGroup = !prevMsg || prevMsg.senderRole !== m.senderRole;
                                
                                return (
                                    <div key={m.id} style={{ 
                                        alignSelf: isOwner ? 'flex-end' : 'flex-start', 
                                        maxWidth: '65%', 
                                        background: isOwner ? '#d9fdd3' : (activeChat.scanner === 'ADMIN' ? '#f0f7ff' : 'white'), 
                                        padding: '6px 12px', 
                                        borderRadius: '8px', 
                                        borderTopRightRadius: isOwner && isFirstInGroup ? '0' : '8px',
                                        borderTopLeftRadius: !isOwner && isFirstInGroup ? '0' : '8px',
                                        boxShadow: '0 1px 0.5px rgba(11,20,26,.13)',
                                        position: 'relative',
                                        marginTop: isFirstInGroup ? '8px' : '0',
                                        border: (!isOwner && activeChat.scanner === 'ADMIN') ? '1px solid #cce4ff' : 'none',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        {!isOwner && activeChat.scanner === 'ADMIN' && isFirstInGroup && (
                                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1d9bf0', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                NotifyMe <BadgeCheck size={12} color="#1d9bf0" />
                                            </div>
                                        )}
                                        {m.mediaType === 'image' && m.mediaUrl && (
                                            <div style={{ marginBottom: '8px', borderRadius: '8px', overflow: 'hidden' }}>
                                                <img src={`${API_BASE.replace('/api', '')}${m.mediaUrl}`} alt="Attached" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                        {m.mediaType === 'audio' && m.mediaUrl && (
                                            <div style={{ marginBottom: '8px' }}>
                                                <audio controls src={`${API_BASE.replace('/api', '')}${m.mediaUrl}`} style={{ width: '200px', height: '36px' }} />
                                            </div>
                                        )}
                                        {m.latitude && m.longitude && (
                                            <a href={`https://maps.google.com/?q=${m.latitude},${m.longitude}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'inherit', textDecoration: 'none', background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: '8px', marginBottom: '8px' }}>
                                                <MapPin size={20} />
                                                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>View Location</div>
                                            </a>
                                        )}
                                        {m.content && (
                                            <div style={{ fontSize: '14.2px', color: '#111b21', lineHeight: '19px', wordWrap: 'break-word', paddingRight: '40px' }}>
                                                {m.content}
                                            </div>
                                        )}
                                        <div style={{ 
                                            fontSize: '11px', 
                                            color: '#667781', 
                                            position: 'absolute',
                                            bottom: '4px',
                                            right: '7px',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '4px' 
                                        }}>
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isOwner && (
                                                <CheckCheck size={15} color={m.status === 'read' ? '#53bdeb' : '#8696a0'} style={{ marginBottom: '-2px' }} />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Input Area */}
                        <div style={{ padding: '10px 16px', background: '#f0f2f5', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,audio/*" />
                            <button onClick={() => fileInputRef.current?.click()} style={{ background: 'transparent', border: 'none', color: '#54656f', cursor: 'pointer', padding: '8px' }}><Paperclip size={24} /></button>
                            <button onClick={shareLocation} style={{ background: 'transparent', border: 'none', color: '#54656f', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}><MapPin size={24} /></button>
                            
                            {isRecording ? (
                                <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 'bold' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }}></div>
                                    Recording {recordingTime}s
                                </div>
                            ) : (
                                <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '9px 12px', display: 'flex', alignItems: 'center' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Type a message" 
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '15px', background: 'transparent' }} 
                                    />
                                </div>
                            )}
                            
                            {replyText.trim() || isRecording ? (
                                <button onClick={() => isRecording ? toggleRecording() : handleSendReply()} style={{ background: isRecording ? '#ef4444' : 'transparent', border: 'none', color: isRecording ? 'white' : '#54656f', cursor: 'pointer', padding: '8px', borderRadius: isRecording ? '50%' : '0' }}>
                                    {isRecording ? <Send size={20} /> : <Send size={24} />}
                                </button>
                            ) : (
                                <button onClick={toggleRecording} style={{ background: 'transparent', border: 'none', color: '#54656f', cursor: 'pointer', padding: '8px' }}><Mic size={24} /></button>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', color: '#667781', textAlign: 'center', borderBottom: '6px solid #25d366' }}>
                        <h1 style={{ fontWeight: '300', color: '#41525d', fontSize: '32px', marginBottom: '16px' }}>NotifyMe Web</h1>
                        <p style={{ fontSize: '14px', maxWidth: '400px', lineHeight: '20px' }}>
                            Send and receive messages securely without sharing your phone number.<br/>
                            End-to-end encryption ensures your privacy.
                        </p>
                    </div>
                )}
            </div>

            {/* Blocked Users Modal */}
            {showBlocked && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0 }}>Blocked Users</h3>
                            <button onClick={() => setShowBlocked(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                        </div>
                        
                        {blockedUsers.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>No blocked users.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                                {blockedUsers.map(u => (
                                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <span style={{ fontWeight: 'bold' }}>{u.scannerId}</span>
                                        <button onClick={() => handleUnblock(u.scannerId)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Unblock</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


