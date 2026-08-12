import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const userGrowthData = [
  { name: 'Mon', users: 4000, premium: 2400 },
  { name: 'Tue', users: 3000, premium: 1398 },
  { name: 'Wed', users: 2000, premium: 9800 },
  { name: 'Thu', users: 2780, premium: 3908 },
  { name: 'Fri', users: 1890, premium: 4800 },
  { name: 'Sat', users: 2390, premium: 3800 },
  { name: 'Sun', users: 3490, premium: 4300 },
];

const scanData = [
  { name: 'Car Tags', value: 400 },
  { name: 'Bike Tags', value: 300 },
  { name: 'Luggage', value: 300 },
  { name: 'Pets', value: 200 },
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsTab() {
  const [scans, setScans] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${API_BASE}/tags/admin/scans`)
        .then(res => setScans(res.data))
        .catch(err => console.error(err));
  }, []);

  return (
    <>
      <div className="header-actions">
        <div><h1>Enterprise Analytics</h1><p>In-depth metrics for users, subscriptions, and platform usage.</p></div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* User Growth Line Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '24px', color: '#0f172a' }}>Weekly User Growth</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="users" name="Total Users" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="premium" name="Premium Subs" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* QR Scan Distribution Pie Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '24px', color: '#0f172a' }}>QR Scan Distribution</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={scanData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {scanData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '24px', color: '#0f172a' }}>Revenue Overview (Monthly)</h3>
          <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                  <BarChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Legend />
                      <Bar dataKey="premium" name="Revenue ($)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '24px', color: '#0f172a' }}>Detailed Scan Logs</h3>
          <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', color: '#64748b' }}>Time</th>
                      <th style={{ padding: '16px', color: '#64748b' }}>Tag ID / Name</th>
                      <th style={{ padding: '16px', color: '#64748b' }}>Location</th>
                      <th style={{ padding: '16px', color: '#64748b' }}>Device Info</th>
                  </tr>
              </thead>
              <tbody>
                  {scans.map(scan => (
                      <tr key={scan.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px' }}>{new Date(scan.scannedAt).toLocaleString()}</td>
                          <td style={{ padding: '16px', fontWeight: 'bold', color: '#4f46e5' }}>{scan.tag?.tagId} <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '12px' }}>({scan.tag?.name})</span></td>
                          <td style={{ padding: '16px', color: '#475569' }}>
                              {scan.latitude && scan.longitude ? `${scan.latitude.toFixed(4)}, ${scan.longitude.toFixed(4)}` : 'Unknown'}
                          </td>
                          <td style={{ padding: '16px', color: '#475569' }}>{scan.deviceInfo || 'Generic Browser'}</td>
                      </tr>
                  ))}
                  {scans.length === 0 && <tr><td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No scans recorded yet.</td></tr>}
              </tbody>
          </table></div>
      </div>
    </>
  );
}

