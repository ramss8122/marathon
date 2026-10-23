import express from 'express';
import { adminLogin, getAdminStats, getAdminMe } from '../controllers/adminController.js';
import {
  getAllRegistrations,
  createAdminGroupRegistrations,
  calculateAdminSummary,
  updateRegistration,
  deleteRegistration,
  getTicketData
} from '../controllers/registrationController.js';
import {
  getAllMessages,
  updateMessageReadStatus,
  deleteMessage
} from '../controllers/contactController.js';
import {
  getEmailConfig,
  getEmails,
  sendEmail,
  saveDraftEmail,
  deleteEmail,
  getCampaignRecipients,
  sendCampaignBulk,
  getCampaigns
} from '../controllers/emailController.js';
import {
  getSettings,
  updateSettings,
  testEmail,
  changePassword
} from '../controllers/settingsController.js';
import {
  adminGetCities,
  adminCreateCity,
  adminUpdateCity,
  adminToggleCityStatus,
  adminDeleteCity
} from '../controllers/cityController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public Route ──
router.post('/login', adminLogin);

// ── Protected Routes (requireAdminAuth applied to all routes below) ──
router.use(requireAdminAuth);

// Admin Profile
router.get('/me', getAdminMe);

// Admin Overview
router.get('/stats', getAdminStats);

// Participant Registrations Management
router.get('/registrations', getAllRegistrations);
router.post('/registrations/calculate', calculateAdminSummary);
router.post('/registrations', createAdminGroupRegistrations);
router.patch('/registrations/:id', updateRegistration);
router.delete('/registrations/:id', deleteRegistration);
router.get('/registrations/:id/ticket', getTicketData);

// Contact Inquiries Management
router.get('/messages', getAllMessages);
router.patch('/messages/:id/read', updateMessageReadStatus);
router.delete('/messages/:id', deleteMessage);

// Email Marketing Management
router.get('/emails/config', getEmailConfig);
router.get('/emails/recipients', getCampaignRecipients);
router.get('/emails/campaigns', getCampaigns);
router.get('/emails', getEmails);
router.post('/emails/send', sendEmail);
router.post('/emails/draft', saveDraftEmail);
router.post('/emails/campaign/send', sendCampaignBulk);
router.delete('/emails/:id', deleteEmail);

// Platform Settings & Configuration
router.get('/settings',                 getSettings);
router.put('/settings',                 updateSettings);
router.post('/settings/test-email',     testEmail);
router.post('/settings/change-password', changePassword);

// City / Event Management
router.get('/cities',               adminGetCities);         // GET  /api/admin/cities
router.post('/cities',              adminCreateCity);        // POST /api/admin/cities
router.put('/cities/:id',           adminUpdateCity);        // PUT  /api/admin/cities/:id
router.patch('/cities/:id/status',  adminToggleCityStatus); // PATCH /api/admin/cities/:id/status
router.delete('/cities/:id',        adminDeleteCity);        // DELETE /api/admin/cities/:id

export default router;
