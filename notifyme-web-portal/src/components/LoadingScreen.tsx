import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

const LoadingScreen = () => {
    const [msgIndex, setMsgIndex] = useState(0);
    const messages = [
        "Please wait, NotifyMe is getting things ready for you…",
        "Missing something? NotifyMe lets you create a custom message so people know what to do when they scan your QR.",
        "Your car, wallet, keys and more can stay connected with NotifyMe."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % messages.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading-screen-container fade-out-transition">
            <div className="animated-logo-container">
                <Shield className="animated-shield" size={64} />
            </div>
            
            <div className="loading-message-container">
                {messages.map((msg, idx) => (
                    <p key={idx} className={`loading-text ${idx === msgIndex ? 'active' : ''}`}>
                        {msg}
                    </p>
                ))}
            </div>

            <style>{`
                .loading-screen-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: #f8fafc;
                    padding: 0 20px;
                    text-align: center;
                }
                
                .animated-logo-container {
                    animation: gentlePulse 3s ease-in-out infinite alternate;
                    margin-bottom: 24px;
                    color: #4f46e5;
                }
                
                @keyframes gentlePulse { 
                    0% { transform: scale(1); opacity: 0.9; }
                    100% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 10px rgba(79, 70, 229, 0.3)); }
                }

                .loading-message-container {
                    position: relative;
                    height: 60px; /* enough space for two lines if strictly needed on tiny screens, though we aim for one */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    max-width: 600px;
                }

                .loading-text {
                    position: absolute;
                    width: 100%;
                    color: #64748b;
                    font-weight: 500;
                    font-size: 16px;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: opacity 0.8s ease, transform 0.8s ease;
                    pointer-events: none;
                }

                .loading-text.active {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* Mobile responsiveness */
                @media (max-width: 768px) {
                    .loading-text {
                        font-size: 13px; /* Slightly smaller to fit naturally in one line */
                    }
                    .animated-logo-container {
                        transform: scale(0.9);
                    }
                }

                .fade-out-transition {
                    animation: appFadeIn 0.4s ease-out forwards;
                }
                @keyframes appFadeIn {
                    from { opacity: 0; transform: scale(0.99); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
