import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Shield, CheckCircle, Ban, Eye, FileText, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

interface SecurityAlert {
    id: string;
    userId: string;
    riskLevel: string;
    reason: string;
    explanation: string;
    status: string;
    createdAt: string;
    user?: {
        name: string;
        lastName: string;
        email: string;
    }
}

const SecurityAlertsTab: React.FC = () => {
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [token] = useState(localStorage.getItem('adminToken'));

    const fetchAlerts = async () => {
        try {
            const res = await axios.get(`${API_BASE}/admin/security-alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(res.data);
        } catch (error) {
            console.error('Failed to fetch security alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        // Setup polling for demo purposes since we aren't hooking up Socket.IO here yet
        const interval = setInterval(fetchAlerts, 10000);
        return () => clearInterval(interval);
    }, [token]);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            await axios.put(`${API_BASE}/admin/security-alerts/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlerts(alerts.map(a => a.id === id ? { ...a, status: newStatus } : a));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'CRITICAL': return '#991b1b';
            case 'HIGH': return '#ef4444';
            case 'MEDIUM': return '#f59e0b';
            case 'LOW': return '#3b82f6';
            default: return '#64748b';
        }
    };

    if (loading) return <div style={{ padding: '24px' }}>Loading Security Alerts...</div>;

    return (
        <div className="tab-content" style={{ animation: 'fadeIn 0.3s' }}>
            <div className="header-actions">
                <div>
                    <h1>AI Security Monitoring</h1>
                    <p>Monitor and respond to suspicious AI interactions across the platform.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldAlert size={18} color="#ef4444" /> Total Alerts
                    </h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{alerts.length}</div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Ban size={18} color="#991b1b" /> Critical Risk
                    </h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{alerts.filter(a => a.riskLevel === 'CRITICAL').length}</div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Eye size={18} color="#f59e0b" /> Pending Review
                    </h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{alerts.filter(a => a.status === 'new' || a.status === 'reviewing').length}</div>
                </div>
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={18} color="#10b981" /> Resolved
                    </h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{alerts.filter(a => a.status === 'resolved' || a.status === 'dismissed').length}</div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#0f172a' }}>Recent Security Events</h3>
                </div>
                {alerts.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No security alerts found. Your system is safe!</div>
                ) : (
                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '16px 24px', color: '#64748b' }}>Date</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b' }}>User</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b' }}>Risk Level</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b' }}>Detection Reason</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b' }}>Status</th>
                                    <th style={{ padding: '16px 24px', color: '#64748b', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map(alert => (
                                    <tr key={alert.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '16px 24px', color: '#0f172a', whiteSpace: 'nowrap' }}>
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{alert.user ? `${alert.user.name} ${alert.user.lastName || ''}` : 'Unknown User'}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{alert.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ 
                                                padding: '4px 12px', 
                                                borderRadius: '20px', 
                                                fontSize: '12px', 
                                                fontWeight: 'bold',
                                                background: `${getRiskColor(alert.riskLevel)}15`,
                                                color: getRiskColor(alert.riskLevel)
                                            }}>
                                                {alert.riskLevel}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{alert.reason}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={alert.explanation}>
                                                {alert.explanation}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <select 
                                                value={alert.status} 
                                                onChange={(e) => handleUpdateStatus(alert.id, e.target.value)}
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    borderRadius: '8px', 
                                                    border: '1px solid #e2e8f0', 
                                                    background: alert.status === 'new' ? '#fffbeb' : '#f8fafc',
                                                    color: '#0f172a',
                                                    outline: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="new">New</option>
                                                <option value="reviewing">Reviewing</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="dismissed">Dismissed</option>
                                                <option value="escalated">Escalated</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button className="secondary-btn" onClick={() => window.alert('Audit log feature connects to user details')} style={{ padding: '6px 12px', fontSize: '12px' }}>
                                                View Audit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecurityAlertsTab;
