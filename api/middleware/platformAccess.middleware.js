export const checkPlatformAccess = (platformTypeGetter) => {
    return async (req, res, next) => {
        try {
            const user = req.user;

            // Debug log
            console.log('User in middleware:', user);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Skip check for customers
            if (user.userType === 'customer') {
                return next();
            }

            // Check if user has platformType
            if (!user.platformType) {
                return res.status(403).json({
                    success: false,
                    message: 'User platform type not found. Please update your profile.'
                });
            }

            // Get platform type - either from function or direct value
            const platformType = typeof platformTypeGetter === 'function' 
                ? platformTypeGetter(req) 
                : platformTypeGetter;

            // Handle array of platform types
            const platformTypes = Array.isArray(platformType) 
                ? platformType 
                : [platformType];

            // Ensure user.platformType is an array
            const userPlatformTypes = Array.isArray(user.platformType) 
                ? user.platformType 
                : [user.platformType];

            // Check if user has access to all required platforms
            const hasAccess = platformTypes.every(type => 
                userPlatformTypes.includes(type)
            );

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: `You don't have access to required platform(s). Your platforms: ${userPlatformTypes.join(', ')}`
                });
            }

            next();
        } catch (error) {
            console.error('Platform access error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error checking platform access'
            });
        }
    };
};