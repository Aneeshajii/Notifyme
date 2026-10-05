const jwt = require('jsonwebtoken');

// Ensure this matches your .env
const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-production-secret-replace-me';

// Middleware to verify JWT Access Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, role, iat, exp }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token Expired' });
        }
        res.status(403).json({ message: 'Invalid Token' });
    }
};

// Middleware for RBAC
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'User role not found' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
        }
        next();
    };
};



const requireVerifiedEmail = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        
        if (!user || !user.emailVerified) {
            return res.status(403).json({ message: 'Email verification required', code: 'EMAIL_UNVERIFIED' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    verifyToken,
    requireRole,
    JWT_SECRET,
    requireVerifiedEmail
};

