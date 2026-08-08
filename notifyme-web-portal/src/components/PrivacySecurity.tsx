import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Key, Smartphone, Lock, EyeOff, MapPin, Bell, LogOut, Search, Activity, UserX, User, HelpCircle, TriangleAlert, Video, Mic, FileText, ImageIcon } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PrivacySecurity({ mode = 'privacy', user }: { mode?: string, user?: any }) {
  const [activeTab, setActiveTab] = useState(mode === 'security' ? 'account' : 'privacy');
  const [toast, setToast] = useState('');
  const [activeLegalModal, setActiveLegalModal] = useState<string | null>(null);

  // Centralized Settings State (Simulating DB Sync via LocalStorage)
  const [settings, setSettings] = useState({
    // Account Security
    twoFactor: false,
    biometrics: false,
    // Privacy
    hideEmail: true,
    hidePhone: true,
    hideLocation: false,
    hideLastActive: false,
    allowAnonymousMsg: true,
    allowAudioCalls: true,
    allowVideoCalls: true,
    allowFileSharing: false,
    allowImageSharing: true,
    allowLocationSharing: false,
    // Notifications
    notifMessages: true,
    notifCalls: true,
    notifScans: true,
    notifSubscriptions: true,
    notifSecurity: true,
    notifSupport: true,
    notifAnnouncements: false,
    // QR Codes
    qrGlobalPrivacy: 'public' // public, private, password
  });

  // Load preferences from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifyMePreferences');
    if (saved) {
      try {
        setSettings({ ...settings, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
  }, []);

  // Save settings automatically when changed
  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notifyMePreferences', JSON.stringify(newSettings));
    showToast('Preference saved instantly.');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Reusable Senior-Friendly Toggle Component
  const SeniorToggle = ({ title, description, checked, onChange }: { title: string, description: string, checked: boolean, onChange: () => void }) => (
    <div className="senior-toggle-container" onClick={onChange}>
      <div className="senior-toggle-text">
        <span className="senior-toggle-title">{title}</span>
        <span className="senior-toggle-desc">{description}</span>
      </div>
      <div className={`senior-toggle-switch ${checked ? 'active' : ''}`}></div>
      {/* Legal Modal Overlay */}
      {activeLegalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="premium-card" style={{ background: 'white', width: '100%', maxWidth: '800px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{activeLegalModal}</h2>
                    <button onClick={() => setActiveLegalModal(null)} style={{ background: 'transparent', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>&times;</button>
                </div>
                <div style={{ padding: '32px', overflowY: 'auto', flex: 1, color: '#475569', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '24px', fontSize: '16px' }}><strong>Last Updated:</strong> October 2026</p>
                    <h3 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '18px' }}>1. Introduction & Overview</h3>
                    <p style={{ marginBottom: '24px' }}>Welcome to NotifyMe. This is a professionally structured placeholder for your official {activeLegalModal}. Once your legal team has finalized the official documentation, you can seamlessly drop the text directly into this securely rendered component.</p>
                    <h3 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '18px' }}>2. Data Collection & Privacy</h3>
                    <p style={{ marginBottom: '24px' }}>NotifyMe is built on a foundation of absolute privacy. We ensure that personal contact information remains hidden when interacting via QR codes. (Replace this section with detailed clauses regarding data retention, anonymization, and third-party sharing policies).</p>
                    <h3 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '18px' }}>3. User Rights & Responsibilities</h3>
                    <p style={{ marginBottom: '24px' }}>Users have the right to access, modify, or permanently delete their data from our servers at any time. Accounts found abusing the secure messaging system for spam or harassment will be subject to immediate termination. (Insert official legal jargon regarding liabilities here).</p>
                    <h3 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '18px' }}>4. Governing Law & Dispute Resolution</h3>
                    <p style={{ marginBottom: '24px' }}>These terms and conditions are governed by the applicable privacy laws and international regulations. Any disputes shall be resolved through binding arbitration in the jurisdiction of the company's incorporation. (Pending finalized corporate counsel review).</p>
                    <h3 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '18px' }}>5. Contact Information</h3>
                    <p>If you have any questions or concerns regarding this {activeLegalModal}, please contact our designated Data Protection Officer at legal@notifyme.app.</p>
                </div>
                <div style={{ padding: '20px 32px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="premium-btn primary" onClick={() => setActiveLegalModal(null)}>I Understand</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {toast && <div className="toast-msg">{toast}</div>}

      <div className="header-actions" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Control Center</h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Manage your account security, privacy, and preferences.</p>
        </div>
      </div>

      <div className="security-tabs">
        <button className={`security-tab ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>Account Security</button>
        <button className={`security-tab ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}>Privacy Options</button>
        <button className={`security-tab ${activeTab === 'qrcodes' ? 'active' : ''}`} onClick={() => setActiveTab('qrcodes')}>QR Privacy</button>
        <button className={`security-tab ${activeTab === 'blocked' ? 'active' : ''}`} onClick={() => setActiveTab('blocked')}>Blocked Users</button>
        <button className={`security-tab ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>Active Sessions</button>
        <button className={`security-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
        <button className={`security-tab ${activeTab === 'recovery' ? 'active' : ''}`} onClick={() => setActiveTab('recovery')}>Emergency Recovery</button>
      </div>

      <div style={{ maxWidth: '800px' }}>
        
        {/* =========================================
            ACCOUNT SECURITY
        ========================================= */}
        {activeTab === 'account' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Account Security</h2>
            
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label className="premium-label">Change Password</label>
                <div className="premium-input-group">
                  <input type="password" placeholder="New Password" className="premium-input" />
                  <button className="premium-btn primary" style={{ whiteSpace: 'nowrap' }} onClick={() => showToast('Password updated successfully.')}>Update</button>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="premium-label">Change Email Address</label>
                <div className="premium-input-group">
                  <input type="email" placeholder="New Email" defaultValue={user?.email} className="premium-input" />
                  <button className="premium-btn primary" style={{ whiteSpace: 'nowrap' }} onClick={() => showToast('Email update link sent.')}>Update</button>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="premium-label">Change Mobile Number</label>
                <div className="premium-input-group">
                  <input type="tel" placeholder="New Mobile Number" defaultValue={user?.phone} className="premium-input" />
                  <button className="premium-btn primary" style={{ whiteSpace: 'nowrap' }} onClick={() => showToast('Verification code sent.')}>Update</button>
                </div>
              </div>
              <div className="google-connect-card" style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a' }}>Google Account Connected</h4>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>You can sign in quickly using Google.</span>
                </div>
                <button className="premium-btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => showToast('Google account disconnected.')}>Disconnect</button>
              </div>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444', marginBottom: '24px', marginTop: '48px' }}>Danger Zone</h2>
            <div style={{ background: '#fef2f2', padding: '32px', borderRadius: '24px', border: '1px solid #fecaca' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '18px', color: '#7f1d1d' }}>Delete Account</h4>
              <p style={{ color: '#991b1b', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
                Permanently delete your account and all associated QR tags, messages, and settings. This action cannot be undone.
              </p>
              <button className="premium-btn danger">Delete My Account</button>
            </div>
          </div>
        )}

        {/* =========================================
            PRIVACY CENTER
        ========================================= */}
        {activeTab === 'privacy' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Visibility Privacy</h2>
            <SeniorToggle 
              title="Hide Email Address" 
              description="Your email will not be visible to people who scan your QR. They can only message you through the app." 
              checked={settings.hideEmail} 
              onChange={() => updateSetting('hideEmail', !settings.hideEmail)} 
            />
            <SeniorToggle 
              title="Hide Phone Number" 
              description="Your phone number stays private. People can still contact you through NotifyMe's secure calling." 
              checked={settings.hidePhone} 
              onChange={() => updateSetting('hidePhone', !settings.hidePhone)} 
            /><h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', marginTop: '48px' }}>Communication Permissions</h2>
            <SeniorToggle 
              title="Allow Anonymous Messages" 
              description="Allow people to message you without creating an account." 
              checked={settings.allowAnonymousMsg} 
              onChange={() => updateSetting('allowAnonymousMsg', !settings.allowAnonymousMsg)} 
            />
            <SeniorToggle 
              title="Allow Audio Calls" 
              description="Allow people to call you securely over the internet." 
              checked={settings.allowAudioCalls} 
              onChange={() => updateSetting('allowAudioCalls', !settings.allowAudioCalls)} 
            />
            <SeniorToggle 
              title="Allow Video Calls" 
              description="Allow people to request video calls." 
              checked={settings.allowVideoCalls} 
              onChange={() => updateSetting('allowVideoCalls', !settings.allowVideoCalls)} 
            />
            <SeniorToggle 
              title="Allow Image Sharing" 
              description="Allow scanners to send you photos." 
              checked={settings.allowImageSharing} 
              onChange={() => updateSetting('allowImageSharing', !settings.allowImageSharing)} 
            />
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px', marginTop: '48px' }}>Legal & Compliance</h2>
            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Privacy Policy', 'Terms & Conditions', 'Cookie Policy', 'Data & Privacy Practices', 'Disclaimer'].map((link, i) => (
                    <button key={i} onClick={() => setActiveLegalModal(link)} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', color: '#334155' }}>
                        {link} <span style={{ color: '#94a3b8' }}>→</span>
                    </button>
                ))}
            </div>
          </div>
        )}

        {/* =========================================
            QR PRIVACY
        ========================================= */}
        {activeTab === 'qrcodes' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Global QR Privacy</h2>
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
              <label className="premium-label" style={{ marginBottom: '16px', fontSize: '16px' }}>Default QR Visibility</label>
              <select 
                className="premium-input" 
                value={settings.qrGlobalPrivacy} 
                onChange={(e) => updateSetting('qrGlobalPrivacy', e.target.value)}
              >
                <option value="public">Public (Anyone can scan and interact)</option>
                <option value="private">Private (Only registered users can scan)</option>
                <option value="password">Password Protected (Requires PIN to view)</option>
              </select>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Manage Individual Tags</h2>
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
                You can Pause, Resume, Rename, or Delete your individual QR codes from the <strong>My Tags</strong> tab. When a tag is paused, scanners will see an "Inactive" message and cannot contact you.
              </p>
              <button className="premium-btn primary" onClick={() => document.querySelector('.nav-menu button:nth-child(2)')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>Go to My Tags</button>
            </div>
          </div>
        )}

        {/* =========================================
            BLOCKED USERS
        ========================================= */}
        {activeTab === 'blocked' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Blocked Users</h2>
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Search blocked users..." className="premium-input" style={{ paddingLeft: '48px' }} />
              </div>

              <div className="blocked-user-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a' }}>Anonymous Scanner (IP: 192.168.x.x)</strong>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Blocked on: Aug 5, 2026 • Reason: Spam messages</span>
                </div>
                <button className="premium-btn" style={{ background: '#f8fafc', padding: '10px 16px', fontSize: '14px' }} onClick={() => showToast('User unblocked.')}>Unblock</button>
              </div>
              <div className="blocked-user-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '16px', color: '#0f172a' }}>John Doe</strong>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Blocked on: Aug 1, 2026 • Reason: Harassment</span>
                </div>
                <button className="premium-btn" style={{ background: '#f8fafc', padding: '10px 16px', fontSize: '14px' }} onClick={() => showToast('User unblocked.')}>Unblock</button>
              </div>
              
              <div style={{ marginTop: '24px', padding: '16px', background: '#f0fdf4', color: '#166534', borderRadius: '12px', fontSize: '14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Shield size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>NotifyMe Master Admin accounts cannot be blocked to ensure you always receive critical security alerts and support responses.</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            ACTIVE SESSIONS
        ========================================= */}
        {activeTab === 'sessions' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Active Sessions</h2>
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              
              <div className="session-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '24px', border: '2px solid #10b981', borderRadius: '16px', marginBottom: '16px', background: '#f0fdf4' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ background: '#d1fae5', padding: '12px', borderRadius: '12px', color: '#059669' }}><Activity size={24} /></div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '18px', color: '#065f46', marginBottom: '4px' }}>Windows PC (Current Device)</strong>
                    <div style={{ color: '#059669', fontSize: '14px', lineHeight: '1.5' }}>
                      Browser: Google Chrome<br/>
                      OS: Windows 11<br/>
                      Last Active: Just now
                    </div>
                  </div>
                </div>
                <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold' }}>Active</span>
              </div>

              <div className="session-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '12px', color: '#64748b' }}><Smartphone size={24} /></div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '18px', color: '#0f172a', marginBottom: '4px' }}>iPhone 14 Pro</strong>
                    <div style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
                      Browser: Safari Mobile<br/>
                      OS: iOS 16<br/>
                      Last Active: Yesterday at 4:30 PM
                    </div>
                  </div>
                </div>
                <button className="premium-btn" style={{ background: '#f8fafc', padding: '10px 16px', fontSize: '14px' }} onClick={() => showToast('Logged out of iPhone 14 Pro.')}>Log Out</button>
              </div>

              <button className="premium-btn danger" style={{ width: '100%' }} onClick={() => showToast('Successfully logged out of all other devices.')}>
                Log Out From All Other Devices
              </button>

            </div>
          </div>
        )}

        {/* =========================================
            NOTIFICATIONS
        ========================================= */}
        {activeTab === 'notifications' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Notification Preferences</h2>
            
            <SeniorToggle 
              title="New Messages" 
              description="Get notified when someone sends you a message." 
              checked={settings.notifMessages} 
              onChange={() => updateSetting('notifMessages', !settings.notifMessages)} 
            />
            <SeniorToggle 
              title="Incoming Calls" 
              description="Get notified when someone calls your QR code." 
              checked={settings.notifCalls} 
              onChange={() => updateSetting('notifCalls', !settings.notifCalls)} 
            />
            <SeniorToggle 
              title="QR Scan Alerts" 
              description="Get notified the moment someone scans your QR code." 
              checked={settings.notifScans} 
              onChange={() => updateSetting('notifScans', !settings.notifScans)} 
            />
            <SeniorToggle 
              title="Subscription Alerts" 
              description="Updates regarding your billing and premium plan." 
              checked={settings.notifSubscriptions} 
              onChange={() => updateSetting('notifSubscriptions', !settings.notifSubscriptions)} 
            />
            <SeniorToggle 
              title="Security Alerts" 
              description="Important alerts about new logins and account changes." 
              checked={settings.notifSecurity} 
              onChange={() => updateSetting('notifSecurity', !settings.notifSecurity)} 
            />
            <SeniorToggle 
              title="Support Updates" 
              description="Notifications when NotifyMe Support replies to your tickets." 
              checked={settings.notifSupport} 
              onChange={() => updateSetting('notifSupport', !settings.notifSupport)} 
            />
            <SeniorToggle 
              title="Announcements" 
              description="News and feature updates from the NotifyMe team." 
              checked={settings.notifAnnouncements} 
              onChange={() => updateSetting('notifAnnouncements', !settings.notifAnnouncements)} 
            />
          </div>
        )}

        {/* =========================================
            EMERGENCY RECOVERY
        ========================================= */}
        {activeTab === 'recovery' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '24px' }}>Emergency Recovery</h2>
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                If you lose access to your account, you can use these methods to recover it safely. Make sure you have access to your verified email or phone number.
              </p>

              <div className="profile-grid-2" style={{ marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ background: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Key size={24} color="#0f172a" />
                  </div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>Email Recovery</h4>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>Send a recovery link to your verified email address.</p>
                  <button className="premium-btn primary" style={{ width: '100%', padding: '12px' }} onClick={() => showToast('Recovery email sent.')}>Send Link</button>
                </div>
                
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ background: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Smartphone size={24} color="#0f172a" />
                  </div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>SMS Recovery</h4>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>Send a recovery PIN to your verified mobile number.</p>
                  <button className="premium-btn primary" style={{ width: '100%', padding: '12px' }} onClick={() => showToast('Recovery SMS sent.')}>Send PIN</button>
                </div>
              </div>

              <div style={{ padding: '24px', background: '#f0f9ff', borderRadius: '16px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={20} /> Need Human Help?</h4>
                  <p style={{ margin: 0, color: '#0c4a6e', fontSize: '15px' }}>If you are completely locked out, our support team can verify your identity manually.</p>
                </div>
                <button className="premium-btn" style={{ background: '#0284c7', color: 'white', flexShrink: 0, marginLeft: '24px' }}>Contact Support</button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
}



