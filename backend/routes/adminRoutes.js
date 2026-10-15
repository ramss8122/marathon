import express from 'express';
import { adminLogin, getAdminStats } from '../controllers/adminController.js';
import {
  getAllRegistrations,
  updateRegistration,
  deleteRegistration
} from '../controllers/registrationController.js';
import {
  getAllMessages,
  updateMessageReadStatus,
  deleteMessage
} from '../controllers/contactController.js';

const router = express.Router();

// Admin Authentication & Overview
router.post('/login', adminLogin);
router.get('/stats', getAdminStats);

// Participant Registrations Management
router.get('/registrations', getAllRegistrations);
router.patch('/registrations/:id', updateRegistration);
router.delete('/registrations/:id', deleteRegistration);

// Contact Inquiries Management
router.get('/messages', getAllMessages);
router.patch('/messages/:id/read', updateMessageReadStatus);
router.delete('/messages/:id', deleteMessage);

export default router;
