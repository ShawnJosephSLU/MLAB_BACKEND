const express = require('express');
const router = express.Router(); // Use express.Router() to create a router
const checkAuth = require('../middleware/check-auth-admin');
const multer = require('multer');


// adding image to the resources dir
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './.installers/resources/');
    },
    filename : function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// filter certain types of files 
const fileFilter = (req , file,  cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

const upload = multer({storage: storage , fileFilter: fileFilter});


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

// GET a specific product by ID
router.get('/:productId', async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.productId)
            .select('name, _id, price, productImage')
            .exec()
            .then();

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
router.post('/', checkAuth, upload.single('productImage'), async (req, res, next) => {
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
        const newProduct = new Product({
            name: req.body.name,
            price: req.body.price,
            version: req.body.version,
            windowsInstaller: req.file.path,
            macosInstaller: req.file.path,
            productImage: req.file.path
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
