import Registration from '../models/Registration.js';
import City from '../models/City.js';
import { isDbReady } from '../config/db.js';
import { sendTicketEmail } from '../services/ticketService.js';

// Package details dictionary
const PACKAGE_DETAILS = {
  '1k': { distance: '1K', amount: 499, name: '1K Fun Run' },
  '3k': { distance: '3K', amount: 599, name: '3K Run' },
  '5k': { distance: '5K', amount: 699, name: '5K Run' },
  '10k': { distance: '10K', amount: 799, name: '10K Run' },
  '21k': { distance: '21K', amount: 899, name: '21K Half Marathon' }
};

/**
 * Finds a City document by selectedEvent (slug, name, or substring for backward compatibility).
 * Returns the City doc or null.
 */
export async function findCityByEvent(eventIdentifier) {
  if (!eventIdentifier) return null;
  const raw = String(eventIdentifier).trim().toLowerCase();

  // 1. Direct match by slug
  let cityDoc = await City.findOne({ slug: raw });
  if (cityDoc) return cityDoc;

  // 2. Direct match by name
  cityDoc = await City.findOne({ name: new RegExp(`^${raw}$`, 'i') });
  if (cityDoc) return cityDoc;

  // 3. Match known slug or name inside raw identifier (e.g. 'chennai-coastal-run' -> matches slug 'chennai' or name 'Chennai')
  const allCities = await City.find();
  for (const c of allCities) {
    const cSlug = (c.slug || '').toLowerCase();
    const cName = (c.name || '').toLowerCase();
    if (cSlug && raw.includes(cSlug)) return c;
    if (cName && raw.includes(cName)) return c;
  }

  // 4. Fallback search by standard city substring
  const knownMatch = raw.match(/(chennai|coimbatore|bengaluru|bangalore|kochi|cochin|hyderabad|mumbai|delhi|madurai)/i);
  if (knownMatch) {
    const kName = knownMatch[1].toLowerCase();
    cityDoc = await City.findOne({
      $or: [
        { slug: new RegExp(kName, 'i') },
        { name: new RegExp(kName, 'i') }
      ]
    });
    if (cityDoc) return cityDoc;
  }

  return null;
}

