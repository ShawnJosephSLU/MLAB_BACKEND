const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth-user');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/user-auth.controller');
const userProductsController = require('../controllers/user-products.controller');



router.post('/register', userController.registerUser); // register a user

// Login Route
router.post('/login', authController.loginUser); 

// Logout route
router.post('/logout', checkAuth,authController.logoutUser); 

// Protected route (authentication required)
router.get('/products', checkAuth, userProductsController.getUserProducts);


module.exports = router;
