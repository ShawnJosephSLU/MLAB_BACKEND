const User = require('../models/user.model');
const tokenBlacklist = [];

exports.getUserProducts = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        // Check if the token is blacklisted
        if (tokenBlacklist.includes(token)) {
            return res.status(401).json({
                error: "Authentication failed. Token is blacklisted."
            });
        }

        // Fetch the user data and populate the products_owned array
        const user = await User.findById(req.userData.userId).populate('products_owned');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Access granted, user is authenticated
        res.status(200).json({
            message: "Access granted",
            products_owned: user.products_owned,
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Internal Server Error",
        });
    }
};