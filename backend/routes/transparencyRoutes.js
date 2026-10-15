import express from 'express';
import { getTransparencyStats } from '../controllers/transparencyController.js';

const router = express.Router();

router.get('/stats', getTransparencyStats);

export default router;
