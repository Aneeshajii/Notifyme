import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={() => window.location.href = '/'} style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ← Back to Home
        </button>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Privacy Policy</h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>1. Information We Collect</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, and other information you choose to provide.</p>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>2. Use of Information</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>We may use the information we collect about you to:</p>
        <ul style={{ lineHeight: '1.6', marginBottom: '16px', paddingLeft: '24px' }}>
          <li>Provide, maintain, and improve our services;</li>
          <li>Perform internal operations;</li>
          <li>Send or facilitate communications between you and other users (such as QR tag scans);</li>
          <li>Send you push notifications and emails regarding your account.</li>
        </ul>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>3. Data Deletion</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>You may request the deletion of your account and all associated data at any time through the "Delete Account" button in your Profile settings on the mobile app, or by contacting us at support@getnotifye.com.</p>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>4. Contact Us</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>If you have any questions about this Privacy Policy, please contact us at support@getnotifye.com.</p>
      </div>
    </div>
  );
}
