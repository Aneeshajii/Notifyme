import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, CheckCircle, ShieldCheck, Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Subscriptions({ profileData, onSubscriptionUpdate }: { profileData: any, onSubscriptionUpdate?: () => void }) {
  const [plans, setPlans] = useState<any[]>([]);
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

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      // Check if user needs phone verification from previous drop-off
      if (profileData?.requiresPhoneVerification) {
          setShowPhoneVerification(true);
      }
  }, [profileData]);

  const handleUpgradeClick = async (plan: any) => {
      setSelectedPlan(plan);
      setIsProcessing(true);
      try {
          const token = localStorage.getItem('userToken');
          
          // 1. Create order on backend
          const orderRes = await axios.post(`${API_BASE}/subscriptions/create-order`, { planId: plan.id }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          const { orderId, amount, key } = orderRes.data;

          // 2. Open Razorpay Checkout
          const options = {
              key: key,
              amount: amount * 100,
              currency: "INR",
              name: "NotifyMe",
              description: `Upgrade to ${plan.name}`,
              image: "/logo.png",
              order_id: orderId,
              handler: async function (response: any) {
                  // 3. Verify Payment Signature
                  try {
                      await axios.post(`${API_BASE}/subscriptions/verify-payment`, {
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature
                      }, {
                          headers: { Authorization: `Bearer ${token}` }
                      });
                      
                      // Payment verified! Show phone verification modal
                      setShowPhoneVerification(true);
                  } catch (err) {
                      alert("Payment verification failed. Please contact support.");
                  }
              },
              prefill: {
                  name: profileData?.name || "",
                  email: profileData?.email || "",
                  contact: profileData?.phone || ""
              },
              theme: {
                  color: "#0f172a"
              },
              modal: {
                  ondismiss: function() {
                      setIsProcessing(false);
                  }
              }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on('payment.failed', function (response: any){
              setIsProcessing(false);
              alert(response.error.description || "Payment failed. Please try again.");
          });
          rzp.open();

      } catch (err) {
          setIsProcessing(false);
          alert("Failed to initialize payment. Please try again.");
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
          
          // Verify OTP first
          await axios.post(`${API_BASE}/auth/verify-otp`, { phone: verifyPhone, otp }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Activate Subscription securely
          await axios.post(`${API_BASE}/subscriptions/activate`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          setShowPhoneVerification(false);
          setOtpSent(false);
          alert(`Verification Successful! Your subscription is now active.`);
          
          if (onSubscriptionUpdate) {
              onSubscriptionUpdate();
          }
      } catch (err) {
          alert("Invalid OTP or Failed to activate subscription.");
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
                          disabled={isProcessing}
                          style={{ 
                              padding: '16px', 
                              background: isCurrent ? '#f1f5f9' : '#0f172a', 
                              color: isCurrent ? '#64748b' : 'white', 
                              border: 'none', 
                              borderRadius: '12px', 
                              fontWeight: '600', 
                              fontSize: '15px',
                              width: '100%', 
                              cursor: (isCurrent || isProcessing) ? 'not-allowed' : 'pointer',
                              marginBottom: '32px',
                              transition: 'all 0.2s ease',
                              boxShadow: isCurrent ? 'none' : '0 4px 12px rgba(15, 23, 42, 0.15)',
                              opacity: isProcessing ? 0.7 : 1
                          }}
                          onMouseOver={(e) => { if (!isCurrent && !isProcessing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseOut={(e) => { if (!isCurrent && !isProcessing) e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                          {isProcessing && selectedPlan?.id === plan.id ? 'Processing...' : (isCurrent ? 'Current Plan' : (profileData?.isPremium ? 'Downgrade' : `Upgrade to ${plan.name}`))}
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

      {showPhoneVerification && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
              <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <div style={{ background: '#ecfdf5', display: 'inline-flex', padding: '12px', borderRadius: '50%', marginBottom: '16px' }}>
                          <CheckCircle color="#10b981" size={32} />
                      </div>
                      <h3 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>Payment Successful!</h3>
                      <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.5' }}>Please verify your phone number to activate your new subscription plan.</p>
                  </div>
                  
                  {!otpSent ? (
                      <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <input type="tel" placeholder="Enter Phone Number" value={verifyPhone} onChange={e => setVerifyPhone(e.target.value)} required style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = '#0f172a'} onBlur={(e) => e.target.style.borderColor = '#e2e8f0'} />
                          <button type="submit" style={{ padding: '16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}>Send Code</button>
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
