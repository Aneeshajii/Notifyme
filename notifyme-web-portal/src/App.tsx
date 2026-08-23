import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer/simplepeer.min.js';
import { Shield, Plus, Settings, Info, LogOut, QrCode, Search, User, Eye, Inbox, Phone, PhoneOff, CreditCard, Bell, Smartphone, Activity, Car, Home, Briefcase, FileText, Lock, Users, Download, HelpCircle, MapPin, TriangleAlert, ShieldAlert, FileSpreadsheet, List, Menu, X, Zap, Globe, Smile, Key, MessageCircle, Mail } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import ChatInterface from './components/ChatInterface';
import QRDownloadModal from './components/QRDownloadModal';
import LoadingScreen from './components/LoadingScreen';
import FloatingAssistant from './components/FloatingAssistant';
import OnboardingFlow from './components/OnboardingFlow';
import { useGoogleLogin } from '@react-oauth/google';
import { socket } from './socket';
import './index.css';

const UserDashboard = lazy(() => import('./components/UserDashboard'));
const QRAnalytics = lazy(() => import('./components/QRAnalytics'));
const SpecializedModes = lazy(() => import('./components/SpecializedModes'));
const PrivacySecurity = lazy(() => import('./components/PrivacySecurity'));
const Subscriptions = lazy(() => import('./components/Subscriptions'));
const ScanHistory = lazy(() => import('./components/ScanHistory'));
const SupportCenter = lazy(() => import('./components/SupportCenter'));
const AboutUs = lazy(() => import('./components/AboutUs'));
import PublicHomepage from './components/PublicHomepage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  isOnboarded?: boolean;
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

