import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, CheckCircle, ShieldCheck, Check } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Subscriptions({ profileData }: { profileData: any }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verifyPhone, setVerifyPhone] = useState(profileData?.phone || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentPlanId = profileData?.subscriptionId;

  useEffect(() => {
      const fetchPlans = async () => {
          try {
              const res = await axios.get(`${API_BASE}/subscriptions`);
              setPlans(res.data);
          } catch (err) {
              console.error("Failed to fetch subscriptions:", err);
          }
      };
      fetchPlans();
  }, []);

  const handleUpgradeClick = (plan: any) => {
      setSelectedPlan(plan);
      setShowRazorpay(true);
  };

  const handlePayment = async () => {
      if (!selectedPlan) return;
      setIsProcessing(true);
      try {
          const token = localStorage.getItem('userToken');
          await axios.post(`${API_BASE}/subscriptions/purchase`, { planId: selectedPlan.id }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setIsProcessing(false);
          setShowRazorpay(false);
          setShowPhoneVerification(true);
      } catch (err) {
          setIsProcessing(false);
          alert("Payment failed.");
          console.error(err);
      }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('userToken');
          await axios.post(`${API_BASE}/auth/send-otp`, { phone: verifyPhone }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setOtpSent(true);
      } catch (err) {
          alert("Failed to send OTP.");
      }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('userToken');
          await axios.post(`${API_BASE}/auth/verify-otp`, { phone: verifyPhone, otp }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setShowPhoneVerification(false);
          setOtpSent(false);
          alert(`Verification Successful! You are now subscribed to ${selectedPlan.name}.`);
      } catch (err) {
          alert("Invalid OTP.");
      }
  };

  return (
    <>
      <div className="header-actions" style={{ marginBottom: '48px', alignItems: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', color: '#0f172a', marginBottom: '12px' }}>Choose your plan</h1>
        <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>Simple, transparent pricing for teams of all sizes. Upgrade your tags and protect your privacy today.</p>
      </div>

      <div className="subscriptions-grid">
          
          {plans.map((plan) => {
              const isCurrent = currentPlanId === plan.id;
              let benefits = [];
              try { benefits = JSON.parse(plan.benefits || "[]"); } catch (e) {}

              return (
                  <div key={plan.id} style={{ 
                      background: 'white', 
                      padding: '40px 32px', 
                      borderRadius: '24px', 
                      border: isCurrent ? '2px solid #0f172a' : '1px solid #e2e8f0',
                      boxShadow: isCurrent ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0,0,0,0.05)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      position: 'relative',
                      transition: 'all 0.3s ease'
                  }}>
                      {isCurrent && (
                          <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#0f172a', color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                              Current Plan
                          </div>
                      )}
                      
                      <h2 style={{ fontSize: '20px', color: '#64748b', fontWeight: '600', margin: '0 0 16px' }}>{plan.name}</h2>
                      <div style={{ fontSize: '48px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', letterSpacing: '-2px', display: 'flex', alignItems: 'baseline' }}>
                          ₹{plan.price} <span style={{ fontSize: '16px', fontWeight: '500', color: '#64748b', letterSpacing: 'normal', marginLeft: '4px' }}>/mo</span>
                      </div>
                      
                      <p style={{ color: '#475569', fontSize: '15px', marginBottom: '32px', lineHeight: '1.5' }}>
                          Up to <strong>{plan.maxQrCodes}</strong> secure QR tags. Perfect for {plan.name.toLowerCase()} usage.
                      </p>

                      <button 
                          onClick={() => !isCurrent && handleUpgradeClick(plan)}
                          style={{ 
                              padding: '16px', 
                              background: isCurrent ? '#f1f5f9' : '#0f172a', 
                              color: isCurrent ? '#64748b' : 'white', 
                              border: 'none', 
                              borderRadius: '12px', 
                              fontWeight: '600', 
                              fontSize: '15px',
                              width: '100%', 
                              cursor: isCurrent ? 'default' : 'pointer',
                              marginBottom: '32px',
                              transition: 'all 0.2s ease',
                              boxShadow: isCurrent ? 'none' : '0 4px 12px rgba(15, 23, 42, 0.15)'
                          }}
                          onMouseOver={(e) => { if (!isCurrent) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseOut={(e) => { if (!isCurrent) e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                          {isCurrent ? 'Current Plan' : (profileData?.isPremium ? 'Downgrade' : `Upgrade to ${plan.name}`)}
                      </button>

                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>What's included</div>
                      
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {benefits.map((b: string, i: number) => (
                              <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: '#475569', fontSize: '15px', lineHeight: '1.5' }}>
                                  <div style={{ background: '#ecfdf5', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                      <Check color="#10b981" size={14} strokeWidth={3} />
                                  </div>
                                  {b}
                              </li>
                          ))}
                      </ul>
                  </div>
              );
          })}
      </div>

      {showRazorpay && selectedPlan && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a', padding: '6px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}>Checkout</div>
                      </div>
                      <button onClick={() => setShowRazorpay(false)} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>&times;</button>
                  </div>
                  
                  <div style={{ textAlign: 'center', marginBottom: '40px', padding: '32px 0', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <div style={{ color: '#64748b', marginBottom: '12px', fontSize: '15px', fontWeight: '500' }}>NotifyMe {selectedPlan.name}</div>
                      <div style={{ fontSize: '48px', fontWeight: '800', color: '#0f172a', letterSpacing: '-2px' }}>₹{selectedPlan.price}</div>
                  </div>

                  <button 
                      onClick={handlePayment} 
                      disabled={isProcessing}
                      style={{ background: '#0f172a', color: 'white', padding: '18px', border: 'none', borderRadius: '12px', width: '100%', fontWeight: '600', fontSize: '16px', cursor: isProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}
                  >
                      {isProcessing ? 'Processing...' : `Pay ₹${selectedPlan.price}`}
                  </button>
                  <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', fontSize: '13px' }}>
                      <ShieldCheck size={14} /> Secured Test Environment
                  </div>
              </div>
          </div>
      )}

      {showPhoneVerification && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
              <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>Verify Your Phone</h3>
                      <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5' }}>We need to verify your phone number to activate your new plan.</p>
                  </div>
                  
                  {!otpSent ? (
                      <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <input type="tel" placeholder="Enter Phone Number" value={verifyPhone} onChange={e => setVerifyPhone(e.target.value)} required style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#0f172a'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                          <button type="submit" style={{ padding: '16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}>Send Code</button>
                          <button type="button" onClick={() => setShowPhoneVerification(false)} style={{ padding: '16px', background: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                      </form>
                  ) : (
                      <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <input type="text" placeholder="0000" value={otp} onChange={e => setOtp(e.target.value)} maxLength={4} required style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontWeight: '600', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#0f172a'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                          <button type="submit" style={{ padding: '16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}>Verify & Activate</button>
                          <button type="button" onClick={() => setOtpSent(false)} style={{ padding: '16px', background: 'transparent', border: 'none', color: '#64748b', fontWeight: '600', cursor: 'pointer' }}>Back</button>
                      </form>
                  )}
              </div>
          </div>
      )}
    </>
  );
}
