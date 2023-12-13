const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../models/user.model');

exports.registerUser = async (req, res, next) => {
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
}