// Setup Axios Interceptor for seamless token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Prevent infinite loop if the refresh token endpoint itself fails with 401
    if (originalRequest.url.includes('/auth/refresh')) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
      return Promise.reject(error);
    }
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
          if (res.data.accessToken) {
            localStorage.setItem('userToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, forcefully logout
        localStorage.removeItem('userToken');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [tags, setTags] = useState<TagType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [activeTabState, setActiveTabState] = useState<'dashboard'|'tags'|'analytics'|'inbox'|'notifications'|'scan_history'|'vehicle'|'home'|'emergency'|'business'|'subscriptions'|'privacy'|'security'|'family'|'about_us'|'support'|'profile'|'settings'>('dashboard');
  
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as any;
    if (hash) {
      setActiveTabState(hash);
    }
  }, []);

  // Profile Form State
  const [profileData, setProfileData] = useState<Partial<UserType>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!isCheckingSession && !isAuthenticated) {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'tags', 'inbox', 'profile', 'subscriptions', 'analytics', 'notifications', 'scan_history', 'family', 'settings'].includes(hash)) {
        setPendingAction(hash);
        setShowLoginModal(true);
      }
    }
  }, [isCheckingSession, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && pendingAction) {
      setActiveTabState(pendingAction as any);
      window.location.hash = pendingAction;
      setPendingAction(null);
      setShowLoginModal(false);
    }
  }, [isAuthenticated, pendingAction]);

  const activeTab = profileData?.requiresPhoneVerification ? 'subscriptions' : activeTabState;
  
  const handleProtectedAction = (action: string) => {
    setPendingAction(action);
    setShowLoginModal(true);
  };

  const setActiveTab = (tab: any) => {
    if (profileData?.requiresPhoneVerification) return;
    
    const protectedTabs = ['dashboard', 'tags', 'inbox', 'profile', 'subscriptions', 'analytics', 'notifications', 'scan_history', 'family'];
    if (!isAuthenticated && protectedTabs.includes(tab)) {
       handleProtectedAction(tab);
       return;
    }

    window.location.hash = tab;
    setActiveTabState(tab);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [downloadingTag, setDownloadingTag] = useState<any>(null);
  const [isChatActive, setIsChatActive] = useState(false);
  
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

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

  useEffect(() => {
    if (user) {
      socket.emit('join-owner-room', user.id);
      
      // Register Service Worker for Push Notifications
      if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
          navigator.serviceWorker.register('/sw.js').then(async (registration) => {
              try {
                  // Only attempt to subscribe if permission is granted or default (not denied)
                  let permission = Notification.permission;
                  if (permission === 'default') {
                      permission = await Notification.requestPermission();
                  }

                  if (permission === 'granted') {
                      const vapidRes = await axios.get(`${API_BASE}/push/vapid-public-key`);
                      const publicKey = vapidRes.data.publicKey;
                      
                      const subscription = await registration.pushManager.subscribe({
                          userVisibleOnly: true,
                          applicationServerKey: urlBase64ToUint8Array(publicKey)
                      });
                      await axios.post(`${API_BASE}/push/subscribe`, { subscription });
                  } else {
                      // console.warn('Push notification permission was denied or ignored by the user.');
                  }
              } catch (err) {
                  console.error('Failed to subscribe to push notifications:', err);
              }
          });
      }

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

      const handleNewMessage = (msg: any) => {
          setMessages(prev => {
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg];
          });
      };

      socket.on('account-updated', handleAccountUpdated);
      socket.on(`user-${user.id}-new-message`, handleNewMessage);

      return () => {
          socket.off('account-updated', handleAccountUpdated);
          socket.off(`user-${user.id}-new-message`, handleNewMessage);
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

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'incoming-call-action') {
          const { action, data } = event.data;
          setIncomingCall({ signal: data.signal, callerId: data.callerId, tagId: data.tagId });
          // If action was 'decline', we can reject immediately
          // If 'answer', we show the UI and let the user click accept (due to browser autoplay policies)
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSwMessage);

    return () => {
      socket.off('incoming-call');
      navigator.serviceWorker?.removeEventListener('message', handleSwMessage);
    };
  }, []);

  // Ringtone Effect
  useEffect(() => {
      let ringAudio: HTMLAudioElement;
      if (incomingCall && !callAccepted) {
          ringAudio = new Audio('https://www.soundjay.com/phone/sounds/phone-calling-1.mp3');
          ringAudio.loop = true;
          ringAudio.play().catch(e => console.log('Audio autoplay blocked by browser', e));
      }
      return () => {
          if (ringAudio) {
              ringAudio.pause();
              ringAudio.currentTime = 0;
          }
      };
  }, [incomingCall, callAccepted]);

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
                localStorage.removeItem('refreshToken');
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
            localStorage.removeItem('refreshToken');
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
          if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
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
        if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
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
        if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
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
      return <LoadingScreen />;
  }

  if (isAuthenticated && user && (!user.tags || user.tags.length === 0)) {
    return <OnboardingFlow user={user} onComplete={setUser} />;
  }

  return (
    <div className="dashboard-container fade-in">
      <audio ref={callerAudio} />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="brand">
          <Shield size={28} />
          <span>NotifyMe</span>
        </div>
        <nav className="nav-menu" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 140px)', paddingRight: '8px' }}>
          
          <div style={{ marginBottom: '16px' }}>
            <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); window.location.hash = ''; }}><Home size={20} /> Home</button>
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}><Activity size={20} /> Dashboard</button>
            <button className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`} onClick={() => { setActiveTab('tags'); setMobileMenuOpen(false); }}><QrCode size={20} /> My Tags</button>
            <button className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => { setActiveTab('inbox'); setMobileMenuOpen(false); }}><Inbox size={20} /> Call/Msg {messages.length > 0 && <span className="badge-count">{messages.length}</span>}</button>
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
                <button className={`nav-item ${activeTab === 'family' ? 'active' : ''}`} onClick={() => { setActiveTab('family'); setMobileMenuOpen(false); }}><Users size={20} /> Family Sharing</button>
              </>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <button className={`nav-item ${activeTab === 'about_us' ? 'active' : ''}`} onClick={() => { setActiveTab('about_us'); setMobileMenuOpen(false); }}><Info size={20} /> About Us</button>
            <button className={`nav-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => { setActiveTab('support'); setMobileMenuOpen(false); }}><HelpCircle size={20} /> Support Center</button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}><Phone size={20} /> Contact Us</button>
          </div>
        </nav>

        <div className="sidebar-bottom">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} /> Sign Out
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="logout-btn" style={{ color: '#4f46e5' }}>
              <LogOut size={18} style={{ transform: 'rotate(180deg)' }} /> Sign In
            </button>
          )}
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
        </header>

        <div className="content-area">
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading content...</div>}>
          {activeTab === 'home' && <PublicHomepage handleProtectedAction={handleProtectedAction} />}
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
              <ChatInterface messages={messages} setMessages={setMessages} user={user} fetchTagsAndMessages={fetchTagsAndMessages} onChatStateChange={setIsChatActive} />
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
              <style>
                {`
                .contact-page-wrapper {
                    padding: 0 0 40px 0;
                }
                .contact-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                @media (max-width: 768px) {
                    .contact-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                        padding: 0;
                    }
                    .contact-card {
                        padding: 24px 16px;
                    }
                }
                .contact-card {
                    background: white;
                    padding: 40px 32px;
                    border-radius: 20px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    height: 100%;
                }
                .photo-placeholder {
                    width: 140px;
                    height: 140px;
                    border-radius: 50%;
                    background: #f8fafc;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    border: 3px solid #e2e8f0;
                    color: #94a3b8;
                    font-size: 14px;
                    font-weight: 500;
                    overflow: hidden;
                }
                .contact-link {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 18px 24px;
                    background: #f8fafc;
                    border-radius: 16px;
                    color: #0f172a;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 16px;
                    transition: all 0.2s;
                    width: 100%;
                    justify-content: center;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 16px;
                }
                .contact-link:hover {
                    background: #e0e7ff;
                    border-color: #c7d2fe;
                    color: #4f46e5;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
                }
                .contact-link.whatsapp:hover {
                    background: #dcfce7;
                    border-color: #86efac;
                    color: #166534;
                    box-shadow: 0 4px 12px rgba(22, 101, 52, 0.1);
                }
                .partner-area {
                    margin-top: auto;
                    padding-top: 32px;
                    border-top: 1px dashed #e2e8f0;
                    width: 100%;
                }
                .partner-placeholder {
                    background: #f8fafc;
                    border: 2px dashed #cbd5e1;
                    border-radius: 12px;
                    padding: 32px;
                    color: #94a3b8;
                    font-size: 14px;
                    margin-top: 16px;
                }
                `}
              </style>
              <div className="header-actions" style={{ marginBottom: '32px' }}>
                <div>
                  <h1>Contact Us</h1>
                  <p>Get in touch with the NotifyMe team</p>
                </div>
              </div>
              
              <div className="contact-page-wrapper">
                <div className="contact-grid">
                  
                  {/* Left Side: Owner Profile */}
                  <div className="contact-card">
                    <h2 style={{ color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', fontWeight: 'bold' }}>Owner</h2>
                    <div className="photo-placeholder">
                      Photo Area
                    </div>
                    <h3 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 24px 0', fontWeight: 'bold' }}>Aneesh . A</h3>
                    
                    <div className="partner-area">
                      <h4 style={{ color: '#64748b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>Partners</h4>
                      <div className="partner-placeholder">
                        Partner Photos / Logos Area
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Contact Methods */}
                  <div className="contact-card" style={{ justifyContent: 'center' }}>
                    <h2 style={{ color: '#0f172a', fontSize: '24px', marginBottom: '40px', fontWeight: 'bold' }}>Contact Us</h2>
                    
                    <a href="https://wa.me/916238774181" target="_blank" rel="noopener noreferrer" className="contact-link whatsapp">
                      <Phone size={22} />
                      +91 6238774181
                    </a>
                    
                    <a href="mailto:notifymeowner@gmail.com" className="contact-link">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      notifymeowner@gmail.com
                    </a>
                  </div>

                </div>
              </div>
            </>
          )}

          {activeTab === 'scan_history' && <ScanHistory />}
          {activeTab === 'subscriptions' && (
              <Subscriptions 
                  profileData={profileData} 
                  onSubscriptionUpdate={() => {
                      setProfileData(prev => ({...prev, requiresPhoneVerification: false}));
                      setUser(prev => prev ? ({...prev, requiresPhoneVerification: false} as any) : null);
                  }}
              />
          )}
          {activeTab === 'privacy' && <PrivacySecurity mode="privacy" />}
          {activeTab === 'security' && <PrivacySecurity mode="security" />}
          {activeTab === 'support' && <SupportCenter user={user} />}
          {activeTab === 'about_us' && <AboutUs />}
          </Suspense>

          {/* Placeholders for remaining modules */}
          {['notifications', 'family'].includes(activeTab) && (
              <div style={{ background: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginTop: '24px' }}>
                  <Lock size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
                  <h2 style={{ color: '#0f172a', marginBottom: '8px', textTransform: 'capitalize' }}>{activeTab.replace('_', ' ')} Module</h2>
                  <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Coming soon. We’re working on this feature.</p>
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

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', overflowY: 'auto' }}>
          <div className="login-card fade-in" style={{ background: 'white', padding: '32px 24px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)', maxWidth: '400px', width: '100%', textAlign: 'center', position: 'relative', margin: 'auto' }}>
            <button onClick={() => { 
                setShowLoginModal(false); 
                setPendingAction(null); 
                const protectedTabs = ['dashboard', 'tags', 'inbox', 'profile', 'subscriptions', 'analytics', 'notifications', 'scan_history', 'family'];
                if (!isAuthenticated && protectedTabs.includes(activeTabState)) {
                    setActiveTabState('home');
                    window.location.hash = '';
                }
            }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            
            <div className="brand login-brand" style={{ justifyContent: 'center', marginBottom: '16px' }}>
              <Shield size={32} color="#4f46e5" />
            </div>
            <h2 style={{ fontSize: '24px', color: '#0f172a', marginBottom: '8px' }}>Login to continue</h2>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>Please log in to use this feature and manage your NotifyMe account.</p>
            
            {authMode === 'login' ? (
              <>
                  <button type="button" onClick={() => handleGoogleLogin()} style={{ width: '100%', padding: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '24px', height: '24px' }} />
                      Continue with Google
                  </button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '16px 0', color: '#cbd5e1' }}>
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                      <span style={{ fontSize: '14px' }}>OR</span>
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                  </div>
  
                  <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input type="email" placeholder="Email Address" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                      <input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                      <button type="submit" style={{ padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
                  </form>
                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                      <span style={{ color: '#64748b' }}>Don't have an account? </span>
                      <button onClick={() => setAuthMode('register')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer' }}>Sign Up</button>
                  </div>
              </>
            ) : (
              <>
                  <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                      <input type="email" placeholder="Email Address" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                      <input type="password" placeholder="Password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }} />
                      <button type="submit" style={{ padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</button>
                  </form>
                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                      <span style={{ color: '#64748b' }}>Already have an account? </span>
                      <button onClick={() => setAuthMode('login')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
                  </div>
              </>
            )}

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button onClick={() => { 
                  setShowLoginModal(false); 
                  setPendingAction(null); 
                  const protectedTabs = ['dashboard', 'tags', 'inbox', 'profile', 'subscriptions', 'analytics', 'notifications', 'scan_history', 'family'];
                  if (!isAuthenticated && protectedTabs.includes(activeTabState)) {
                      setActiveTabState('home');
                      window.location.hash = '';
                  }
              }} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#0f172a'} onMouseOut={e=>e.currentTarget.style.color='#64748b'}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Chatbot */}
      {isAuthenticated && (
        <div style={{ display: (activeTab === 'inbox' && isChatActive) ? 'none' : 'block' }}>
            <FloatingAssistant onNavigate={setActiveTab} />
        </div>
      )}
    </div>
  );
}

export default App;




