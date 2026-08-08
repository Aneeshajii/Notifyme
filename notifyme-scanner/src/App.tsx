import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer/simplepeer.min.js';
import { Shield, Phone, MessageSquare, MapPin, Send, CheckCircle, PhoneOff, Camera, Image as ImageIcon, Lock, ScanLine, ShieldCheck, ChevronRight } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './index.css';

const API_BASE = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

interface TagData {
  id: string;
  name: string;
  status: string;
  ownerName: string;
  isPremium?: boolean;
}

const NotifyMeLogo = ({ size = 48 }: { size?: number }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #1d9bf0 0%, #005bb5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <ShieldCheck size={size * 0.55} color="white" />
    </div>
);

function ScannerProfile() {
  const { uuid } = useParams<{ uuid: string }>();
  
  const [tagData, setTagData] = useState<TagData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<{ message: string, placeholderMessage?: string } | null>(null);
  
  // Messaging state
  const [showMsgInput, setShowMsgInput] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isSendingMsg, setIsSendingMsg] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const scannerId = useRef<string>(localStorage.getItem('scannerId') || "anon_" + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    localStorage.setItem('scannerId', scannerId.current);
  }, []);

  useEffect(() => {
      let interval: any;
      if (uuid && showMsgInput) {
          const fetchMsgs = async () => {
              try {
                  const res = await axios.get("http://localhost:5000/api/messages/scanner/" + uuid + "/" + scannerId.current);
                  setChatMessages(res.data);
              } catch (e) {}
          };
          fetchMsgs();
          interval = setInterval(fetchMsgs, 2000);
      }
      return () => clearInterval(interval);
  }, [uuid, showMsgInput]);
  
  // WebRTC Call States
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const ownerAudio = useRef<HTMLAudioElement | null>(null);
  const connectionRef = useRef<any>(null);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tags/" + uuid, {
            headers: { 'x-scanner-id': scannerId.current }
        });
        setTagData(res.data);
        setLoading(false);
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
            setErrorState({ message: err.response.data.message, placeholderMessage: err.response.data.placeholderMessage });
        } else if (err.response && err.response.status === 429) {
            setErrorState({ message: 'Too many requests. Please try again later.' });
        } else {
            setErrorState({ message: 'This QR code is invalid or no longer exists.' });
        }
        setLoading(false);
      }
    };
    if (uuid) fetchTag();
  }, [uuid]);

  useEffect(() => {
    socket.on('call-accepted', (signal: any) => {
      setCallAccepted(true);
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
    });
    socket.on('owner-offline', () => {
        setIsCalling(false);
        if (stream) stream.getTracks().forEach(t => t.stop());
        alert('The owner is currently offline and cannot answer calls right now.');
    });
    return () => {
      socket.off('call-accepted');
      socket.off('owner-offline');
    };
  }, [stream]);

  const initiateCall = () => {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((currentStream) => {
      setStream(currentStream);
      setIsCalling(true);

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: currentStream
      });

      peer.on('signal', (data: any) => {
        if (tagData) {
            socket.emit('call-owner', {
              tagId: tagData.id,
              signalData: data,
              callerId: socket.id
            });
        }
      });

      peer.on('stream', (remoteStream: MediaStream) => {
        if (ownerAudio.current) {
          ownerAudio.current.srcObject = remoteStream;
          ownerAudio.current.play();
        }
      });

      connectionRef.current = peer;
    }).catch(err => {
      alert('Please allow microphone access to call the owner.');
    });
  };

  const endCall = () => {
    setIsCalling(false);
    setCallAccepted(false);
    if (connectionRef.current) connectionRef.current.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const handleSendMessage = async (text: string, type: 'text'|'image' = 'text') => {
    if (!text.trim() && type === 'text') return;
    setIsSendingMsg(true);

    try {
        await axios.post("http://localhost:5000/api/messages/send", {
            tagId: tagData?.id,
            content: type === 'image' ? '[Image Attached] ' + text : text,
            senderInfo: 'Anonymous Scanner',
            scannerId: scannerId.current
        });
        setMessage('');
        const res = await axios.get("http://localhost:5000/api/messages/scanner/" + uuid + "/" + scannerId.current);
        setChatMessages(res.data);
    } catch (e) {
        alert('Failed to send message.');
    } finally {
        setIsSendingMsg(false);
    }
  };

  const handleImageUpload = () => {
      handleSendMessage('Attached a photo of the item', 'image');
  };

  const shareLocation = async () => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
              const url = "https://maps.google.com/?q=" + position.coords.latitude + "," + position.coords.longitude;
              handleSendMessage("My current location: " + url);
              alert('Location sent securely to the owner!');
          }, () => {
              alert('Location access denied.');
          });
      } else {
          alert('Geolocation is not supported by this browser.');
      }
  };

  if (loading) return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                  <NotifyMeLogo size={64} />
              </div>
              <p style={{ color: '#64748b', fontWeight: '500' }}>Establishing Secure Connection...</p>
          </div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>
      </div>
  );

  if (errorState) return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '24px' }}>
          <div style={{ background: 'white', padding: '48px 32px', borderRadius: '32px', textAlign: 'center', maxWidth: '440px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'inline-flex', background: '#fef2f2', padding: '20px', borderRadius: '50%', marginBottom: '24px' }}>
                  <Lock size={40} color="#ef4444" />
              </div>
              <h2 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '28px', letterSpacing: '-0.5px' }}>Access Restricted</h2>
              <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px', lineHeight: '1.6' }}>{errorState.message}</p>
              {errorState.placeholderMessage && (
                  <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#334155', fontStyle: 'italic', fontWeight: '500', fontSize: '15px' }}>
                      "{errorState.placeholderMessage}"
                  </div>
              )}
          </div>
      </div>
  );

  if (!tagData) return <div style={{ padding: '40px', textAlign: 'center' }}>This QR code is invalid or no longer exists.</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      <audio ref={ownerAudio} />
      
      {/* Trustful Branding Banner */}
      <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 50 }}>
          <ShieldCheck size={24} color="#1d9bf0" />
          <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '18px', letterSpacing: '-0.5px' }}>Verified by NotifyMe</span>
      </div>

      <main style={{ maxWidth: '480px', margin: '40px auto 0', padding: '0 20px' }}>
        
        {/* Connection Header / Wallet Pass Style */}
        <div className="animate-fade-in" style={{ background: 'white', borderRadius: '32px', padding: '40px 32px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', marginBottom: '32px', border: '1px solid rgba(0,0,0,0.02)' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                <NotifyMeLogo size={72} />
            </div>
            <h1 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '32px', letterSpacing: '-1px' }}>Connect</h1>
            <p style={{ color: '#64748b', fontSize: '16px', margin: '0 0 32px', lineHeight: '1.5' }}>You are securely connecting to the owner of this item.</p>
            
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.03)' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Owner</span>
                <h2 style={{ margin: '0', color: '#0f172a', fontSize: '28px', letterSpacing: '-0.5px' }}>{tagData.ownerName || 'User'}</h2>
            </div>
        </div>

        {/* Call UI Overlay */}
        {isCalling ? (
          <div className="animate-fade-in" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', padding: '48px 32px', borderRadius: '32px', textAlign: 'center', color: 'white', marginBottom: '24px', boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.4)' }}>
            <Phone size={72} style={{ margin: '0 auto 32px', opacity: callAccepted ? 1 : 0.8, animation: callAccepted ? 'none' : 'bounce 1s infinite' }} />
            <h2 style={{ margin: '0 0 12px', fontSize: '28px', letterSpacing: '-0.5px' }}>{callAccepted ? 'Call Connected' : 'Calling...'}</h2>
            <p style={{ opacity: 0.8, margin: '0 0 40px', fontSize: '16px' }}>{callAccepted ? 'Secure Channel Active' : 'Ringing over secure bridge...'}</p>
            <button onClick={endCall} style={{ background: 'white', color: '#ef4444', border: 'none', padding: '20px', borderRadius: '100px', width: '100%', fontWeight: '700', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
              <PhoneOff size={24} /> End Call
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Premium Calling Feature */}
            {tagData.isPremium ? (
                <button onClick={initiateCall} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', width: '100%', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.3)', transition: 'all 0.2s', fontSize: '20px', fontWeight: '700' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '50%' }}>
                      <Phone size={28} />
                  </div>
                  Call Owner
                </button>
            ) : (
                <button disabled style={{ background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'not-allowed', width: '100%', fontSize: '20px', fontWeight: '700' }}>
                  <div style={{ background: '#e2e8f0', padding: '16px', borderRadius: '50%', color: '#94a3b8' }}>
                      <Lock size={28} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                      <div style={{ marginBottom: '4px', color: '#64748b' }}>Call Owner</div>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>Calling Disabled (Free Tag)</div>
                  </div>
                </button>
            )}

            <button onClick={() => setShowMsgInput(!showMsgInput)} style={{ background: 'white', color: '#0f172a', border: '1px solid rgba(0,0,0,0.05)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', width: '100%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', transition: 'all 0.2s', fontSize: '20px', fontWeight: '700' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '50%' }}>
                  <MessageSquare size={28} color="#4f46e5" />
              </div>
              Message Owner
            </button>

            {showMsgInput && (
                <div className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', marginTop: '8px' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={18} color="#10b981" /> Secure Chat
                    </div>
                    
                    <div style={{ height: '320px', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'white' }}>
                        {chatMessages.length === 0 ? (
                            <div style={{ margin: 'auto', color: '#94a3b8', fontSize: '15px', textAlign: 'center', padding: '0 24px' }}>
                                Start the conversation. Your messages are secure and anonymous.
                            </div>
                        ) : (
                            chatMessages.map(msg => (
                                <div key={msg.id} style={{ alignSelf: msg.senderRole === 'scanner' ? 'flex-end' : 'flex-start', background: msg.senderRole === 'scanner' ? '#4f46e5' : '#f1f5f9', color: msg.senderRole === 'scanner' ? 'white' : '#0f172a', padding: '14px 18px', borderRadius: '20px', borderBottomRightRadius: msg.senderRole === 'scanner' ? '4px' : '20px', borderBottomLeftRadius: msg.senderRole === 'scanner' ? '20px' : '4px', maxWidth: '85%', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    {msg.content.startsWith('[Image Attached]') && (
                                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '24px', borderRadius: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    <div style={{ fontSize: '15px', lineHeight: '1.5' }}>{msg.content.replace('[Image Attached] ', '')}</div>
                                </div>
                            ))
                        )}
                        {isSendingMsg && (
                            <div style={{ alignSelf: 'flex-end', color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Sending...</div>
                        )}
                    </div>

                    <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={handleImageUpload} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
                            <Camera size={22} />
                        </button>
                        <input 
                            type="text"
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage(message)}
                            placeholder="Type a message..." 
                            style={{ flex: 1, padding: '14px 20px', borderRadius: '100px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '15px', background: '#f8fafc' }} 
                        />
                        <button onClick={() => handleSendMessage(message)} disabled={isSendingMsg || !message.trim()} style={{ background: message.trim() ? '#4f46e5' : '#e2e8f0', color: message.trim() ? 'white' : '#94a3b8', border: 'none', padding: '14px', borderRadius: '50%', cursor: message.trim() ? 'pointer' : 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s', boxShadow: message.trim() ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none' }}>
                            <Send size={20} style={{ transform: 'translateX(2px)' }} />
                        </button>
                    </div>
                </div>
            )}

            <button onClick={shareLocation} style={{ background: 'white', color: '#0f172a', border: '1px solid rgba(0,0,0,0.05)', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', width: '100%', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', transition: 'all 0.2s', fontSize: '20px', fontWeight: '700' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '50%' }}>
                  <MapPin size={28} color="#ef4444" />
              </div>
              Send Live Location
            </button>

          </div>
        )}

      </main>
      
      <style>{
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15%); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      }</style>
    </div>
  );
}

function Home() {
    const [tagId, setTagId] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    
    useEffect(() => {
        if (isScanning) {
            const scanner = new Html5QrcodeScanner(
                'reader',
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );
            
            scanner.render((decodedText) => {
                scanner.clear();
                setIsScanning(false);
                if (decodedText.includes('/scan/')) {
                    const url = new URL(decodedText);
                    window.location.href = url.pathname + url.search;
                } else {
                    alert('Invalid NotifyMe QR Code');
                }
            }, (error) => {});
            
            return () => { scanner.clear().catch(e => console.error(e)); };
        }
    }, [isScanning]);
    
    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <main className="animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '48px 32px', background: 'white', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.02)', textAlign: 'center' }}>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
                    <NotifyMeLogo size={80} />
                </div>
                <h1 style={{ margin: '0 0 12px', color: '#0f172a', fontSize: '32px', letterSpacing: '-1px' }}>NotifyMe Scanner</h1>
                <p style={{ color: '#64748b', margin: '0 0 40px', fontSize: '16px', lineHeight: '1.5' }}>Scan a secure QR code or enter a Tag ID manually.</p>
                
                {isScanning ? (
                    <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
                        <div id="reader" style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '2px solid #e2e8f0' }}></div>
                        <button 
                            onClick={() => setIsScanning(false)}
                            style={{ marginTop: '20px', background: '#f1f5f9', color: '#64748b', border: 'none', padding: '16px', borderRadius: '16px', fontWeight: '700', fontSize: '16px', width: '100%', cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
                        >
                            Cancel Scan
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <button 
                            onClick={() => setIsScanning(true)}
                            style={{ background: 'linear-gradient(135deg, #1d9bf0 0%, #005bb5 100%)', color: 'white', border: 'none', padding: '20px', borderRadius: '20px', fontWeight: '700', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 20px rgba(29, 155, 240, 0.25)', transition: 'transform 0.1s' }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <ScanLine size={24} /> Scan QR Code
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '14px', margin: '8px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                            <span style={{ fontWeight: '600', letterSpacing: '1px' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input 
                                type="text" 
                                value={tagId}
                                onChange={e => setTagId(e.target.value)}
                                placeholder="Enter Secure ID" 
                                style={{ padding: '18px', borderRadius: '16px', border: '2px solid #e2e8f0', fontSize: '14px', textAlign: 'center', letterSpacing: '1px', outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc' }}
                                onFocus={e => e.currentTarget.style.borderColor = '#1d9bf0'}
                                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                            />
                            <button 
                                onClick={() => { if (tagId.trim()) window.location.href = '/scan/' + tagId.trim(); }}
                                style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '16px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                            >
                                Look Up QR
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <style>{.animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }}</style>
        </div>
    );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/scan/:uuid" element={<ScannerProfile />} />
    </Routes>
  );
}
export default App;

