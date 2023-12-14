const Product = require('../../models/product.model');
mongoose = require("mongoose");


exports.getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.getProductByName =  async (req, res, next) => {
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
}


exports.createNewProduct = async (req, res, next) => {
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
}
