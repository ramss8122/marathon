import Registration from '../models/Registration.js';
import { isDbReady } from '../config/db.js';

// Package details dictionary
const PACKAGE_DETAILS = {
  '1k': { distance: '1K', amount: 499, name: '1K Fun Run' },
  '3k': { distance: '3K', amount: 599, name: '3K Run' },
  '5k': { distance: '5K', amount: 699, name: '5K Run' },
  '10k': { distance: '10K', amount: 799, name: '10K Run' },
  '21k': { distance: '21K', amount: 899, name: '21K Half Marathon' }
};

const EVENT_NAMES = {
  'chennai-coastal-run': 'Chennai Coastal Sunrise Run',
  'coimbatore-hills-run': 'Coimbatore Green Foothills Marathon',
  'bengaluru-tech-stride': 'Bengaluru Heritage & Lakes Stride',
  'kochi-backwater-marathon': 'Kochi Marine Drive Backwater Run'
};

export const createRegistration = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is not available. Please ensure MongoDB is running.'
      });
    }

    const {
      fullName,
      email,
      mobileNumber,
      dob,
      gender,
      city,
      state,
      raceCategory,
      selectedCategories,
      selectedEvent,
      emergencyContact,
      emergencyPhone,
      amount,
      paymentMethod = 'Online'
    } = req.body;

    // Support both single category string and multiple categories (array or comma-delimited)
    let categoriesList = [];
    if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
      categoriesList = selectedCategories;
    } else if (Array.isArray(raceCategory)) {
      categoriesList = raceCategory;
    } else if (typeof raceCategory === 'string' && raceCategory.trim()) {
      categoriesList = raceCategory.split(',').map(c => c.trim()).filter(Boolean);
    }

    if (!fullName || !email || !mobileNumber || categoriesList.length === 0 || !selectedEvent) {
      return res.status(400).json({
        success: false,
        message: 'Missing required registration details. Please fill in all required fields and select at least one race category.'
      });
    }

    const matchedPackages = categoriesList.map(cat => {
      const key = cat.toLowerCase();
      return PACKAGE_DETAILS[key] || { distance: cat.toUpperCase(), amount: 699, name: `${cat} Run` };
    });

    const calculatedAmount = matchedPackages.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const finalAmount = (typeof amount === 'number' && amount > 0) ? amount : calculatedAmount;
    const finalDistance = matchedPackages.map(p => p.distance).join(', ');
    const finalCategoryStr = categoriesList.join(', ');
    const eventName = EVENT_NAMES[selectedEvent] || 'South India Marathon Series';
    const registrationRef = 'RUN-' + Math.floor(100000 + Math.random() * 900000);

    const newRegistration = new Registration({
      registrationRef,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      dob: dob || '1995-01-01',
      gender: gender || 'Male',
      city: city ? city.trim() : 'Chennai',
      state: state ? state.trim() : 'Tamil Nadu',
      raceCategory: finalCategoryStr,
      selectedCategories: categoriesList,
      selectedEvent,
      eventName,
      distance: finalDistance,
      amount: finalAmount,
      emergencyContact: emergencyContact ? emergencyContact.trim() : 'Self',
      emergencyPhone: emergencyPhone ? emergencyPhone.trim() : mobileNumber.trim(),
      registrationStatus: 'Confirmed',
      paymentStatus: 'Pending',
      paymentMethod,
      createdAt: new Date()
    });

    const saved = await newRegistration.save();

    res.status(201).json({
      success: true,
      message: 'Registration created and saved to MongoDB successfully.',
      data: saved
    });
  } catch (error) {
    console.error('Registration save error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRegistrations = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please ensure MongoDB is running.'
      });
    }

    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRegistration = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const { id } = req.params;
    const { registrationStatus, paymentStatus } = req.body;

    const updates = {};
    if (registrationStatus) updates.registrationStatus = registrationStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const updated = await Registration.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRegistration = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected.'
      });
    }

    const { id } = req.params;
    await Registration.findByIdAndDelete(id);
    res.json({ success: true, message: 'Registration deleted successfully.' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
