import React from 'react';
import { Shield, Zap, Globe, Smile, Home, Car, Briefcase, MessageCircle, Phone, HelpCircle } from 'lucide-react';

export default function PublicHomepage({ handleProtectedAction }: { handleProtectedAction: (action: string) => void }) {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#f8fafc', margin: '-24px', borderRadius: '24px', overflow: 'hidden' }}>
      
      {/* PUBLIC HERO SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '80px 20px 40px', textAlign: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' }}>
        <div style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ padding: '16px', background: 'white', borderRadius: '24px', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.15)' }}>
              <Shield size={48} color="#4f46e5" />
            </div>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#0f172a', marginBottom: '24px', letterSpacing: '-1px' }}>Welcome to NotifyMe</h1>
          <p style={{ fontSize: '20px', color: '#64748b', marginBottom: '40px', lineHeight: '1.6' }}>The easiest way to let people contact you without sharing your personal phone number. Secure, anonymous connections.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => handleProtectedAction('dashboard')} style={{ padding: '16px 32px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '100px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>Get Started Now</button>
          </div>
        </div>
      </div>

      {/* WHY NOTIFYME SECTION */}
      <div id="why-notifyme" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: '48px' }}>Why NotifyMe?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Shield size={28} />
              </div>
              <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px', fontWeight: '700' }}>Privacy First</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Keep personal contact details private while still allowing people to reach you when necessary.</p>
            </div>
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Zap size={28} />
              </div>
              <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px', fontWeight: '700' }}>Instant Assistance</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Make it easy for someone to quickly notify or contact you when your attention is needed.</p>
            </div>
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Globe size={28} />
              </div>
              <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px', fontWeight: '700' }}>Versatile Communication</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Use NotifyMe across different situations and locations without unnecessarily exposing your personal phone number.</p>
            </div>
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#ffe4e6', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Smile size={28} />
              </div>
              <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px', fontWeight: '700' }}>User-Friendly</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>A simple, intuitive experience designed to be easy for everyone to understand and use.</p>
            </div>
          </div>
        </div>
      </div>

      {/* DIFFERENT USE CASES SECTION */}
      <div id="use-cases" style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center', marginBottom: '48px' }}>Different Use Cases</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '32px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <Home size={32} color="#4f46e5" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '12px', fontWeight: '700' }}>On the Gate</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Allow visitors to simply scan the QR code to announce their arrival, avoiding the need to repeatedly ring a doorbell or wait outside unacknowledged.</p>
            </div>
            <div style={{ padding: '32px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <Car size={32} color="#4f46e5" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '12px', fontWeight: '700' }}>On Your Car</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Keep a NotifyMe tag on your dashboard so someone can instantly alert you if your vehicle needs to be moved or if there's an emergency, without displaying your number.</p>
            </div>
            <div style={{ padding: '32px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              <Briefcase size={32} color="#4f46e5" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '12px', fontWeight: '700' }}>In Your Wallet</h3>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Place a mini QR sticker inside your wallet. If lost, the finder can quickly scan it and send you a secure message, increasing your chances of getting it back.</p>
            </div>
          </div>
        </div>
      </div>

      {/* WEBSITE FOOTER */}
      <footer id="footer" style={{ background: '#0f172a', padding: '80px 24px 40px', color: 'white', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: 'white' }}>
              <Shield size={32} color="#6366f1" />
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>NotifyMe</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px', margin: 0 }}>
              NotifyMe provides a convenient, privacy-conscious way for people to reach you. Stay connected in everyday situations—from parked cars to lost keys—without unnecessarily exposing your personal contact details.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Agreements</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '15px' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>Refund Policy</a></li>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '15px' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>Terms & Conditions</a></li>
              <li><a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', fontSize: '15px' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='#94a3b8'}>Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Need Help?</h4>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px 0' }}>Let us know by connecting with us on WhatsApp or through our Support Center.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="https://wa.me/916238774181" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', textDecoration: 'none', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
                <MessageCircle size={20} color="#22c55e" />
                <span style={{ fontSize: '15px', fontWeight: '500' }}>WhatsApp Us</span>
              </a>
              <a href="tel:+916238774181" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', textDecoration: 'none', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
                <Phone size={20} color="#60a5fa" />
                <span style={{ fontSize: '15px', fontWeight: '500' }}>+91 6238774181</span>
              </a>
              <button onClick={() => { window.scrollTo({top:0, behavior:'smooth'}); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', textDecoration: 'none', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s', width: '100%', cursor: 'pointer', textAlign: 'left', outline: 'none' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.2)';}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}>
                <HelpCircle size={20} color="#f43f5e" />
                <span style={{ fontSize: '15px', fontWeight: '500' }}>Support Center</span>
              </button>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '48px auto 0', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
          © {new Date().getFullYear()} NotifyMe. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
