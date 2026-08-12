const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verifyToken } = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

router.post('/chat', verifyToken, async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        if (!message) return res.status(400).json({ error: 'Message is required.' });

        // 1. Security Check
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
                action: 'NONE',
                quickActions: [{ label: 'Contact Support', action: 'OPEN_SUPPORT' }]
            });
        }

        // 2. Fetch User Context
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { subscription: true, tags: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found.' });

        // 3. Build System Instruction Context
        const planName = user.isPremium ? (user.subscription?.planId || 'Premium') : 'Free';
        const limit = user.subscription?.maxQrCodes || (user.isPremium ? 10 : 1);
        const currentQRCodes = user.tags.length;
        
        const systemInstruction = `You are the NotifyMe AI Assistant. You must act as a friendly, helpful product and customer-support assistant.
You understand natural language, typos, and follow-up questions. Do not act like a rigid keyword bot.

USER CONTEXT:
- Name: ${user.name || 'User'}
- Email: ${user.email}
- Current Plan: ${planName}
- QR Code Limits: They have created ${currentQRCodes} out of their ${limit} allowed QR codes.
- Is Premium: ${user.isPremium}

NOTIFYME FEATURES KNOWLEDGE:
- QR Creation: Users can create secure QR tags that others can scan to contact them.
- Messaging: Scanners can send real-time text, images, and voice messages to the tag owner without exchanging phone numbers.
- Location Sharing: Scanners can securely share their GPS location with the tag owner.
- Calling: Premium users can receive VoIP app calls directly through the browser without exposing their phone number.
- Privacy & Security: Users can block abusive scanners, hide their identity, and manage permissions from the Privacy Center.
- Subscriptions: Free users get 1 QR code. Premium/Gold users get up to 10 (or more), plus calling and analytics features.

YOUR RULES:
1. NEVER expose passwords, OTPs, authentication tokens, private user info, other users' data, database credentials, or admin info.
2. If the user asks for a feature that their current plan does not support (like Calling on a Free plan), explain that they need to upgrade and set the action to OPEN_SUBSCRIPTION.
3. If the user explicitly asks to talk to a human, an agent, customer care, or support, be helpful and route them by setting the action to OPEN_SUPPORT.
4. If you don't know something, clearly say so. Do not invent features, prices, or limits.
5. Provide simple, clear answers.

OUTPUT FORMAT:
You must strictly output a raw JSON object. Do not wrap it in markdown code blocks.
Schema:
{
  "response": "Your natural language response to the user.",
  "action": "A single action string from this exact list: NONE, OPEN_QR, OPEN_SUPPORT, OPEN_SUBSCRIPTION, OPEN_PRIVACY, OPEN_SETTINGS. Use NONE if no navigation is needed.",
  "quickActions": [
    { "label": "Short Button Text", "action": "An action from the list above" }
  ]
}`;

        // 4. Construct Conversation History for Gemini
        let contents = [];
        if (conversationHistory && conversationHistory.length > 0) {
            contents = conversationHistory.map(msg => ({
                role: msg.sender === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
        }
        
        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // 5. Call Gemini LLM
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not set in environment.");
            return res.status(500).json({ 
                error: 'AI is currently offline. Please configure GEMINI_API_KEY in the backend.' 
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
            }
        });

        const rawText = response.text();
        let aiResponseData;
        try {
            aiResponseData = JSON.parse(rawText);
        } catch (e) {
            console.error('Failed to parse Gemini response as JSON:', rawText);
            aiResponseData = {
                response: "I encountered an error trying to process your request. Let me know if I can help you with anything else.",
                action: 'NONE',
                quickActions: []
            };
        }

        // 6. Return standard JSON to frontend
        return res.json({
            response: aiResponseData.response,
            action: aiResponseData.action || 'NONE',
            quickActions: aiResponseData.quickActions || []
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: error.message || 'Failed to communicate with AI Assistant.' });
    }
});

module.exports = router;
