const jwt = require('jsonwebtoken');
const adminTokenBlacklist = []; //  blacklist array for admin tokens

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        // Check if the admin token is blacklisted
        if (adminTokenBlacklist.includes(token)) {
            console.log("Admin Token blacklisted. Access denied.");
            return res.status(401).json({
                error: "Authentication failed. Admin Token is blacklisted."
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Ensure the user is an admin
        if (decodedToken.role !== 'admin') {
            throw new Error('Authentication failed. User is not an admin.');
        }

        req.userData = {
            adminId: decodedToken.adminId,
            email: decodedToken.email,
            role: decodedToken.role
        };
        next();
    } catch (error) {
        return res.status(401).json({
            error: error.message || "Authentication failed. Invalid token."
        });
    }
};
