import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Check, X, GripVertical } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    maxQrCodes: number;
    benefits: string; // JSON string
    isActive: boolean;
}

const SubscriptionsTab: React.FC = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', price: 0, maxQrCodes: 1, isActive: true });
    const [benefits, setBenefits] = useState<string[]>([]);
    const [newBenefit, setNewBenefit] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await axios.get(`${API_BASE}/subscriptions/admin/all`);
            setPlans(res.data);
        } catch (err) {
            console.error("Failed to fetch subscriptions", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBenefit = () => {
        if (newBenefit.trim()) {
            setBenefits([...benefits, newBenefit.trim()]);
            setNewBenefit('');
        }
    };

    const handleRemoveBenefit = (index: number) => {
        setBenefits(benefits.filter((_, i) => i !== index));
    };

    const handleMoveBenefit = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const newB = [...benefits];
            [newB[index-1], newB[index]] = [newB[index], newB[index-1]];
            setBenefits(newB);
        } else if (direction === 'down' && index < benefits.length - 1) {
            const newB = [...benefits];
            [newB[index+1], newB[index]] = [newB[index], newB[index+1]];
            setBenefits(newB);
        }
    };

    const handleSave = async () => {
        try {
            const payload = { ...formData, benefits };
            if (isEditing && isEditing !== 'new') {
                await axios.put(`${API_BASE}/subscriptions/${isEditing}`, payload);
            } else {
                await axios.post(`${API_BASE}/subscriptions`, payload);
            }
            setIsEditing(null);
            fetchPlans();
        } catch (err) {
            console.error("Failed to save plan", err);
            alert("Error saving subscription plan.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this subscription plan?')) {
            try {
                await axios.delete(`${API_BASE}/subscriptions/${id}`);
                fetchPlans();
            } catch (err) {
                console.error(err);
                alert("Failed to delete plan");
            }
        }
    };

    const handleEditClick = (plan: SubscriptionPlan) => {
        setIsEditing(plan.id);
        setFormData({ name: plan.name, price: plan.price, maxQrCodes: plan.maxQrCodes, isActive: plan.isActive });
        setBenefits(JSON.parse(plan.benefits || '[]'));
    };

    const handleNewClick = () => {
        setIsEditing('new');
        setFormData({ name: '', price: 0, maxQrCodes: 1, isActive: true });
        setBenefits([]);
    };

    if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;

    return (
        <div className="tab-content" style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, color: '#0f172a' }}>Subscription Plans Management</h2>
                <button onClick={handleNewClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#4f46e5', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    <Plus size={18} /> Add New Plan
                </button>
            </div>

            {isEditing && (
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>{isEditing === 'new' ? 'Create New Plan' : 'Edit Plan'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Plan Name (e.g. Premium, Gold)</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Price (₹)</label>
                            <input value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Max QR Codes Allowed</label>
                            <input value={formData.maxQrCodes} onChange={e => setFormData({...formData, maxQrCodes: Number(e.target.value)})} type="number" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#0f172a' }}>
                            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                            Plan is Active (Visible to users)
                        </label>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Plan Benefits (Features list)</label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            <input value={newBenefit} onChange={e => setNewBenefit(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddBenefit()} placeholder="e.g. Priority Support" type="text" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            <button onClick={handleAddBenefit} style={{ background: '#f1f5f9', color: '#4f46e5', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Add Benefit</button>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {benefits.map((b, idx) => (
                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <button onClick={() => handleMoveBenefit(idx, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#cbd5e1' : '#64748b' }}>▲</button>
                                        <button onClick={() => handleMoveBenefit(idx, 'down')} disabled={idx === benefits.length - 1} style={{ background: 'none', border: 'none', cursor: idx === benefits.length - 1 ? 'default' : 'pointer', color: idx === benefits.length - 1 ? '#cbd5e1' : '#64748b' }}>▼</button>
                                    </div>
                                    <span style={{ flex: 1, color: '#0f172a' }}>{b}</span>
                                    <button onClick={() => handleRemoveBenefit(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setIsEditing(null)} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSave} style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save Subscription Plan</button>
                    </div>
                </div>
            )}

            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', color: '#64748b' }}>Plan Name</th>
                            <th style={{ padding: '16px 24px', color: '#64748b' }}>Price</th>
                            <th style={{ padding: '16px 24px', color: '#64748b' }}>Max QR Codes</th>
                            <th style={{ padding: '16px 24px', color: '#64748b' }}>Benefits</th>
                            <th style={{ padding: '16px 24px', color: '#64748b' }}>Status</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.map(plan => {
                            const parsedBenefits = JSON.parse(plan.benefits || '[]');
                            return (
                                <tr key={plan.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#0f172a' }}>{plan.name}</td>
                                    <td style={{ padding: '16px 24px', color: '#475569' }}>₹{plan.price}</td>
                                    <td style={{ padding: '16px 24px', color: '#475569' }}>{plan.maxQrCodes}</td>
                                    <td style={{ padding: '16px 24px', color: '#475569' }}>{parsedBenefits.length} items</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ background: plan.isActive ? '#ecfdf5' : '#fef2f2', color: plan.isActive ? '#10b981' : '#ef4444', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button onClick={() => handleEditClick(plan)} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', marginRight: '16px' }}><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(plan.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                        {plans.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No subscription plans found.</td>
                            </tr>
                        )}
                    </tbody>
                </table></div>
            </div>
        </div>
    );
};

export default SubscriptionsTab;

