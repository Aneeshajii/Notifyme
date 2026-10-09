const fs = require('fs');
let code = fs.readFileSync('routes/auth.js', 'utf8');

const terminateCode = `// DELETE /api/auth/users/:id/terminate
router.delete('/users/:id/terminate', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {`;

const selfDeleteCode = `// DELETE /api/auth/me
router.delete('/me', verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // 1. Delete all non-tag user dependencies
      await prisma.otpVerification.deleteMany({ where: { userId } });
      await prisma.blockedScanner.deleteMany({ where: { ownerId: userId } });
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.payment.deleteMany({ where: { userId } });
      await prisma.pushSubscription.deleteMany({ where: { userId } });
      await prisma.securityAlert.deleteMany({ where: { userId } });
      await prisma.notification.deleteMany({ where: { userId } });
      await prisma.familyShare.deleteMany({ where: { ownerId: userId } });
      
      // 2. Delete all tags (and their messages/scans/calls/conversations)
      const userTags = await prisma.tag.findMany({ where: { ownerId: userId } });
      for (const tag of userTags) {
          await prisma.message.deleteMany({ where: { tagId: tag.id } });
          await prisma.scanHistory.deleteMany({ where: { tagId: tag.id } });
          await prisma.callLog.deleteMany({ where: { tagId: tag.id } });
          await prisma.conversation.deleteMany({ where: { tagId: tag.id } });
          await prisma.tag.delete({ where: { id: tag.id } });
      }
      
      // Finally delete user
      await prisma.user.delete({ where: { id: userId } });
      
      const io = req.app.get('io');
      if (io) io.emit('admin_notification', { type: 'user_deleted_self', userId });
      
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// DELETE /api/auth/users/:id/terminate
router.delete('/users/:id/terminate', verifyToken, requireRole('MASTER_ADMIN'), async (req, res) => {`;

code = code.replace(terminateCode, selfDeleteCode);
fs.writeFileSync('routes/auth.js', code);
console.log('Added self-delete route');
