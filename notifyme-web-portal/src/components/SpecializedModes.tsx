import React from 'react';
import { Car, Home, TriangleAlert, Briefcase, Zap, Shield, Phone, Bell, MapPin, Search } from 'lucide-react';

export default function SpecializedModes({ mode }: { mode: 'vehicle' | 'home' | 'emergency' | 'business' }) {
  const getModeDetails = () => {
    switch (mode) {
      case 'vehicle': return { title: 'Vehicle Mode', icon: <Car size={24} color="#4f46e5" />, desc: 'Manage alerts for your car, bike, or truck.', bgColor: '#e0e7ff', btnColor: '#4f46e5',
        templates: [
            { icon: <Zap size={20} />, name: 'Lights Left On', desc: 'Pre-filled message alert' },
            { icon: <TriangleAlert size={20} />, name: 'Blocking Vehicle', desc: 'Pre-filled message alert' },
            { icon: <Shield size={20} />, name: 'Window Open', desc: 'Pre-filled message alert' }
        ]
      };
      case 'home': return { title: 'Home Mode', icon: <Home size={24} color="#10b981" />, desc: 'Secure your deliveries and visitor logs.', bgColor: '#ecfdf5', btnColor: '#10b981',
        templates: [
            { icon: <Bell size={20} />, name: 'Visitor Arrived', desc: 'Pre-filled message alert' },
            { icon: <MapPin size={20} />, name: 'Package Delivered', desc: 'Pre-filled message alert' },
            { icon: <Phone size={20} />, name: 'Maintenance Visit', desc: 'Pre-filled message alert' }
        ]
      };
      case 'emergency': return { title: 'Emergency Mode', icon: <TriangleAlert size={24} color="#ef4444" />, desc: 'Configure SOS contacts and medical notes.', bgColor: '#fef2f2', btnColor: '#ef4444',
        templates: [
            { icon: <Phone size={20} />, name: 'SOS Contacts', desc: 'Manage your emergency contacts' },
            { icon: <Shield size={20} />, name: 'Medical Info', desc: 'Blood group and allergies' },
            { icon: <Zap size={20} />, name: 'Roadside Assist', desc: 'Quick dial mechanics' }
        ]
      };
      case 'business': return { title: 'Business Mode', icon: <Briefcase size={24} color="#f59e0b" />, desc: 'Manage reception and customer support QRs.', bgColor: '#fffbeb', btnColor: '#f59e0b',
        templates: [
            { icon: <Search size={20} />, name: 'Reception QR', desc: 'Visitor management' },
            { icon: <Phone size={20} />, name: 'Customer Support', desc: 'Direct routing' },
            { icon: <MapPin size={20} />, name: 'Delivery QR', desc: 'Vendor routing' }
        ]
      };
    }
  };

  const config = getModeDetails();

  return (
    <>
      <div className="header-actions">
        <div>
          <h1>{config.title}</h1>
          <p>{config.desc}</p>
        </div>
        <button style={{ padding: '12px 24px', background: config.btnColor, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Configure Settings
        </button>
      </div>

      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ background: config.bgColor, width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {config.icon}
              </div>
              <div>
                  <h2 style={{ margin: '0 0 8px', color: '#0f172a' }}>Activate {config.title}</h2>
                  <p style={{ margin: 0, color: '#64748b' }}>Link a specific QR Tag to this mode to enable specialized quick-action templates for the scanner.</p>
              </div>
          </div>
          <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                  <option>Select a QR Tag to link...</option>
                  <option>My Tesla (OPTIONAL-123)</option>
                  <option>Office Keys</option>
              </select>
          </div>
      </div>

      <h3 style={{ margin: '0 0 20px', color: '#0f172a' }}>Quick Action Templates</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {config.templates.map(template => (
              <div key={template.name} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ background: config.bgColor, color: config.btnColor, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      {template.icon}
                  </div>
                  <h4 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '18px' }}>{template.name}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{template.desc}</p>
              </div>
          ))}
      </div>
    </>
  );
}
