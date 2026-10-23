import express from 'express';
import { createRegistration } from '../controllers/registrationController.js';

const router = express.Router();

// Only public participant registration submission
router.post('/', createRegistration);

export default router;
