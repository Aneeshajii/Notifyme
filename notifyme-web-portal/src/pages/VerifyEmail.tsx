import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://notifyme-api-px9n.onrender.com/api';

export default function VerifyEmail() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    axios.post(`${API_BASE}/auth/verify-email`, { token })
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully. Your GetNotify account is now fully activated.');
        setTimeout(() => {
          window.location.href = '/account/dashboard';
        }, 3000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'center', maxWidth: '400px' }}>
        {status === 'loading' && <Loader size={48} className="animate-spin mx-auto text-blue-500 mb-4" />}
        {status === 'success' && <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />}
        {status === 'error' && <XCircle size={48} className="mx-auto text-red-500 mb-4" />}
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>
          {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Verification Failed'}
        </h2>
        <p style={{ color: '#475569', marginBottom: '24px' }}>{message}</p>
        
        {status !== 'loading' && (
          <button 
            onClick={() => { window.location.href = '/account/dashboard'; }}
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer' }}
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
