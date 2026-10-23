import express from 'express';
import {
  getCampaignRecipients,
  sendCampaignBulk,
  getCampaigns
} from '../controllers/emailController.js';

const router = express.Router();

// GET /api/email/recipients?city=Chennai&status=confirmed
router.get('/recipients', getCampaignRecipients);

// POST /api/email/campaign/send
router.post('/campaign/send', sendCampaignBulk);

// GET /api/email/campaigns
router.get('/campaigns', getCampaigns);

export default router;
