const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, unique: true, required: true },
    price: {type: Number, required: true},
    version: {
        major: { type: Number, default: 1 },
        minor: { type: Number, default: 0 },
        patch: { type: Number, default: 0 }
    },
    productImage: {type : String, default: "No Product Image"},
    winInstaller: {type: String, default: "No Windows Installer Available"},
    macosInstaller: {type: String, default: "No MacOS Installer Available"}

}, { versionKey: false });


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
