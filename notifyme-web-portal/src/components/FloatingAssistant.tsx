import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, ShieldCheck, User, Loader2, Sparkles, AlertTriangle, Shield } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FloatingAssistantProps {
    onNavigate: (tab: any) => void;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    isError?: boolean;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Hi there! I'm your NotifyMe Assistant. How can I help you manage your QR codes or account today?", sender: 'ai', timestamp: new Date() }
    ]);
    const [currentQuickActions, setCurrentQuickActions] = useState<{label: string, action: string}[]>([
        { label: 'Create a QR', action: 'OPEN_QR' },
        { label: 'My Subscriptions', action: 'OPEN_SUBSCRIPTION' },
        { label: 'Privacy & Security', action: 'OPEN_PRIVACY' },
        { label: 'Support', action: 'OPEN_SUPPORT' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const token = localStorage.getItem('userToken');
            
            if (!token) {
                setTimeout(() => {
                    const aiMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        text: "You need to be logged in to chat with me! Please sign in to access your account and features.",
                        sender: 'ai',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiMsg]);
                    setCurrentQuickActions([
                        { label: 'Sign In / Register', action: 'OPEN_QR' },
                        { label: 'Support', action: 'OPEN_SUPPORT' }
                    ]);
                    setIsTyping(false);
                }, 800);
                return;
            }
            
            // Format history for backend
            const history = messages.map(m => ({ text: m.text, sender: m.sender }));

            const res = await axios.post(`${API_BASE}/ai/chat`, {
                message: userMsg.text,
                conversationHistory: history
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: res.data.response,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);

            if (res.data.quickActions && res.data.quickActions.length > 0) {
                setCurrentQuickActions(res.data.quickActions);
            } else {
                setCurrentQuickActions([]);
            }

            if (res.data.action && res.data.action !== 'NONE') {
                setTimeout(() => {
                    handleAction(res.data.action);
                }, 1000);
            }

        } catch (err: any) {
            console.error("Chat error:", err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "I'm having trouble connecting right now. Please try again later.";
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
        }
    };

    const handleAction = (action: string) => {
        if (action === 'NONE') return;
        switch(action) {
            case 'OPEN_QR': onNavigate('tags'); setIsOpen(false); break;
            case 'OPEN_SUPPORT': onNavigate('support'); setIsOpen(false); break;
            case 'OPEN_SUBSCRIPTION': onNavigate('subscriptions'); setIsOpen(false); break;
            case 'OPEN_PRIVACY': onNavigate('privacy'); setIsOpen(false); break;
            case 'OPEN_SETTINGS': onNavigate('settings'); setIsOpen(false); break;
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
        }}>
            {/* Chat Window */}
            {isOpen && (
                <div className="floating-assistant-container">
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                                <Bot size={24} color="white" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>NotifyMe Assistant</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', opacity: 0.9 }}>
                                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                                    Online & Secure
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'background 0.2s' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{
                        flex: 1,
                        background: '#f8fafc',
                        padding: '20px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <ShieldCheck size={14} /> End-to-end encrypted session
                        </div>

                        {messages.map((msg) => (
                            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '12px 16px',
                                    background: msg.sender === 'user' ? '#4f46e5' : 'white',
                                    color: msg.sender === 'user' ? 'white' : '#0f172a',
                                    borderRadius: '16px',
                                    borderBottomRightRadius: msg.sender === 'user' ? '4px' : '16px',
                                    borderBottomLeftRadius: msg.sender !== 'user' ? '4px' : '16px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    border: msg.sender === 'user' ? 'none' : (msg.isError ? '1px solid #fca5a5' : '1px solid #e2e8f0'),
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.text}
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
                                <Loader2 size={16} color="#64748b" className="spin-animation" />
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Assistant is typing...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions (only show if no typing and no recent user message) */}
                    {!isTyping && messages[messages.length-1].sender === 'ai' && currentQuickActions.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', background: '#f8fafc', overflowX: 'auto', borderTop: '1px solid #e2e8f0' }} className="hide-scrollbar">
                            {currentQuickActions.map(qa => (
                                <button key={qa.label} onClick={() => {
                                    if (qa.action !== 'NONE') {
                                        handleAction(qa.action);
                                    } else {
                                        setInputValue(qa.label);
                                        setTimeout(() => handleSend(), 50);
                                    }
                                }} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#475569', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                                    {qa.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div style={{ padding: '16px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            className="input-field"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything..."
                            style={{ flex: 1, padding: '12px 16px', borderRadius: '100px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            style={{ width: '44px', height: '44px', borderRadius: '50%', background: inputValue.trim() && !isTyping ? '#4f46e5' : '#e2e8f0', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputValue.trim() && !isTyping ? 'pointer' : 'default', transition: 'background 0.2s' }}
                        >
                            <Send size={18} style={{ marginLeft: '2px' }} />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <div style={{ position: 'relative' }}>
                    {isHovered && (
                        <div style={{
                            position: 'absolute',
                            right: '76px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'white',
                            color: '#0f172a',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            animation: 'fadeIn 0.2s ease-out'
                        }}>
                            Ask NotifyMe
                            <div style={{
                                position: 'absolute',
                                right: '-4px',
                                top: '50%',
                                transform: 'translateY(-50%) rotate(45deg)',
                                width: '8px',
                                height: '8px',
                                background: 'white'
                            }}></div>
                        </div>
                    )}
                    
                    <div className="button-pulse-ring" style={{
                        position: 'absolute',
                        top: -4, left: -4, right: -4, bottom: -4,
                        borderRadius: '50%',
                        background: 'rgba(79, 70, 229, 0.4)',
                        zIndex: 0
                    }}></div>

                    <button
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '32px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            boxShadow: isHovered ? '0 10px 25px -5px rgba(79, 70, 229, 0.6)' : '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            transform: isHovered ? 'scale(1.05) translateY(-2px)' : 'scale(1) translateY(0)',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <Shield size={28} />
                        {/* Notification Badge */}
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '16px', height: '16px', background: '#ef4444', border: '2px solid white', borderRadius: '50%' }}></div>
                    </button>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulseGlow {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.2); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-50%) translateX(10px); }
                    to { opacity: 1; transform: translateY(-50%) translateX(0); }
                }
                .button-pulse-ring {
                    animation: pulseGlow 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
                }
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @media (max-width: 768px) {
                    /* Reposition above bottom nav if present on mobile */
                    div[style*="bottom: 24px"] {
                        bottom: 80px !important; 
                        right: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default FloatingAssistant;
