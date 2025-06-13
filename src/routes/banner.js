import express from 'express';
import {createBanner,getBanners,getActiveBanners,updateBanner,deleteBanner} from '../controllers/banner.js';
import {protect} from '../middlewares/authMiddleware.js'

const routerBanner = express.Router();
routerBanner.get('/:id/active', getActiveBanners);
routerBanner.post('/', protect,createBanner);
routerBanner.get('/', getBanners);
routerBanner.put('/:id',protect, updateBanner);
routerBanner.delete('/:id',protect, deleteBanner);

export default routerBanner;