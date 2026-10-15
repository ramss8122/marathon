import ContactMessage from '../models/ContactMessage.js';
import { isDbReady } from '../config/db.js';

export const createContactMessage = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is not available. Please ensure MongoDB is running.'
      });
    }

    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    const newContact = new ContactMessage({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      isRead: false,
      createdAt: new Date()
    });

    const saved = await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. Our team will get back to you shortly.',
      data: saved
    });
  } catch (error) {
    console.error('Contact save error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMessageReadStatus = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const { id } = req.params;
    const { isRead } = req.body;

    const updated = await ContactMessage.findByIdAndUpdate(
      id,
      { isRead: isRead !== undefined ? isRead : true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const { id } = req.params;
    await ContactMessage.findByIdAndDelete(id);
    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
