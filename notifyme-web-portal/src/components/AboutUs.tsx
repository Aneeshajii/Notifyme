import React, { useEffect, useState } from 'react';
import { Shield, Lock, Eye, BookOpen, Compass, Zap, Search, User, Inbox, Phone, PhoneOff, CreditCard, Bell, Smartphone, Activity, Car, Home, Briefcase, FileText, Users, Download, HelpCircle, MapPin, TriangleAlert, ShieldAlert, FileSpreadsheet, List, ShieldCheck, Heart, Star, Sparkles, Globe, Fingerprint, MessageSquare } from 'lucide-react';
import '../index.css';

const AboutUs = ({ setActiveTab }: any) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    { title: 'QR Management', desc: 'Securely generate and track your tags.', icon: <Search size={24} color="#4f46e5" /> },
    { title: 'Secure Messaging', desc: 'End-to-end encrypted chats.', icon: <MessageSquare size={24} color="#10b981" /> },
    { title: 'Audio Calling', desc: 'High quality anonymous calls.', icon: <Phone size={24} color="#3b82f6" /> },
    { title: 'Video Calling', desc: 'Face to face, completely secure.', icon: <Smartphone size={24} color="#8b5cf6" /> },
    { title: 'Privacy Controls', desc: 'You decide what is visible.', icon: <Eye size={24} color="#f59e0b" /> },

    { title: 'Scan History', desc: 'Detailed logs of every scan.', icon: <Activity size={24} color="#6366f1" /> },
    { title: 'Notifications', desc: 'Instant alerts on all devices.', icon: <Bell size={24} color="#ec4899" /> },
    { title: 'Support Center', desc: '24/7 dedicated assistance.', icon: <HelpCircle size={24} color="#14b8a6" /> },
    { title: 'Subscriptions', desc: 'Flexible premium plans.', icon: <CreditCard size={24} color="#f59e0b" /> },
    { title: 'Multi-device', desc: 'Sync across all platforms.', icon: <Globe size={24} color="#06b6d4" /> },
    { title: 'Google Sign-In', desc: 'Fast, secure authentication.', icon: <Fingerprint size={24} color="#4f46e5" /> }
  ];

  const values = [
    { name: 'Trust', icon: <ShieldCheck size={24} /> },
    { name: 'Privacy', icon: <Eye size={24} /> },
    { name: 'Innovation', icon: <Sparkles size={24} /> },
    { name: 'Security', icon: <Lock size={24} /> },
    { name: 'Simplicity', icon: <Sparkles size={24} /> },
    { name: 'Reliability', icon: <Activity size={24} /> },
    { name: 'Accessibility', icon: <Globe size={24} /> },
  ];

  return (
    <div className={`about-us-container ${isVisible ? 'fade-in' : ''}`} style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px', padding: '16px' }}>
      
      {/* 1. Hero Section */}
      <section className="about-section text-center" style={{ marginTop: '20px', padding: '40px 16px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Navigation / Back Button */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '24px', zIndex: 10 }}>
            <button 
                onClick={() => setActiveTab ? setActiveTab('dashboard') : window.location.hash = 'dashboard'}
                style={{ background: 'rgba(79,70,229,0.1)', color: '#4f46e5', border: 'none', padding: '10px 20px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                &larr; Back to Dashboard
            </button>
        </div>

        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
        
        <div style={{ marginBottom: '24px' }}>
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <Shield size={48} color="white" />
            </div>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '800', color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.5px', lineHeight: '1.2' }}>About GetNotifye</h1>
        <h2 style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', color: '#4f46e5', fontWeight: '600', marginBottom: '24px' }}>Simple. Private. Secure.</h2>
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6', padding: '0 16px' }}>
          GetNotifye is a privacy-first communication platform that allows people to connect securely through smart QR codes without exposing their personal contact information.
        </p>
      </section>

      {/* 2, 3, 4. Story, Mission, Vision */}
      <section className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="premium-card" style={{ padding: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}><BookOpen size={24} color="#4f46e5" /> Our Story</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
                GetNotifye was built with a simple idea: people should be reachable when necessary without exposing their personal phone numbers or email addresses.<br/><br/>
                Whether someone finds your wallet, keys, vehicle, luggage, or any valuable item, GetNotifye makes it easy for them to contact you securely while keeping you in complete control of your privacy.
            </p>
        </div>
        <div className="premium-card" style={{ padding: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}><Compass size={24} color="#10b981" /> Our Mission</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
                Our mission is to make communication safer, smarter, and more private for everyone through innovative QR-based technology.
            </p>
        </div>
        <div className="premium-card" style={{ padding: '24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}><Eye size={24} color="#f59e0b" /> Our Vision</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
                Our vision is to become one of the world's most trusted privacy-first QR communication platforms by delivering secure, simple, and reliable experiences for everyone.
            </p>
        </div>
      </section>

      {/* 5. How it Works */}
      <section>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 32px)', marginBottom: '32px', color: '#0f172a' }}>How GetNotifye Works</h2>
        <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', margin: '0 auto' }}>
            {[
                { title: 'Create your QR.', icon: <Search size={20} /> },
                { title: 'Attach it to your belongings.', icon: <Briefcase size={20} /> },
                { title: 'Someone scans it.', icon: <Smartphone size={20} /> },
                { title: 'They securely contact you.', icon: <MessageSquare size={20} /> },
                { title: 'Your privacy remains protected.', icon: <ShieldCheck size={20} color="#10b981" /> },
            ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '16px 20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '50%', color: '#4f46e5', flexShrink: 0 }}>{step.icon}</div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Step {idx + 1}</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>{step.title}</div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 6. Why Choose */}
      <section>
        <h2 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '48px', color: '#0f172a' }}>Why Choose GetNotifye</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="premium-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Shield size={40} color="#4f46e5" style={{ marginBottom: '16px' }}/>
                <h3 style={{ marginBottom: '12px' }}>Privacy First</h3>
                <p style={{ color: '#64748b' }}>Your personal phone number and email remain protected.</p>
            </div>
            <div className="premium-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Lock size={40} color="#10b981" style={{ marginBottom: '16px' }}/>
                <h3 style={{ marginBottom: '12px' }}>Secure Communication</h3>
                <p style={{ color: '#64748b' }}>Chat and communicate safely.</p>
            </div>
            <div className="premium-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Zap size={40} color="#f59e0b" style={{ marginBottom: '16px' }}/>
                <h3 style={{ marginBottom: '12px' }}>Smart QR Technology</h3>
                <p style={{ color: '#64748b' }}>Generate QR codes for multiple belongings.</p>
            </div>
            <div className="premium-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <User size={40} color="#3b82f6" style={{ marginBottom: '16px' }}/>
                <h3 style={{ marginBottom: '12px' }}>User Controlled</h3>
                <p style={{ color: '#64748b' }}>You decide what information is visible.</p>
            </div>
            <div className="premium-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Activity size={40} color="#8b5cf6" style={{ marginBottom: '16px' }}/>
                <h3 style={{ marginBottom: '12px' }}>Reliable</h3>
                <p style={{ color: '#64748b' }}>Built for everyday use.</p>
            </div>
            <div className="premium-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Heart size={40} color="#ec4899" style={{ marginBottom: '16px' }}/>
                <h3 style={{ marginBottom: '12px' }}>Easy to Use</h3>
                <p style={{ color: '#64748b' }}>Simple enough for users of every age.</p>
            </div>
        </div>
      </section>

      {/* 8. Privacy Promise */}
      <section className="premium-card" style={{ background: '#0f172a', color: 'white', textAlign: 'center', padding: '64px 32px' }}>
        <ShieldCheck size={64} color="#10b981" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '36px', color: 'white', marginBottom: '24px' }}>Your Privacy Comes First</h2>
        <p style={{ fontSize: '20px', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            GetNotifye never shares your personal information without your permission.<br/><br/>
            You decide what others can see.<br/>
            You stay in complete control.
        </p>
      </section>

      {/* 7. Core Features */}
      <section>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 32px)', marginBottom: '32px', color: '#0f172a' }}>Core Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {features.map((f, i) => (
                <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', flexShrink: 0 }}>{f.icon}</div>
                    <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0f172a', fontWeight: 'bold' }}>{f.title}</h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>{f.desc}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 9. Our Values */}
      <section>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 3.5vw, 32px)', marginBottom: '32px', color: '#0f172a' }}>Our Values</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {values.map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '12px 20px', borderRadius: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: '600', color: '#334155', fontSize: '14px' }}>
                    {React.cloneElement(v.icon, { color: '#4f46e5', size: 18 })} {v.name}
                </div>
            ))}
        </div>
      </section>

      {/* 10. Built for Everyone */}
      <section className="premium-card text-center" style={{ padding: '48px 24px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
        <Users size={48} color="#4f46e5" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 32px)', marginBottom: '16px', color: '#0f172a' }}>Built for Everyone</h2>
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#64748b', maxWidth: '600px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            The GetNotifye interface is intentionally simple and user-friendly, ensuring that anyone can secure their belongings with ease.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
            {['Students', 'Families', 'Professionals', 'Senior Citizens', 'Travelers', 'Businesses'].map((aud, i) => (
                <span key={i} style={{ background: '#e0e7ff', color: '#4f46e5', padding: '6px 16px', borderRadius: '100px', fontWeight: 'bold', fontSize: '14px' }}>{aud}</span>
            ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'white', padding: '40px 24px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Shield size={40} color="#0f172a" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '20px' }}>GetNotifye</h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontWeight: '500', fontSize: '14px' }}>Protecting your privacy, one QR at a time.</p>

          <div style={{ color: '#94a3b8', fontSize: '13px', borderTop: '1px solid #f1f5f9', paddingTop: '24px', width: '100%' }}>
              &copy; {new Date().getFullYear()} GetNotifye. All rights reserved.
          </div>
      </footer>
      
      <style>{`
        .fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;


