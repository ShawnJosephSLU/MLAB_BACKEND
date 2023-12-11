const express = require('express');
const router = express.Router(); // Use express.Router() to create a router
const checkAuth = require('../middleware/check-auth-admin');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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
const imageFileFilter = (req , file,  cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

const uploadImage = multer({storage: imageStorage , fileFilter: imageFileFilter});



// Sample Product model
const Product = require('../models/product.model');

// GET all products
router.get('/', async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET a specific product by name
router.get('/:productName', async (req, res, next) => {
    try {
        const productName = req.params.productName;
        const product = await Product.findOne({ name: new RegExp('^' + productName + '$', 'i') })
            .exec();

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// POST a new product (authentication required, admin only)
router.post('/', checkAuth, async (req, res, next) => {
    try {
        // Check if the user is an admin
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized. Only admin users can create products.' });
        }

        // Check if the product already exists in the database by name
        const existingProduct = await Product.findOne({ name: req.body.name });

        if (existingProduct) {
            return res.status(400).json({ error: 'Product with this name already exists in the database.' });
        }

        // If the product doesn't exist, create a new one
        const newProductName = req.body.name.replace(/\s+/g, '-'); // Replace spaces with hyphens
        const newProduct = new Product({
            _id: new mongoose.Types.ObjectId(),
            name: newProductName,
            price: req.body.price,
            version: req.body.version,  
            winInstaller: req.body.winInstaller,
            macosInstaller: req.body.macosInstaller          
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});


// Update an Existing Product's winInstaller by name
router.patch('/:productName/installer/windows', checkAuth, uploadWindowsInstaller.single('winInstaller'), async (req, res, next) => {
    try {
        // Check if the user is an admin
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized. Only admin users can update installers.' });
        }

        const productName = req.params.productName;

        // Use case-insensitive search to find the product by name
        const product = await Product.findOne({ name: new RegExp('^' + productName + '$', 'i') });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if a new windowsInstaller file is uploaded
        if (req.file) {

            // Update the winInstaller field in the product with the file path
            product.winInstaller = req.file.path;

            // Save the updated product
            await product.save();

            return res.status(200).json({
                message: `Windows installer for ${productName} was successfully updated`,
                product: product,
            });
        }

        return res.status(400).json({ message: 'No windows installer file uploaded' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});


// Update an Existing Product's macosInstaller by name
router.patch('/:productName/installer/macOS', checkAuth, uploadMacOSInstaller.single('macosInstaller'), async (req, res, next) => {
    try {
        // Check if the user is an admin
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized. Only admin users can update installers.' });
        }

        const productName = req.params.productName;

        // Use case-insensitive search to find the product by name
        const product = await Product.findOne({ name: new RegExp('^' + productName + '$', 'i') });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if a new macosInstaller file is uploaded
        if (req.file) {

            // Update the macosInstaller field in the product with the file path
            product.macosInstaller = req.file.path;

            // Save the updated product
            await product.save();

            return res.status(200).json({
                message: `MacOS installer for ${productName} was successfully updated`,
                product: product,
            });
        }

        return res.status(400).json({ message: 'No MacOS installer file uploaded' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});


// Update an Existing Product's price by name
router.patch('/:productName/price', checkAuth, async (req, res, next) => {
    try {
        // Check if the user is an admin
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized. Only admin users can update product price.' });
        }

        const productName = req.params.productName;

        // Use case-insensitive search to find the product by name
        const product = await Product.findOne({ name: new RegExp('^' + productName + '$', 'i') });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if a new price is provided in the request body
        if (req.body.price === undefined) {
            return res.status(400).json({ error: 'Price not provided in the request body' });
        }

        // Update the price field in the product
        product.price = req.body.price;

        // Save the updated product
        await product.save();

        return res.status(200).json({
            message: `Price for product ${productName} was successfully updated`,
            product: product,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;
