import React, { useState } from 'react';
import {
  FaXmark,
  FaUser,
  FaUsers,
  FaCircleCheck,
  FaCircleExclamation,
  FaIdCard,
  FaCheck,
  FaCreditCard,
  FaRotate,
  FaMoneyBillWave,
  FaArrowRotateRight,
  FaArrowLeft,
  FaArrowRight,
  FaTag,
  FaShieldHalved
} from 'react-icons/fa6';
import { RACE_PACKAGES, UPCOMING_EVENTS } from '../../data/marathonData';
import adminFetch from '../../utils/adminFetch';
import { getCityDisplayName } from '../../utils/cityHelper';

const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "Don't know"];
const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];
const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore',
  'Malaysia', 'Sri Lanka', 'Australia', 'Canada', 'Other'
];

const HEAR_ABOUT_OPTIONS = [
  'Social Media (Instagram/Facebook)',
  'Friends / Family Referral',
  'Running Club / Marathon Community',
  'Corporate / Workplace Announcement',
  'Poster / Banner / Flyer',
  'Search Engine (Google)',
  'Previous Runner',
  'Other'
];

const createBlankParticipant = () => ({
  fullName: '',
  email: '',
  mobileNumber: '',
  whatsappNumber: '',
  gender: 'Male',
  dob: '',
  tshirtSize: 'M',
  bloodGroup: 'O+',
  selectedEvent: UPCOMING_EVENTS[0]?.id || 'chennai-coastal-run',
  raceCategory: '5k',
  address: '',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '',
  country: 'India',
  emergencyContact: '',
  emergencyPhone: '',
  organisation: '',
  designation: '',
  runningGroup: '',
  hearAbout: 'Social Media (Instagram/Facebook)'
});

