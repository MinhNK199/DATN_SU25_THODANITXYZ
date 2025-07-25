import express from 'express';
import {createBanner,getBannerById,getAllBanners,updateBanner,deleteBanner} from '../controllers/banner.js';
import {protect} from '../middlewares/authMiddleware.js'

const routerBanner = express.Router();
routerBanner.get('/:id',getBannerById );
routerBanner.post('/', protect,createBanner);
routerBanner.get('/', getAllBanners);
routerBanner.put('/:id',protect, updateBanner);
routerBanner.delete('/:id',protect, deleteBanner);

export default routerBanner;