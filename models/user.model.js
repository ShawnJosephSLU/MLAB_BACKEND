const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = require('./product.model');

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    dob: { type: Date, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    country: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    products_owned: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { versionKey: false });

const User = mongoose.model('User', userSchema);

module.exports = User;