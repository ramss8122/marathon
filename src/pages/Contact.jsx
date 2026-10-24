import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaPaperPlane,
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaArrowRight
} from 'react-icons/fa6';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message cannot be empty.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Please provide a message with at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (validate()) {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setIsSubmitted(true);
        } else {
          setSubmitError(data.message || 'Failed to submit message. Please try again.');
        }
      } catch (err) {
        setSubmitError('Unable to connect to the server. Please verify the backend is running.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      subject: '',
      message: ''
    });
    setErrors({});
    setIsSubmitted(false);
    setSubmitError('');
  };

  return (
    <div className="page-wrapper contact-page">

      {/* ── FULL-SCREEN HERO ── */}
      <section className="page-hero">
        <div
          className="page-hero-bg"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1600&q=80')"
          }}
        />
        <div className="page-hero-inner">
          {/* LEFT */}
          <div className="page-hero-content">
            <div className="page-hero-badge">
              <FaEnvelope />
              <span>Get in Touch</span>
            </div>
            <h1 className="page-hero-title">
              Let's <span>Connect</span><br />With Us
            </h1>
            <p className="page-hero-subtitle">
              Have inquiries about runner bib collection, venue directions, or bulk group entries? Our team is ready to help you every step of the way.
            </p>
            <div className="page-hero-actions">
              <a href="#contact-form" className="btn btn-primary btn-large">
                <span>Send a Message</span>
                <FaArrowRight className="btn-icon" />
              </a>
              <Link to="/events" className="btn btn-outline btn-large">
                <span>View Events</span>
              </Link>
            </div>
            <div className="page-hero-highlights">
              <span className="page-hero-highlight"><FaCircleCheck /> Email Support</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Helpline Available</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Mon–Sat 9AM–6PM</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="page-hero-image-wrap">
            <div className="page-hero-stat-card">
              <span className="stat-num">24h</span>
              <span className="stat-label">Response Time</span>
            </div>
            <div className="page-hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?auto=format&fit=crop&w=1000&q=80"
                alt="Marathon participants and running event community"
                className="page-hero-img"
              />
              
            </div>
          </div>
        </div>
      </section>


      {/* Main Content */}
      <section id="contact-form" className="section contact-section">
        <div className="content-container">
          <div className="contact-layout-grid">
            {/* Left Column: Contact Information Cards */}
            <div className="contact-info-panel">
              <h2 className="contact-panel-title">Support Information</h2>
              <p className="contact-panel-desc">
                Feel free to send a message through the frontend demo form or reach out through our demo help channels.
              </p>

              <div className="contact-cards-stack">
                <div className="contact-info-card">
                  <div className="contact-card-icon">
                    <FaEnvelope />
                  </div>
                  <div className="contact-card-details">
                    <h3 className="contact-card-heading">Email Support</h3>
                    <p className="contact-card-value">support@indiaruntrust.org</p>
                    <span className="demo-placeholder-tag">(Placeholder / Demo Desk)</span>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-card-icon">
                    <FaPhone />
                  </div>
                  <div className="contact-card-details">
                    <h3 className="contact-card-heading">Helpline</h3>
                    <p className="contact-card-value">+91 98765 43210</p>
                    <span className="demo-placeholder-tag">(Mon - Sat, 9:00 AM - 6:00 PM IST)</span>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="contact-card-icon">
                    <FaLocationDot />
                  </div>
                 <div className="contact-card-details">
  <h3 className="contact-card-heading">Event Locations</h3>
  <p className="contact-card-value">Multiple Cities Across India</p>
  <span className="demo-placeholder-tag">(Event Venues Announced Per Schedule)</span>
</div>
                </div>
              </div>

              <div className="contact-demo-disclaimer">
                <FaCircleInfo className="disclaimer-icon" />
                <p>
                  <strong>Note:</strong> This contact form functions as a client-side frontend demo. No live email server is connected.
                </p>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="contact-form-panel">
              {isSubmitted ? (
                <div className="form-success-card">
                  <div className="success-icon-wrap">
                    <FaCircleCheck />
                  </div>
                  <h3 className="success-title">Message Received!</h3>
                  <p className="success-desc">
                    Thank you, <strong>{formData.fullName}</strong>. Your message regarding "
                    <strong>{formData.subject}</strong>" has been recorded in this demo interface.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-primary"
                  >
                    <span>Send Another Message</span>
                  </button>
                </div>
              ) : (
                <form className="site-form contact-form" onSubmit={handleSubmit} noValidate>
                  <h2 className="form-heading">Send Us a Message</h2>

                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label">
                      Full Name <span className="req-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Senthil Kumar"
                      className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                    />
                    {errors.fullName && (
                      <span className="error-message">
                        <FaCircleExclamation /> {errors.fullName}
                      </span>
                    )}
                  </div>

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
                      placeholder="e.g. senthil@example.com"
                      className={`form-input ${errors.email ? 'input-error' : ''}`}
                    />
                    {errors.email && (
                      <span className="error-message">
                        <FaCircleExclamation /> {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">
                      Subject <span className="req-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Group Registration Inquiry"
                      className={`form-input ${errors.subject ? 'input-error' : ''}`}
                    />
                    {errors.subject && (
                      <span className="error-message">
                        <FaCircleExclamation /> {errors.subject}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      Message <span className="req-star">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Type your message or inquiry here..."
                      className={`form-textarea ${errors.message ? 'input-error' : ''}`}
                    ></textarea>
                    {errors.message && (
                      <span className="error-message">
                        <FaCircleExclamation /> {errors.message}
                      </span>
                    )}
                  </div>

                  {submitError && (
                    <div className="admin-login-alert error" style={{ marginBottom: '1rem' }}>
                      <FaCircleExclamation />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-block form-submit-btn"
                    disabled={isSubmitting}
                  >
                    <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                    <FaPaperPlane className="btn-icon" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
