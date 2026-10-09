import React from 'react';

export default function TermsOfService() {
  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={() => window.location.href = '/'} style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            ← Back to Home
        </button>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Terms of Service</h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>By accessing or using the GetNotifye service, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.</p>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>2. User Conduct</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>You are solely responsible for all code, video, images, information, data, text, software, music, sound, photographs, graphics, messages or other materials ("content") that you upload, post, publish or display via the Service.</p>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>3. Account Termination</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>4. Modifications to Service</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>We reserve the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice.</p>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '32px', marginBottom: '16px' }}>5. Contact Us</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '16px' }}>If you have any questions about these Terms, please contact us at support@getnotifye.com.</p>
      </div>
    </div>
  );
}
