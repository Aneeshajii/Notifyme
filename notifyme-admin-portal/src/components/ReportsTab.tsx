import React from 'react';
import { Download, FileText, FileSpreadsheet, AlertTriangle } from 'lucide-react';

export default function ReportsTab() {
  const handleExportCSV = (type: string) => {
    // Simulated CSV Export
    const csvContent = "data:text/csv;charset=utf-8,ID,Name,Email\n1,Aneesh,admin@notifyme.com\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="header-actions">
        <div><h1>Reports & Exports</h1><p>Generate and download platform data for analysis and compliance.</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#e0e7ff', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UsersIcon />
          </div>
          <h3 style={{ margin: 0, color: '#0f172a' }}>User Data Report</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0, flex: 1 }}>Export a complete list of registered users, their join dates, and locations.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => handleExportCSV('users')} style={{ flex: 1, padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} /> CSV
            </button>
            <button onClick={() => alert('PDF generation requires backend service.')} style={{ flex: 1, padding: '10px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FileText size={18} /> PDF
            </button>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#ecfdf5', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RevenueIcon />
          </div>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Revenue Report</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0, flex: 1 }}>Detailed export of all Premium subscription transactions and refunds.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => handleExportCSV('revenue')} style={{ flex: 1, padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} /> CSV
            </button>
            <button onClick={() => alert('PDF generation requires backend service.')} style={{ flex: 1, padding: '10px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FileText size={18} /> PDF
            </button>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#fef2f2', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle color="#ef4444" size={24} />
          </div>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Abuse & Spam Report</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0, flex: 1 }}>Export list of blocked users, flagged QR tags, and reported messages.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => handleExportCSV('abuse')} style={{ flex: 1, padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FileSpreadsheet size={18} /> CSV
            </button>
            <button onClick={() => alert('PDF generation requires backend service.')} style={{ flex: 1, padding: '10px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FileText size={18} /> PDF
            </button>
          </div>
        </div>

      </div>
    </>
  );
}

// Icons
function UsersIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>; }
function RevenueIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>; }
