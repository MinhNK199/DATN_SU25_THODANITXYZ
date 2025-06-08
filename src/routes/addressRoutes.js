const express = require('express');
const router = express.Router();
const {
    getUserAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/addresses
router.route('/').get(protect, getUserAddresses).post(protect, createAddress);

// @route   GET /api/addresses/:id
router
    .route('/:id')
    .get(protect, getAddressById)
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

// @route   PUT /api/addresses/:id/default
router.put('/:id/default', protect, setDefaultAddress);

module.exports = router; 