import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, ShieldCheck, Zap, Lock, ScanLine, Phone } from 'lucide-react';

interface QRDownloadModalProps {
    tag: any;
    onClose: () => void;
}

const QRDownloadModal: React.FC<QRDownloadModalProps> = ({ tag, onClose }) => {
    const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

    const simpleRef = useRef<HTMLDivElement>(null);
    const premiumRef = useRef<HTMLDivElement>(null);
    const namedRef = useRef<HTMLDivElement>(null);

    const handleDownload = async (ref: React.RefObject<HTMLDivElement>, index: number, name: string) => {
        if (!ref.current) return;
        setDownloadingIndex(index);
        try {
            const canvas = await html2canvas(ref.current, {
                scale: 3, // High resolution
                backgroundColor: null,
                useCORS: true,
                logging: false
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `${name}_NotifyMe_QR.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error generating QR:", error);
            alert("Failed to download QR code. Please try again.");
        } finally {
            setDownloadingIndex(null);
        }
    };

    // The premium design block used for options 2 and 3
    const renderPremiumDesign = (includeName: boolean) => (
        <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            padding: '40px',
            borderRadius: '24px',
            color: 'white',
            width: '400px',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 2px rgba(99, 102, 241, 0.2), 0 20px 40px -10px rgba(0,0,0,0.5)',
            fontFamily: '"Inter", sans-serif'
        }}>
            {/* Background elements */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0) 70%)', filter: 'blur(30px)' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(168,85,247,0) 70%)', filter: 'blur(30px)' }} />
            
            {/* Dots pattern */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', opacity: 0.3 }}>
                {[...Array(9)].map((_, i) => <div key={i} style={{ width: '4px', height: '4px', background: '#818cf8', borderRadius: '50%' }} />)}
            </div>
            
            <div style={{ position: 'absolute', bottom: '100px', right: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', opacity: 0.3 }}>
                {[...Array(9)].map((_, i) => <div key={i} style={{ width: '4px', height: '4px', background: '#818cf8', borderRadius: '50%' }} />)}
            </div>

            {/* Top decorative lines */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', borderRight: '2px solid rgba(99,102,241,0.5)', borderTop: '2px solid rgba(99,102,241,0.5)', width: '20px', height: '20px', borderRadius: '0 4px 0 0' }} />
            <div style={{ position: 'absolute', top: '20px', left: '60px', borderTop: '2px solid rgba(99,102,241,0.5)', width: '20px', height: '2px' }} />

            {/* Header */}
            <div style={{ textAlign: 'center', zIndex: 10 }}>
                {includeName && (
                    <h2 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '2px', background: 'linear-gradient(to right, #fff, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>
                        {tag.name}
                    </h2>
                )}
                <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', letterSpacing: '1px', color: '#fff' }}>
                    SCAN TO <span style={{ color: '#a855f7' }}>REACH ME</span>
                </h3>
            </div>

            {/* QR Code Area */}
            <div style={{ 
                background: 'white', 
                padding: '16px', 
                borderRadius: '20px', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), 0 0 0 4px rgba(255,255,255,0.1)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginTop: '10px'
            }}>
                <img src={tag.qrCodeDataUrl} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block', imageRendering: 'crisp-edges' }} />
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    background: '#1e1b4b',
                    padding: '8px',
                    borderRadius: '8px',
                    boxShadow: '0 0 0 4px white'
                }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#a855f7', display: 'block', lineHeight: 1 }}>N</span>
                </div>
            </div>

            {/* Floating icons */}
            <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', background: 'rgba(30,27,75,0.8)', padding: '10px', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(4px)' }}>
                <Phone size={20} color="#a855f7" />
            </div>
            <div style={{ position: 'absolute', top: '50%', right: '16px', transform: 'translateY(-50%)', background: 'rgba(30,27,75,0.8)', padding: '10px', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(4px)' }}>
                <ScanLine size={20} color="#a855f7" />
            </div>

            {/* Footer Branding */}
            <div style={{ textAlign: 'center', zIndex: 10, width: '100%', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '32px', fontWeight: '900', color: '#a855f7', display: 'block', lineHeight: 1 }}>N</span>
                    <span style={{ fontSize: '32px', fontWeight: '800', color: 'white', letterSpacing: '-1px' }}>Notify<span style={{color: '#a855f7'}}>Me</span></span>
                </div>
                
                <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#94a3b8', fontWeight: '600', marginBottom: '24px' }}>
                    CONNECT &bull; SHARE &bull; COMMUNICATE
                </div>

                <div style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '12px', 
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={14} color="#a855f7" />
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '700' }}>PRIVATE</div>
                            <div style={{ fontSize: '9px', color: 'white', fontWeight: '500' }}>BY DESIGN</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={14} color="#a855f7" />
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '700' }}>INSTANT</div>
                            <div style={{ fontSize: '9px', color: 'white', fontWeight: '500' }}>CONNECT</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={14} color="#a855f7" />
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '700' }}>SECURE</div>
                            <div style={{ fontSize: '9px', color: 'white', fontWeight: '500' }}>PLATFORM</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
            padding: '20px'
        }}>
            <div style={{
                background: '#f8fafc',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '1200px',
                maxHeight: '95vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                overflow: 'hidden'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', background: 'white', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '24px', fontWeight: '800' }}>Choose Your QR Design</h2>
                        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Download a high-resolution PNG for printing or sharing.</p>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', padding: '12px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '32px', overflowY: 'auto', display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
                    
                    {/* OPTION 1: SIMPLE QR */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: '1', minWidth: '300px', maxWidth: '350px', width: '100%' }}>
                        <h3 style={{ margin: 0, textAlign: 'center', color: '#334155' }}>1. Simple QR</h3>
                        <div style={{ 
                            background: '#e2e8f0', 
                            padding: '16px', 
                            borderRadius: '24px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '550px'
                        }}>
                            {/* The render block to screenshot */}
                            <div ref={simpleRef} style={{ background: 'white', padding: '40px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <img src={tag.qrCodeDataUrl} alt="Simple QR" style={{ width: '250px', height: '250px', display: 'block', imageRendering: 'crisp-edges' }} />
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDownload(simpleRef, 1, 'Simple')} 
                            disabled={downloadingIndex !== null}
                            style={{ padding: '16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)', opacity: downloadingIndex === 1 ? 0.7 : 1 }}
                        >
                            <Download size={20} /> {downloadingIndex === 1 ? 'Generating...' : 'Download Simple QR'}
                        </button>
                    </div>

                    {/* OPTION 2: PREMIUM DESIGN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: '1', minWidth: '350px', maxWidth: '420px', width: '100%' }}>
                        <h3 style={{ margin: 0, textAlign: 'center', color: '#334155' }}>2. Premium Design</h3>
                        <div style={{ 
                            background: '#e2e8f0', 
                            padding: '16px', 
                            borderRadius: '24px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '550px',
                            overflow: 'hidden'
                        }}>
                            {/* We use a wrapper with transform scale for preview so it fits nicely, but html2canvas captures actual size */}
                            <div style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
                                <div ref={premiumRef}>
                                    {renderPremiumDesign(false)}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDownload(premiumRef, 2, 'Premium')} 
                            disabled={downloadingIndex !== null}
                            style={{ padding: '16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px 0 rgba(15, 23, 42, 0.39)', opacity: downloadingIndex === 2 ? 0.7 : 1 }}
                        >
                            <Download size={20} /> {downloadingIndex === 2 ? 'Generating...' : 'Download Premium QR'}
                        </button>
                    </div>

                    {/* OPTION 3: NAMED DESIGN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: '1', minWidth: '350px', maxWidth: '420px', width: '100%' }}>
                        <h3 style={{ margin: 0, textAlign: 'center', color: '#334155' }}>3. Named Premium</h3>
                        <div style={{ 
                            background: '#e2e8f0', 
                            padding: '16px', 
                            borderRadius: '24px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '550px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
                                <div ref={namedRef}>
                                    {renderPremiumDesign(true)}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDownload(namedRef, 3, 'Named')} 
                            disabled={downloadingIndex !== null}
                            style={{ padding: '16px', background: 'linear-gradient(135deg, #a855f7 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px 0 rgba(168, 85, 247, 0.39)', opacity: downloadingIndex === 3 ? 0.7 : 1 }}
                        >
                            <Download size={20} /> {downloadingIndex === 3 ? 'Generating...' : 'Download Named QR'}
                        </button>
                    </div>

                </div>
            </div>
            
            {/* Mobile responsiveness styles added directly inline or via CSS, here we use inline wrapper scaling and flexWrap */}
        </div>
    );
};

export default QRDownloadModal;
