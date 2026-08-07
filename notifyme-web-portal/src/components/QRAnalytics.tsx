import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Download, Share2, MapPin } from 'lucide-react';

const mockScanTrend = [
  { day: 'Mon', scans: 12 }, { day: 'Tue', scans: 19 }, { day: 'Wed', scans: 15 },
  { day: 'Thu', scans: 25 }, { day: 'Fri', scans: 22 }, { day: 'Sat', scans: 40 }, { day: 'Sun', scans: 35 }
];

const mockDeviceTypes = [
  { name: 'Mobile (iOS)', value: 65 },
  { name: 'Mobile (Android)', value: 25 },
  { name: 'Desktop', value: 10 }
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b'];

export default function QRAnalytics() {
  return (
    <>
      <div className="header-actions">
        <div>
          <h1>QR Analytics</h1>
          <p>Detailed insights on how and where your QR codes are being scanned.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button className="secondary-btn"><Share2 size={20} /> Share Report</button>
            <button className="primary-btn"><Download size={20} /> Export PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 24px', color: '#0f172a' }}>Weekly Scan Trend</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockScanTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="scans" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 24px', color: '#0f172a' }}>Device Types</h3>
            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mockDeviceTypes} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {mockDeviceTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                {mockDeviceTypes.map((device, index) => (
                    <div key={device.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[index] }}></div>
                            <span style={{ color: '#475569', fontSize: '14px' }}>{device.name}</span>
                        </div>
                        <strong style={{ color: '#0f172a' }}>{device.value}%</strong>
                    </div>
                ))}
            </div>
          </div>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 24px', color: '#0f172a' }}>Top Scan Locations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#e0e7ff', padding: '12px', borderRadius: '50%' }}><MapPin color="#4f46e5" size={20} /></div>
                  <div>
                      <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>New York, USA</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>42 Scans this week</p>
                  </div>
              </div>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '50%' }}><MapPin color="#10b981" size={20} /></div>
                  <div>
                      <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>Los Angeles, USA</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>28 Scans this week</p>
                  </div>
              </div>
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '50%' }}><MapPin color="#d97706" size={20} /></div>
                  <div>
                      <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>London, UK</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>15 Scans this week</p>
                  </div>
              </div>
          </div>
      </div>
    </>
  );
}
