const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middleware/auth');

const scanForSecurityThreats = (message) => {
    const lowerMsg = message.toLowerCase();
    
    const sqlInjection = /('|"|;|--|\/\*|\*\/|union\s+select|drop\s+table)/i;
    const isSafePasswordReq = /(change|reset|forgot|update|lost).*(password|pass|pin)/i.test(lowerMsg);
    const maliciousCreds = /(give|show|what is|reveal|send|all|get|database).*(password|token|secret|jwt|credential)/i;
    const adminAccess = /(master admin|admin panel|root|sudo|system variables|env)/i;

    if (sqlInjection.test(lowerMsg)) {
        return { isThreat: true, level: 'CRITICAL', reason: 'Possible SQL Injection attempt detected.' };
    }
    
    if (!isSafePasswordReq && maliciousCreds.test(lowerMsg)) {
        return { isThreat: true, level: 'HIGH', reason: 'Attempt to request or bypass authentication secrets.' };
    }

    if (adminAccess.test(lowerMsg)) {
        return { isThreat: true, level: 'HIGH', reason: 'Attempt to access Master Admin or system configuration.' };
    }

    return { isThreat: false };
};

// Advanced Regex Intent Classifier
const detectIntent = (msg, contextMsg) => {
    const lowerMsg = msg.toLowerCase();
    const ctx = contextMsg.toLowerCase();
    
    // HUMAN_SUPPORT_REQUEST
    if (/(talk|speak|connect|chat|contact|need|want|help|pls|please).*(agent|human|person|customer care|support|owner|someone|real person|representative)/i.test(lowerMsg) ||
        /^(agent|human|support|someone|customer care|help me|real person|talk to someone|customer care bro|agent please|i want customer care)$/i.test(lowerMsg) ||
        // Contextual follow-up
        (/(someone|agent|human)/i.test(lowerMsg) && /(troubleshooting|problem|help)/i.test(ctx))) {
        return 'HUMAN_SUPPORT_REQUEST';
    }

    // CREATE_QR
    if (/(create|make|new|generate|build|get).*(qr|tag)/i.test(lowerMsg)) {
        return 'CREATE_QR';
    }

    // QR_PROBLEM
    if (/(qr|tag|scan).*(not working|broken|error|fail|problem|issue|wont work)/i.test(lowerMsg) || 
        /(problem with my qr)/i.test(lowerMsg)) {
        return 'QR_PROBLEM';
    }

    // QR_HELP
    if (/(qr|tag).*(how|what|where)/i.test(lowerMsg)) {
        return 'QR_HELP';
    }

    // SUBSCRIPTION_HELP / UPGRADE
    if (/(renew|upgrade|get premium|what plan|how much is premium|pricing|cost|pay|premium|gold|basic)/i.test(lowerMsg)) {
        return 'SUBSCRIPTION_HELP';
    }

    // PAYMENT_HELP
    if (/(payment|card|pay|transaction|checkout|charge|bill).*(not working|fail|error|problem|issue)/i.test(lowerMsg)) {
        return 'PAYMENT_HELP';
    }

    // ACCOUNT_HELP (Password)
    if (/(change|reset|forgot|update|lost).*(password|pass|pin)/i.test(lowerMsg)) {
        return 'ACCOUNT_HELP_PASSWORD';
    }

    // PRIVACY_HELP
    if (/(privacy|secure|private|hide|anonymous)/i.test(lowerMsg)) {
        return 'PRIVACY_HELP';
    }

    // BLOCK_USER
    if (/(block|report|harass|bothering me|stop someone)/i.test(lowerMsg)) {
        return 'BLOCK_USER';
    }

    // YES / CONFIRMATION (Contextual)
    if (/^(yes|yeah|yep|sure|ok|okay|do it|please|y|ya|ha|haan)\b/i.test(lowerMsg)) {
        if (ctx.includes('support chat or create a support ticket') || ctx.includes('open the Support Center') || ctx.includes('troubleshoot')) return 'HUMAN_SUPPORT_REQUEST';
        if (ctx.includes('Security Settings') || ctx.includes('change your password')) return 'ACCOUNT_HELP_PASSWORD_CONFIRM';
        if (ctx.includes('Subscriptions section')) return 'SUBSCRIPTION_HELP_CONFIRM';
        if (ctx.includes('QR creation page')) return 'CREATE_QR_CONFIRM';
        if (ctx.includes('Privacy Center')) return 'PRIVACY_HELP_CONFIRM';
        return 'CONFIRM_GENERAL';
    }

    // NO / DISMISSAL
    if (/^(no|nope|nah|nevermind|nothing|cancel|stop)$/i.test(lowerMsg)) {
        return 'DISMISSAL';
    }

    // GREETINGS
    if (/^(hello|hi|hey|hii+|namaste|hola)(?:\s.*)?$/i.test(lowerMsg)) {
        return 'GREETING';
    }

    // THANKS
    if (/^(thanks|thank you|ty|tq|dhanyavad)$/i.test(lowerMsg)) {
        return 'THANKS';
    }

    return 'UNKNOWN';
};


router.post('/chat', verifyToken, async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        if (!message) return res.status(400).json({ error: 'Message is required.' });

        const securityCheck = scanForSecurityThreats(message);
        
        if (securityCheck.isThreat) {
            const alert = await prisma.securityAlert.create({
                data: {
                    userId: req.user.id,
                    riskLevel: securityCheck.level,
                    reason: securityCheck.reason,
                    explanation: `The user sent a message that triggered our security patterns: "${message}"`,
                    status: 'new'
                }
            });

            await prisma.auditLog.create({
                data: {
                    adminId: 'SYSTEM_AI',
                    action: 'SECURITY_ALERT_GENERATED',
                    entityId: req.user.id,
                    details: JSON.stringify({ alertId: alert.id, reason: securityCheck.reason, userPrompt: message }),
                    ipAddress: req.ip || req.connection.remoteAddress
                }
            });

            return res.json({
                response: "I'm sorry, but I cannot fulfill that request due to security policies. If you need assistance, please contact support.",
                action: null,
                quickActions: [{ label: 'Contact Support', action: 'OPEN_SUPPORT' }]
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { subscription: true, tags: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found.' });

        const lastAiMsg = [...conversationHistory].reverse().find(m => m.sender === 'ai')?.text || '';
        const intent = detectIntent(message, lastAiMsg);

        let aiResponse = "";
        let action = null;
        let quickActions = [];

        switch (intent) {
            case 'HUMAN_SUPPORT_REQUEST':
                aiResponse = "Sure 👍 I can help you contact NotifyMe Support. Would you like to start a support chat or create a support ticket?";
                quickActions = [{ label: 'Start Support Chat', action: 'OPEN_SUPPORT' }, { label: 'Create Ticket', action: 'OPEN_SUPPORT' }];
                break;
            
            case 'QR_PROBLEM':
                aiResponse = "I'm sorry to hear your QR code is having issues. Would you like help troubleshooting the QR, or do you want to contact support?";
                quickActions = [{ label: 'Contact Support', action: 'OPEN_SUPPORT' }, { label: 'My QR Codes', action: 'OPEN_QR' }];
                break;

            case 'CREATE_QR':
            case 'CREATE_QR_CONFIRM':
                const limit = user.subscription?.maxQrCodes || (user.isPremium ? 10 : 1);
                const current = user.tags.length;
                aiResponse = `You have created ${current} out of ${limit} QR codes. Want me to open the QR creation page?`;
                action = intent === 'CREATE_QR_CONFIRM' ? 'OPEN_QR' : null;
                quickActions = [{ label: 'Create QR', action: 'OPEN_QR' }, { label: 'My QR Codes', action: 'OPEN_QR' }];
                break;

            case 'QR_HELP':
                aiResponse = "NotifyMe QR codes help people contact you safely without revealing your phone number. Would you like to create one?";
                quickActions = [{ label: 'Create QR', action: 'OPEN_QR' }];
                break;

            case 'SUBSCRIPTION_HELP':
            case 'SUBSCRIPTION_HELP_CONFIRM':
                const plan = user.isPremium ? 'Premium' : 'Free';
                aiResponse = `You're currently on the ${plan} plan. You can upgrade or manage it from the Subscriptions section. I can also show you the available plans.`;
                action = intent === 'SUBSCRIPTION_HELP_CONFIRM' ? 'OPEN_SUBSCRIPTION' : null;
                quickActions = [{ label: 'View Plans', action: 'OPEN_SUBSCRIPTION' }];
                break;

            case 'PAYMENT_HELP':
                aiResponse = "I see you're having trouble with a payment. Our support team can help you with billing issues immediately. Would you like to contact them?";
                quickActions = [{ label: 'Contact Support', action: 'OPEN_SUPPORT' }];
                break;

            case 'ACCOUNT_HELP_PASSWORD':
            case 'ACCOUNT_HELP_PASSWORD_CONFIRM':
                aiResponse = "Sure 👍 You can change your password from Settings → Security → Change Password. Want me to take you there?";
                action = intent === 'ACCOUNT_HELP_PASSWORD_CONFIRM' ? 'OPEN_SETTINGS' : null;
                quickActions = [{ label: 'Yes, take me there', action: 'OPEN_SETTINGS' }];
                break;

            case 'PRIVACY_HELP':
            case 'PRIVACY_HELP_CONFIRM':
                aiResponse = "NotifyMe takes your privacy seriously. You can control who can scan your tags and contact you in the Privacy Center.";
                action = intent === 'PRIVACY_HELP_CONFIRM' ? 'OPEN_PRIVACY' : null;
                quickActions = [{ label: 'Open Privacy Center', action: 'OPEN_PRIVACY' }];
                break;

            case 'BLOCK_USER':
                aiResponse = "If someone is bothering you, you can block them from the Privacy Center. Would you like me to open it for you, or do you want to report them to Support?";
                quickActions = [{ label: 'Privacy Center', action: 'OPEN_PRIVACY' }, { label: 'Contact Support', action: 'OPEN_SUPPORT' }];
                break;

            case 'GREETING':
                aiResponse = "Hey! 👋 How can I help you today?";
                quickActions = [{ label: 'My QR Codes', action: 'OPEN_QR' }, { label: 'Support', action: 'OPEN_SUPPORT' }];
                break;

            case 'DISMISSAL':
                aiResponse = "No problem 😄 I'm here whenever you need me.";
                break;

            case 'THANKS':
                aiResponse = "You're welcome! 😊";
                break;

            case 'CONFIRM_GENERAL':
                aiResponse = "👍";
                break;

            case 'UNKNOWN':
            default:
                aiResponse = "Are you looking for help with a specific feature? You can ask me about managing your QR codes, subscriptions, privacy, or contacting support.";
                quickActions = [
                    { label: 'Create a QR', action: 'OPEN_QR' },
                    { label: 'My Subscriptions', action: 'OPEN_SUBSCRIPTION' },
                    { label: 'Privacy & Security', action: 'OPEN_PRIVACY' },
                    { label: 'Contact Support', action: 'OPEN_SUPPORT' }
                ];
                break;
        }

        return res.json({ response: aiResponse, action: action, quickActions: quickActions });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'Internal server error while processing AI request.' });
    }
});

module.exports = router;
