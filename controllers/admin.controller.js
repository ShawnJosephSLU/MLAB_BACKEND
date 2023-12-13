// admin.controllers.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin.model');

exports.registerAdmin = async (req, res, next) => {
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
};
