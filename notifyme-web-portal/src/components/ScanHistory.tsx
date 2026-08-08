import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, MapPin, Smartphone, Clock, Shield } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ScanHistory() {
  const [scans, setScans] = useState<any[]>([]);

  useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
          axios.get(`${API_BASE}/tags/scans`, {
              headers: { Authorization: `Bearer ${token}` }
          })
          .then(res => setScans(res.data))
          .catch(err => console.error(err));
      }
  }, []);
  return (
    <>
      <div className="header-actions">
        <div>
          <h1>Scan History</h1>
          <p>A detailed audit log of every time your QR codes were scanned.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button className="secondary-btn"><Filter size={20} /> Filter Logs</button>
            <button className="primary-btn"><Download size={20} /> Export CSV</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div className="search-bar" style={{ background: 'white', width: '300px', border: '1px solid #e2e8f0' }}>
                <Search size={18} color="#64748b" />
                <input type="text" placeholder="Search logs by tag or location..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
              </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
              <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '14px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '16px 24px' }}>QR Tag</th>
                          <th style={{ padding: '16px 24px' }}>Location</th>
                          <th style={{ padding: '16px 24px' }}>Device & Browser</th>
                          <th style={{ padding: '16px 24px' }}>Timestamp</th>
                          <th style={{ padding: '16px 24px' }}>Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {scans.map(scan => (
                          <tr key={scan.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#0f172a' }}>{scan.tag?.name}</td>
                              <td style={{ padding: '16px 24px', color: '#64748b' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <MapPin size={16} />
                                      {scan.latitude ? `${scan.latitude.toFixed(4)}, ${scan.longitude.toFixed(4)}` : 'Unknown'}
                                  </div>
                              </td>
                              <td style={{ padding: '16px 24px', color: '#64748b' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Smartphone size={16} />
                                      {scan.deviceInfo || 'Unknown Device'}
                                  </div>
                              </td>
                              <td style={{ padding: '16px 24px', color: '#64748b' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Clock size={16} />
                                      {new Date(scan.scannedAt).toLocaleString()}
                                  </div>
                              </td>
                              <td style={{ padding: '16px 24px' }}>
                                  <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Shield size={12} />
                                      Safe
                                  </span>
                              </td>
                          </tr>
                      ))}
                      {scans.length === 0 && <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No scans recorded yet.</td></tr>}
                  </tbody>
              </table></div>
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '14px' }}>
              <span>Showing 1 to 5 of 84 entries</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>Previous</button>
                  <button style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>Next</button>
              </div>
          </div>
      </div>
    </>
  );
}

