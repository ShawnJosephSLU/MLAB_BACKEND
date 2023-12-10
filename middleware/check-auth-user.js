// check-auth-user.js middleware
const jwt = require('jsonwebtoken');
const userTokenBlacklist = [];

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        // Check if the token is blacklisted
        if (userTokenBlacklist.includes(token)) {
            console.log("Token blacklisted. Access denied.");
            return res.status(401).json({
                error: "Authentication failed. Token is blacklisted."
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userData = { userId: decodedToken.userId, username: decodedToken.username };
        next();
    } catch (error) {
        console.error("Authentication failed. Invalid token.", error);
        return res.status(401).json({
            error: "Authentication failed. Invalid token."
        });
    }
};
