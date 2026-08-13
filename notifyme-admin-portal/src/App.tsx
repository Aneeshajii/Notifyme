import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, ShieldAlert, Menu, X, Users, QrCode, Search, LogOut, Activity, DollarSign, Settings, ChevronLeft, MessageSquare, PieChart, Bell, LifeBuoy, AlertTriangle, Lock, FileText, Server, Download, PhoneCall, BarChart } from 'lucide-react';
import './index.css';

import AnalyticsTab from './components/AnalyticsTab';
import MonitoringTab from './components/MonitoringTab';
import SupportTab from './components/SupportTab';
import ReportsTab from './components/ReportsTab';
import SubscriptionsTab from './components/SubscriptionsTab';
import CommunicationsTab from './components/CommunicationsTab';
import GlobalSettings from './components/GlobalSettings';
import ChatViewer from './components/ChatViewer';
import SecurityAlertsTab from './components/SecurityAlertsTab';

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
  createdAt: string;
  _count?: any;
  isBlocked?: boolean;
  isPremium?: boolean;
  subscription?: any;
  premiumGrantType?: string;
  premiumExpiresAt?: string;
  role?: string;
  profilePicUrl?: string;
}

interface TagType {
  id: string;
  tagId: string;
  name: string;
  plateNumber?: string;
  status: string;
  ownerId: string;
  owner: UserType;
  placeholderMessage?: string;
  createdAt: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'tags' | 'communications' | 'subscriptions' | 'analytics' | 'notifications' | 'support' | 'abuse' | 'security' | 'content' | 'monitoring' | 'settings' | 'reports' | 'ai-alerts'>('dashboard');
  const [users, setUsers] = useState<UserType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth State
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [isCheckingSession, setIsCheckingSession] = useState(!!token);
  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [mfaTempToken, setMfaTempToken] = useState('');
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [error, setError] = useState('');

  // MFA Setup states
  const [mfaSetupQr, setMfaSetupQr] = useState('');
  const [mfaSetupSecret, setMfaSetupSecret] = useState('');
  const [mfaSetupToken, setMfaSetupToken] = useState('');

  // Security State
  const [sessions, setSessions] = useState<any[]>([]);
  
