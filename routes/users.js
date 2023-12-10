const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const checkAuth = require('../middleware/check-auth-user');
// Declare the tokenBlacklist array
const tokenBlacklist = [];


router.post('/register', async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password

        const newUser = new User({
            _id: new mongoose.Types.ObjectId(), 
            firstName: req.body.firstName,  
            lastName: req.body.lastName,  
            username: req.body.username,  
            dob: new Date(req.body.dob),
            email: req.body.email,   
            password: hashedPassword,  
            country: req.body.country,   
            role: 'user'                        
        });
        

        const result = await newUser.save();

        res.status(201).json({
            message: "New user created",
            user: newUser
        });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({
                error: "Username already exists. Please choose a different username."
            });
        } else {
            console.error(error);
            res.status(500).json({
                error: "Internal Server Error"
            });
        }
    }
});


router.post('/login', async (req, res, next) => {
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
});


// Logout route
router.post('/logout', checkAuth, (req, res) => {
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
});


// Protected route (authentication required)
router.get('/products', checkAuth, async (req, res, next) => {
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
});



module.exports = router;
