import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MessageCircle, AlertCircle, CheckCircle, Send, X } from 'lucide-react';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

export default function SupportTab() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE}/tickets`, { headers: { Authorization: `Bearer ${token}` } });
      setTickets(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    
    const socket = io(SOCKET_URL);
    socket.on('admin_notification', (data: any) => {
        if (data.type === 'new_ticket' || data.type === 'ticket_closed') {
            fetchTickets();
        }
    });
    
    return () => {
        socket.disconnect();
    };
  }, []);

  const handleReply = async () => {
      if (!replyText.trim() || !selectedTicket) return;
      try {
          const token = localStorage.getItem('adminToken');
          await axios.post(`${API_BASE}/tickets/${selectedTicket.id}/reply`, { adminReply: replyText }, { headers: { Authorization: `Bearer ${token}` } });
          setReplyText('');
          fetchTickets();
          setSelectedTicket(null);
      } catch (err) {
          console.error(err);
      }
  };
  
  const handleCloseTicket = async (id: string) => {
      if (!window.confirm('Are you sure you want to close this ticket?')) return;
      try {
          const token = localStorage.getItem('adminToken');
          await axios.post(`${API_BASE}/tickets/${id}/close`, {}, { headers: { Authorization: `Bearer ${token}` } });
          fetchTickets();
          if (selectedTicket?.id === id) setSelectedTicket(null);
      } catch (err) {
          console.error(err);
      }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading tickets...</div>;

  return (
    <>
      <div className="header-actions">
        <div><h1>Support Ticket System</h1><p>Manage customer inquiries and technical support requests.</p></div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
              <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Search tickets by ID, user, or subject..." style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#0f172a' }}>
                  <Filter size={18} /> Filter Status
                </button>
              </div>

              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div className="table-responsive"><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', color: '#64748b' }}>Ticket ID</th>
                            <th style={{ padding: '16px 24px', color: '#64748b' }}>User</th>
                            <th style={{ padding: '16px 24px', color: '#64748b' }}>Subject</th>
                            <th style={{ padding: '16px 24px', color: '#64748b' }}>Status</th>
                            <th style={{ padding: '16px 24px', color: '#64748b' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', background: selectedTicket?.id === ticket.id ? '#eff6ff' : 'white' }}>
                                <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#4f46e5' }}>{ticket.id.substring(0,8).toUpperCase()}</td>
                                <td style={{ padding: '16px 24px', color: '#0f172a', fontWeight: 'bold' }}>{ticket.user}</td>
                                <td style={{ padding: '16px 24px', color: '#475569' }}>{ticket.subject}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ 
                                        background: ticket.status === 'closed' ? '#f1f5f9' : ticket.status === 'open' ? '#fef2f2' : '#fef3c7', 
                                        color: ticket.status === 'closed' ? '#64748b' : ticket.status === 'open' ? '#ef4444' : '#d97706', 
                                        padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold' 
                                    }}>
                                        {ticket.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', color: '#475569' }}>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {tickets.length === 0 && <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No tickets found</td></tr>}
                    </tbody>
                </table></div>
              </div>
          </div>
          
          {selectedTicket && (
              <div style={{ width: '400px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>Ticket Details</h3>
                      <button onClick={() => setSelectedTicket(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
                  </div>
                  <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                      <h4 style={{ margin: '0 0 8px' }}>Subject</h4>
                      <p style={{ margin: '0 0 16px', color: '#475569' }}>{selectedTicket.subject}</p>
                      <h4 style={{ margin: '0 0 8px' }}>Description</h4>
                      <p style={{ margin: '0 0 16px', color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>{selectedTicket.description}</p>
                      
                      {selectedTicket.adminReply && (
                          <>
                              <h4 style={{ margin: '0 0 8px' }}>Admin Reply</h4>
                              <p style={{ margin: '0 0 16px', color: '#0f172a', background: '#eff6ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #4f46e5' }}>{selectedTicket.adminReply}</p>
                          </>
                      )}
                      
                      {selectedTicket.status !== 'closed' && (
                          <button onClick={() => handleCloseTicket(selectedTicket.id)} style={{ width: '100%', padding: '12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '16px' }}>
                              Close Ticket
                          </button>
                      )}
                  </div>
                  
                  {selectedTicket.status !== 'closed' && (
                      <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
                          <h4 style={{ margin: '0 0 12px' }}>Send Reply</h4>
                          <textarea 
                              value={replyText} 
                              onChange={e => setReplyText(e.target.value)} 
                              placeholder="Type your response to the user..."
                              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '100px', marginBottom: '12px', resize: 'vertical' }}
                          />
                          <button onClick={handleReply} style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <Send size={18} /> Send Reply
                          </button>
                      </div>
                  )}
              </div>
          )}
      </div>
    </>
  );
}

