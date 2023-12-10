const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const checkAuth = require('../middleware/check-auth-admin');
const tokenBlacklist = [];


// Admin registration
router.post('/register', async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password

        const newAdmin = new Admin({
            _id: new mongoose.Types.ObjectId(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dob: new Date(req.body.dob),
            email: req.body.email,
            password: hashedPassword,
            country: req.body.country,
            role: 'admin'
        });

        const result = await newAdmin.save();

        res.status(201).json({
            message: "New admin created",
            admin: newAdmin
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                error: "Email already exists. Please choose a different email."
            });
        } else {
            console.error(error);
            res.status(500).json({
                error: "Internal Server Error"
            });
        }
    }
});

// Admin login
router.post('/login', async (req, res, next) => {
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
});

// Admin Logout route
router.post('/logout', checkAuth, (req, res) => {
    const token = req.headers.authorization.split(" ")[1];

    // Check if the admin token is already blacklisted
    if (tokenBlacklist.includes(token)) {
        console.log("Admin Token is already blacklisted. Ignoring duplicate admin logout.");
        return res.status(200).json({
            message: "Admin Token is already blacklisted",
        });
    }

    // Add the admin token to the admin blacklist
    tokenBlacklist.push(token);

    console.log("Admin Token added to admin blacklist:", token);

    res.status(200).json({
        message: "Admin Logout successful",
    });
});


// Protected route (authentication required)
router.get('/products', checkAuth, async (req, res, next) => {
    try {
        // Fetch the admin data and perform actions specific to admin
        const admin = await Admin.findById(req.userData.adminId).populate('products_owned');

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Access granted, admin is authenticated
        res.status(200).json({
            message: "Access granted",
            // Add admin-specific data here
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Internal Server Error",
        });
    }
});

module.exports = router;
