import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings2, Save } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function GlobalSettings() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_BASE}/settings`)
            .then(res => {
                setSettings(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const toggleSetting = async (key: string) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        try {
            await axios.put(`${API_BASE}/settings`, { [key]: newSettings[key] });
        } catch (error) {
            alert('Failed to update setting');
        }
    };

    if (loading) return <div>Loading settings...</div>;
    if (!settings) return <div>Failed to load settings</div>;

    return (
        <div style={{ animation: 'fadeIn 0.3s' }}>
            <div className="header-actions">
                <div>
                    <h1><Settings2 size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }}/> Global Settings</h1>
                    <p>Master toggles for platform-wide features.</p>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>Communication Features</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Allow Voice Messages</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Enable users to record and send voice notes.</div>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={settings.allowVoice} 
                            onChange={() => toggleSetting('allowVoice')} 
                            style={{ width: '24px', height: '24px' }}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Allow File Sharing</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Enable users to share images and files in chat.</div>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={settings.allowFile} 
                            onChange={() => toggleSetting('allowFile')} 
                            style={{ width: '24px', height: '24px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Allow Location Sharing</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Enable the Send Live Location feature for scanners.</div>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={settings.allowLocation} 
                            onChange={() => toggleSetting('allowLocation')} 
                            style={{ width: '24px', height: '24px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Allow Video Calling</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Enable WebRTC video calling alongside audio.</div>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={settings.allowVideoCall} 
                            onChange={() => toggleSetting('allowVideoCall')} 
                            style={{ width: '24px', height: '24px' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
