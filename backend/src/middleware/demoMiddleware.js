const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to prevent modification/deletion of demo users
exports.protectDemoUsers = async (req, res, next) => {
  try {
      // Check if user is trying to modify a demo user
      // We assume user ID is in req.params.id for update/delete operations
      const targetUserId = req.params.id;
      
      if (targetUserId) {
        const targetUser = await prisma.user.findUnique({
             where: { id: targetUserId },
             select: { isDemo: true }
        });
        
        if (targetUser && targetUser.isDemo) {
            return res.status(403).json({ 
                message: 'Action forbidden: Cannot modify or delete demo users.' 
            });
        }
      }
      
      // Also check if current logged in user is a demo user trying to change their own profile (if applicable)
      // For this system, we might just block profile updates for demo users globally if they try to update 'me'
      if (req.user && req.user.id) {
           const currentUser = await prisma.user.findUnique({
               where: { id: req.user.id },
               select: { isDemo: true }
           });
           
           if (currentUser && currentUser.isDemo) {
               // Allow GET, but block PUT/PATCH/DELETE on self
               if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
                    return res.status(403).json({ 
                        message: 'Action forbidden: Demo users cannot modify their own profile.' 
                    });
               }
           }
      }

      next();
  } catch (error) {
      next(error);
  }
};