  // Detailed User View State
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedUserMessages, setSelectedUserMessages] = useState<any[]>([]);
  const [selectedUserAuditLogs, setSelectedUserAuditLogs] = useState<any[]>([]);
  const [auditLogCategoryFilter, setAuditLogCategoryFilter] = useState<string>('All Activity');
  const [auditLogSearchQuery, setAuditLogSearchQuery] = useState<string>('');
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Advanced User Management State
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editedUser, setEditedUser] = useState<UserType | null>(null);
  
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  // New State for Master Admin Actions
  const [directMessageContent, setDirectMessageContent] = useState('');
  const [isBlockingUser, setIsBlockingUser] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [editingTagPlaceholder, setEditingTagPlaceholder] = useState<string | null>(null);
  const [tagPlaceholderText, setTagPlaceholderText] = useState('');
  const [grantPremiumType, setGrantPremiumType] = useState<string>('');
  const [grantPremiumExpiry, setGrantPremiumExpiry] = useState<string>('');

  const handleUserClick = async (user: UserType) => {
    setSelectedUser(user);
    setEditedUser(user);
    setIsEditingUser(false);
    setIsResettingPassword(false);
    setNewPassword('');
    setDirectMessageContent('');
    setIsBlockingUser(false);
    setBlockReason('');
    setEditingTagPlaceholder(null);
    setAuditLogCategoryFilter('All Activity');
    setAuditLogSearchQuery('');
    setLoadingDetails(true);

    try {
      const subRes = await axios.get(`${API_BASE}/subscriptions/admin/all`);
      setSubscriptions(Array.isArray(subRes.data) ? subRes.data : []);
    } catch (e) {
      console.error("Failed to refetch subscriptions:", e);
    }

    try {
      const [msgRes, auditRes] = await Promise.all([
          axios.get(`${API_BASE}/messages/user/${user.id}`),
          axios.get(`${API_BASE}/auth/users/${user.id}/audit-logs`)
      ]);
      setSelectedUserMessages(msgRes.data);
      setSelectedUserAuditLogs(auditRes.data);
    } catch (err) {
      console.error("Error fetching user details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    try {
      const newStatus = !selectedUser.isBlocked;
      await axios.post(`${API_BASE}/auth/users/${selectedUser.id}/block`, { 
          isBlocked: newStatus,
          reason: newStatus ? blockReason : '' 
      });
      setSelectedUser({...selectedUser, isBlocked: newStatus});
      setUsers(users.map(u => u.id === selectedUser.id ? {...u, isBlocked: newStatus} : u));
      setIsBlockingUser(false);
      setBlockReason('');
      alert(`User ${newStatus ? 'blocked' : 'unblocked'} successfully.`);
    } catch (err) {
      console.error(err);
      alert('Failed to update user block status');
    }
  };

  const handleTerminateUser = async () => {
    if (!selectedUser) return;
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
        try {
            await axios.delete(`${API_BASE}/auth/users/${selectedUser.id}/terminate`);
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setSelectedUser(null);
            alert('User successfully terminated.');
        } catch (err) {
            console.error(err);
            alert('Failed to terminate user.');
        }
    }
  };

  const handleSendDirectMessage = async () => {
    if (!selectedUser || !directMessageContent) return;
    try {
      await axios.post(`${API_BASE}/messages/admin/direct`, { userId: selectedUser.id, content: directMessageContent });
      setDirectMessageContent('');
      alert('Direct message sent to user!');
      // Refetch messages to show it
      handleUserClick(selectedUser);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleGrantPremium = async () => {
    if (!selectedUser) return;
    try {
        const selectedPlan = subscriptions.find(p => p.id === grantPremiumType);
        await axios.post(`${API_BASE}/auth/users/${selectedUser.id}/grant-premium`, { 
            subscriptionId: grantPremiumType,
            premiumExpiresAt: grantPremiumExpiry || null 
        });
        const updatedUser = { 
            ...selectedUser, 
            isPremium: true,
            subscriptionId: grantPremiumType, 
            premiumGrantType: selectedPlan ? selectedPlan.name : 'Custom',
            premiumExpiresAt: grantPremiumExpiry || undefined 
        };
        setSelectedUser(updatedUser);
        setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
        alert(`Successfully assigned subscription to user.`);
    } catch (err: any) {
        console.error(err);
        alert('Failed to assign subscription');
    }
  };

  const handleRevokePremium = async () => {
      if (!selectedUser) return;
      try {
          await axios.post(`${API_BASE}/auth/users/${selectedUser.id}/revoke-premium`);
          const updatedUser = { ...selectedUser, isPremium: false, subscriptionId: undefined, premiumGrantType: undefined, premiumExpiresAt: undefined };
          setSelectedUser(updatedUser);
          setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
          alert('Successfully revoked subscription.');
      } catch (err: any) {
          console.error(err);
          alert('Failed to revoke subscription');
      }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedUser || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('profilePic', file);
    
    try {
        const res = await axios.put(`${API_BASE}/auth/users/${selectedUser.id}/profile-pic`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSelectedUser(res.data.user);
        setEditedUser(res.data.user);
        setUsers(users.map(u => u.id === res.data.user.id ? res.data.user : u));
    } catch (err) {
        console.error(err);
        alert('Failed to upload profile picture.');
    }
  };

  const handleRemoveProfilePic = async () => {
    if (!selectedUser) return;
    if (window.confirm('Remove profile picture?')) {
        try {
            const res = await axios.delete(`${API_BASE}/auth/users/${selectedUser.id}/profile-pic`);
            setSelectedUser(res.data.user);
            setEditedUser(res.data.user);
            setUsers(users.map(u => u.id === res.data.user.id ? res.data.user : u));
        } catch (err) {
            console.error(err);
            alert('Failed to remove profile picture.');
        }
    }
  };

  const handleTagStatusUpdate = async (tagId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await axios.post(`${API_BASE}/tags/admin/${tagId}/status`, { status: newStatus });
      setTags(tags.map(t => t.tagId === tagId ? {...t, status: newStatus} : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
        try {
            await axios.delete(`${API_BASE}/tags/admin/${tagId}`);
            setTags(tags.filter(t => t.tagId !== tagId));
        } catch (err) {
            console.error(err);
        }
    }
  };

  const handleUpdatePlaceholder = async (tagId: string) => {
    try {
        await axios.post(`${API_BASE}/tags/admin/${tagId}/placeholder`, { placeholderMessage: tagPlaceholderText });
        setTags(tags.map(t => t.tagId === tagId ? {...t, placeholderMessage: tagPlaceholderText} : t));
        setEditingTagPlaceholder(null);
        alert('Placeholder message updated');
    } catch (err) {
        console.error(err);
        alert('Failed to update placeholder');
    }
  };

  useEffect(() => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [auditRes, tagRes, userRes, subRes, sessionsRes] = await Promise.all([
          axios.get(`${API_BASE}/auth/audit-logs`),
          axios.get(`${API_BASE}/tags/admin/all`),
          axios.get(`${API_BASE}/auth/users`),
          axios.get(`${API_BASE}/subscriptions`),
          axios.get(`${API_BASE}/auth/sessions`)
        ]);
        setAuditLogs(Array.isArray(auditRes.data) ? auditRes.data : []);
        setTags(Array.isArray(tagRes.data) ? tagRes.data : []);
        setUsers(Array.isArray(userRes.data) ? userRes.data : []);
        setSubscriptions(Array.isArray(subRes.data) ? subRes.data : []);
        setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
      } catch (error) {
        console.error("Error fetching admin data", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            handleLogout();
        }
      } finally {
        setLoading(false);
        setIsCheckingSession(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isMfaStep) {
          const res = await axios.post(`${API_BASE}/auth/login/verify-mfa`, { mfaTempToken, token: mfaToken });
          localStorage.setItem('adminToken', res.data.accessToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
          setIsAuthenticated(true);
          setToken(res.data.accessToken);
      } else {
          const res = await axios.post(`${API_BASE}/auth/login`, { email, password, role: 'MASTER_ADMIN' });
          if (res.data.mfaRequired) {
              setMfaTempToken(res.data.mfaTempToken);
              setIsMfaStep(true);
              return;
          }
          localStorage.setItem('adminToken', res.data.accessToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
          setIsAuthenticated(true);
          setToken(res.data.accessToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSetupMfa = async () => {
      try {
          const res = await axios.post(`${API_BASE}/auth/mfa/setup`);
          setMfaSetupQr(res.data.qrCodeDataUrl);
          setMfaSetupSecret(res.data.secret);
      } catch (err: any) {
          alert('Failed to initiate MFA setup.');
      }
  };

  const handleVerifyMfaSetup = async () => {
      try {
          await axios.post(`${API_BASE}/auth/mfa/verify-setup`, { token: mfaSetupToken });
          alert('MFA successfully enabled!');
          setMfaSetupQr('');
          setMfaSetupSecret('');
          setMfaSetupToken('');
      } catch (err: any) {
          alert('Invalid MFA token. Try again.');
      }
  };

  const handleRevokeSession = async (sessionId: string) => {
      try {
          await axios.delete(`${API_BASE}/auth/sessions/${sessionId}`);
          setSessions(sessions.filter(s => s.id !== sessionId));
      } catch (err: any) {
          alert('Failed to revoke session.');
      }
  };

  const handleRevokeAllSessions = async () => {
      try {
          await axios.delete(`${API_BASE}/auth/sessions/all`);
          setSessions([]);
          handleLogout(); // Since their own session might be revoked
      } catch (err: any) {
          alert('Failed to revoke all sessions.');
      }
  };

  const handleLogout = async () => {
      try {
          await axios.post(`${API_BASE}/auth/logout`);
      } catch (err) {
          console.error("Logout API failed", err);
      } finally {
          localStorage.removeItem('adminToken');
          setToken(null);
          setIsAuthenticated(false);
          setIsMfaStep(false);
          setIsCheckingSession(false);
      }
  };

  if (isCheckingSession) {
      return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f1f5f9' }}>
              <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                  <ShieldAlert size={64} color="#4f46e5" />
              </div>
              <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 'bold' }}>Verifying Admin Session...</p>
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .7; transform: scale(1.05); } }`}</style>
          </div>
      );
  }

  if (!token) {
      return (
          <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
              <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <ShieldAlert size={48} color="#4f46e5" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 8px', color: '#0f172a' }}>{isMfaStep ? 'Two-Factor Authentication' : 'Master Admin Portal'}</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>{isMfaStep ? 'Enter the 6-digit code from your authenticator app.' : 'Restricted access. Please sign in.'}</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isMfaStep ? (
                <>
                    <input 
                      type="email" 
                      placeholder="Admin Email" 
                      autoComplete="username"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                      required
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      autoComplete="current-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                      required
                    />
                </>
            ) : (
                <input 
                  type="text" 
                  placeholder="6-Digit Code" 
                  value={mfaToken}
                  onChange={e => setMfaToken(e.target.value)}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', textAlign: 'center', letterSpacing: '4px' }}
                  maxLength={6}
                  required
                />
            )}
            
            {error && <div style={{ color: '#ef4444', fontSize: '14px' }}>{error}</div>}
            
            <button type="submit" style={{ padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              {isMfaStep ? 'Verify Code' : 'Sign In'}
            </button>
          </form>

          {!isMfaStep && (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Or continue with</div>
                  <button style={{ padding: '10px', background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> Google
                  </button>
                  <button style={{ padding: '10px', background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.74 3.58-.8 1.58-.16 2.92.56 3.73 1.63-3.41 1.83-2.82 6.17.47 7.51-.7 1.66-1.57 3.05-2.86 3.83zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.31 2.45-1.92 4.31-3.74 4.25z"/></svg> Apple
                  </button>
              </div>
          )}
        </div>
          </div>
      );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{ background: '#0f172a' }}>
        <div className="brand" style={{ color: 'white' }}>
          <Shield size={28} color="#4f46e5" />
          <span>NotifyMe Admin</span>
        </div>
        <nav className="nav-menu" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'dashboard' ? '#4f46e5' : '#94a3b8' }}>
            <Activity size={20} /> Dashboard Overview
          </button>
          <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'users' ? '#4f46e5' : '#94a3b8' }}>
            <Users size={20} /> User Management
          </button>
          <button className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`} onClick={() => { setActiveTab('tags'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'tags' ? '#4f46e5' : '#94a3b8' }}>
            <QrCode size={20} /> QR Code Management
          </button>
          <button className={`nav-item ${activeTab === 'communications' ? 'active' : ''}`} onClick={() => { setActiveTab('communications'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'communications' ? '#4f46e5' : '#94a3b8' }}>
            <PhoneCall size={20} /> Communications
          </button>
          <button className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`} onClick={() => { setActiveTab('subscriptions'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'subscriptions' ? '#4f46e5' : '#94a3b8' }}>
            <DollarSign size={20} /> Subscriptions
          </button>
          <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'analytics' ? '#4f46e5' : '#94a3b8' }}>
            <BarChart size={20} /> Analytics & Reports
          </button>
          <button className={`nav-item ${activeTab === 'ai-alerts' ? 'active' : ''}`} onClick={() => { setActiveTab('ai-alerts'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'ai-alerts' ? '#4f46e5' : '#94a3b8' }}>
            <ShieldAlert size={20} /> Security Alerts
          </button>
          <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => { setActiveTab('security'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'security' ? '#4f46e5' : '#94a3b8' }}>
            <Shield size={20} /> Security Dashboard
          </button>
          <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => { setActiveTab('notifications'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'notifications' ? '#4f46e5' : '#94a3b8' }}>
            <Bell size={20} /> Notification Center
          </button>
          <button className={`nav-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => { setActiveTab('support'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'support' ? '#4f46e5' : '#94a3b8' }}>
            <LifeBuoy size={20} /> Support Tickets
          </button>
          <button className={`nav-item ${activeTab === 'abuse' ? 'active' : ''}`} onClick={() => { setActiveTab('abuse'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'abuse' ? '#4f46e5' : '#94a3b8' }}>
            <AlertTriangle size={20} /> Abuse & Spam
          </button>
          <button className={`nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => { setActiveTab('content'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'content' ? '#4f46e5' : '#94a3b8' }}>
            <FileText size={20} /> Content Management
          </button>
          <button className={`nav-item ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => { setActiveTab('monitoring'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'monitoring' ? '#4f46e5' : '#94a3b8' }}>
            <Server size={20} /> System Monitoring
          </button>
          <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'reports' ? '#4f46e5' : '#94a3b8' }}>
            <Download size={20} /> Reports
          </button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }} style={{ color: activeTab === 'settings' ? '#4f46e5' : '#94a3b8' }}>
            <Settings size={20} /> Platform Settings
          </button>
        </nav>
        <button onClick={handleLogout} className="nav-item logout" style={{ color: '#ef4444', marginTop: 'auto' }}>
          <LogOut size={20} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ background: '#f8fafc' }}>
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="search-bar">
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Search system..." style={{ background: 'transparent' }} />
          </div>
          <div className="user-profile">
            <span>Master Admin</span>
            <div className="avatar" style={{ background: '#4f46e5', color: 'white' }}>A</div>
          </div>
        </header>

        <div className="content-area">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading ecosystem data...</div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <>
                  <div className="header-actions">
                    <div><h1>System Overview</h1><p>Real-time ecosystem analytics.</p></div>
                  </div>
                  
                  <div className="stats-grid">
                      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <h3 style={{ color: '#64748b', margin: 0 }}>Total Users</h3>
                              <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '8px' }}><Users color="#4f46e5" size={20} /></div>
                          </div>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{users.length}</div>
                      </div>

                      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <h3 style={{ color: '#64748b', margin: 0 }}>Active QR Tags</h3>
                              <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '8px' }}><QrCode color="#10b981" size={20} /></div>
                          </div>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{tags.length}</div>
                      </div>

                      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <h3 style={{ color: '#64748b', margin: 0 }}>Premium Revenue</h3>
                              <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '8px' }}><DollarSign color="#d97706" size={20} /></div>
                          </div>
                          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>$0.00</div>
                      </div>
                  </div>
                </>
              )}

              {activeTab === 'users' && (
                <>
                  {!selectedUser ? (
                    <>
                      <div className="header-actions">
                        <div><h1>User Management</h1><p>View all registered users on the platform. Click a name for details.</p></div>
                      </div>
                      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '16px 24px', color: '#64748b' }}>Name</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b' }}>Email</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b' }}>Location</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b' }}>Contact</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b' }}>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#4f46e5', cursor: 'pointer' }} onClick={() => handleUserClick(user)}>
                                            {user.name} {user.lastName || ''}
                                        </td>
                                        <td style={{ padding: '16px 24px', color: '#475569' }}>{user.email}</td>
                                        <td style={{ padding: '16px 24px', color: '#475569' }}>{user.city || 'N/A'}{user.state ? `, ${user.state}` : ''}</td>
                                        <td style={{ padding: '16px 24px', color: '#475569' }}>{user.phone || 'N/A'}</td>
                                        <td style={{ padding: '16px 24px', color: '#475569' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="header-actions" style={{ marginBottom: '24px' }}>
                        <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', padding: 0 }}>
                            <ChevronLeft size={20} /> Back to Users
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                          {/* Left Column: Profile Card */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                              <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                      {selectedUser.profilePicUrl ? (
                                          <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px', backgroundImage: `url(http://localhost:5000${selectedUser.profilePicUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '2px solid #e2e8f0' }} />
                                      ) : (
                                          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px', fontWeight: 'bold' }}>
                                              {selectedUser.name?.charAt(0).toUpperCase()}
                                          </div>
                                      )}
                                      
                                      {!isEditingUser ? (
                                        <>
                                          <h2 style={{ margin: 0, color: '#0f172a' }}>{selectedUser.name} {selectedUser.lastName || ''}</h2>
                                          <p style={{ color: '#64748b', margin: '4px 0 12px' }}>{selectedUser.email}</p>
                                          
                                          {selectedUser.isPremium ? (
                                              <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                                  <span style={{ color: '#d97706', fontSize: '12px', fontWeight: 'bold' }}>
                                                      Premium Member ({selectedUser.premiumGrantType || 'Paid'})
                                                  </span>
                                                  {selectedUser.premiumExpiresAt && (
                                                      <span style={{ color: '#b45309', fontSize: '11px' }}>
                                                          Expires: {new Date(selectedUser.premiumExpiresAt).toLocaleDateString()}
                                                      </span>
                                                  )}
                                                  {selectedUser.isPremium && (
                                                      <button onClick={handleRevokePremium} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' }}>
                                                          Revoke Subscription
                                                      </button>
                                                  )}
                                              </div>
                                          ) : (
                                              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                                                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}>Assign Subscription:</div>
                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                      <div style={{ display: 'flex', gap: '8px' }}>
                                                          <select value={grantPremiumType} onChange={e => setGrantPremiumType(e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1, fontSize: '12px' }}>
                                                              <option value="">-- Select Subscription Plan --</option>
                                                              {subscriptions.map(plan => (
                                                                  <option key={plan.id} value={plan.id}>{plan.name} ({plan.maxQrCodes} Tags)</option>
                                                              ))}
                                                          </select>
                                                      </div>
                                                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                          <span style={{ fontSize: '11px', color: '#64748b' }}>Expires:</span>
                                                          <input type="date" value={grantPremiumExpiry} onChange={e => setGrantPremiumExpiry(e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1, fontSize: '12px' }} />
                                                      </div>
                                                      <button onClick={handleGrantPremium} disabled={!grantPremiumType} style={{ background: grantPremiumType ? '#4f46e5' : '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: grantPremiumType ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>Assign Subscription</button>
                                                  </div>
                                              </div>
                                          )}

                                          <button onClick={() => setIsEditingUser(true)} style={{ display: 'block', width: '100%', padding: '10px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                              Edit Details
                                          </button>
                                        </>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                                                <input type="file" accept="image/*" onChange={handleProfilePicUpload} style={{ fontSize: '12px', flex: 1 }} />
                                                {selectedUser.profilePicUrl && (
                                                    <button onClick={handleRemoveProfilePic} style={{ padding: '6px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Remove Pic</button>
                                                )}
                                            </div>
                                            <input type="text" value={editedUser?.name || ''} onChange={(e) => setEditedUser({...editedUser!, name: e.target.value})} placeholder="First Name" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                            <input type="text" value={editedUser?.lastName || ''} onChange={(e) => setEditedUser({...editedUser!, lastName: e.target.value})} placeholder="Last Name" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                            <input type="email" value={editedUser?.email || ''} onChange={(e) => setEditedUser({...editedUser!, email: e.target.value})} placeholder="Email Address" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => { setIsEditingUser(false); setSelectedUser(editedUser); alert('Details updated in admin panel!'); }} style={{ flex: 1, padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                                                <button onClick={() => { setIsEditingUser(false); setEditedUser(selectedUser); }} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                            </div>
                                        </div>
                                      )}
                                  </div>
                                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                                      <h4 style={{ color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Contact Details</h4>
                                      
                                      {!isEditingUser ? (
                                          <>
                                              <div style={{ marginBottom: '12px' }}><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</div>
                                              <div style={{ marginBottom: '12px' }}><strong>Address:</strong> {selectedUser.address || 'N/A'}</div>
                                              <div style={{ marginBottom: '12px' }}><strong>Location:</strong> {selectedUser.city || 'N/A'}, {selectedUser.state || 'N/A'} - {selectedUser.pincode || 'N/A'}</div>
                                          </>
                                      ) : (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                              <input type="text" value={editedUser?.phone || ''} onChange={(e) => setEditedUser({...editedUser!, phone: e.target.value})} placeholder="Phone Number" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                              <input type="text" value={editedUser?.address || ''} onChange={(e) => setEditedUser({...editedUser!, address: e.target.value})} placeholder="Address" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                              <input type="text" value={editedUser?.city || ''} onChange={(e) => setEditedUser({...editedUser!, city: e.target.value})} placeholder="City" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                              <input type="text" value={editedUser?.state || ''} onChange={(e) => setEditedUser({...editedUser!, state: e.target.value})} placeholder="State" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                              <input type="text" value={editedUser?.pincode || ''} onChange={(e) => setEditedUser({...editedUser!, pincode: e.target.value})} placeholder="Pincode" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                                          </div>
                                      )}
                                      
                                      <div style={{ marginTop: '12px' }}><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <strong>Account Status:</strong> 
                                          <span style={{ 
                                              padding: '2px 8px', 
                                              borderRadius: '12px', 
                                              fontSize: '12px', 
                                              fontWeight: 'bold',
                                              background: selectedUser.isBlocked ? '#fef2f2' : '#ecfdf5',
                                              color: selectedUser.isBlocked ? '#ef4444' : '#10b981' 
                                          }}>
                                              {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                                          </span>
                                      </div>
                                  </div>
                              </div>

                              {/* Administration Actions Card */}
                              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                  <h4 style={{ color: '#0f172a', margin: '0 0 16px' }}>Administration Actions</h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                      
                                      {!isResettingPassword ? (
                                        <button onClick={() => setIsResettingPassword(true)} style={{ padding: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Reset Password Directly</button>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Set New Password</label>
                                            <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                <button onClick={() => { alert(`Password directly changed to: ${newPassword}`); setIsResettingPassword(false); setNewPassword(''); }} style={{ flex: 1, padding: '8px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Save Password</button>
                                                <button onClick={() => { setIsResettingPassword(false); setNewPassword(''); }} style={{ flex: 1, padding: '8px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Cancel</button>
                                            </div>
                                        </div>
                                      )}

                                      <button onClick={() => {
                                          if (selectedUser.isBlocked) {
                                              handleBlockUser(); // Unblock immediately
                                          } else {
                                              setIsBlockingUser(true); // Open block modal
                                          }
                                      }} style={{ padding: '12px', background: selectedUser.isBlocked ? '#ecfdf5' : '#fef3c7', color: selectedUser.isBlocked ? '#10b981' : '#d97706', border: `1px solid ${selectedUser.isBlocked ? '#a7f3d0' : '#fde68a'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{selectedUser.isBlocked ? 'Unblock User' : 'Block User'}</button>
                                      
                                      <button onClick={handleTerminateUser} style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Terminate User</button>
                                  </div>
                              </div>

                              {/* Direct Messaging Card */}
                              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                  <h4 style={{ color: '#0f172a', margin: '0 0 16px' }}>Direct Communication</h4>
                                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Send a direct message to the user's app inbox.</p>
                                  <textarea value={directMessageContent} onChange={(e) => setDirectMessageContent(e.target.value)} placeholder="Type message to user..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px', marginBottom: '12px', resize: 'vertical' }}></textarea>
                                  <button onClick={handleSendDirectMessage} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Send Message</button>
                              </div>
                          </div>

                          {/* Right Column: Tags & Activity */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <QrCode size={20} color="#4f46e5"/> QR Code Management
                                        </h3>
                                        <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '100px', color: '#475569', fontWeight: 'bold' }}>
                                            Limit: {tags.filter(t => t.ownerId === selectedUser.id).length} / {selectedUser.subscription?.maxQrCodes || 1} Used
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        {tags.filter(t => t.ownerId === selectedUser.id).map(tag => (
                                            <div key={tag.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <strong style={{ color: '#0f172a' }}>{tag.name}</strong>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '12px', background: tag.status === 'active' ? '#ecfdf5' : (tag.status === 'paused' ? '#fef3c7' : '#fef2f2'), color: tag.status === 'active' ? '#10b981' : (tag.status === 'paused' ? '#d97706' : '#ef4444'), padding: '2px 8px', borderRadius: '100px', fontWeight: 'bold' }}>{tag.status}</span>
                                                        <button onClick={() => handleTagStatusUpdate(tag.tagId, tag.status)} style={{ padding: '2px 8px', background: tag.status === 'active' ? '#fef3c7' : '#ecfdf5', color: tag.status === 'active' ? '#d97706' : '#10b981', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>{tag.status === 'active' ? 'Pause' : 'Resume'}</button>
                                                        <button onClick={() => handleDeleteTag(tag.tagId)} style={{ padding: '2px 8px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Del</button>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Tag ID: <strong style={{color:'#4f46e5'}}>{tag.tagId}</strong></span>
                                                    <span style={{ fontSize: '12px' }}>Scans: <strong>{tag._count?.scans || 0}</strong></span>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                    Created: {new Date(tag.createdAt).toLocaleDateString()}
                                                </div>
                                                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                                                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                                      <span>Scanner Placeholder:</span>
                                                      {!editingTagPlaceholder || editingTagPlaceholder !== tag.tagId ? (
                                                          <button onClick={() => { setEditingTagPlaceholder(tag.tagId); setTagPlaceholderText(tag.placeholderMessage || ''); }} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Edit</button>
                                                      ) : null}
                                                  </div>
                                                  {editingTagPlaceholder === tag.tagId ? (
                                                      <div style={{ display: 'flex', gap: '4px' }}>
                                                          <input type="text" value={tagPlaceholderText} onChange={e => setTagPlaceholderText(e.target.value)} placeholder="Message for scanners..." style={{ flex: 1, padding: '4px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                                                          <button onClick={() => handleUpdatePlaceholder(tag.tagId)} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', padding: '0 8px', cursor: 'pointer' }}>Save</button>
                                                      </div>
                                                  ) : (
                                                      <div style={{ fontSize: '12px', color: '#0f172a', fontStyle: tag.placeholderMessage ? 'normal' : 'italic' }}>{tag.placeholderMessage || "No message set"}</div>
                                                  )}
                                              </div>
                                          </div>
                                      ))}
                                      {tags.filter(t => t.ownerId === selectedUser.id).length === 0 && <p style={{ color: '#94a3b8' }}>No active tags found.</p>}
                                  </div>
                              </div>

                              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ margin: '0 0 20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={20} color="#4f46e5"/> Recent Inbox Messages</h3>
                                    {loadingDetails ? (
                                        <p style={{ color: '#94a3b8' }}>Loading messages...</p>
                                    ) : (
                                        <ChatViewer messages={selectedUserMessages} user={selectedUser} />
                                    )}
                                </div>

                                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                      <h3 style={{ margin: '0 0 20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldAlert size={20} color="#4f46e5"/> Audit Logs</h3>
                                      
                                      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                          <select 
                                            value={auditLogCategoryFilter} 
                                            onChange={(e) => setAuditLogCategoryFilter(e.target.value)}
                                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', flex: 1 }}
                                          >
                                              <option>All Activity</option>
                                              <option>Authentication</option>
                                              <option>Profile</option>
                                              <option>QR Codes</option>
                                              <option>Subscription</option>
                                              <option>Security</option>
                                              <option>Support</option>
                                          </select>
                                          <div style={{ position: 'relative', flex: 2 }}>
                                              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                              <input 
                                                type="text" 
                                                value={auditLogSearchQuery} 
                                                onChange={(e) => setAuditLogSearchQuery(e.target.value)}
                                                placeholder="Search activity..." 
                                                style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                              />
                                          </div>
                                      </div>

                                      {(() => {
                                          const filteredLogs = selectedUserAuditLogs.filter(log => {
                                              const actionLower = log.action.toLowerCase();
                                              const detailsLower = (log.details || '').toLowerCase();
                                              const matchesSearch = actionLower.includes(auditLogSearchQuery.toLowerCase()) || detailsLower.includes(auditLogSearchQuery.toLowerCase());
                                              if (!matchesSearch) return false;
                                              
                                              switch(auditLogCategoryFilter) {
                                                  case 'Authentication': return actionLower.includes('login') || actionLower.includes('logout') || actionLower.includes('account');
                                                  case 'Profile': return actionLower.includes('profile');
                                                  case 'QR Codes': return actionLower.includes('qr_');
                                                  case 'Subscription': return actionLower.includes('subscrib');
                                                  case 'Security': return actionLower.includes('password') || actionLower.includes('mfa') || actionLower.includes('block');
                                                  case 'Support': return actionLower.includes('ticket');
                                                  default: return true;
                                              }
                                          });

                                          return filteredLogs.length > 0 ? (
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                                                  {filteredLogs.map(log => (
                                                      <div key={log.id} style={{ padding: '12px', borderLeft: '4px solid #4f46e5', background: '#f8fafc', borderRadius: '0 8px 8px 0' }}>
                                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                              <strong style={{ color: '#0f172a', fontSize: '14px' }}>{log.action.replace(/_/g, ' ')}</strong>
                                                              <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date(log.createdAt).toLocaleString()}</span>
                                                          </div>
                                                          <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>Admin ID: {log.adminId} | IP: {log.ipAddress || 'Unknown'}</p>
                                                          {log.details && (
                                                              <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b', background: '#e2e8f0', padding: '8px', borderRadius: '4px', wordBreak: 'break-word' }}>
                                                                  {log.details}
                                                              </div>
                                                          )}
                                                      </div>
                                                  ))}
                                              </div>
                                          ) : (
                                              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>No audit logs found matching criteria.</p>
                                          );
                                      })()}
                                  </div>
                          </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === 'tags' && (
                <>
                  <div className="header-actions">
                    <div><h1>Tag Management</h1><p>Overview of all active QR tags in the system.</p></div>
                  </div>
                  <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 24px', color: '#64748b' }}>Tag ID</th>
                                <th style={{ padding: '16px 24px', color: '#64748b' }}>Name / Ref</th>
                                <th style={{ padding: '16px 24px', color: '#64748b' }}>Owner</th>
                                <th style={{ padding: '16px 24px', color: '#64748b' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map(tag => (
                                <tr key={tag.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#4f46e5' }}>{tag.tagId}</td>
                                    <td style={{ padding: '16px 24px', color: '#475569' }}>{tag.name} {tag.plateNumber ? `(${tag.plateNumber})` : ''}</td>
                                    <td style={{ padding: '16px 24px', color: '#0f172a' }}>{tag.owner?.name || 'Unknown'}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ background: tag.status === 'active' ? '#ecfdf5' : '#fef2f2', color: tag.status === 'active' ? '#10b981' : '#ef4444', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {tag.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table></div>
                  </div>
                </>
              )}

              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'ai-alerts' && <SecurityAlertsTab />}
              {activeTab === 'monitoring' && <MonitoringTab />}
              {activeTab === 'support' && <SupportTab />}
              {activeTab === 'reports' && <ReportsTab />}
              {activeTab === 'subscriptions' && <SubscriptionsTab />}
              {activeTab === 'communications' && <CommunicationsTab />}
              {activeTab === 'settings' && <GlobalSettings />}
              
              {/* Placeholders for remaining tabs to ensure complete routing */}
              {['notifications', 'abuse', 'content'].includes(activeTab) && (
                  <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <Lock size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
                      <h2 style={{ color: '#0f172a', marginBottom: '8px', textTransform: 'capitalize' }}>{activeTab} Module</h2>
                      <p style={{ color: '#64748b' }}>This enterprise module is currently being provisioned. Features like RBAC and AI Fraud Detection will appear here.</p>
                  </div>
              )}

            </>
          )}
        </div>

        {/* Block User Modal */}
        {isBlockingUser && selectedUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
              <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 16px', color: '#0f172a' }}>Block User Account</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Provide a reason for suspending this account. This will be sent as a system message to their inbox.</p>
                  <textarea 
                      value={blockReason} 
                      onChange={e => setBlockReason(e.target.value)} 
                      placeholder="Violation of terms..." 
                      style={{ width: '100%', minHeight: '100px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '24px', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button onClick={() => { setIsBlockingUser(false); setBlockReason(''); }} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={handleBlockUser} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Confirm Block</button>
                  </div>
              </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="tab-content" style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#0f172a' }}>Security Dashboard</h2>
            </div>

            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Two-Factor Authentication (MFA)</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>Secure your Master Admin account by enabling TOTP-based Multi-Factor Authentication.</p>
                
                {!mfaSetupQr ? (
                    <button onClick={handleSetupMfa} style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Setup MFA</button>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start', border: '1px dashed #cbd5e1', padding: '24px', borderRadius: '12px', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                            <img src={mfaSetupQr} alt="MFA QR Code" style={{ width: '150px', height: '150px', borderRadius: '8px', background: 'white', padding: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            <div>
                                <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>1. Scan the QR Code</h4>
                                <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px' }}>Open Google Authenticator or Authy and scan this code.</p>
                                <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>2. Enter the 6-digit code</h4>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" value={mfaSetupToken} onChange={e => setMfaSetupToken(e.target.value)} placeholder="000000" maxLength={6} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100px', textAlign: 'center', letterSpacing: '2px', fontSize: '16px' }} />
                                    <button onClick={handleVerifyMfaSetup} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Verify & Enable</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: '#1e293b' }}>Active Device Sessions</h3>
                    <button onClick={handleRevokeAllSessions} style={{ padding: '8px 16px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Revoke All Sessions</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sessions.map(s => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                            <div>
                                <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>{s.deviceInfo}</h4>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>IP: {s.ipAddress} • Expires: {new Date(s.expiresAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => handleRevokeSession(s.id)} style={{ padding: '8px 16px', background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Revoke</button>
                        </div>
                    ))}
                    {sessions.length === 0 && <div style={{ color: '#94a3b8' }}>No active sessions found.</div>}
                </div>
            </div>
            
            <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Audit Logs</h3>
              <div style={{ overflowX: 'auto' }}>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Time</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Admin ID</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Target Entity ID</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>IP Address</th>
                      <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '14px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', color: '#0f172a', fontSize: '14px', fontFamily: 'monospace' }}>{log.adminId.substring(0, 8)}...</td>
                        <td style={{ padding: '12px 16px', color: '#0f172a', fontSize: '14px', fontWeight: 'bold' }}>{log.action}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '14px', fontFamily: 'monospace' }}>{log.entityId}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '14px' }}>{log.ipAddress || 'Unknown'}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '14px' }}>{log.details || '-'}</td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No audit logs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table></div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;



