import express from 'express';
import { getCities, getCityBySlug } from '../controllers/cityController.js';

const router = express.Router();

// Public routes – no authentication required
router.get('/',      getCities);      // GET /api/cities         (active only)
router.get('/:slug', getCityBySlug);  // GET /api/cities/:slug   (active only)

export default router;
