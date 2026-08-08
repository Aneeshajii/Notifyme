import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer/simplepeer.min.js';
import { Shield, Plus, Settings, Info, LogOut, QrCode, Search, User, Eye, Inbox, Phone, PhoneOff, CreditCard, Bell, Smartphone, Activity, Car, Home, Briefcase, FileText, Lock, Users, Download, HelpCircle, MapPin, TriangleAlert, ShieldAlert, FileSpreadsheet, List, Menu, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import ChatInterface from './components/ChatInterface';
import './index.css';

import UserDashboard from './components/UserDashboard';
import QRAnalytics from './components/QRAnalytics';
import SpecializedModes from './components/SpecializedModes';
import PrivacySecurity from './components/PrivacySecurity';
import Subscriptions from './components/Subscriptions';
import ScanHistory from './components/ScanHistory';
import SupportCenter from './components/SupportCenter';
import AboutUs from './components/AboutUs';
import QRDownloadModal from './components/QRDownloadModal';
import FloatingAssistant from './components/FloatingAssistant';
import { useGoogleLogin } from '@react-oauth/google';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socket: Socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

interface UserType {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  pincode?: string;
  city?: string;
  state?: string;
  isPremium: boolean;
}

interface TagType {
  id: string;
  tagId: string;
  name: string;
  plateNumber: string;
  status: string;
  qrCodeDataUrl: string;
}

interface MessageType {
  id: string;
  content: string;
  senderInfo: string;
  createdAt: string;
  tag: {
    name: string;
  };
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [tags, setTags] = useState<TagType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard'|'tags'|'analytics'|'inbox'|'notifications'|'scan_history'|'vehicle'|'home'|'emergency'|'business'|'subscriptions'|'privacy'|'security'|'family'|'about_us'|'support'|'profile'|'settings'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [downloadingTag, setDownloadingTag] = useState<any>(null);
  
  // Expanded sidebar category toggle state
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    modes: true,
    account: true
  });
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Profile Form State
  const [profileData, setProfileData] = useState<Partial<UserType>>({});
  const [isSaving, setIsSaving] = useState(false);

  // WebRTC States
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const callerAudio = useRef<HTMLAudioElement>(null);
  const connectionRef = useRef<any>();

  const toggleMute = () => { if (stream) { stream.getAudioTracks()[0].enabled = isMuted; setIsMuted(!isMuted); } };
  const toggleCamera = () => { if (stream) { stream.getVideoTracks()[0].enabled = !isCameraOn; setIsCameraOn(!isCameraOn); } };
  const toggleSpeaker = () => setIsSpeaker(!isSpeaker);

  const logCall = async (tagId: string, status: string, duration?: number) => {
    try {
        await axios.post(`${API_BASE}/calls/log`, {
            tagId, status, duration
        });
    } catch (e) {
        console.error("Failed to log call");
    }
  };

  useEffect(() => {
    if (user) {
      socket.emit('join-owner-room', user.id);
      
      const handleAccountUpdated = async () => {
          try {
              const res = await axios.get(`${API_BASE}/auth/me`);
              setUser(res.data);
              setProfileData(res.data);
              fetchTagsAndMessages(res.data.id);
          } catch (e) {
              console.error("Failed to sync account updates.");
          }
      };

      socket.on('account-updated', handleAccountUpdated);

      return () => {
          socket.off('account-updated', handleAccountUpdated);
      };
    }
  }, [user?.id]);

  useEffect(() => {
    socket.on('incoming-call', (data) => {
      setIncomingCall({
        signal: data.signal,
        callerId: data.callerId,
        tagId: data.tagId
      });
    });
    return () => {
      socket.off('incoming-call');
    };
  }, []);

  const acceptCall = () => {
    setCallAccepted(true);
    setCallStartTime(Date.now());
    navigator.mediaDevices.getUserMedia({ video: isCameraOn, audio: true }).then((currentStream) => {
      setStream(currentStream);
      
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: currentStream
      });

      peer.on('signal', (data: any) => {
        socket.emit('answer-call', { signalData: data, callerId: incomingCall.callerId });
      });

      peer.on('stream', (remoteStream: MediaStream) => {
        if (callerAudio.current) {
          callerAudio.current.srcObject = remoteStream;
          callerAudio.current.play();
        }
      });

      peer.signal(incomingCall.signal);
      connectionRef.current = peer;
    }).catch(err => alert("Microphone permission denied."));
  };

  const rejectCall = () => {
    if (incomingCall) {
        logCall(incomingCall.tagId, 'rejected');
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (incomingCall && callStartTime) {
        const duration = Math.floor((Date.now() - callStartTime) / 1000);
        logCall(incomingCall.tagId, 'completed', duration);
    }
    setCallAccepted(false);
    setIncomingCall(null);
    setIsMuted(false);
    setIsCameraOn(false);
    setCallStartTime(null);
    if (connectionRef.current) connectionRef.current.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  // Session persistence on load
  useEffect(() => {
      const storedToken = localStorage.getItem('userToken');
      if (storedToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          axios.get(`${API_BASE}/auth/me`).then(res => {
              setUser(res.data);
              setProfileData(res.data);
              setIsAuthenticated(true);
              fetchTagsAndMessages(res.data.id);
          }).catch(() => {
              localStorage.removeItem('userToken');
              delete axios.defaults.headers.common['Authorization'];
          }).finally(() => {
              setIsCheckingSession(false);
          });
      } else {
          setIsCheckingSession(false);
      }
  }, []);

  const handleLogout = async () => {
      try {
          await axios.post(`${API_BASE}/auth/logout`);
      } catch (err) {
          console.error("Logout API failed", err);
      } finally {
          localStorage.removeItem('userToken');
          delete axios.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
      }
  };

  const fetchTagsAndMessages = async (userId: string) => {
    try {
      const [tagsRes, msgsRes] = await Promise.all([
        axios.get(`${API_BASE}/tags/user/${userId}`),
        axios.get(`${API_BASE}/messages/user/${userId}`)
      ]);
      setTags(tagsRes.data);
      setMessages(msgsRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await axios.post(`${API_BASE}/auth/google/verify`, { 
          token: tokenResponse.access_token 
        });
        const loggedInUser = res.data.user; 
        if (loggedInUser && res.data.accessToken) {
          const token = res.data.accessToken;
          localStorage.setItem('userToken', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
          setUser(loggedInUser);
          setProfileData(loggedInUser);
          setIsAuthenticated(true);
          fetchTagsAndMessages(loggedInUser.id);
        } else {
            throw new Error("Invalid response from server");
        }
      } catch (err) {
        console.error(err);
        setAuthError('Google login verification failed.');
      }
    },
    onError: () => setAuthError('Google login window closed or failed.')
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      if (authMode === 'register') {
        const res = await axios.post(`${API_BASE}/auth/register`, { email, password, name });
        if (!res.data.accessToken) throw new Error("Registration succeeded but no token provided.");
        const token = res.data.accessToken;
        localStorage.setItem('userToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(res.data.user);
        setProfileData(res.data.user);
        setIsAuthenticated(true);
        fetchTagsAndMessages(res.data.user.id);
      } else {
        const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
        if (!res.data.accessToken) throw new Error("Login succeeded but no token provided.");
        const token = res.data.accessToken;
        localStorage.setItem('userToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(res.data.user);
        setProfileData(res.data.user);
        setIsAuthenticated(true);
        fetchTagsAndMessages(res.data.user.id);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Authentication failed. Please check credentials.");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await axios.put(`${API_BASE}/auth/profile/${user.id}`, profileData);
      setUser(res.data.user);
      setProfileData(res.data.user);
      alert("Profile saved successfully!");
    } catch (error) {
      alert("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTag = async () => {
    const tagName = prompt('Enter a name for this tag (e.g., My Tesla):');
    if (!tagName || !user) return;
    try {
      await axios.post(`${API_BASE}/tags/create`, {
        ownerId: user.id, name: tagName
      });
      fetchTagsAndMessages(user.id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create QR Code');
    }
  };

  const handleEditTag = async (tag: any) => {
    const newName = prompt('Enter new name for this tag:', tag.name);
    if (!newName || newName === tag.name) return;
    try {
      await axios.put(`${API_BASE}/tags/${tag.id}`, { name: newName });
      fetchTagsAndMessages(user!.id);
    } catch (error) {
      alert('Failed to edit tag');
    }
  };

  const handleToggleTagStatus = async (tag: any) => {
    const newStatus = tag.isActive ? false : true;
    const confirmMsg = newStatus ? 'Activate this tag?' : 'Pause this tag? Scanners will not be able to contact you.';
    if (!window.confirm(confirmMsg)) return;
    try {
      await axios.put(`${API_BASE}/tags/${tag.id}`, { 
          isActive: newStatus, 
          status: newStatus ? 'active' : 'paused' 
      });
      fetchTagsAndMessages(user!.id);
    } catch (error) {
      alert('Failed to toggle tag status');
    }
  };

  if (isCheckingSession) {
      return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
              <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                  <Shield size={64} color="#4f46e5" />
              </div>
              <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 'bold' }}>Loading your secure session...</p>
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .7; transform: scale(1.05); } }`}</style>
          </div>
      );
  }

  if (!isAuthenticated) {
    return (
      <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div className="login-card" style={{ background: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div className="brand login-brand" style={{ justifyContent: 'center', marginBottom: '32px' }}>
            <Shield size={48} color="#4f46e5" />
          </div>
          <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '8px' }}>Welcome to NotifyMe</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>Secure, anonymous connections.</p>
          
            {authMode === 'login' ? (
              <>
                  <button onClick={handleGoogleLogin} style={{ width: '100%', padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '24px', height: '24px' }} />
                      Continue with Google
                  </button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0', color: '#cbd5e1' }}>
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                      <span style={{ fontSize: '14px' }}>OR</span>
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                  </div>
  
                  <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <input type="email" placeholder="Email Address" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                      <input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                      <button type="submit" style={{ padding: '16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
                  </form>
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <span style={{ color: '#64748b' }}>Don't have an account? </span>
                      <button onClick={() => setAuthMode('register')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer' }}>Sign Up</button>
                  </div>
              </>
            ) : (
              <>
                  <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                      <input type="email" placeholder="Email Address" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                      <input type="password" placeholder="Password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                      <button type="submit" style={{ padding: '16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</button>
                  </form>
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <span style={{ color: '#64748b' }}>Already have an account? </span>
                      <button onClick={() => setAuthMode('login')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
                  </div>
              </>
            )}

        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <audio ref={callerAudio} />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="brand">
          <Shield size={28} />
          <span>NotifyMe</span>
        </div>
        <nav className="nav-menu" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 140px)', paddingRight: '8px' }}>
          
          <div style={{ marginBottom: '16px' }}>
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}><Activity size={20} /> Dashboard</button>
            <button className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`} onClick={() => { setActiveTab('tags'); setMobileMenuOpen(false); }}><QrCode size={20} /> My Tags</button>
            <button className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => { setActiveTab('inbox'); setMobileMenuOpen(false); }}><Inbox size={20} /> Comm Center {messages.length > 0 && <span className="badge-count">{messages.length}</span>}</button>
            <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => { setActiveTab('notifications'); setMobileMenuOpen(false); }}><Bell size={20} /> Notifications</button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ padding: '0 16px', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => toggleCategory('account')}>
              ACCOUNT & SECURITY {expandedCategories.account ? '▼' : '▶'}
            </div>
            {expandedCategories.account && (
              <>
                <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}><User size={20} /> Profile</button>
                <button className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`} onClick={() => { setActiveTab('subscriptions'); setMobileMenuOpen(false); }}><CreditCard size={20} /> Subscriptions</button>
                <button className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => { setActiveTab('privacy'); setMobileMenuOpen(false); }}><Eye size={20} /> Privacy Center</button>
                <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => { setActiveTab('security'); setMobileMenuOpen(false); }}><ShieldAlert size={20} /> Security Center</button>
                <button className={`nav-item ${activeTab === 'family' ? 'active' : ''}`} onClick={() => { setActiveTab('family'); setMobileMenuOpen(false); }}><Users size={20} /> Family Sharing</button>
              </>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <button className={`nav-item ${activeTab === 'about_us' ? 'active' : ''}`} onClick={() => { setActiveTab('about_us'); setMobileMenuOpen(false); }}><Info size={20} /> About Us</button>
            <button className={`nav-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => { setActiveTab('support'); setMobileMenuOpen(false); }}><HelpCircle size={20} /> Support Center</button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}><Settings size={20} /> App Settings</button>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="search-bar">
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="user-profile">
            <span>{user?.name || 'User'}</span>
            <div className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
          </div>
        </header>

        <div className="content-area">
          {activeTab === 'dashboard' && <UserDashboard tags={tags} messages={messages} setActiveTab={setActiveTab} user={user} profileData={profileData} />}
          {activeTab === 'analytics' && <QRAnalytics />}

          {activeTab === 'tags' && (
            <>
              <div className="header-actions">
                <div><h1>My Privacy Tags</h1><p>Manage your secure QR codes seamlessly.</p></div>
                {(() => {
                  const limit = user?.isPremium ? 10 : 1;
                  const isLimitReached = tags.length >= limit;
                  return (
                    <div className="header-actions-right">
                      <button 
                        className="primary-btn new-tag-btn" 
                        onClick={handleCreateTag} 
                        disabled={isLimitReached}
                        style={{ cursor: isLimitReached ? 'not-allowed' : 'pointer', opacity: isLimitReached ? 0.6 : 1 }}
                      >
                        <Plus size={20} /> Create New Tag
                      </button>
                      {isLimitReached && (
                        <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold' }}>
                          Limit reached ({tags.length}/{limit} tags). Upgrade to create more.
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="tags-grid">
                {tags.map(tag => (
                  <div key={tag.id} className="tag-card" style={{ opacity: tag.isActive ? 1 : 0.6 }}>
                    <div className="tag-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className={`status-dot ${tag.status}`}></div>
                            <span className="status-text">{tag.status}</span>
                        </div>
                        <div className="tag-header-actions" style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEditTag(tag)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '12px', textDecoration: 'underline' }}>Edit Name</button>
                            <button onClick={() => handleToggleTagStatus(tag)} style={{ background: tag.isActive ? '#fef2f2' : '#ecfdf5', color: tag.isActive ? '#ef4444' : '#10b981', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                {tag.isActive ? 'Pause' : 'Activate'}
                            </button>
                        </div>
                    </div>
                    <h3>{tag.name}</h3>
                    <div className="qr-preview"><img src={tag.qrCodeDataUrl} alt="QR Code" style={{ width: '120px', height: '120px', opacity: tag.isActive ? 1 : 0.2 }} /><div className="tag-id">{tag.tagId}</div></div>
                    {!tag.isActive && <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '12px', fontWeight: 'bold', marginTop: '-10px', marginBottom: '10px' }}>QR Code Inactive</div>}
                    <div className="tag-footer"><span className="scans-count"><Eye size={16} /> 0 Scans</span>
                      <div className="tag-footer-buttons" style={{ display: 'flex', gap: '8px' }}>
                        <button className="secondary-btn" onClick={() => setDownloadingTag(tag)}>Download QR</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'inbox' && (
            <>
              <div className="header-actions"><div><h1>Secure Inbox</h1><p>Read anonymous and system messages.</p></div></div>
              <ChatInterface messages={messages} user={user} fetchTagsAndMessages={fetchTagsAndMessages} />
            </>
          )}

          {activeTab === 'profile' && (
            <>
              <div className="header-actions"><div><h1>Profile</h1><p>Manage your account details.</p></div></div>
              <div className="profile-container" style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '12px' }}>
                    <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '32px' }}>{user?.name?.charAt(0).toUpperCase()}</div>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a' }}>{profileData.name} {profileData.lastName}</h2>
                        <span style={{ display: 'inline-flex', alignItems: 'center', background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', marginTop: '8px' }}><Shield size={14} style={{ marginRight: '6px'}}/> Premium Member</span>
                    </div>
                </div>
                
                <div className="profile-grid-2">
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>First Name</label>
                        <input type="text" value={profileData.name || ''} onChange={e => setProfileData({...profileData, name: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Last Name</label>
                        <input type="text" value={profileData.lastName || ''} onChange={e => setProfileData({...profileData, lastName: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                </div>

                <div className="profile-grid-2">
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Email Address</label>
                        <input type="email" value={profileData.email || ''} onChange={e => setProfileData({...profileData, email: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Contact Number</label>
                        <input type="text" value={profileData.phone || ''} onChange={e => setProfileData({...profileData, phone: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Address</label>
                    <input type="text" value={profileData.address || ''} onChange={e => setProfileData({...profileData, address: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>

                <div className="profile-grid-3">
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>City</label>
                        <input type="text" value={profileData.city || ''} onChange={e => setProfileData({...profileData, city: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>State</label>
                        <input type="text" value={profileData.state || ''} onChange={e => setProfileData({...profileData, state: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 'bold' }}>Pincode</label>
                        <input type="text" value={profileData.pincode || ''} onChange={e => setProfileData({...profileData, pincode: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button onClick={handleSaveProfile} disabled={isSaving} className="primary-btn" style={{ minWidth: '150px', justifyContent: 'center' }}>
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <div className="header-actions"><div><h1>Settings</h1><p>Preferences & Integrations</p></div></div>
              <div className="settings-container" style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ marginBottom: '20px', color: '#0f172a' }}>App Preferences</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '8px' }}><Bell color="#4f46e5" size={20} /></div>
                                <strong>Push Notifications</strong>
                            </div>
                            <input type="checkbox" defaultChecked />
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ marginBottom: '20px', color: '#0f172a' }}>Subscription Plans</h3>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>
                            Your active subscription plan determines your tag limits and available features.
                            Subscriptions are managed exclusively by NotifyMe Support. 
                            Please go to the <strong>Subscriptions</strong> tab to view your current benefits.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ marginBottom: '20px', color: '#0f172a' }}>Contact Us</h3>
                        <div style={{ marginBottom: '16px', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>
                            For support or inquiries, please use the secure in-app messaging system below to prevent misuse.
                            <br /><br />
                            <strong>Direct Support Email:</strong> support@notifyme.com<br />
                            <strong>Direct Support Phone:</strong> +1 (555) 000-0000
                        </div>
                        <textarea placeholder="Type your message to NotifyMe Support here..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px', marginBottom: '12px', resize: 'vertical' }}></textarea>
                        <button className="primary-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => alert('Message sent securely to the official NotifyMe account!')}>Send Message</button>
                    </div>


                </div>

              </div>
            </>
          )}

          {activeTab === 'scan_history' && <ScanHistory />}
          {activeTab === 'subscriptions' && <Subscriptions profileData={profileData} />}
          {activeTab === 'privacy' && <PrivacySecurity mode="privacy" />}
          {activeTab === 'security' && <PrivacySecurity mode="security" />}
          {activeTab === 'support' && <SupportCenter />} 
          {activeTab === 'about_us' && <AboutUs />}

          {/* Placeholders for remaining modules */}
          {['notifications', 'family'].includes(activeTab) && (
              <div style={{ background: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginTop: '24px' }}>
                  <Lock size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
                  <h2 style={{ color: '#0f172a', marginBottom: '8px', textTransform: 'capitalize' }}>{activeTab.replace('_', ' ')} Module</h2>
                  <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>This premium enterprise feature is currently being provisioned for your account. Please check back later.</p>
              </div>
          )}

        </div>
      </main>

      {/* Incoming Call Overlay */}
      {incomingCall && !callAccepted && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.2s' }}>
            <div style={{ background: 'white', padding: '48px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxWidth: '400px', width: '100%', animation: 'slideUp 0.3s' }}>
                <div style={{ background: '#ef4444', color: 'white', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'pulse 1s infinite' }}>
                    <Phone size={40} />
                </div>
                <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '32px' }}>Incoming Secure Call</p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button onClick={rejectCall} style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '16px 32px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', flex: 1, fontSize: '16px' }}>Reject</button>
                    <button onClick={acceptCall} style={{ background: '#10b981', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', flex: 1, fontSize: '16px', boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)' }}>Answer</button>
                </div>
            </div>
        </div>
      )}

      {/* Active Call Overlay */}
      {callAccepted && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.2s' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <div style={{ background: '#10b981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={40} color="white" />
                    </div>
                </div>
                <h2 style={{ color: 'white', fontSize: '32px', margin: '0 0 8px' }}>Active Call</h2>
                <p style={{ color: '#94a3b8', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }}></div> Secure Connection</p>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
                <button onClick={toggleMute} style={{ background: isMuted ? '#f59e0b' : 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    {isMuted ? 'Muted' : 'Mute'}
                </button>
                <button onClick={toggleCamera} style={{ background: isCameraOn ? '#4f46e5' : 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    {isCameraOn ? 'Cam On' : 'Cam Off'}
                </button>
                <button onClick={toggleSpeaker} style={{ background: isSpeaker ? '#10b981' : 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                    {isSpeaker ? 'Speaker On' : 'Speaker Off'}
                </button>
                <button onClick={endCall} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '20px 40px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', boxShadow: '0 10px 15px -3px rgba(239,68,68,0.3)' }}><PhoneOff size={24} /> End Call</button>
            </div>
        </div>
      )}
      
      <audio ref={callerAudio} />

      {downloadingTag && (
        <QRDownloadModal 
          tag={downloadingTag} 
          onClose={() => setDownloadingTag(null)} 
        />
      )}

      {/* AI Assistant Chatbot */}
      <FloatingAssistant onNavigate={setActiveTab} />
    </div>
  );
}

export default App;




