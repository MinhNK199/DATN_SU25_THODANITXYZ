const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fullName: {
        type: String,
        required: [true, 'Please add a full name'],
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
    },
    city: {
        type: String,
        required: [true, 'Please add a city'],
    },
    district: {
        type: String,
        required: [true, 'Please add a district'],
    },
    ward: {
        type: String,
        required: [true, 'Please add a ward'],
    },
    postalCode: {
        type: String,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home',
    },
    note: {
        type: String,
    },
}, {
    timestamps: true,
});

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

module.exports = mongoose.model('Address', addressSchema); 