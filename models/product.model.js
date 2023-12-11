const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: { type: String, unique: true, required: true },
    price: {type: Number, required: true},
    version: {
        major: { type: Number, default: 1 },
        minor: { type: Number, default: 0 },
        patch: { type: Number, default: 0 }
    },
    windowsInstaller: { type: String, default: "No Windows Installer"},
    macosInstaller: { type: String , default: "No MacOs Installer"},

    productImage: {type : String, required: true}
   
   
}, { versionKey: false });

// Virtual property for version_string
productSchema.virtual('version_string').get(function() {
    return `${this.version.major}.${this.version.minor}.${this.version.patch}`;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
