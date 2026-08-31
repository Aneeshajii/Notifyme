import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, MessageSquare, AlertCircle, Clock, X, Send, BadgeCheck, ShieldCheck } from 'lucide-react';

const GetNotifyeLogo = ({ size = 48 }: { size?: number }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #1d9bf0 0%, #005bb5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <ShieldCheck size={size * 0.55} color="white" />
    </div>
);
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function SupportCenter({ user }: any) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [issueType, setIssueType] = useState('Select an issue...');
  const [description, setDescription] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const fetchTickets = async () => {
      try {
          const token = localStorage.getItem('userToken');
          const res = await axios.get(`${API_BASE}/tickets/my`, { headers: { Authorization: `Bearer ${token}` } });
          setTickets(res.data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      if (user) {
          fetchTickets();
          
          const socket = io(SOCKET_URL, { transports: ['websocket'] });
          socket.on(`user-${user.id}-notification`, (data: any) => {
              if (data.type === 'ticket_reply' || data.type === 'ticket_closed') {
                  fetchTickets();
              }
          });
          
          return () => {
              socket.disconnect();
          };
      }
  }, [user]);

  const handleSubmit = async () => {
      if (issueType === 'Select an issue...' || !description.trim()) {
          alert('Please provide a subject and description');
          return;
      }
      try {
          const token = localStorage.getItem('userToken');
          await axios.post(`${API_BASE}/tickets`, { subject: issueType, description, priority: 'medium' }, { headers: { Authorization: `Bearer ${token}` } });
          setShowContactModal(false);
          setIssueType('Select an issue...');
          setDescription('');
          alert('Your support ticket has been submitted successfully! We will contact you soon.');
          fetchTickets();
      } catch (err) {
          console.error(err);
      }
  };

  const handleCloseTicket = async (id: string) => {
      if (!window.confirm('Are you sure you want to close this ticket?')) return;
      try {
          const token = localStorage.getItem('userToken');
          await axios.post(`${API_BASE}/tickets/${id}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });
          fetchTickets();
          if (selectedTicket?.id === id) setSelectedTicket(null);
      } catch (err) {
          console.error(err);
      }
  };

  return (
    <>
      <div className="header-actions">
        <div><h1>Support Center</h1><p>Get help and manage your support tickets.</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ background: '#e0e7ff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <BookOpen color="#4f46e5" size={24} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Knowledge Base</h3>
              <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px' }}>Browse articles and guides to learn how to use GetNotifye.</p>
              <button onClick={() => window.open('/GetNotifye_Manual.pdf', '_blank')} style={{ width: '100%', padding: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>View Articles</button>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ background: '#ecfdf5', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <MessageSquare color="#10b981" size={24} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Contact Customer Care</h3>
              <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px' }}>Submit a ticket directly to our support team.</p>
              <button onClick={() => setShowContactModal(true)} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Create Ticket</button>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <div style={{ background: '#fef2f2', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <AlertCircle color="#ef4444" size={24} />
              </div>
              <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Report Abuse</h3>
              <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px' }}>Report suspicious activity or spam messages.</p>
              <button onClick={() => alert("Opening Abuse Report Form...")} style={{ width: '100%', padding: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Report Issue</button>
          </div>
      </div>

      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 24px', color: '#0f172a', fontSize: '20px' }}>Your Recent Support Tickets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading tickets...</div>
              ) : tickets.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>You haven't submitted any support tickets yet.</div>
              ) : (
                  tickets.map(ticket => (
                      <div key={ticket.id} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '20px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc' }}>
                          <div style={{ 
                              background: ticket.status === 'closed' ? '#f1f5f9' : ticket.status === 'responded' ? '#dcfce7' : '#fef9c3', 
                              color: ticket.status === 'closed' ? '#64748b' : ticket.status === 'responded' ? '#16a34a' : '#ca8a04', 
                              padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', width: '120px', textAlign: 'center' 
                          }}>
                              {ticket.status.toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>{ticket.subject}</h4>
                              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Ticket #{ticket.id.substring(0,8).toUpperCase()} - Opened by you</p>
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Clock size={16} /> {new Date(ticket.createdAt).toLocaleDateString()}
                          </div>
                          <button onClick={() => setSelectedTicket(ticket)} style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>View</button>
                      </div>
                  ))
              )}
          </div>
      </div>

      {selectedTicket && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Ticket #{selectedTicket.id.substring(0,8).toUpperCase()}</h2>
                <button onClick={() => setSelectedTicket(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 8px' }}>Subject</h4>
                  <p style={{ margin: 0, color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>{selectedTicket.subject}</p>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 8px' }}>Description</h4>
                  <p style={{ margin: 0, color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>{selectedTicket.description}</p>
              </div>

              {selectedTicket.adminReply && (
                  <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <GetNotifyeLogo size={24} />
                          <h4 style={{ margin: 0, color: '#111b21', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              GetNotifye <BadgeCheck size={16} color="#1d9bf0" />
                          </h4>
                      </div>
                      <div style={{ background: '#f0f7ff', padding: '16px', borderRadius: '12px', border: '1px solid #cce4ff', color: '#111b21', fontSize: '15px', lineHeight: '1.5', position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <div style={{ position: 'absolute', top: '-6px', left: '16px', width: '12px', height: '12px', background: '#f0f7ff', borderLeft: '1px solid #cce4ff', borderTop: '1px solid #cce4ff', transform: 'rotate(45deg)' }}></div>
                          {selectedTicket.adminReply}
                      </div>
                  </div>
              )}

              {selectedTicket.status !== 'closed' && (
                  <button onClick={() => handleCloseTicket(selectedTicket.id)} style={{ width: '100%', padding: '16px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Close Ticket (Issue Resolved)
                  </button>
              )}
            </div>
          </div>
      )}

      {/* Contact Customer Care Modal */}
      {showContactModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Create Support Ticket</h2>
              <button onClick={() => setShowContactModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>What do you need help with?</label>
                <select 
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }}
                >
                  <option disabled>Select an issue...</option>
                  <option>Tag is not scanning</option>
                  <option>Unable to update location</option>
                  <option>Payment / Subscription issue</option>
                  <option>Lost physical tag</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569', fontSize: '14px' }}>Please describe your problem</label>
                <textarea 
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about the issue you are facing..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none', resize: 'vertical' }}
                ></textarea>
              </div>

              <button 
                onClick={handleSubmit}
                style={{ width: '100%', padding: '16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '8px' }}
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
