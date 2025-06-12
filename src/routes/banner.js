import express from 'express';
import {createBanner,getBanners,getActiveBanners,updateBanner,deleteBanner} from '../controllers/banner.js';

const router = express.Router();

// Public route để lấy banners
router.get('/banners/active', getActiveBanners);
router.post('/banners', createBanner);
router.get('/banners', getBanners);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

export default router;