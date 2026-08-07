import React from 'react';
import { QrCode, MessageSquare, Phone, HelpCircle, User, CreditCard, Clock, BadgeCheck, ShieldCheck, ChevronRight, Activity, MapPin, Lock, CheckCircle2, Download, Settings, ShieldAlert, List, Star } from 'lucide-react';

const NotifyMeLogo = ({ size = 48 }: { size?: number }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #1d9bf0 0%, #005bb5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <ShieldCheck size={size * 0.55} color="white" />
    </div>
);

export default function UserDashboard({ tags, messages, setActiveTab, user, profileData }: any) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const planName = profileData?.subscription?.name || 'Basic';
  const qrLimit = profileData?.subscription?.maxQrCodes || 3;
  const qrUsed = tags?.length || 0;
  
  const expiryDate = profileData?.premiumExpiresAt ? new Date(profileData.premiumExpiresAt).toLocaleDateString() : 'Never';

  const unreadCount = messages?.length || 0;

  return (
    <div style={{ paddingBottom: '32px' }}>
      {/* Top Greeting Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            {getGreeting()}, {profileData?.name?.split(' ')[0] || 'User'} ??
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} /> {planName.replace(' Plan', '')}
            </span>
            <span style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
               Expires: {expiryDate}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', padding: '16px 24px', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(255,255,255,0.5)' }}>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>QR Usage</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>{qrUsed} / {qrLimit} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>used</span></div>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="action-cards-grid">
        {[
            { icon: <QrCode size={24} color="#4f46e5" />, label: 'Generate QR', bg: '#e0e7ff', tab: 'tags' },
            { icon: <MessageSquare size={24} color="#10b981" />, label: 'Messages', bg: '#d1fae5', tab: 'inbox' },
            { icon: <Phone size={24} color="#f59e0b" />, label: 'Calls', bg: '#fef3c7', tab: 'inbox' },
            { icon: <HelpCircle size={24} color="#ec4899" />, label: 'Support', bg: '#fce7f3', tab: 'support' },
            { icon: <User size={24} color="#8b5cf6" />, label: 'My Profile', bg: '#ede9fe', tab: 'profile' },
            { icon: <CreditCard size={24} color="#0ea5e9" />, label: 'Subscription', bg: '#e0f2fe', tab: 'subscriptions' },
        ].map((action, i) => (
            <button key={i} onClick={() => setActiveTab(action.tab)} style={{ 
                background: 'white', border: 'none', padding: '24px 16px', borderRadius: '20px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
            >
                <div style={{ background: action.bg, padding: '16px', borderRadius: '50%' }}>{action.icon}</div>
                <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{action.label}</span>
            </button>
        ))}
      </div>

      <div className="dashboard-split">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Communication Preview */}
              <div onClick={() => setActiveTab('inbox')} style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s' }}
                   onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Communication</h3>
                      {unreadCount > 0 && <span style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold' }}>{unreadCount} Unread</span>}
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #f1f5f9' }}>
                      <NotifyMeLogo size={48} />
                      <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>NotifyMe</span>
                              <BadgeCheck size={16} color="#1d9bf0" />
                          </div>
                          <p style={{ margin: 0, color: '#64748b', fontSize: '15px' }}>"We've upgraded your subscription."</p>
                      </div>
                      <ChevronRight color="#cbd5e1" />
                  </div>
              </div>

              {/* Live Activity */}
              <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Live Activity</h3>
                      <button onClick={() => setActiveTab('scan_history')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>View All <ChevronRight size={16} /></button>
                  </div>
                  
                  <div style={{ marginBottom: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Today</div>
                  <div onClick={() => setActiveTab('scan_history')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '16px', cursor: 'pointer', marginBottom: '16px', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='#f8fafc'}>
                      <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '50%' }}><Activity size={20} /></div>
                      <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>Car QR scanned</h4>
                          <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> Bangalore</div>
                      </div>
                  </div>

                  <div style={{ marginBottom: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Yesterday</div>
                  <div onClick={() => setActiveTab('scan_history')} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '16px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='#f8fafc'}>
                      <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '50%' }}><Activity size={20} /></div>
                      <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>Wallet QR scanned</h4>
                          <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> Kochi</div>
                      </div>
                  </div>
              </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Security Center */}
              <div onClick={() => setActiveTab('security')} style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <div style={{ background: '#dcfce7', color: '#16a34a', padding: '8px', borderRadius: '50%' }}><Lock size={20} /></div>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Security Center</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '14px', fontWeight: '500' }}><CheckCircle2 size={16} /> Email Verified</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontSize: '14px', fontWeight: '500' }}><CheckCircle2 size={16} /> Phone Verified</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}><ShieldAlert size={16} /> 2FA Disabled</div>
                  </div>
              </div>

              {/* Support Preview */}
              <div onClick={() => setActiveTab('support')} style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0f172a' }}>Support</h3>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Ticket #NM-1045</span>
                          <span style={{ background: '#fef9c3', color: '#ca8a04', padding: '4px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold' }}>IN PROGRESS</span>
                      </div>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Waiting for support team response...</p>
                  </div>
              </div>

              {/* Bottom Quick Shortcuts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => setActiveTab('scan_history')} style={{ width: '100%', padding: '16px', background: 'white', border: 'none', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}><List size={18} color="#64748b" /> Scan History</button>
                  <button onClick={() => setActiveTab('tags')} style={{ width: '100%', padding: '16px', background: 'white', border: 'none', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}><QrCode size={18} color="#64748b" /> My QR Codes</button>
                  <button onClick={() => setActiveTab('downloads')} style={{ width: '100%', padding: '16px', background: 'white', border: 'none', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}><Download size={18} color="#64748b" /> Downloads</button>
                  <button onClick={() => setActiveTab('settings')} style={{ width: '100%', padding: '16px', background: 'white', border: 'none', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', color: '#475569', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}><Settings size={18} color="#64748b" /> Settings</button>
              </div>
          </div>
      </div>
    </div>
  );
}


