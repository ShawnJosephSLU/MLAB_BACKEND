const express = require('express');
const router = express.Router(); // Use express.Router() to create a router
const checkAuth = require('../middleware/check-auth-admin');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const productController = require("../controllers/products/products.controller");

// Function to create directories recursively
const createDirectory = (directoryPath) => {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
};

// WINDOWS
const windowsInstallerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = './.installers/windows/';
        createDirectory(destinationPath); // Ensure the directory exists
        cb(null, destinationPath);
    },
    filename : function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const windowsFileFilter = (req, file, cb) => {
    const allowedExecutableExtensions = ['.exe'];
    const isExecutable = allowedExecutableExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));

    if(isExecutable) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const uploadWindowsInstaller = multer({ storage: windowsInstallerStorage, fileFilter: windowsFileFilter });

// MACOS
const macOSInstallerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = './.installers/macOS/';
        createDirectory(destinationPath); // Ensure the directory exists
        cb(null, destinationPath);
    },
    filename : function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const macOSFileFilter = (req, file, cb) => {
    const allowedExecutableExtensions = ['.dmg'];
    const isExecutable = allowedExecutableExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));

    if(isExecutable) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const uploadMacOSInstaller = multer({ storage: macOSInstallerStorage, fileFilter: macOSFileFilter });

// Resources
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = './.installers/resources/';
        createDirectory(destinationPath); // Ensure the directory exists
        cb(null, destinationPath);
    },
    filename : function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// filter certain types of files 
const imageFileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/svg+xml' 
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};


const uploadImage = multer({storage: imageStorage , fileFilter: imageFileFilter});

// Sample Product model
const Product = require('../models/product.model');

// GET all products
router.get('/', productController.getAllProducts);

// GET a specific product by name
router.get('/:productName', productController.getProductByName);

// POST a new product (authentication required, admin only)
router.post('/', checkAuth, productController.createNewProduct);

// Update an Existing Product's winInstaller by name
router.patch('/:productName/installer/windows', checkAuth, uploadWindowsInstaller.single('winInstaller'),  productController.updateWindowsInstaller);

// Update an Existing Product's macosInstaller by name
router.patch('/:productName/installer/macOS', checkAuth, uploadMacOSInstaller.single('macosInstaller'), productController.updateMacOSInstaller);

// Update an Existing Product's price by name
router.patch('/:productName/price', checkAuth, productController.updatePrice);

// Update an Existing Product's Image by name 
router.patch('/:productName/image', checkAuth, uploadImage.single('productImage'), productController.updateImage);

// fetch Product's Image by name 
router.get('/:productName/image', productController.fetchProductImg);

// get product windows installer
router.get("/:productName/windows/:installer", productController.fetchProductWindowsInstaller);

// get product macOS installer
router.get("/:productName/macos/installer.dmg", productController.fetchProductMacOSInstaller);


module.exports = router;

