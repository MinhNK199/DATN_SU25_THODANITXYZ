const express = require('express');
const router = express.Router();

const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const cartRoutes = require('./cartRoutes');
const categoryRoutes = require('./categoryRoutes');
const brandRoutes = require('./brandRoutes');
const couponRoutes = require('./couponRoutes');
const addressRoutes = require('./addressRoutes');
const notificationRoutes = require('./notificationRoutes');

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/coupons', couponRoutes);
router.use('/addresses', addressRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router; 