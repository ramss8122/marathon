import express from 'express';
import {
  createContactMessage,
  getAllMessages,
  updateMessageReadStatus,
  deleteMessage
} from '../controllers/contactController.js';

const router = express.Router();

router.post('/', createContactMessage);
router.get('/', getAllMessages);
router.patch('/:id/read', updateMessageReadStatus);
router.delete('/:id', deleteMessage);

export default router;
