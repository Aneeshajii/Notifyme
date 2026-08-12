import React, { useState } from 'react';
import axios from 'axios';
import { User, Phone, QrCode, ArrowRight, CheckCircle, Shield, MessageSquare, PhoneCall, MapPin, Download } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface OnboardingProps {
    user: any;
    onComplete: (user: any) => void;
}

const OnboardingFlow: React.FC<OnboardingProps> = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    
    // Step 1 State
    const [firstName, setFirstName] = useState(user?.name || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    
    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdTagId, setCreatedTagId] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const handleNextStep = () => {
        if (!firstName.trim() || !lastName.trim()) {
            setError("First name and Last name are required.");
            return;
        }
        setError('');
        setStep(2);
    };

    const handleCreateQR = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('userToken');
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Create the Tag
            const tagRes = await axios.post(`${API_BASE}/tags/create`, {
                vehicleNo: "First QR",
                ownerName: `${firstName} ${lastName}`
            }, { headers });
            
            const newTagId = tagRes.data.id;
            setCreatedTagId(newTagId);
            setQrCodeUrl(tagRes.data.qrCodeUrl);

            // 2. Mark User as Onboarded and update details
            const onboardRes = await axios.post(`${API_BASE}/auth/onboard`, {
                firstName,
                lastName,
                phone
            }, { headers });

            setStep(3);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to create QR code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadQR = () => {
        if (!qrCodeUrl) return;
        const link = document.createElement('a');
        link.download = `NotifyMe-QR-${createdTagId}.png`;
        link.href = qrCodeUrl;
        link.click();
    };

    const finishOnboarding = async () => {
        try {
            // Fetch fresh user data
            const token = localStorage.getItem('userToken');
            const res = await axios.get(`${API_BASE}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onComplete(res.data);
        } catch (err) {
            window.location.reload();
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header */}
            <div style={{ position: 'absolute', top: '30px', left: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={28} color="#4f46e5" />
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>NotifyMe</span>
            </div>

            <div style={{ width: '100%', maxWidth: '900px', background: 'white', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: step === 2 ? 'row' : 'column' }}>
                
                {/* Step 1: User Details */}
                {step === 1 && (
                    <div style={{ padding: '60px', width: '100%', maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                            <h1 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '12px' }}>Welcome to NotifyMe! 👋</h1>
                            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5' }}>Let's set up your profile so people know who they are contacting securely.</p>
                        </div>

                        {error && (
                            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>First Name *</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        type="text" 
                                        value={firstName} 
                                        onChange={e => setFirstName(e.target.value)}
                                        placeholder="John"
                                        style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Last Name *</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        type="text" 
                                        value={lastName} 
                                        onChange={e => setLastName(e.target.value)}
                                        placeholder="Doe"
                                        style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Phone Number (Optional)</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input 
                                        type="text" 
                                        value={phone} 
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="+1 234 567 8900"
                                        style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' }}
                                    />
                                </div>
                                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Your number is kept completely private and hidden from scanners.</p>
                            </div>
                        </div>

                        <button 
                            onClick={handleNextStep}
                            style={{ width: '100%', marginTop: '40px', padding: '14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
                        >
                            Continue <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {/* Step 2: Create QR & Live Preview */}
                {step === 2 && (
                    <>
                        <div style={{ flex: 1, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '16px' }}>Create Your QR Code</h2>
                            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
                                This is what people will see when they scan your code. They can message or call you securely without ever seeing your personal phone number.
                            </p>

                            {error && (
                                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca' }}>
                                    {error}
                                </div>
                            )}

                            <button 
                                onClick={handleCreateQR}
                                disabled={isLoading}
                                style={{ width: '100%', padding: '16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.2s', opacity: isLoading ? 0.7 : 1 }}
                            >
                                {isLoading ? 'Creating...' : <>Create QR Code <QrCode size={22} /></>}
                            </button>
                            
                            <button 
                                onClick={() => setStep(1)}
                                style={{ width: '100%', marginTop: '16px', padding: '14px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}
                            >
                                Back
                            </button>
                        </div>
                        
                        {/* Live Preview Screen (Mobile Phone Mockup) */}
                        <div style={{ flex: 1, background: '#f1f5f9', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '320px', height: '620px', background: 'white', borderRadius: '40px', border: '12px solid #0f172a', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                                {/* Notch */}
                                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '24px', background: '#0f172a', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', zIndex: 10 }}></div>
                                
                                {/* App Content */}
                                <div style={{ background: '#4f46e5', padding: '40px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
                                    <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#4f46e5', fontSize: '32px', fontWeight: 'bold' }}>
                                        {firstName.charAt(0)}{lastName.charAt(0)}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{firstName} {lastName}</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.8 }}>Owner</p>
                                </div>
                                
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, background: '#f8fafc' }}>
                                    <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><MessageSquare size={24} /></div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Send Message</h4>
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Chat securely</p>
                                        </div>
                                    </div>
                                    
                                    {user?.isPremium && (
                                        <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <div style={{ width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><PhoneCall size={24} /></div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Voice Call</h4>
                                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>App-to-App call</p>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><MapPin size={24} /></div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Share Location</h4>
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Send GPS coordinates</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Step 3: Success Screen */}
                {step === 3 && (
                    <div style={{ padding: '60px', width: '100%', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <CheckCircle size={40} color="#10b981" />
                        </div>
                        
                        <h2 style={{ fontSize: '28px', color: '#0f172a', marginBottom: '12px' }}>Your QR Code has been created successfully.</h2>
                        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                            You are all set! You can print this QR code and place it on your vehicle or belongings.
                        </p>

                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                            <img src={qrCodeUrl} alt="Your QR Code" style={{ width: '200px', height: '200px' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                            <button 
                                onClick={handleDownloadQR}
                                style={{ flex: 1, padding: '16px', background: 'white', color: '#4f46e5', border: '2px solid #4f46e5', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <Download size={20} /> Download QR
                            </button>
                            <button 
                                onClick={finishOnboarding}
                                style={{ flex: 1, padding: '16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                Go to Dashboard <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingFlow;
