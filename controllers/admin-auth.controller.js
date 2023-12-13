// admin-auth.controller.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const adminTokenBlacklist = [];


exports.loginAdmin = async (req, res, next) => {
    try {
        // Find the admin in the database
        const admin = await Admin.findOne({ email: req.body.email });

        // Check if the admin exists
        if (!admin) {
            return res.status(401).json({
                error: "Authentication failed. Admin not found."
            });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(req.body.password, admin.password);

        // Check if passwords match
        if (!passwordMatch) {
            return res.status(401).json({
                error: "Authentication failed. Invalid password."
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { adminId: admin._id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );


        // Successful login, send token to the client
        res.status(200).json({
            message: "Authentication successful",
            token: token,
            expiresIn: 3600,
            admin: {
                _id: admin._id,
                email: admin.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message
        });
    }
}

exports.logoutAdmin = (req, res) => {
    const token = req.headers.authorization.split(" ")[1];

    // Check if the admin token is already blacklisted
    if (adminTokenBlacklist.includes(token)) {
        console.log("Admin Token is already blacklisted. Ignoring duplicate admin logout.");
        return res.status(200).json({
            message: "Admin Token is already blacklisted",
        });
    }

    // Add the admin token to the admin blacklist
    adminTokenBlacklist.push(token);

    console.log("Admin Token added to admin blacklist:", token);

    res.status(200).json({
        message: "Admin Logout successful",
    });
}