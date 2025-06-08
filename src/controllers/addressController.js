const Address = require('../models/Address');
const asyncHandler = require('express-async-handler');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
const getUserAddresses = asyncHandler(async (req, res) => {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
});

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
const getAddressById = asyncHandler(async (req, res) => {
    const address = await Address.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (address) {
        res.json(address);
    } else {
        res.status(404);
        throw new Error('Address not found');
    }
});

// @desc    Create an address
// @route   POST /api/addresses
// @access  Private
const createAddress = asyncHandler(async (req, res) => {
    const {
        fullName,
        phone,
        address,
        city,
        district,
        ward,
        postalCode,
        isDefault,
        type,
        note,
    } = req.body;

    const addressObj = new Address({
        user: req.user._id,
        fullName,
        phone,
        address,
        city,
        district,
        ward,
        postalCode,
        isDefault,
        type,
        note,
    });

    const createdAddress = await addressObj.save();
    res.status(201).json(createdAddress);
});

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
    const {
        fullName,
        phone,
        address,
        city,
        district,
        ward,
        postalCode,
        isDefault,
        type,
        note,
    } = req.body;

    const addressObj = await Address.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (addressObj) {
        addressObj.fullName = fullName;
        addressObj.phone = phone;
        addressObj.address = address;
        addressObj.city = city;
        addressObj.district = district;
        addressObj.ward = ward;
        addressObj.postalCode = postalCode;
        addressObj.isDefault = isDefault;
        addressObj.type = type;
        addressObj.note = note;

        const updatedAddress = await addressObj.save();
        res.json(updatedAddress);
    } else {
        res.status(404);
        throw new Error('Address not found');
    }
});

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const address = await Address.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (address) {
        await address.remove();
        res.json({ message: 'Address removed' });
    } else {
        res.status(404);
        throw new Error('Address not found');
    }
});

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
    const address = await Address.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (address) {
        // Set all other addresses to non-default
        await Address.updateMany(
            { user: req.user._id, _id: { $ne: address._id } },
            { isDefault: false }
        );

        // Set this address as default
        address.isDefault = true;
        const updatedAddress = await address.save();
        res.json(updatedAddress);
    } else {
        res.status(404);
        throw new Error('Address not found');
    }
});

module.exports = {
    getUserAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
}; 