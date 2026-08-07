import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, QrCode, Activity, Settings, Bell, Search, Database } from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, tagsRes] = await Promise.all([
          axios.get(`${API_BASE}/auth/users`),
          axios.get(`${API_BASE}/tags/admin/all`)
        ]);
        setUsers(usersRes.data);
        setTags(tagsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return <div style={{ padding: '48px', color: 'white', fontFamily: 'Inter' }}>Loading Master Control Room...</div>;
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Shield size={24} />
          </div>
          <span className="brand-text">NotifyMe Admin</span>
        </div>
        
        <nav className="nav-menu">
          <button className="nav-item active"><Activity size={20} /> Overview</button>
          <button className="nav-item"><Users size={20} /> All Users ({users.length})</button>
          <button className="nav-item"><QrCode size={20} /> Generated Tags ({tags.length})</button>
          <button className="nav-item"><Database size={20} /> System Logs</button>
          <div style={{ flexGrow: 1 }}></div>
          <button className="nav-item"><Settings size={20} /> Admin Settings</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1>Master Control Room</h1>
            <p>Monitor your entire system across all apps and websites.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}>
              <Bell size={20} />
            </button>
            <div style={{ background: 'var(--gradient)', padding: '2px', borderRadius: '12px' }}>
              <div style={{ background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '10px' }}>
                <span style={{ fontWeight: 600 }}>SuperAdmin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Top Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Users size={28} /></div>
            <div className="stat-info">
              <h3>Total Registered Users</h3>
              <p>{users.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}><QrCode size={28} /></div>
            <div className="stat-info">
              <h3>Active QR Tags</h3>
              <p>{tags.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Activity size={28} /></div>
            <div className="stat-info">
              <h3>System Status</h3>
              <p>Active</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="data-section">
          <div className="table-header">
            <h2>Recent User Signups</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-dark)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <Search size={16} color="var(--text-muted)" />
              <input type="text" placeholder="Search database..." style={{ background: 'none', border: 'none', color: 'white', outline: 'none' }} />
            </div>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Join Date</th>
                <th>Tags Owned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const userTags = tags.filter(t => t.owner?._id === user._id || t.owner === user._id).length;
                return (
                  <tr key={user._id}>
                    <td style={{ fontWeight: 500 }}>{user.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge premium">{userTags} Tags</span></td>
                    <td><span className="badge active">Active</span></td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No users registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