export function isCityActive(cityDoc) {
  if (!cityDoc) return false;
  if (cityDoc.status === 'inactive' || cityDoc.isActive === false) return false;
  return true;
}

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
      whatsappNumber,
      organisation,
      designation,
      tshirtSize,
      bloodGroup,
      address,
      pincode,
      country,
      facebookLink,
      instagramLink,
      hearAbout,
      runningGroup,
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

    // Lookup City model by selectedEvent or city
    const cityDoc = await findCityByEvent(selectedEvent || city);
    if (!cityDoc || !isCityActive(cityDoc)) {
      return res.status(400).json({
        success: false,
        message: 'Registrations are closed for this city'
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
    const resolvedCityName = cityDoc.name;
    const eventName = `${cityDoc.name} Marathon`;
    const eventDate = cityDoc.eventDate || cityDoc.date || '';
    const eventVenue = cityDoc.venue || '';
    const flagOffTime = cityDoc.flagOffTime || cityDoc.time || '5:30 AM IST';
    const gatesOpenTime = cityDoc.gatesOpenTime || '4:30 AM IST';
    const registrationRef = 'RUN-' + Math.floor(100000 + Math.random() * 900000);

    const newRegistration = new Registration({
      registrationRef,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      dob: dob || '1995-01-01',
      gender: gender || 'Male',
      city: resolvedCityName,
      state: state ? state.trim() : 'Tamil Nadu',
      whatsappNumber: whatsappNumber ? whatsappNumber.trim() : '',
      organisation: organisation ? organisation.trim() : '',
      designation: designation ? designation.trim() : '',
      tshirtSize: tshirtSize ? tshirtSize.trim() : '',
      bloodGroup: bloodGroup ? bloodGroup.trim() : '',
      address: address ? address.trim() : '',
      pincode: pincode ? pincode.trim() : '',
      country: country ? country.trim() : 'India',
      facebookLink: facebookLink ? facebookLink.trim() : '',
      instagramLink: instagramLink ? instagramLink.trim() : '',
      hearAbout: hearAbout ? hearAbout.trim() : '',
      runningGroup: runningGroup ? runningGroup.trim() : '',
      raceCategory: finalCategoryStr,
      selectedCategories: categoriesList,
      selectedEvent: cityDoc.slug || selectedEvent,
      eventName,
      eventDate,
      eventVenue,
      flagOffTime,
      gatesOpenTime,
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

    // Fire-and-forget: generate PDF ticket and email it to the registrant
    sendTicketEmail(saved).catch(err =>
      console.error('[createRegistration] Ticket email error:', err.message)
    );

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

export const VALID_COUPONS = {
  'RUNTRUST10': 10,
  'RUNTRUST20': 20,
  'MARATHON15': 15,
  'EARLYBIRD10': 10
};

export const calculateAdminSummary = async (req, res) => {
  try {
    const { participants = [], couponCode = '' } = req.body;

    if (!Array.isArray(participants) || participants.length === 0 || participants.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Between 1 and 3 participants required for summary calculation.'
      });
    }

    const cleanCoupon = String(couponCode || '').trim().toUpperCase();
    const discountPct = (cleanCoupon && VALID_COUPONS[cleanCoupon]) ? VALID_COUPONS[cleanCoupon] : 0;
    const isCouponValid = Boolean(cleanCoupon && VALID_COUPONS[cleanCoupon]);

    let subTotal = 0;
    const participantBreakdown = participants.map((p, idx) => {
      const catKey = (p.raceCategory || '5k').toLowerCase();
      const pkgInfo = PACKAGE_DETAILS[catKey] || { distance: '5K', amount: 699, name: '5K Run' };
      const basePrice = pkgInfo.amount;
      const discount = Math.round((basePrice * discountPct) / 100);
      const finalPrice = basePrice - discount;

      subTotal += basePrice;

      return {
        index: idx + 1,
        fullName: p.fullName || `Participant ${idx + 1}`,
        event: (p.selectedEvent && p.selectedEvent.split('-')[0]) ? (p.selectedEvent.split('-')[0].charAt(0).toUpperCase() + p.selectedEvent.split('-')[0].slice(1)) : 'Chennai',
        raceCategory: pkgInfo.name,
        distance: pkgInfo.distance,
        basePrice,
        discount,
        finalPrice
      };
    });

    const discountAmount = Math.round((subTotal * discountPct) / 100);
    const finalTotal = subTotal - discountAmount;

    res.json({
      success: true,
      participantCount: participants.length,
      subTotal,
      couponCode: cleanCoupon,
      isCouponValid,
      discountPct,
      discountAmount,
      finalTotal,
      breakdown: participantBreakdown
    });
  } catch (error) {
    console.error('Error calculating summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminGroupRegistrations = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please ensure MongoDB is running.'
      });
    }

    const {
      participants,
      orderId: clientOrderId,
      paymentStatus = 'Pending',
      paymentMethod = 'Online',
      paymentRef = '',
      couponCode = ''
    } = req.body;

    if (!Array.isArray(participants) || participants.length === 0 || participants.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration request: between 1 and 3 participants required.'
      });
    }

    // Shared Group ID & Order ID
    const sharedOrderId = clientOrderId || ('ORD-' + Date.now().toString(36) + '-' + Math.floor(1000 + Math.random() * 9000)).toUpperCase();
    const sharedGroupId = 'GRP-' + Math.floor(100000 + Math.random() * 900000);

    // Duplicate Protection: If this orderId was already processed, return existing records
    if (clientOrderId) {
      const existingRecords = await Registration.find({ orderId: clientOrderId });
      if (existingRecords.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'Registrations for this order have already been processed.',
          isDuplicate: true,
          count: existingRecords.length,
          orderId: clientOrderId,
          groupId: existingRecords[0].groupId || sharedGroupId,
          data: existingRecords
        });
      }
    }

    // Coupon discount calculation verified on backend (Never trust client-supplied total)
    const cleanCoupon = String(couponCode || '').trim().toUpperCase();
    const discountPct = (cleanCoupon && VALID_COUPONS[cleanCoupon]) ? VALID_COUPONS[cleanCoupon] : 0;

    // Validate each participant independently
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validatedParticipants = [];

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const pNum = i + 1;

      if (!p.fullName || p.fullName.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: `Participant ${pNum}: Full name is required and must be at least 3 characters.`
        });
      }

      if (!p.email || !emailRegex.test(p.email.trim())) {
        return res.status(400).json({
          success: false,
          message: `Participant ${pNum}: Valid email address is required.`
        });
      }

      const cleanPhone = String(p.mobileNumber || '').replace(/[\s-]/g, '');
      if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: `Participant ${pNum}: Valid 10-digit Indian mobile number required.`
        });
      }

      if (!p.dob) {
        return res.status(400).json({
          success: false,
          message: `Participant ${pNum}: Date of birth is required.`
        });
      }

      if (!p.selectedEvent) {
        return res.status(400).json({
          success: false,
          message: `Participant ${pNum}: Marathon event selection is required.`
        });
      }

      const catKey = (p.raceCategory || '5k').toLowerCase();
      const pkgInfo = PACKAGE_DETAILS[catKey] || { distance: '5K', amount: 699, name: '5K Run' };

      const baseAmount = pkgInfo.amount;
      const participantDiscount = Math.round((baseAmount * discountPct) / 100);
      const participantFinalAmount = baseAmount - participantDiscount;

      validatedParticipants.push({
        raw: p,
        cleanPhone,
        pkgInfo,
        baseAmount,
        participantDiscount,
        participantFinalAmount
      });
    }

    // Backend-verified totals
    const subTotal = validatedParticipants.reduce((sum, item) => sum + item.baseAmount, 0);
    const totalDiscountAmount = validatedParticipants.reduce((sum, item) => sum + item.participantDiscount, 0);
    const backendVerifiedTotal = subTotal - totalDiscountAmount;

    // Save each participant as a separate record in MongoDB, linked by groupId & orderId
    const savedRecords = [];
    for (let i = 0; i < validatedParticipants.length; i++) {
      const { raw, cleanPhone, pkgInfo, participantFinalAmount } = validatedParticipants[i];
      const eventName = EVENT_NAMES[raw.selectedEvent] || 'Chennai Coastal Sunrise Run';
      const registrationRef = 'RUN-' + Math.floor(100000 + Math.random() * 900000);

      const regDoc = new Registration({
        registrationRef,
        fullName: raw.fullName.trim(),
        email: raw.email.trim().toLowerCase(),
        mobileNumber: cleanPhone,
        dob: raw.dob,
        gender: raw.gender || 'Male',
        city: raw.city ? raw.city.trim() : 'Chennai',
        state: raw.state ? raw.state.trim() : 'Tamil Nadu',
        whatsappNumber: raw.whatsappNumber ? String(raw.whatsappNumber).trim() : '',
        organisation: raw.organisation ? String(raw.organisation).trim() : '',
        designation: raw.designation ? String(raw.designation).trim() : '',
        tshirtSize: raw.tshirtSize ? String(raw.tshirtSize).trim() : '',
        bloodGroup: raw.bloodGroup ? String(raw.bloodGroup).trim() : '',
        address: raw.address ? String(raw.address).trim() : '',
        pincode: raw.pincode ? String(raw.pincode).trim() : '',
        country: raw.country ? String(raw.country).trim() : 'India',
        facebookLink: raw.facebookLink ? String(raw.facebookLink).trim() : '',
        instagramLink: raw.instagramLink ? String(raw.instagramLink).trim() : '',
        hearAbout: raw.hearAbout ? String(raw.hearAbout).trim() : '',
        runningGroup: raw.runningGroup ? String(raw.runningGroup).trim() : '',
        raceCategory: pkgInfo.name,
        selectedCategories: [raw.raceCategory || '5k'],
        selectedEvent: raw.selectedEvent,
        eventName,
        distance: pkgInfo.distance,
        amount: participantFinalAmount,
        emergencyContact: raw.emergencyContact ? raw.emergencyContact.trim() : 'Self',
        emergencyPhone: raw.emergencyPhone ? String(raw.emergencyPhone).trim() : cleanPhone,
        registrationStatus: 'Confirmed',
        paymentStatus: paymentStatus === 'Paid' ? 'Paid' : 'Pending',
        paymentMethod: paymentMethod || 'Online',
        paymentRef: paymentRef || '',
        groupId: sharedGroupId,
        orderId: sharedOrderId,
        createdAt: new Date()
      });

      const saved = await regDoc.save();
      savedRecords.push(saved);

      // Fire-and-forget: generate PDF ticket and email it to each participant
      sendTicketEmail(saved).catch(err =>
        console.error(`[createAdminGroupRegistrations] Ticket email error for ${saved.email}:`, err.message)
      );
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${savedRecords.length} participant ${savedRecords.length === 1 ? 'registration' : 'registrations'}.`,
      groupId: sharedGroupId,
      orderId: sharedOrderId,
      subTotal,
      discountAmount: totalDiscountAmount,
      totalAmount: backendVerifiedTotal,
      discountCode: cleanCoupon,
      count: savedRecords.length,
      data: savedRecords
    });
  } catch (error) {
    console.error('Error creating admin registrations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Bib number generator ──────────────────────────────────────────────────────
// Generates a unique numeric bib that is NOT already in use in the DB.
async function generateUniqueBib() {
  const MAX_ATTEMPTS = 20;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit, 1000-9999
    const existing = await Registration.findOne({ bibNumber: candidate });
    if (!existing) return candidate;
  }
  // Fallback to timestamp suffix to guarantee uniqueness
  return String(Date.now()).slice(-6);
}

// GET /api/admin/registrations/:id/ticket
export const getTicketData = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ success: false, message: 'Database is not connected.' });
    }

    const { id } = req.params;
    const reg = await Registration.findById(id).lean();
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found.' });
    }

    // ── Auto-generate bib number if not yet assigned ──────────────────────────
    let bibNumber = reg.bibNumber || '';
    if (!bibNumber) {
      bibNumber = await generateUniqueBib();
      await Registration.findByIdAndUpdate(id, { bibNumber });
    }

    // ── Resolve city event defaults based on selectedEvent / city ─────────────
    const eventKey = (reg.selectedEvent || reg.city || 'chennai').toLowerCase();
    const cityKey = Object.keys(CITY_EVENT_DEFAULTS).find(k => eventKey.includes(k)) || 'chennai';
    const defaults = CITY_EVENT_DEFAULTS[cityKey];

    // Prefer stored fields over defaults (admin may have set them via PATCH)
    const eventName      = reg.eventName      || defaults.eventName;
    const eventDate      = reg.eventDate      || defaults.eventDate;
    const eventVenue     = reg.eventVenue     || defaults.eventVenue;
    const flagOffTime    = reg.flagOffTime    || defaults.flagOffTime;
    const gatesOpenTime  = reg.gatesOpenTime  || defaults.gatesOpenTime;

    // ── Build short ticket code ───────────────────────────────────────────────
    const dist       = (reg.distance || reg.raceCategory || '5K').split(',')[0].trim().toUpperCase().replace(/\s+/g, '');
    const ticketCode = `RUN-${dist}-${bibNumber}`;

    // ── Build thank-you discount code from runner first name ──────────────────
    const firstWord    = (reg.fullName || 'RUNNER').split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
    const suffix       = Math.random().toString(36).slice(2, 6).toUpperCase();
    const discountCode = `RUN-${firstWord}-${suffix}`;

    const ticketData = {
      runnerName:      reg.fullName     || 'Runner',
      eventName,
      eventDate,
      eventVenue,
      flagOffTime,
      gatesOpenTime,
      distance:        reg.distance     || reg.raceCategory || '5K',
      raceCategory:    reg.raceCategory || reg.distance     || '5K',
      tshirtSize:      reg.tshirtSize   || '—',
      bloodGroup:      reg.bloodGroup   || '—',
      amount:          reg.amount       || 0,
      registrationRef: reg.registrationRef,
      bibNumber,
      ticketCode,
      discountCode
    };

    res.json({ success: true, data: ticketData });
  } catch (error) {
    console.error('Error fetching ticket data:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
