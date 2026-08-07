import React, { useState, useEffect } from 'react';
import { Server, Cpu, Database, Activity, HardDrive } from 'lucide-react';

export default function MonitoringTab() {
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(62);

  // Simulate real-time monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * (85 - 30) + 30));
      setMemoryUsage(Math.floor(Math.random() * (75 - 50) + 50));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="header-actions">
        <div><h1>System Monitoring</h1><p>Real-time server health and performance metrics.</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px' }}><Activity color="#10b981" size={24} /></div>
          <div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>API Status</div>
            <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#0f172a' }}>100% Uptime</div>
          </div>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#e0e7ff', padding: '12px', borderRadius: '12px' }}><Server color="#4f46e5" size={24} /></div>
          <div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>WebSockets</div>
            <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#0f172a' }}>Connected (2)</div>
          </div>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px' }}><Database color="#d97706" size={24} /></div>
          <div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Database Latency</div>
            <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#0f172a' }}>12 ms</div>
          </div>
        </div>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#f3e8ff', padding: '12px', borderRadius: '12px' }}><HardDrive color="#9333ea" size={24} /></div>
          <div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Storage Used</div>
            <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#0f172a' }}>45.2 GB</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Cpu size={20} color="#4f46e5"/> CPU Usage</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Server Cluster Alpha</span>
            <span style={{ color: '#64748b' }}>{cpuUsage}%</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ width: `${cpuUsage}%`, height: '100%', background: cpuUsage > 80 ? '#ef4444' : '#4f46e5', transition: 'width 0.5s ease-in-out' }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', marginTop: '24px' }}>
            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Database Nodes</span>
            <span style={{ color: '#64748b' }}>34%</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ width: `34%`, height: '100%', background: '#4f46e5' }}></div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><HardDrive size={20} color="#10b981"/> Memory Usage</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>RAM Allocation</span>
            <span style={{ color: '#64748b' }}>{memoryUsage}% ({(memoryUsage * 0.32).toFixed(1)} GB / 32 GB)</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ width: `${memoryUsage}%`, height: '100%', background: '#10b981', transition: 'width 0.5s ease-in-out' }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', marginTop: '24px' }}>
            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Redis Cache</span>
            <span style={{ color: '#64748b' }}>Bypassed</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{ width: `0%`, height: '100%', background: '#94a3b8' }}></div>
          </div>
        </div>
      </div>
    </>
  );
}
