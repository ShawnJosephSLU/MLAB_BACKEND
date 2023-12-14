const Product = require('../../models/product.model');

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


