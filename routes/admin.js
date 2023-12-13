const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth-admin');
const adminController = require('../controllers/clients/admin.controller');
const adminAuthController = require('../controllers/authentication/admin-auth.controller');


// Admin registration
router.post('/register', adminController.registerAdmin);

// Admin login
router.post('/login', adminAuthController.loginAdmin);

// Admin Logout route
router.post('/logout', checkAuth, adminAuthController.logoutAdmin);

module.exports = router;
