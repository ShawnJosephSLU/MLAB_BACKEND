const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    _id: Schema.Types.ObjectId,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    country: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'admin' },
}, { versionKey: false });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;