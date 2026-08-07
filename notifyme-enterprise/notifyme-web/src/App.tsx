import React from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, QrCode, Settings, LayoutDashboard, Search, Bell, Plus, Phone, MessageSquare, AlertTriangle, Fingerprint, MapPin, Mic } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './index.css';

// ---------------------------------------------------------
// 1. Master Admin Portal
// ---------------------------------------------------------
const AdminPortal = () => {
  const [activeTab, setActiveTab] = React.useState('overview');

  return (
    <div className="portal-container admin-theme">
      <aside className="sidebar">
        <div className="brand"><Shield size={24} color="#f43f5e" /> <span>NotifyMe Admin</span></div>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><LayoutDashboard size={18}/> Overview</button>
          <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><Users size={18}/> User Management</button>
          <button className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`} onClick={() => setActiveTab('tags')}><QrCode size={18}/> Tag Registry</button>
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><Shield size={18}/> Admin Profile</button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18}/> Platform Settings</button>
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <h2>Enterprise Command Center</h2>
          <div className="admin-badge">Super Admin</div>
        </header>

        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card"><h3>Total Users</h3><p className="stat-value">512,492</p></div>
              <div className="stat-card"><h3>Active QR Tags</h3><p className="stat-value">849,104</p></div>
              <div className="stat-card premium-card"><h3>Monthly Revenue (MRR)</h3><p className="stat-value">$145,290</p></div>
            </div>
            
            <div className="table-container">
              <h3>Recent Platform Activity</h3>
              <table className="data-table">
                <thead><tr><th>User ID</th><th>Action</th><th>Timestamp</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>usr_9x2b...</td><td>Generated NFC Tag</td><td>2 mins ago</td><td><span className="badge success">Success</span></td></tr>
                  <tr><td>usr_4m1q...</td><td>Upgraded to Premium</td><td>15 mins ago</td><td><span className="badge success">Success</span></td></tr>
                  <tr><td>usr_7z8p...</td><td>Failed Login Attempt</td><td>1 hr ago</td><td><span className="badge error">Flagged</span></td></tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'profile' && (
          <div className="table-container">
            <h3>Admin Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Name</p>
                <h4 style={{ margin: '4px 0 0' }}>Anees (Super Admin)</h4>
              </div>
              <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Email</p>
                <h4 style={{ margin: '4px 0 0' }}>admin@notifyme.com</h4>
              </div>
              <button className="primary-btn" style={{ width: 'fit-content' }}>Update Password</button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="table-container">
            <h3>Platform Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>Maintenance Mode</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Disable access to all portals temporarily.</p>
                </div>
                <button className="badge error" style={{ border: 'none', cursor: 'pointer' }}>Turn On</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>Force JWT Rotation</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Log out all active users across mobile and web.</p>
                </div>
                <button className="badge error" style={{ border: 'none', cursor: 'pointer' }}>Execute</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
           <div className="table-container">
             <h3>User Management</h3>
             <p style={{ color: 'var(--text-muted)' }}>Search and ban users from the platform.</p>
             {/* We can add a user table here in the future */}
           </div>
        )}

        {activeTab === 'tags' && (
           <div className="table-container">
             <h3>Tag Registry</h3>
             <p style={{ color: 'var(--text-muted)' }}>Monitor active and lost tags globally.</p>
             {/* We can add a tag table here in the future */}
           </div>
        )}

      </main>
    </div>
  );
};

// ---------------------------------------------------------
// 2. User Web Portal
// ---------------------------------------------------------
const UserPortal = () => {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('tags');

  const handleUpgrade = async () => {
    try {
      // 1. Get Order ID from Backend
      const orderRes = await fetch('http://localhost:5001/api/payments/create-order', { method: 'POST' });
      const orderData = await orderRes.json();

      // 2. Initialize Razorpay
      const options = {
        key: 'rzp_test_dummy_key_123', // Dummy key for frontend
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NotifyMe Enterprise',
        description: 'Lifetime Premium Upgrade',
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('http://localhost:5001/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: 'dummy_user_123'
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setIsPremium(true);
            alert('🎉 Payment Successful! You are now a Premium Member.');
          }
        },
        prefill: {
          name: "NotifyMe User",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#10b981"
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment initialization failed. Is the backend running?");
    }
  };

  return (
    <div className="portal-container user-theme">
      <aside className="sidebar">
        <div className="brand"><Shield size={24} color="#3b82f6" /> <span>NotifyMe</span></div>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'tags' ? 'active' : ''}`} onClick={() => setActiveTab('tags')}><QrCode size={18}/> My Tags</button>
          <button className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}><MessageSquare size={18}/> Secure Inbox</button>
          <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}><Bell size={18}/> Notifications</button>
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><Users size={18}/> Profile</button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18}/> Settings</button>
        </nav>
        
        {!isPremium ? (
          <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 8px', color: 'white' }}>Upgrade to Premium</h4>
            <p style={{ margin: '0 0 16px', color: 'white', fontSize: '0.85rem' }}>Unlock unlimited tags and priority voice calls.</p>
            <button onClick={handleUpgrade} style={{ background: 'white', color: '#d97706', border: 'none', padding: '8px 16px', borderRadius: '100px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>Pay ₹999 / yr</button>
            <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 'bold' }}>Google Pay • Paytm • UPI</p>
          </div>
        ) : (
          <div style={{ marginTop: 'auto', background: '#10b981', padding: '20px', borderRadius: '12px', textAlign: 'center', color: 'white' }}>
            <Shield size={24} style={{ margin: '0 auto 8px' }} />
            <h4 style={{ margin: '0' }}>Premium Member</h4>
          </div>
        )}
      </aside>
      <main className="content">
        <header className="topbar">
          <div className="search-bar"><Search size={18} color="#64748b"/><input type="text" placeholder="Search..."/></div>
          {activeTab === 'tags' && <button className="primary-btn"><Plus size={18}/> Create New Tag</button>}
        </header>

        {activeTab === 'tags' && (
          <>
            <div className="tags-grid">
              <div className="tag-card">
                <div className="tag-header"><div className="status-dot active"></div><span>Active</span></div>
                <h3>My Tesla Model 3</h3>
                <p className="tag-meta">Plate: OPT-123</p>
                <div className="qr-box">Encrypted QR Data</div>
                <button className="secondary-btn" onClick={() => navigate('/scan/aB9x2Z')}>Test Scanner Portal</button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', marginTop: '32px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '24px', color: 'white' }}>Tag Scan Analytics (Last 7 Days)</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={[
                    { name: 'Mon', scans: 4 }, { name: 'Tue', scans: 7 }, { name: 'Wed', scans: 2 },
                    { name: 'Thu', scans: 12 }, { name: 'Fri', scans: 25 }, { name: 'Sat', scans: 18 }, { name: 'Sun', scans: 9 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'inbox' && (
          <div className="table-container">
            <h3>Secure Inbox</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>End-to-end encrypted messages from your tags.</p>
            <div style={{ padding: '16px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>Tag: My Tesla Model 3</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>10 mins ago</span>
              </div>
              <p style={{ margin: '0 0 12px' }}>Hey, your lights are on!</p>
              <button className="primary-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}><Phone size={14} style={{ marginRight: '8px' }}/> Call Back (Anonymous)</button>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>Tag: House Keys</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Yesterday</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
                <MapPin size={16}/> <span>Secure Location Shared</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="table-container">
            <h3>User Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Name</p>
                <h4 style={{ margin: '4px 0 0' }}>NotifyMe User</h4>
              </div>
              <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Phone Number</p>
                <h4 style={{ margin: '4px 0 0' }}>+91 9876543210 <span className="badge success" style={{marginLeft: '8px'}}>OTP Verified</span></h4>
              </div>
              <button className="secondary-btn" style={{ width: 'fit-content', marginTop: 0 }}>Edit Profile</button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="table-container">
            <h3>Privacy Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>Accept Voice Calls</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Allow people to call you anonymously when they scan your tags.</p>
                </div>
                <div style={{ width: '40px', height: '24px', background: '#10b981', borderRadius: '12px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px' }}>Push Notifications</h4>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Receive alerts on your mobile device instantly.</p>
                </div>
                <div style={{ width: '40px', height: '24px', background: '#10b981', borderRadius: '12px' }}></div>
              </div>
              <button className="badge error" style={{ border: 'none', cursor: 'pointer', padding: '12px', fontSize: '1rem', marginTop: '16px' }}>Delete Account</button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="table-container">
            <h3>Notifications</h3>
            <p style={{ color: 'var(--text-muted)' }}>You have no new notifications.</p>
          </div>
        )}

      </main>
    </div>
  );
};

// ---------------------------------------------------------
// 3. QR Scanner Portal
// ---------------------------------------------------------
const ScannerPortal = () => {
  const { tagId } = useParams();
  
  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => alert(`📍 Secure Location Grabbed!\nLat: ${pos.coords.latitude}\nLng: ${pos.coords.longitude}\n\n(This would instantly send to the owner's dashboard)`),
        (err) => alert('Error accessing location: ' + err.message)
      );
    }
  };

  const handleVoiceNote = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      alert("🎙️ Microphone connected!\n\nRecording started... When finished, it will automatically upload to Vercel Blob Storage securely.");
    } catch (err) {
      alert("Microphone permission denied.");
    }
  };
  
  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <Shield size={32} color="#10b981" />
        <h1>Secure Contact Portal</h1>
        <p>You scanned Tag ID: {tagId}</p>
      </div>
      
      <div className="action-list">
        <button className="action-btn call-btn">
          <Phone size={24} />
          <div>
            <h3>Call Owner Anonymously</h3>
            <p>Voice call via secure WebRTC</p>
          </div>
        </button>

        <button className="action-btn msg-btn" onClick={handleVoiceNote}>
          <Mic size={24} />
          <div>
            <h3>Leave a Voice Note</h3>
            <p>Uploads securely via Vercel Blob</p>
          </div>
        </button>

        <button className="action-btn" onClick={handleShareLocation} style={{ borderLeft: '4px solid #8b5cf6' }}>
          <MapPin size={24} />
          <div>
            <h3>Share Exact Location</h3>
            <p>Send a secure GPS pin</p>
          </div>
        </button>
        
        <button className="action-btn alert-btn">
          <AlertTriangle size={24} />
          <div>
            <h3>Report Vehicle Issue</h3>
            <p>Lights on, blocked driveway, etc.</p>
          </div>
        </button>
      </div>
      
      <div className="privacy-badge">
        <Fingerprint size={16} />
        <span>Your phone number is hidden.</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// Router Setup
// ---------------------------------------------------------
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserPortal />} />
      <Route path="/admin" element={<AdminPortal />} />
      <Route path="/scan/:tagId" element={<ScannerPortal />} />
    </Routes>
  );
}
