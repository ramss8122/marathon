import express from 'express';
import {
  createRegistration,
  getAllRegistrations,
  updateRegistration,
  deleteRegistration
} from '../controllers/registrationController.js';

const router = express.Router();

router.post('/', createRegistration);
router.get('/', getAllRegistrations);
router.patch('/:id', updateRegistration);
router.delete('/:id', deleteRegistration);

export default router;
