import express from 'express';
import {
  getDonationStats,
  getDonationConfig,
  createDonationOrder,
  verifyDonationPayment,
  handleDonationWebhook
} from '../controllers/donationController.js';

const router = express.Router();

router.get('/stats', getDonationStats);
router.get('/config', getDonationConfig);
router.post('/create-order', createDonationOrder);
router.post('/verify', verifyDonationPayment);
router.post('/webhook', handleDonationWebhook);

export default router;
