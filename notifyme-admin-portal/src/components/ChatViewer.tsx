import React, { useState } from 'react';
import { CheckCheck } from 'lucide-react';

export default function ChatViewer({ messages, user }: any) {
    const [selectedChat, setSelectedChat] = useState<string | null>(null);

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

    return (
        <div style={{ display: 'flex', height: '600px', background: '#f0f2f5', borderRadius: '12px', border: '1px solid #d1d7db', overflow: 'hidden' }}>
            {/* Sidebar (Chat List) */}
            <div style={{ width: '35%', minWidth: '250px', borderRight: '1px solid #d1d7db', display: 'flex', flexDirection: 'column', background: 'white' }}>
                <div style={{ padding: '12px 16px', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #d1d7db' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '500', color: '#111b21' }}>Conversations</span>
                    </div>
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
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dfe5e7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '12px', overflow: 'hidden' }}>
                                <img src={`https://api.dicebear.com/6.x/initials/svg?seed=${chat.scanner}&backgroundColor=00a884`} alt="avatar" style={{ width: '100%', height: '100%' }} />
                            </div>
                            <div style={{ flex: 1, borderBottom: '1px solid #f2f2f2', paddingBottom: '12px', minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                                    <span style={{ fontWeight: '400', color: '#111b21', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.scanner}</span>
                                    <span style={{ fontSize: '11px', color: '#667781' }}>{new Date(chat.lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {chat.lastMsg.senderRole === 'owner' && (
                                        <CheckCheck size={14} color={chat.lastMsg.status === 'read' ? '#53bdeb' : '#8696a0'} />
                                    )}
                                    <span style={{ fontSize: '12px', color: '#667781', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#efeae2', position: 'relative' }}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '10px 16px', background: '#f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #d1d7db' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden' }}>
                                    <img src={`https://api.dicebear.com/6.x/initials/svg?seed=${activeChat.scanner}&backgroundColor=00a884`} alt="avatar" style={{ width: '100%', height: '100%' }} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '15px', color: '#111b21', fontWeight: '500' }}>{activeChat.scanner}</h3>
                                    <div style={{ fontSize: '12px', color: '#667781' }}>Tag: {activeChat.tag.name}</div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: 'contain', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(255,255,255,0.7)' }}>
                            {activeChat.msgs.map((m: any, index: number) => {
                                const isOwner = m.senderRole === 'owner';
                                const prevMsg = index > 0 ? activeChat.msgs[index-1] : null;
                                const isFirstInGroup = !prevMsg || prevMsg.senderRole !== m.senderRole;
                                
                                return (
                                    <div key={m.id} style={{ 
                                        alignSelf: isOwner ? 'flex-end' : 'flex-start', 
                                        maxWidth: '75%', 
                                        background: isOwner ? '#d9fdd3' : 'white', 
                                        color: '#111b21', 
                                        padding: '6px 7px 8px 9px', 
                                        borderRadius: '7.5px', 
                                        borderTopLeftRadius: !isOwner && isFirstInGroup ? '0' : '7.5px',
                                        borderTopRightRadius: isOwner && isFirstInGroup ? '0' : '7.5px',
                                        boxShadow: '0 1px 0.5px rgba(11,20,26,.13)',
                                        position: 'relative',
                                        marginTop: isFirstInGroup ? '8px' : '0',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <div style={{ fontSize: '14px', lineHeight: '19px', paddingRight: '40px' }}>
                                            {m.content}
                                        </div>
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
                                                <CheckCheck size={14} color={m.status === 'read' ? '#53bdeb' : '#8696a0'} style={{ marginBottom: '-2px' }} />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', color: '#667781', textAlign: 'center', borderBottom: '6px solid #25d366' }}>
                        <h1 style={{ fontWeight: '300', color: '#41525d', fontSize: '24px', marginBottom: '8px' }}>Select a chat</h1>
                        <p style={{ fontSize: '13px', maxWidth: '300px', lineHeight: '20px' }}>
                            View detailed message history for this user.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
