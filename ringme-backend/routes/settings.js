const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/settings
// Public route (used by clients to know which features are enabled)
router.get('/', async (req, res) => {
    try {
        let settings = await prisma.systemSetting.findUnique({ where: { id: 'global' } });
        if (!settings) {
            settings = await prisma.systemSetting.create({
                data: { id: 'global' }
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/settings
// Master Admin route to update global feature toggles
router.put('/', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {
    try {
        const { allowVoice, allowFile, allowLocation, allowVideoCall } = req.body;
        
        let settings = await prisma.systemSetting.findUnique({ where: { id: 'global' } });
        if (!settings) {
            settings = await prisma.systemSetting.create({
                data: { id: 'global' }
            });
        }

        const updated = await prisma.systemSetting.update({
            where: { id: 'global' },
            data: {
                allowVoice: allowVoice !== undefined ? allowVoice : settings.allowVoice,
                allowFile: allowFile !== undefined ? allowFile : settings.allowFile,
                allowLocation: allowLocation !== undefined ? allowLocation : settings.allowLocation,
                allowVideoCall: allowVideoCall !== undefined ? allowVideoCall : settings.allowVideoCall
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
