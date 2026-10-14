import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FaPersonRunning,
  FaCircleCheck,
  FaCircleExclamation,
  FaShieldHalved,
  FaArrowRight,
  FaIdCard,
  FaUserCheck,
  FaClock
} from 'react-icons/fa6';
import { RACE_PACKAGES, UPCOMING_EVENTS } from '../data/marathonData';

export default function Registration() {
  const [searchParams] = useSearchParams();

  // Find preselected package or default to 5k
  const initialPkgParam = searchParams.get('package');
  const initialEventParam = searchParams.get('event');

  const defaultPkg = RACE_PACKAGES.find(p => p.id === initialPkgParam) || RACE_PACKAGES[2]; // Default 5K
  const defaultEvent = UPCOMING_EVENTS.find(e => e.id === initialEventParam) || UPCOMING_EVENTS[0];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    dob: '',
    gender: 'Male',
    city: defaultEvent.city,
    state: 'Tamil Nadu',
    raceCategory: defaultPkg.id,
    selectedEvent: defaultEvent.id,
    emergencyContact: '',
    emergencyPhone: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrationRef, setRegistrationRef] = useState('');

  // Handle preselection when query params change
  useEffect(() => {
    if (initialPkgParam) {
      const matched = RACE_PACKAGES.find(p => p.id === initialPkgParam);
      if (matched) {
        setFormData(prev => ({ ...prev, raceCategory: matched.id }));
      }
    }
    if (initialEventParam) {
      const matchedEvt = UPCOMING_EVENTS.find(e => e.id === initialEventParam);
      if (matchedEvt) {
        setFormData(prev => ({
          ...prev,
          selectedEvent: matchedEvt.id,
          city: matchedEvt.city
        }));
      }
    }
  }, [initialPkgParam, initialEventParam]);

  // Current selected package details
  const currentPackage = RACE_PACKAGES.find(p => p.id === formData.raceCategory) || RACE_PACKAGES[0];

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format.';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.replace(/[\s-]/g, ''))) {
      newErrors.mobileNumber = 'Please provide a valid 10-digit Indian mobile number.';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required.';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required.';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact person name is required.';
    }

    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Emergency contact phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(formData.emergencyPhone.replace(/[\s-]/g, ''))) {
      newErrors.emergencyPhone = 'Please provide a valid 10-digit emergency phone number.';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the event guidelines and terms.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePackageSelect = (pkgId) => {
    setFormData(prev => ({ ...prev, raceCategory: pkgId }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (validate()) {
      setIsSubmitting(true);

      try {
        const res = await fetch('/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setRegistrationRef(data.data?.registrationRef);
          setIsSubmitted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setSubmitError(data.message || 'Registration failed. Please check your details and try again.');
        }
      } catch (err) {
        setSubmitError('Unable to connect to the backend server. Please verify the server and database are running.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      mobileNumber: '',
      dob: '',
      gender: 'Male',
      city: 'Chennai',
      state: 'Tamil Nadu',
      raceCategory: '5k',
      selectedEvent: UPCOMING_EVENTS[0].id,
      emergencyContact: '',
      emergencyPhone: '',
      agreeTerms: false
    });
    setErrors({});
    setIsSubmitted(false);
    setRegistrationRef('');
    setSubmitError('');
  };

  return (
    <div className="page-wrapper registration-page">
      {/* Page Header */}
      <section className="page-banner">
        <div className="content-container">
          <div className="page-banner-content">
            <div className="page-badge">
              <FaIdCard className="page-badge-icon" />
              <span>Official Runner Portal</span>
            </div>
            <h1 className="page-title">INDIA RUNTRUST Registration</h1>
            <p className="page-subtitle">
              Secure your runner bib and join hundreds of fellow runners on race day.
            </p>
          </div>
        </div>
      </section>

      <section className="section registration-section">
        <div className="content-container">
          {isSubmitted ? (
            /* SUCCESS CONFIRMATION DISPLAY */
            <div className="registration-success-wrapper">
              <div className="registration-success-card">
                <div className="success-header">
                  <div className="success-icon-wrap large">
                    <FaCircleCheck />
                  </div>
                  <h2 className="success-main-title">Registration Demo Confirmed!</h2>
                  <p className="success-subtitle">
                    Thank you, <strong>{formData.fullName}</strong>. Your entry for{' '}
                    <strong>{currentPackage.name}</strong> has been recorded in this demo showcase.
                  </p>
                </div>

                <div className="registration-receipt-box">
                  <div className="receipt-row">
                    <span className="receipt-label">Registration ID:</span>
                    <span className="receipt-value ref-badge">{registrationRef}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Event:</span>
                    <span className="receipt-value">
                      {UPCOMING_EVENTS.find(e => e.id === formData.selectedEvent)?.name || 'INDIA RUNTRUST City Run'}
                    </span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Category / Distance:</span>
                    <span className="receipt-value">{currentPackage.name} ({currentPackage.distance})</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Registration Fee:</span>
                    <span className="receipt-value fee-amount">{currentPackage.formattedPrice}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Runner Email:</span>
                    <span className="receipt-value">{formData.email}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Runner Mobile:</span>
                    <span className="receipt-value">{formData.mobileNumber}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Emergency Contact:</span>
                    <span className="receipt-value">{formData.emergencyContact} ({formData.emergencyPhone})</span>
                  </div>
                </div>

                <div className="demo-notice-alert">
                  <FaShieldHalved className="alert-icon" />
                  <p>
                    <strong>Demonstration Notice:</strong> No payment was debited, and no live payment gateway or server-side transaction was processed. This is an interactive frontend registration showcase.
                  </p>
                </div>

                <div className="success-actions">
                  <button type="button" onClick={handleResetForm} className="btn btn-secondary">
                    <span>Register Another Participant</span>
                  </button>
                  <Link to="/events" className="btn btn-primary">
                    <span>Explore More Events</span>
                    <FaArrowRight className="btn-icon" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM & SUMMARY */
            <div className="registration-layout-grid">
              {/* Left Column: Form Fields */}
              <div className="registration-form-panel">
                <form className="site-form" onSubmit={handleSubmit} noValidate>
                  {/* Category Selection Tabs */}
                  <div className="form-section-block">
                    <h3 className="form-section-title">
                      <span className="section-number-pill">1</span> Select Race Category
                    </h3>
                    <p className="form-section-desc">
                      Choose your preferred distance. The registration fee updates automatically.
                    </p>

                    <div className="category-selection-grid">
                      {RACE_PACKAGES.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`category-select-card ${formData.raceCategory === pkg.id ? 'selected' : ''}`}
                          onClick={() => handlePackageSelect(pkg.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter') handlePackageSelect(pkg.id); }}
                        >
                          <div className="category-card-top">
                            <span className="category-tag">{pkg.distance}</span>
                            <span className="category-price">{pkg.formattedPrice}</span>
                          </div>
                          <div className="category-card-name">{pkg.name}</div>
                          <div className="category-card-tagline">{pkg.tagline}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Event & Location */}
                  <div className="form-section-block">
                    <h3 className="form-section-title">
                      <span className="section-number-pill">2</span> Select Target City & Event
                    </h3>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="selectedEvent" className="form-label">
                          Running Event <span className="req-star">*</span>
                        </label>
                        <select
                          id="selectedEvent"
                          name="selectedEvent"
                          value={formData.selectedEvent}
                          onChange={handleChange}
                          className="form-select"
                        >
                          {UPCOMING_EVENTS.map(evt => (
                            <option key={evt.id} value={evt.id}>
                              {evt.name} ({evt.city})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="city" className="form-label">
                          Participant City <span className="req-star">*</span>
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="e.g. Chennai"
                          className={`form-input ${errors.city ? 'input-error' : ''}`}
                        />
                        {errors.city && (
                          <span className="error-message">
                            <FaCircleExclamation /> {errors.city}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="state" className="form-label">
                        State <span className="req-star">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. Tamil Nadu"
                        className={`form-input ${errors.state ? 'input-error' : ''}`}
                      />
                      {errors.state && (
                        <span className="error-message">
                          <FaCircleExclamation /> {errors.state}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="form-section-block">
                    <h3 className="form-section-title">
                      <span className="section-number-pill">3</span> Participant Information
                    </h3>

                    <div className="form-group">
                      <label htmlFor="fullName" className="form-label">
                        Full Name (As printed on Bib & Certificate) <span className="req-star">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Ananya Raman"
                        className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                      />
                      {errors.fullName && (
                        <span className="error-message">
                          <FaCircleExclamation /> {errors.fullName}
                        </span>
                      )}
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">
                          Email Address <span className="req-star">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. ananya@example.com"
                          className={`form-input ${errors.email ? 'input-error' : ''}`}
                        />
                        {errors.email && (
                          <span className="error-message">
                            <FaCircleExclamation /> {errors.email}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="mobileNumber" className="form-label">
                          Mobile Number (10 Digits) <span className="req-star">*</span>
                        </label>
                        <input
                          type="tel"
                          id="mobileNumber"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          className={`form-input ${errors.mobileNumber ? 'input-error' : ''}`}
                        />
                        {errors.mobileNumber && (
                          <span className="error-message">
                            <FaCircleExclamation /> {errors.mobileNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="dob" className="form-label">
                          Date of Birth <span className="req-star">*</span>
                        </label>
                        <input
                          type="date"
                          id="dob"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className={`form-input ${errors.dob ? 'input-error' : ''}`}
                        />
                        {errors.dob && (
                          <span className="error-message">
                            <FaCircleExclamation /> {errors.dob}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="gender" className="form-label">
                          Gender <span className="req-star">*</span>
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="form-section-block">
                    <h3 className="form-section-title">
                      <span className="section-number-pill">4</span> Emergency Contact Details
                    </h3>
                    <p className="form-section-desc">
                      Mandatory safety requirement for medical response tracking on course.
                    </p>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="emergencyContact" className="form-label">
                          Emergency Contact Name <span className="req-star">*</span>
                        </label>
                        <input
                          type="text"
                          id="emergencyContact"
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          placeholder="e.g. Ramesh Raman (Father/Spouse)"
                          className={`form-input ${errors.emergencyContact ? 'input-error' : ''}`}
                        />
                        {errors.emergencyContact && (
                          <span className="error-message">
                            <FaCircleExclamation /> {errors.emergencyContact}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="emergencyPhone" className="form-label">
                          Emergency Contact Number <span className="req-star">*</span>
                        </label>
                        <input
                          type="tel"
                          id="emergencyPhone"
                          name="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={handleChange}
                          placeholder="e.g. 9840123456"
                          maxLength={10}
                          className={`form-input ${errors.emergencyPhone ? 'input-error' : ''}`}
                        />
                        {errors.emergencyPhone && (
                          <span className="error-message">
                            <FaCircleExclamation /> {errors.emergencyPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="form-checkbox"
                      />
                      <span>
                        I declare that I am physically fit to participate in this event and agree to the INDIA RUNTRUST draft participant guidelines.
                      </span>
                    </label>
                    {errors.agreeTerms && (
                      <span className="error-message">
                        <FaCircleExclamation /> {errors.agreeTerms}
                      </span>
                    )}
                  </div>

                  {submitError && (
                    <div
                      className="form-submit-error-alert"
                      style={{
                        marginBottom: '1.25rem',
                        padding: '0.85rem 1.15rem',
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #F87171',
                        borderRadius: '8px',
                        color: '#991B1B',
                        fontSize: '0.92rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem'
                      }}
                    >
                      <FaCircleExclamation style={{ flexShrink: 0 }} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-large submit-reg-btn"
                    disabled={isSubmitting}
                  >
                    <span>{isSubmitting ? 'PROCESSING REGISTRATION...' : 'COMPLETE REGISTRATION'}</span>
                    <FaArrowRight className="btn-icon" />
                  </button>
                </form>
              </div>

              {/* Right Column: Order & Fee Summary Sticky Card */}
              <div className="registration-summary-panel">
                <div className="sticky-summary-card">
                  <h3 className="summary-card-title">Registration Summary</h3>
                  <div className="summary-brand-row">
                    <span className="brand-label-text">Organization:</span>
                    <strong>INDIA RUNTRUST</strong>
                  </div>

                  <div className="summary-package-highlight">
                    <div className="pkg-highlight-head">
                      <span className="pkg-dist">{currentPackage.distance}</span>
                      <span className="pkg-name">{currentPackage.name}</span>
                    </div>
                    <div className="pkg-price-display">
                      <span className="pkg-amount">{currentPackage.formattedPrice}</span>
                      <span className="pkg-note">per entrant</span>
                    </div>
                  </div>

                  <div className="summary-inclusions">
                    <h4 className="inclusions-title">Package Inclusions:</h4>
                    <ul className="inclusions-list">
                      {currentPackage.includes.map((inc, i) => (
                        <li key={i}>
                          <FaCircleCheck className="inclusion-check" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="summary-fee-breakdown">
                    <div className="fee-line">
                      <span>Race Entry Fee:</span>
                      <span>{currentPackage.formattedPrice}</span>
                    </div>
                    <div className="fee-line">
                      <span>Processing / Taxes:</span>
                      <span>₹0 (Included)</span>
                    </div>
                    <div className="fee-total-line">
                      <span>Total Amount:</span>
                      <span className="total-val">{currentPackage.formattedPrice}</span>
                    </div>
                  </div>

                  <div className="demo-gateway-disclaimer">
                    <FaShieldHalved className="shield-icon" />
                    <span>Frontend demo mode only. No actual card or banking information is collected.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