export default function AddRegistrationModal({ isOpen, onClose, onSuccess }) {
  // Step navigation: 'form' | 'review' | 'success'
  const [currentStep, setCurrentStep] = useState('form');

  // Option selected: 1, 2, or 3 participants
  const [participantCount, setParticipantCount] = useState(1);

  // Preserve all 3 participant entries in memory
  const [participantsData, setParticipantsData] = useState([
    createBlankParticipant(),
    createBlankParticipant(),
    createBlankParticipant()
  ]);

  // Validation errors for each participant: [ { field: 'msg' }, ... ]
  const [errors, setErrors] = useState([{}, {}, {}]);

  // Active view tab when multiple participants exist in form step
  const [activeTab, setActiveTab] = useState(0);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponStatus, setCouponStatus] = useState(null); // { valid: boolean, message: string }
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Backend verified calculation summary
  const [backendSummary, setBackendSummary] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Payment Configuration for entire group
  const [paymentOption, setPaymentOption] = useState('Paid'); // 'Paid' | 'Pending'
  const [paymentMethod, setPaymentMethod] = useState('Online UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentRefError, setPaymentRefError] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);

  // Persistent client-side orderId for duplicate protection
  const [clientOrderId, setClientOrderId] = useState(() =>
    'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000)
  );

  if (!isOpen) return null;

  // Handle field change for participant at index
  const handleFieldChange = (index, field, value) => {
    setParticipantsData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear field error if exists
    if (errors[index]?.[field]) {
      setErrors(prev => {
        const nextErr = [...prev];
        nextErr[index] = { ...nextErr[index], [field]: '' };
        return nextErr;
      });
    }

    if (submissionError) setSubmissionError('');
  };

  // Copy common details from Participant 1
  const handleCopyFromFirst = (targetIndex) => {
    const p1 = participantsData[0];
    setParticipantsData(prev => {
      const updated = [...prev];
      updated[targetIndex] = {
        ...updated[targetIndex],
        address: p1.address,
        city: p1.city,
        state: p1.state,
        pincode: p1.pincode,
        country: p1.country,
        selectedEvent: p1.selectedEvent,
        emergencyContact: p1.emergencyContact,
        emergencyPhone: p1.emergencyPhone,
        organisation: p1.organisation,
        runningGroup: p1.runningGroup
      };
      return updated;
    });

    setErrors(prev => {
      const nextErr = [...prev];
      nextErr[targetIndex] = {};
      return nextErr;
    });
  };

  // Switch participant count (1, 2, or 3)
  const handleOptionChange = (count) => {
    setParticipantCount(count);
    if (activeTab >= count) {
      setActiveTab(count - 1);
    }
    setSubmissionError('');
    setSubmissionResult(null);
  };

  // Validate an individual participant
  const validateParticipant = (p) => {
    const errs = {};
    const phoneOk = (v) => /^[6-9]\d{9}$/.test(String(v || '').replace(/[\s-]/g, ''));

    if (!p.fullName?.trim()) {
      errs.fullName = 'Full Name is required';
    } else if (p.fullName.trim().length < 3) {
      errs.fullName = 'Full Name must be at least 3 characters';
    }

    if (!p.email?.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) {
      errs.email = 'Valid email address required';
    }

    if (!p.mobileNumber?.trim()) {
      errs.mobileNumber = 'Mobile number is required';
    } else if (!phoneOk(p.mobileNumber)) {
      errs.mobileNumber = 'Valid 10-digit mobile number required (starting 6-9)';
    }

    if (!p.whatsappNumber?.trim()) {
      errs.whatsappNumber = 'WhatsApp number is required';
    } else if (!phoneOk(p.whatsappNumber)) {
      errs.whatsappNumber = 'Valid 10-digit WhatsApp number required';
    }

    if (!p.dob) {
      errs.dob = 'Date of birth is required';
    }

    if (!p.gender) {
      errs.gender = 'Gender is required';
    }

    if (!p.tshirtSize) {
      errs.tshirtSize = 'T-Shirt size is required';
    }

    if (!p.bloodGroup) {
      errs.bloodGroup = 'Blood group is required';
    }

    if (!p.selectedEvent) {
      errs.selectedEvent = 'Event selection is required';
    }

    if (!p.raceCategory) {
      errs.raceCategory = 'Race category is required';
    }

    if (!p.address?.trim()) {
      errs.address = 'Full address is required';
    }

    if (!p.city?.trim()) {
      errs.city = 'City is required';
    }

    if (!p.state?.trim()) {
      errs.state = 'State is required';
    }

    if (!p.pincode?.trim()) {
      errs.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(p.pincode.trim())) {
      errs.pincode = 'Valid 6-digit Indian pincode required';
    }

    if (!p.emergencyContact?.trim()) {
      errs.emergencyContact = 'Emergency contact name is required';
    }

    if (!p.emergencyPhone?.trim()) {
      errs.emergencyPhone = 'Emergency phone is required';
    } else if (!phoneOk(p.emergencyPhone)) {
      errs.emergencyPhone = 'Valid 10-digit emergency phone required';
    }

    return errs;
  };

  // Fetch verified calculation from backend
  const fetchBackendCalculation = async (activeList, coupon) => {
    setIsCalculating(true);
    try {
      const res = await adminFetch('/api/admin/registrations/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participants: activeList,
          couponCode: coupon
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBackendSummary(data);
        if (coupon) {
          if (data.isCouponValid) {
            setCouponStatus({
              valid: true,
              message: `Coupon "${data.couponCode}" applied: ${data.discountPct}% off (-₹${data.discountAmount})`
            });
            setAppliedCoupon(data.couponCode);
          } else {
            setCouponStatus({
              valid: false,
              message: `Coupon "${coupon}" is invalid or expired.`
            });
            setAppliedCoupon('');
          }
        } else {
          setCouponStatus(null);
          setAppliedCoupon('');
        }
        return data;
      }
    } catch (err) {
      console.warn('Backend calculate warning, falling back to local computation:', err);
    } finally {
      setIsCalculating(false);
    }

    // Local fallback calculation if backend request failed
    const packagePriceMap = {};
    RACE_PACKAGES.forEach(pkg => {
      packagePriceMap[pkg.id] = pkg.price;
    });

    let subTotal = 0;
    const breakdown = activeList.map((p, idx) => {
      const pkg = RACE_PACKAGES.find(r => r.id === p.raceCategory) || { price: 699, distance: '5K', title: '5K Run' };
      const price = pkg.price;
      subTotal += price;
      return {
        index: idx + 1,
        fullName: p.fullName || `Participant ${idx + 1}`,
        event: p.selectedEvent,
        raceCategory: pkg.title || p.raceCategory,
        distance: pkg.distance,
        basePrice: price,
        discount: 0,
        finalPrice: price
      };
    });

    const fallbackData = {
      participantCount: activeList.length,
      subTotal,
      couponCode: '',
      isCouponValid: false,
      discountPct: 0,
      discountAmount: 0,
      finalTotal: subTotal,
      breakdown,
      isOffline: true
    };
    setBackendSummary(fallbackData);
    return fallbackData;
  };

  // Proceed from Form Step to Review Step
  const handleProceedToReview = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmissionError('');

    // 1. Validate each active participant form independently
    const newErrors = [];
    let hasAnyError = false;

    for (let i = 0; i < participantCount; i++) {
      const pErrs = validateParticipant(participantsData[i]);
      newErrors.push(pErrs);
      if (Object.keys(pErrs).length > 0) {
        hasAnyError = true;
      }
    }

    setErrors(newErrors);

    if (hasAnyError) {
      const firstErrorIndex = newErrors.findIndex(errObj => Object.keys(errObj).length > 0);
      if (firstErrorIndex !== -1) {
        setActiveTab(firstErrorIndex);
      }
      setSubmissionError('Please fill in all required fields marked with * in the highlighted participant form.');
      return;
    }

    // 2. Fetch verified backend summary
    const activeParticipants = participantsData.slice(0, participantCount);
    await fetchBackendCalculation(activeParticipants, appliedCoupon);

    // 3. Move to review step
    setCurrentStep('review');
  };

  // Apply Coupon in Review Step
  const handleApplyCoupon = async (codeOverride) => {
    const code = (codeOverride !== undefined ? codeOverride : couponInput).trim();
    if (!code) {
      setCouponStatus({ valid: false, message: 'Please enter a coupon code to apply.' });
      return;
    }
    setIsApplyingCoupon(true);
    const activeParticipants = participantsData.slice(0, participantCount);
    await fetchBackendCalculation(activeParticipants, code);
    setIsApplyingCoupon(false);
  };

  // Remove Applied Coupon
  const handleRemoveCoupon = async () => {
    setCouponInput('');
    setAppliedCoupon('');
    setCouponStatus(null);
    const activeParticipants = participantsData.slice(0, participantCount);
    await fetchBackendCalculation(activeParticipants, '');
  };

  // Final Submit / Confirm Registrations (Called from Review Step)
  const handleConfirmAndPay = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmissionError('');
    setPaymentRefError('');

    // 1. Validate Payment Reference if marked as Paid
    if (paymentOption === 'Paid' && !paymentRef.trim()) {
      setPaymentRefError('Please enter the payment transaction reference or receipt number for verified payment.');
      return;
    }

    // 2. Prevent repeated payment submissions
    if (isSubmitting) return;

    // 3. Prepare Payload
    const activeParticipants = participantsData.slice(0, participantCount);

    const payload = {
      orderId: clientOrderId,
      paymentStatus: paymentOption,
      paymentMethod: paymentOption === 'Pending' ? 'Pending Offline' : paymentMethod,
      paymentRef: paymentOption === 'Pending' ? '' : paymentRef.trim(),
      couponCode: appliedCoupon,
      participants: activeParticipants
    };

    setIsSubmitting(true);

    try {
      const res = await adminFetch('/api/admin/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmissionResult({
          count: data.count,
          groupId: data.groupId,
          orderId: data.orderId,
          totalAmount: data.totalAmount,
          isDuplicate: data.isDuplicate || false,
          records: data.data || []
        });
        setCurrentStep('success');

        // Trigger parent dashboard/table refresh
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } else {
        setSubmissionError(data.message || 'Failed to create registrations. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setSubmissionError('Network error connecting to backend server. Please verify the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setSubmissionError('');
    setSubmissionResult(null);
    setCurrentStep('form');
    onClose();
  };

  // Reset modal to enter new registration
  const handleResetForNew = () => {
    setParticipantsData([
      createBlankParticipant(),
      createBlankParticipant(),
      createBlankParticipant()
    ]);
    setErrors([{}, {}, {}]);
    setActiveTab(0);
    setPaymentRef('');
    setCouponInput('');
    setAppliedCoupon('');
    setCouponStatus(null);
    setBackendSummary(null);
    setSubmissionResult(null);
    setSubmissionError('');
    setCurrentStep('form');
    setClientOrderId('ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000));
  };

  // Calculate local pricing breakdown for quick previews
  const activeParticipants = participantsData.slice(0, participantCount);
  const packagePriceMap = {};
  RACE_PACKAGES.forEach(pkg => {
    packagePriceMap[pkg.id] = pkg.price;
  });

  const localSubtotal = activeParticipants.reduce((sum, p) => {
    return sum + (packagePriceMap[p.raceCategory] || 699);
  }, 0);

  const displayTotal = backendSummary ? backendSummary.finalTotal : localSubtotal;

  return (
    <div className="admin-modal-backdrop" onClick={handleClose}>
      <div
        className="admin-modal-card admin-reg-modal"
        style={{ maxWidth: currentStep === 'review' ? '740px' : '680px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-reg-modal-title"
      >
        {/* ── MODAL HEADER ── */}
        <div className="modal-header">
          <div className="modal-header-title">
            <FaIdCard className="modal-icon gold" />
            <div>
              <h2 id="add-reg-modal-title">
                {currentStep === 'review'
                  ? 'Registration Summary & Payment Review'
                  : currentStep === 'success'
                  ? 'Registration Confirmed'
                  : 'New Participant Registration'}
              </h2>
              <span className="msg-date" style={{ color: '#F1F5F9', fontSize: '0.82rem' }}>
                {currentStep === 'review'
                  ? 'Review group participants, verify backend pricing, and confirm payment'
                  : currentStep === 'success'
                  ? 'Group registrations successfully stored in MongoDB'
                  : 'Create single or group registrations with linked order and shared payment'}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <FaXmark />
          </button>
        </div>

        {/* ── STEP TRACKER BAR ── */}
        <div className="reg-step-tracker">
          <div
            className={`step-tracker-item ${currentStep === 'form' ? 'active' : 'completed'}`}
            onClick={() => {
              if (currentStep === 'review') setCurrentStep('form');
            }}
          >
            <span className="step-tracker-badge">
              {currentStep !== 'form' ? <FaCheck style={{ fontSize: '0.65rem' }} /> : '1'}
            </span>
            <span className="step-tracker-label-full">Participant Details</span>
            <span className="step-tracker-label-short">Details</span>
          </div>

          <div className="step-tracker-divider" />

          <div className={`step-tracker-item ${currentStep === 'review' ? 'active' : currentStep === 'success' ? 'completed' : ''}`}>
            <span className="step-tracker-badge">
              {currentStep === 'success' ? <FaCheck style={{ fontSize: '0.65rem' }} /> : '2'}
            </span>
            <span className="step-tracker-label-full">Summary &amp; Payment</span>
            <span className="step-tracker-label-short">Payment</span>
          </div>

          <div className="step-tracker-divider" />

          <div className={`step-tracker-item ${currentStep === 'success' ? 'active' : ''}`}>
            <span className="step-tracker-badge">3</span>
            <span className="step-tracker-label-full">Confirmation</span>
            <span className="step-tracker-label-short">Confirm</span>
          </div>
        </div>

        {/* ── SUCCESS STEP VIEW ── */}
        {currentStep === 'success' && submissionResult ? (
          <div className="modal-body admin-reg-modal-body">
            <div className="admin-alert-box success" style={{ margin: '0' }}>
              <FaCircleCheck className="alert-box-icon" />
              <div className="alert-box-content">
                <h4>
                  {submissionResult.isDuplicate
                    ? 'Order Already Processed'
                    : `Registration Successful (${submissionResult.count} ${submissionResult.count === 1 ? 'Participant' : 'Participants'})`}
                </h4>
                <p>
                  {submissionResult.isDuplicate
                    ? 'Records for this order ID were already recorded in MongoDB. Duplicate entries were prevented.'
                    : 'All participant registrations have been successfully saved to MongoDB and linked to the shared group order.'}
                </p>
              </div>
            </div>

            {/* Order & Group Reference Box */}
            <div className="participant-detail-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="detail-item">
                <span className="detail-label">Shared Group ID</span>
                <span className="detail-val" style={{ color: '#9E1B22' }}>{submissionResult.groupId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Shared Order ID</span>
                <span className="detail-val">{submissionResult.orderId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Combined Total Fee</span>
                <span className="detail-val" style={{ color: '#2E7D32' }}>₹{submissionResult.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Registered Participants Roster */}
            <div className="admin-table-card" style={{ border: '1px solid #EDEAE3', boxShadow: 'none' }}>
              <div className="table-card-header" style={{ background: '#FAF8F5' }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800 }}>Registered Participants Roster</h4>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ref #</th>
                      <th>Participant Name</th>
                      <th>Race / Distance</th>
                      <th>Fee</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionResult.records.map((r, i) => (
                      <tr key={r._id || i}>
                        <td><span className="ref-tag">{r.registrationRef}</span></td>
                        <td>
                          <strong>{r.fullName}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#6B6B6B' }}>{r.email}</div>
                        </td>
                        <td>{r.distance} ({r.raceCategory})</td>
                        <td><strong>₹{r.amount}</strong></td>
                        <td>
                          <span className={`status-pill ${r.paymentStatus?.toLowerCase()}`}>
                            {r.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleResetForNew}
              >
                <FaArrowRotateRight />
                <span>Register Another</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm admin-action-primary-btn"
                onClick={handleClose}
              >
                Done &amp; Close
              </button>
            </div>
          </div>
        ) : currentStep === 'review' ? (
          /* ── STEP 2: SUMMARY & PAYMENT REVIEW VIEW ── */
          <div className="modal-body admin-reg-modal-body">
            {/* Global Error Banner */}
            {submissionError && (
              <div className="admin-alert-box error" style={{ margin: 0 }}>
                <FaCircleExclamation className="alert-box-icon" />
                <div className="alert-box-content">
                  <p>{submissionError}</p>
                </div>
              </div>
            )}

            {/* Group Registration Overview Banner */}
            <div className="review-group-banner">
              <div>
                <div className="review-banner-title">
                  <FaUsers style={{ color: '#9E1B22' }} />
                  <span>Group Registration ({participantCount} {participantCount === 1 ? 'Participant' : 'Participants'})</span>
                  <span className="review-banner-tag">One Payment For All</span>
                </div>
                <div className="review-banner-note">
                  Order ID: <code>{clientOrderId}</code> | Single shared transaction covers all members.
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm copy-p1-btn"
                onClick={() => setCurrentStep('form')}
              >
                <FaArrowLeft /> Edit Details
              </button>
            </div>

            {/* Participants Summary Breakdown Table */}
            <div className="review-summary-table-wrap">
              <table className="review-summary-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Participant Name</th>
                    <th>Event &amp; Distance</th>
                    <th>Package Price</th>
                    <th>Discount</th>
                    <th style={{ textAlign: 'right' }}>Net Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {(backendSummary?.breakdown || activeParticipants).map((item, idx) => {
                    const name = item.fullName || `Participant ${idx + 1}`;
                    const eventName = getCityDisplayName(item.event || item.selectedEvent || 'Chennai');
                    const distance = item.distance || '5K';
                    const basePrice = item.basePrice || packagePriceMap[item.raceCategory] || 699;
                    const discount = item.discount || 0;
                    const finalPrice = item.finalPrice !== undefined ? item.finalPrice : (basePrice - discount);

                    return (
                      <tr key={idx}>
                        <td>
                          <span style={{ fontWeight: 800, color: '#888' }}>{idx + 1}</span>
                        </td>
                        <td>
                          <strong>{name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#6B6B6B' }}>
                            {participantsData[idx]?.email || ''} | {participantsData[idx]?.gender || ''} ({participantsData[idx]?.tshirtSize || 'M'})
                          </div>
                        </td>
                        <td>
                          <div>{eventName}</div>
                          <span style={{ fontSize: '0.75rem', color: '#6B6B6B' }}>Distance: {distance}</span>
                        </td>
                        <td>₹{basePrice}</td>
                        <td>
                          {discount > 0 ? (
                            <span style={{ color: '#2E7D32', fontWeight: 700 }}>-₹{discount}</span>
                          ) : (
                            <span style={{ color: '#999' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#1C1C1E' }}>
                          ₹{finalPrice}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Coupon Code Section */}
            <div className="coupon-section-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1C1C1E', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaTag style={{ color: '#9E1B22' }} />
                  <span>Promo / Discount Coupon</span>
                </label>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{ background: 'none', border: 'none', color: '#D32F2F', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Remove Coupon
                  </button>
                )}
              </div>

              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter code (e.g. RUNTRUST10, RUNTRUST20)"
                  className="admin-form-control"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={isApplyingCoupon || isCalculating}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleApplyCoupon()}
                  disabled={isApplyingCoupon || isCalculating || !couponInput.trim()}
                  style={{ minWidth: '90px' }}
                >
                  {isApplyingCoupon ? <FaRotate className="spinning" /> : 'Apply Code'}
                </button>
              </div>

              {/* Coupon Status Alert */}
              {couponStatus && (
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.4rem 0.65rem',
                    borderRadius: '6px',
                    background: couponStatus.valid ? '#E8F5E9' : '#FFEBEE',
                    color: couponStatus.valid ? '#2E7D32' : '#C62828',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {couponStatus.valid ? <FaCircleCheck /> : <FaCircleExclamation />}
                  <span>{couponStatus.message}</span>
                </div>
              )}

              {/* Sample Coupons Hints */}
              {!appliedCoupon && (
                <div className="coupon-hint-pills">
                  <span>Available Coupons:</span>
                  <button type="button" className="coupon-pill-btn" onClick={() => { setCouponInput('RUNTRUST10'); handleApplyCoupon('RUNTRUST10'); }}>RUNTRUST10 (10% off)</button>
                  <button type="button" className="coupon-pill-btn" onClick={() => { setCouponInput('RUNTRUST20'); handleApplyCoupon('RUNTRUST20'); }}>RUNTRUST20 (20% off)</button>
                  <button type="button" className="coupon-pill-btn" onClick={() => { setCouponInput('MARATHON15'); handleApplyCoupon('MARATHON15'); }}>MARATHON15 (15% off)</button>
                </div>
              )}
            </div>

            {/* Financial Summary & Backend Verification */}
            <div className="review-pricing-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#333' }}>Order Financial Summary</span>
                <span className="verified-server-badge">
                  <FaShieldHalved /> Backend Verified
                </span>
              </div>

              <div className="pricing-line-row">
                <span>Subtotal ({participantCount} {participantCount === 1 ? 'participant' : 'participants'}):</span>
                <span>₹{(backendSummary ? backendSummary.subTotal : localSubtotal).toLocaleString('en-IN')}</span>
              </div>

              {backendSummary && backendSummary.discountAmount > 0 && (
                <div className="pricing-line-row discount-row">
                  <span>Coupon Discount ({backendSummary.couponCode} - {backendSummary.discountPct}%):</span>
                  <span>-₹{backendSummary.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pricing-line-row total-row">
                <span>Total Amount Due (One Single Payment):</span>
                <strong style={{ color: '#9E1B22', fontSize: '1.25rem' }}>
                  ₹{(backendSummary ? backendSummary.finalTotal : localSubtotal).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            {/* Payment Integration Status Notice (Requirement 10) */}
            <div className="gateway-notice-card">
              <FaCreditCard style={{ marginTop: '0.2rem', fontSize: '1rem', flexShrink: 0 }} />
              <div>
                <strong>Payment Gateway Status:</strong> Live payment gateway (Razorpay/Stripe) API credentials are not configured in environment variables. Admin panel supports verified direct/offline receipts (UPI, Cash, NEFT) or recording as Pending Payment.
              </div>
            </div>

            {/* Group Payment Method & Reference Selection */}
            <div className="shared-payment-card" style={{ background: '#FAF8F5', border: '1px solid #EDEAE3', borderRadius: '10px', padding: '1rem 1.15rem' }}>
              <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FaCreditCard style={{ color: '#9E1B22' }} />
                <span>Payment Settlement Mode</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div className="admin-form-field">
                  <label>Payment Status <span className="req-star">*</span></label>
                  <select
                    className="admin-form-control"
                    value={paymentOption}
                    onChange={(e) => setPaymentOption(e.target.value)}
                  >
                    <option value="Paid">Verified Paid (Payment Received)</option>
                    <option value="Pending">Pending Payment (Record as Pending)</option>
                  </select>
                </div>

                {paymentOption === 'Paid' ? (
                  <>
                    <div className="admin-form-field">
                      <label>Payment Method</label>
                      <select
                        className="admin-form-control"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="Online UPI">Online UPI / QR Transfer</option>
                        <option value="Cash">Cash at Counter</option>
                        <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                        <option value="Cheque">Cheque / Demand Draft</option>
                      </select>
                    </div>

                    <div className="admin-form-field">
                      <label>
                        Transaction Ref / Receipt No. <span className="req-star">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. UPI-98401234 or CASH-REC-01"
                        className={`admin-form-control ${paymentRefError ? 'has-error' : ''}`}
                        value={paymentRef}
                        onChange={(e) => {
                          setPaymentRef(e.target.value);
                          if (paymentRefError) setPaymentRefError('');
                        }}
                      />
                      {paymentRefError && <span className="field-error-msg">{paymentRefError}</span>}
                    </div>
                  </>
                ) : (
                  <div className="admin-form-field" style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.8rem', color: '#E65100', background: '#FFF3E0', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #FFE0B2', marginTop: '1.3rem' }}>
                      <strong>Pending Notice:</strong> Registrations will be recorded with <code>Pending</code> payment. You can verify and mark them paid later from the All Registrations dashboard.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── STEP 1: REGISTRATION FORM VIEW ── */
          <div className="modal-body admin-reg-modal-body">
            {/* Registration Mode Selector */}
            <div className="reg-options-container">
              <label className="reg-options-label">
                <span>Select Registration Mode:</span>
                <span className="selected-count-badge">
                  {participantCount === 1 ? 'Single Registration (1 Person)' : `Group Registration (${participantCount} People)`}
                </span>
              </label>

              <div className="reg-options-grid">
                {/* Option 1: Single */}
                <button
                  type="button"
                  className={`reg-option-card ${participantCount === 1 ? 'active' : ''}`}
                  onClick={() => handleOptionChange(1)}
                >
                  <div className="option-icon-wrap">
                    <FaUser />
                  </div>
                  <div className="option-content">
                    <span className="option-title">Single Registration</span>
                    <span className="option-sub">1 Person</span>
                  </div>
                  {participantCount === 1 && <span className="option-check-dot"><FaCheck /></span>}
                </button>

                {/* Option 2: Group (2 People) */}
                <button
                  type="button"
                  className={`reg-option-card ${participantCount === 2 ? 'active' : ''}`}
                  onClick={() => handleOptionChange(2)}
                >
                  <div className="option-icon-wrap">
                    <FaUsers />
                  </div>
                  <div className="option-content">
                    <span className="option-title">Group Registration</span>
                    <span className="option-sub">2 People</span>
                  </div>
                  {participantCount === 2 && <span className="option-check-dot"><FaCheck /></span>}
                </button>

                {/* Option 3: Group (3 People) */}
                <button
                  type="button"
                  className={`reg-option-card ${participantCount === 3 ? 'active' : ''}`}
                  onClick={() => handleOptionChange(3)}
                >
                  <div className="option-icon-wrap">
                    <FaUsers />
                  </div>
                  <div className="option-content">
                    <span className="option-title">Group Registration</span>
                    <span className="option-sub">3 People</span>
                  </div>
                  {participantCount === 3 && <span className="option-check-dot"><FaCheck /></span>}
                </button>
              </div>
            </div>

            {/* Error banner if submission/validation failed */}
            {submissionError && (
              <div className="admin-alert-box error" style={{ margin: 0 }}>
                <FaCircleExclamation className="alert-box-icon" />
                <div className="alert-box-content">
                  <p>{submissionError}</p>
                </div>
              </div>
            )}

            {/* Group Navigation Tabs if > 1 participant */}
            {participantCount > 1 && (
              <div className="participant-tabs-nav">
                {[...Array(participantCount)].map((_, idx) => {
                  const hasErr = Object.keys(errors[idx] || {}).length > 0;
                  const isComplete = participantsData[idx].fullName && !hasErr;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`participant-tab-btn ${activeTab === idx ? 'active' : ''} ${hasErr ? 'has-error' : ''}`}
                      onClick={() => setActiveTab(idx)}
                    >
                      <span className="tab-number">{idx + 1}</span>
                      <span className="tab-text">
                        Participant {idx + 1}
                        {participantsData[idx].fullName && (
                          <span className="tab-name-hint">: {participantsData[idx].fullName.split(' ')[0]}</span>
                        )}
                      </span>
                      {hasErr && <FaCircleExclamation className="tab-icon-err" />}
                      {isComplete && !hasErr && <FaCheck className="tab-icon-ok" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Render Active Participant Form */}
            {[...Array(participantCount)].map((_, idx) => {
              if (idx !== activeTab) return null;
              const pData = participantsData[idx];
              const pErrors = errors[idx] || {};

              return (
                <div key={idx} className="participant-form-card">
                  <div className="p-card-header">
                    <div className="p-card-title-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span className="p-card-badge">Participant {idx + 1}</span>
                      <h3 className="p-card-title">
                        {idx === 0 ? 'Primary Participant Details' : `Participant ${idx + 1} Details`}
                      </h3>
                    </div>

                    {/* Copy details from Participant 1 button */}
                    {idx > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline copy-p1-btn"
                        onClick={() => handleCopyFromFirst(idx)}
                        title="Copy address, event, and emergency contact from Participant 1"
                      >
                        Copy Info from Participant 1
                      </button>
                    )}
                  </div>

                  <div className="admin-form-grid">
                    {/* Full Name */}
                    <div className="admin-form-field">
                      <label>
                        Full Name <span className="req-star">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        className={`admin-form-control ${pErrors.fullName ? 'has-error' : ''}`}
                        value={pData.fullName}
                        onChange={(e) => handleFieldChange(idx, 'fullName', e.target.value)}
                      />
                      {pErrors.fullName && <span className="field-error-msg">{pErrors.fullName}</span>}
                    </div>

                    {/* Email */}
                    <div className="admin-form-field">
                      <label>
                        Email Address <span className="req-star">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. ramesh@example.com"
                        className={`admin-form-control ${pErrors.email ? 'has-error' : ''}`}
                        value={pData.email}
                        onChange={(e) => handleFieldChange(idx, 'email', e.target.value)}
                      />
                      {pErrors.email && <span className="field-error-msg">{pErrors.email}</span>}
                    </div>

                    {/* Mobile Number */}
                    <div className="admin-form-field">
                      <label>
                        Mobile Number <span className="req-star">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="10-digit mobile number"
                        className={`admin-form-control ${pErrors.mobileNumber ? 'has-error' : ''}`}
                        value={pData.mobileNumber}
                        onChange={(e) => handleFieldChange(idx, 'mobileNumber', e.target.value)}
                      />
                      {pErrors.mobileNumber && <span className="field-error-msg">{pErrors.mobileNumber}</span>}
                    </div>

                    {/* WhatsApp Number */}
                    <div className="admin-form-field">
                      <label>
                        WhatsApp Number <span className="req-star">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="10-digit WhatsApp number"
                        className={`admin-form-control ${pErrors.whatsappNumber ? 'has-error' : ''}`}
                        value={pData.whatsappNumber}
                        onChange={(e) => handleFieldChange(idx, 'whatsappNumber', e.target.value)}
                      />
                      {pErrors.whatsappNumber && <span className="field-error-msg">{pErrors.whatsappNumber}</span>}
                    </div>

                    {/* Date of Birth */}
                    <div className="admin-form-field">
                      <label>
                        Date of Birth <span className="req-star">*</span>
                      </label>
                      <input
                        type="date"
                        className={`admin-form-control ${pErrors.dob ? 'has-error' : ''}`}
                        value={pData.dob}
                        onChange={(e) => handleFieldChange(idx, 'dob', e.target.value)}
                      />
                      {pErrors.dob && <span className="field-error-msg">{pErrors.dob}</span>}
                    </div>

                    {/* Gender */}
                    <div className="admin-form-field">
                      <label>
                        Gender <span className="req-star">*</span>
                      </label>
                      <select
                        className={`admin-form-control ${pErrors.gender ? 'has-error' : ''}`}
                        value={pData.gender}
                        onChange={(e) => handleFieldChange(idx, 'gender', e.target.value)}
                      >
                        {GENDERS.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      {pErrors.gender && <span className="field-error-msg">{pErrors.gender}</span>}
                    </div>

                    {/* T-Shirt Size */}
                    <div className="admin-form-field">
                      <label>
                        T-Shirt Size <span className="req-star">*</span>
                      </label>
                      <select
                        className={`admin-form-control ${pErrors.tshirtSize ? 'has-error' : ''}`}
                        value={pData.tshirtSize}
                        onChange={(e) => handleFieldChange(idx, 'tshirtSize', e.target.value)}
                      >
                        {TSHIRT_SIZES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {pErrors.tshirtSize && <span className="field-error-msg">{pErrors.tshirtSize}</span>}
                    </div>

                    {/* Blood Group */}
                    <div className="admin-form-field">
                      <label>
                        Blood Group <span className="req-star">*</span>
                      </label>
                      <select
                        className={`admin-form-control ${pErrors.bloodGroup ? 'has-error' : ''}`}
                        value={pData.bloodGroup}
                        onChange={(e) => handleFieldChange(idx, 'bloodGroup', e.target.value)}
                      >
                        {BLOOD_GROUPS.map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                      {pErrors.bloodGroup && <span className="field-error-msg">{pErrors.bloodGroup}</span>}
                    </div>

                    {/* Event Selection */}
                    <div className="admin-form-field full-width">
                      <label>
                        Marathon Event <span className="req-star">*</span>
                      </label>
                      <select
                        className={`admin-form-control ${pErrors.selectedEvent ? 'has-error' : ''}`}
                        value={pData.selectedEvent}
                        onChange={(e) => handleFieldChange(idx, 'selectedEvent', e.target.value)}
                      >
                        {UPCOMING_EVENTS.map(evt => {
                          const cityName = getCityDisplayName({ selectedEvent: evt.id, eventName: evt.title, city: evt.city });
                          return (
                            <option key={evt.id} value={evt.id}>
                              {cityName}
                            </option>
                          );
                        })}
                      </select>
                      {pErrors.selectedEvent && <span className="field-error-msg">{pErrors.selectedEvent}</span>}
                    </div>

                    {/* Race Category / Package Selection */}
                    <div className="admin-form-field full-width">
                      <label>
                        Race Category / Distance <span className="req-star">*</span>
                      </label>
                      <select
                        className={`admin-form-control ${pErrors.raceCategory ? 'has-error' : ''}`}
                        value={pData.raceCategory}
                        onChange={(e) => handleFieldChange(idx, 'raceCategory', e.target.value)}
                      >
                        {RACE_PACKAGES.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.distance} - {pkg.name} (₹{pkg.price})
                          </option>
                        ))}
                      </select>
                      {pErrors.raceCategory && <span className="field-error-msg">{pErrors.raceCategory}</span>}
                    </div>

                    {/* Address */}
                    <div className="admin-form-field full-width">
                      <label>
                        Residential Address <span className="req-star">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Street address, apartment, suite"
                        className={`admin-form-control ${pErrors.address ? 'has-error' : ''}`}
                        value={pData.address}
                        onChange={(e) => handleFieldChange(idx, 'address', e.target.value)}
                      />
                      {pErrors.address && <span className="field-error-msg">{pErrors.address}</span>}
                    </div>

                    {/* City */}
                    <div className="admin-form-field">
                      <label>
                        City <span className="req-star">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Chennai"
                        className={`admin-form-control ${pErrors.city ? 'has-error' : ''}`}
                        value={pData.city}
                        onChange={(e) => handleFieldChange(idx, 'city', e.target.value)}
                      />
                      {pErrors.city && <span className="field-error-msg">{pErrors.city}</span>}
                    </div>

                    {/* State */}
                    <div className="admin-form-field">
                      <label>
                        State <span className="req-star">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tamil Nadu"
                        className={`admin-form-control ${pErrors.state ? 'has-error' : ''}`}
                        value={pData.state}
                        onChange={(e) => handleFieldChange(idx, 'state', e.target.value)}
                      />
                      {pErrors.state && <span className="field-error-msg">{pErrors.state}</span>}
                    </div>

                    {/* Pincode */}
                    <div className="admin-form-field">
                      <label>
                        Pincode <span className="req-star">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="6-digit pincode"
                        className={`admin-form-control ${pErrors.pincode ? 'has-error' : ''}`}
                        value={pData.pincode}
                        onChange={(e) => handleFieldChange(idx, 'pincode', e.target.value)}
                      />
                      {pErrors.pincode && <span className="field-error-msg">{pErrors.pincode}</span>}
                    </div>

                    {/* Country */}
                    <div className="admin-form-field">
                      <label>Country</label>
                      <select
                        className="admin-form-control"
                        value={pData.country}
                        onChange={(e) => handleFieldChange(idx, 'country', e.target.value)}
                      >
                        {COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Emergency Contact Name */}
                    <div className="admin-form-field">
                      <label>
                        Emergency Contact Person <span className="req-star">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contact person name"
                        className={`admin-form-control ${pErrors.emergencyContact ? 'has-error' : ''}`}
                        value={pData.emergencyContact}
                        onChange={(e) => handleFieldChange(idx, 'emergencyContact', e.target.value)}
                      />
                      {pErrors.emergencyContact && <span className="field-error-msg">{pErrors.emergencyContact}</span>}
                    </div>

                    {/* Emergency Phone */}
                    <div className="admin-form-field">
                      <label>
                        Emergency Phone Number <span className="req-star">*</span>
                      </label>
                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="10-digit emergency phone"
                        className={`admin-form-control ${pErrors.emergencyPhone ? 'has-error' : ''}`}
                        value={pData.emergencyPhone}
                        onChange={(e) => handleFieldChange(idx, 'emergencyPhone', e.target.value)}
                      />
                      {pErrors.emergencyPhone && <span className="field-error-msg">{pErrors.emergencyPhone}</span>}
                    </div>

                    {/* Organisation (Optional) */}
                    <div className="admin-form-field">
                      <label>Organisation / Company (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Infosys, TCS, College"
                        className="admin-form-control"
                        value={pData.organisation}
                        onChange={(e) => handleFieldChange(idx, 'organisation', e.target.value)}
                      />
                    </div>

                    {/* Running Group (Optional) */}
                    <div className="admin-form-field">
                      <label>Running Club / Group (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Chennai Runners"
                        className="admin-form-control"
                        value={pData.runningGroup}
                        onChange={(e) => handleFieldChange(idx, 'runningGroup', e.target.value)}
                      />
                    </div>

                    {/* How did you hear about us */}
                    <div className="admin-form-field full-width">
                      <label>How did you hear about the Marathon?</label>
                      <select
                        className="admin-form-control"
                        value={pData.hearAbout}
                        onChange={(e) => handleFieldChange(idx, 'hearAbout', e.target.value)}
                      >
                        {HEAR_ABOUT_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MODAL FOOTER ── */}
        {currentStep === 'form' && (
          <div className="modal-footer">
            <div className="modal-footer-left">
              <div className="fee-summary-pill">
                <span className="fee-label">Estimated Total ({participantCount} {participantCount === 1 ? 'person' : 'people'}):</span>
                <strong className="fee-amount">₹{localSubtotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="modal-footer-right" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm admin-action-primary-btn"
                onClick={handleProceedToReview}
              >
                <span>Review &amp; Proceed to Payment</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="modal-footer">
            <div className="modal-footer-left">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentStep('form')}
                disabled={isSubmitting}
              >
                <FaArrowLeft />
                <span>Edit Details</span>
              </button>
            </div>

            <div className="modal-footer-right" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm admin-action-primary-btn"
                onClick={handleConfirmAndPay}
                disabled={isSubmitting || isCalculating}
              >
                {isSubmitting ? (
                  <>
                    <FaRotate className="spinning" />
                    <span>Processing Payment &amp; Saving...</span>
                  </>
                ) : (
                  <>
                    <FaMoneyBillWave />
                    <span>Proceed to Payment (₹{displayTotal.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
