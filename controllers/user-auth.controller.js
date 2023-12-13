// auth.controller.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const tokenBlacklist = [];


exports.loginUser = async (req, res, next) => {
    try {
        // Log request details
        console.log("Login Request Body:", req.body);

        // Find the user in the database
        const user = await User.findOne({ username: req.body.username });

        // Log user details
        console.log("User:", user);

        // Check if the user exists
        if (!user) {
            return res.status(401).json({
                error: "Authentication failed. User not found."
            });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        // Log password match result
        console.log("Password Match:", passwordMatch);

        // Check if passwords match
        if (!passwordMatch) {
            return res.status(401).json({
                error: "Authentication failed. Invalid password."
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '3h' }
        );


        // Log token details
        console.log("Generated Token:", token);

        // Successful login, send token to the client
        res.status(200).json({
            message: "Authentication successful",
            token: token,
            expiresIn: 10800, // 3 hrs in seconds
            user: {
                _id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        // Log detailed error information
        console.error("Login Error:", error);

        // Send a response with error details
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message
        });
    }
};


exports.logoutUser = (req, res) => {
    const token = req.headers.authorization.split(" ")[1];

    // Check if the token is already blacklisted
    if (tokenBlacklist.includes(token)) {
        console.log("Token is already blacklisted. Ignoring duplicate logout.");
        return res.status(200).json({
            message: "Token is already blacklisted",
        });
    }

    // Add the token to the blacklist
    tokenBlacklist.push(token);

    console.log("Token added to blacklist:", token);

    res.status(200).json({
        message: "Logout successful",
    });
};