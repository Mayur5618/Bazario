import User from  '../models/buyer.model.js';

// Get buyer's city
export const getBuyerCity = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Return the user's city
        res.status(200).json({
            success: true,
            city: req.user.city || null
        });

    } catch (error) {
        console.error('Error getting buyer city:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching buyer city'
        });
    }
}; 