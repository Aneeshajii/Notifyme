import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AnnouncementsTab() {
    const [activeSection, setActiveSection] = useState<'create' | 'active' | 'scheduled' | 'expired' | 'history'>('create');
    const [announcements, setAnnouncements] = useState<any[]>([]);
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [actionButtonText, setActionButtonText] = useState('');
    const [actionUrl, setActionUrl] = useState('');
    const [deliveryTypes, setDeliveryTypes] = useState<string[]>(['IN_APP']);
    const [targetAudience, setTargetAudience] = useState('ALL');
    const [publishAt, setPublishAt] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    useEffect(() => {
        if (activeSection !== 'create') {
            fetchAnnouncements();
        }
    }, [activeSection]);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get(`${API_BASE}/announcements/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(res.data);
        } catch (err) {
            console.error('Failed to fetch announcements');
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post(`${API_BASE}/announcements/admin`, {
                title,
                description,
                imageUrl,
                actionButtonText,
                actionUrl,
                deliveryTypes,
                targetAudience,
                publishAt: publishAt || undefined,
                expiresAt: expiresAt || undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Announcement created successfully!');
            setTitle('');
            setDescription('');
            setImageUrl('');
            setActionButtonText('');
            setActionUrl('');
            setPublishAt('');
            setExpiresAt('');
            setActiveSection('active');
        } catch (err) {
            alert('Failed to create announcement');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_BASE}/announcements/admin/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Announcement deleted');
            fetchAnnouncements();
        } catch (err) {
            alert('Failed to delete announcement');
        }
    };

    const toggleDeliveryType = (type: string) => {
        if (deliveryTypes.includes(type)) {
            setDeliveryTypes(deliveryTypes.filter(t => t !== type));
        } else {
            setDeliveryTypes([...deliveryTypes, type]);
        }
    };

    const filteredAnnouncements = announcements.filter(a => {
        if (activeSection === 'active') return a.status === 'ACTIVE';
        if (activeSection === 'scheduled') return a.status === 'SCHEDULED';
        if (activeSection === 'expired') return a.status === 'EXPIRED';
        if (activeSection === 'history') return true; // Show all
        return true;
    });

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Communications / Announcements</h1>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                {['create', 'active', 'scheduled', 'expired', 'history'].map((section) => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section as any)}
                        style={{
                            padding: '8px 16px',
                            background: activeSection === section ? '#0f172a' : 'transparent',
                            color: activeSection === section ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {section === 'create' ? '+ Create Announcement' : `${section}`}
                    </button>
                ))}
            </div>

            {activeSection === 'create' && (
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '800px' }}>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Announcement Image URL</label>
                            <input 
                                type="text" 
                                value={imageUrl} 
                                onChange={e => setImageUrl(e.target.value)} 
                                placeholder="https://example.com/image.png" 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                            {imageUrl && <img src={imageUrl} alt="Preview" style={{ marginTop: '12px', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Big Heading / Title *</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                placeholder="🎉 New Feature Available!" 
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '18px', fontWeight: 'bold' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Paragraph / Description *</label>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                                placeholder="We've just launched a new feature..." 
                                required
                                rows={4}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Action Button Text</label>
                                <input 
                                    type="text" 
                                    value={actionButtonText} 
                                    onChange={e => setActionButtonText(e.target.value)} 
                                    placeholder="Learn More" 
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Action Destination URL</label>
                                <input 
                                    type="text" 
                                    value={actionUrl} 
                                    onChange={e => setActionUrl(e.target.value)} 
                                    placeholder="/some-page or https://..." 
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Delivery Options *</label>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {['IN_APP', 'PUSH', 'BANNER'].map(type => (
                                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={deliveryTypes.includes(type)} 
                                            onChange={() => toggleDeliveryType(type)} 
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        {type.replace('_', ' ')}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Target Audience *</label>
                            <select 
                                value={targetAudience} 
                                onChange={e => setTargetAudience(e.target.value)} 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            >
                                <option value="ALL">All Users</option>
                                <option value="BASIC">Basic Users</option>
                                <option value="PREMIUM">Premium Users</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Schedule Publish Time (Optional)</label>
                                <input 
                                    type="datetime-local" 
                                    value={publishAt} 
                                    onChange={e => setPublishAt(e.target.value)} 
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Expiration Time (Optional)</label>
                                <input 
                                    type="datetime-local" 
                                    value={expiresAt} 
                                    onChange={e => setExpiresAt(e.target.value)} 
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            style={{ 
                                padding: '16px', 
                                background: '#4f46e5', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: 'bold', 
                                fontSize: '16px', 
                                cursor: 'pointer',
                                marginTop: '12px'
                            }}
                            disabled={deliveryTypes.length === 0}
                        >
                            Publish Announcement
                        </button>
                    </form>
                </div>
            )}

            {activeSection !== 'create' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredAnnouncements.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', background: 'white', borderRadius: '16px' }}>
                            <p style={{ color: '#64748b' }}>No announcements found.</p>
                        </div>
                    ) : (
                        filteredAnnouncements.map(ann => (
                            <div key={ann.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                {ann.imageUrl && (
                                    <img src={ann.imageUrl} alt="Thumbnail" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#0f172a' }}>{ann.title}</h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                                                {ann.targetAudience}
                                            </span>
                                            <span style={{ padding: '4px 8px', background: ann.status === 'ACTIVE' ? '#ecfdf5' : '#f1f5f9', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: ann.status === 'ACTIVE' ? '#10b981' : '#64748b' }}>
                                                {ann.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ color: '#475569', margin: '0 0 12px 0' }}>{ann.description}</p>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b' }}>
                                        <span><strong>Types:</strong> {JSON.parse(ann.deliveryTypes || '[]').join(', ')}</span>
                                        <span><strong>Publish:</strong> {new Date(ann.publishAt).toLocaleString()}</span>
                                        {ann.expiresAt && <span><strong>Expires:</strong> {new Date(ann.expiresAt).toLocaleString()}</span>}
                                        <span><strong>Seen By:</strong> {ann._count?.userStates || 0} users</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button onClick={() => handleDelete(ann.id)} style={{ padding: '8px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
