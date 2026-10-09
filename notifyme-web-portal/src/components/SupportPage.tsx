import React from 'react';

export default function SupportPage() {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Support & Contact</h1>
        <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '18px' }}>We are here to help! If you have any questions, issues, or feedback, please reach out to our support team.</p>
        
        <div style={{ backgroundColor: '#f1f5f9', padding: '24px', borderRadius: '12px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Email Support</h2>
            <p style={{ fontSize: '18px', color: '#4f46e5', fontWeight: 'bold' }}>support@getnotifye.com</p>
        </div>

        <button onClick={() => window.location.href = '/'} style={{ padding: '12px 24px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            ← Return to Homepage
        </button>
      </div>
    </div>
  );
}
