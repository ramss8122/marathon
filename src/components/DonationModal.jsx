import React, { useState, useEffect } from 'react';
import {
  FaHeart,
  FaXmark,
  FaIndianRupeeSign,
  FaShieldHalved,
  FaCircleCheck,
  FaCircleExclamation,
  FaArrowRight,
  FaLock
} from 'react-icons/fa6';
import './DonationModal.css';

const PRESET_AMOUNTS = [100, 250, 500, 1000];

export default function DonationModal({ isOpen, onClose, onDonationSuccess }) {
  const [selectedPreset, setSelectedPreset] = useState(250);
  const [customAmount, setCustomAmount] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(250);
      setCustomAmount('');
      setErrorMessage('');
      setSuccessData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Active donation amount
  const activeAmount = customAmount ? Number(customAmount) : selectedPreset;

  const handlePresetClick = (amount) => {
    setSelectedPreset(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    if (val) {
      setSelectedPreset(null);
    } else {
      setSelectedPreset(250);
    }
  };

  // Helper to load Razorpay checkout script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!activeAmount || activeAmount < 1) {
      setErrorMessage('Please select or enter a donation amount of at least ₹1.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Order on backend
      const res = await fetch('/api/donations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          mobileNumber: cleanMobile,
          amount: activeAmount,
          message: message.trim(),
          isAnonymous
        })
      });

      const orderResult = await res.json();
      if (!res.ok || !orderResult.success) {
        throw new Error(orderResult.message || 'Could not initiate donation order.');
      }

      const { donationId, orderId, amount, keyId, isMockOrder } = orderResult.data;

      // Step 2: If live Razorpay key is present and not mock, launch official checkout
      if (keyId && !isMockOrder) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error('Failed to load payment gateway SDK. Please check your internet connection.');
        }

        const options = {
          key: keyId,
          amount: Math.round(amount * 100),
          currency: 'INR',
          name: 'INDIA RUNTRUST',
          description: 'Community Marathon & Sports Donation',
          order_id: orderId,
          prefill: {
            name: fullName.trim(),
            email: email.trim(),
            contact: cleanMobile
          },
          theme: {
            color: '#A71920'
          },
          handler: async (response) => {
            try {
              const verifyRes = await fetch('/api/donations/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  donationId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                setSuccessData(verifyData.data);
                if (onDonationSuccess) onDonationSuccess();
              } else {
                setErrorMessage(verifyData.message || 'Payment verification failed.');
              }
            } catch {
              setErrorMessage('Failed to verify payment with server.');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (failResp) => {
          setErrorMessage(failResp.error?.description || 'Payment failed. Please try again.');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Step 2 Fallback: Test Mode confirmation verification
        const verifyRes = await fetch('/api/donations/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donationId,
            razorpay_order_id: orderId,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: 'test_signature_verified'
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          setSuccessData(verifyData.data);
          if (onDonationSuccess) onDonationSuccess();
        } else {
          setErrorMessage(verifyData.message || 'Donation verification failed.');
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('Donation error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="donation-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="donation-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          className="donation-modal-close"
          onClick={onClose}
          aria-label="Close donation window"
        >
          <FaXmark />
        </button>

        {successData ? (
          <div className="donation-success-view">
            <div className="donation-success-icon-wrap">
              <FaCircleCheck />
            </div>
            <h3 className="donation-success-title">Thank You for Your Generosity!</h3>
            <p className="donation-success-desc">
              Your contribution of <strong>₹{successData.amount?.toLocaleString('en-IN')}</strong> has been received successfully.
              Every rupee directly supports our grassroots runners, hydration amenities, and community marathons.
            </p>
            <div className="donation-receipt-box">
              <div className="receipt-row">
                <span className="receipt-label">Donation Reference</span>
                <span className="receipt-value">{successData.donationId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Donor Name</span>
                <span className="receipt-value">{successData.donorName}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Payment Status</span>
                <span className="receipt-value status-success">Verified Successful</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
              onClick={onClose}
            >
              <span>Return to Transparency Page</span>
            </button>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="donation-modal-header">
              <div className="donation-modal-icon-badge">
                <FaHeart />
              </div>
              <div>
                <h3 className="donation-modal-title">Make a Donation</h3>
                <p className="donation-modal-subtitle">
                  Support RUNTRUST's community initiatives and help us create a positive impact through running events.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="donation-error-alert">
                <FaCircleExclamation />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="donation-form">
              {/* Amount Selection */}
              <div className="donation-amount-section">
                <label className="donation-field-label">Select Donation Amount</label>
                <div className="donation-amount-grid">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className={`donation-preset-btn ${selectedPreset === amt && !customAmount ? 'active' : ''}`}
                      onClick={() => handlePresetClick(amt)}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                  <div className="donation-custom-amount-wrap">
                    <span className="custom-currency-prefix">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Custom"
                      className={`donation-custom-input ${customAmount ? 'active' : ''}`}
                      value={customAmount}
                      onChange={handleCustomChange}
                    />
                  </div>
                </div>
              </div>

              {/* Donor Details */}
              <div className="donation-details-section">
                <div className="donation-field-group">
                  <label className="donation-field-label" htmlFor="donor-name">
                    Full Name <span className="field-required">*</span>
                  </label>
                  <input
                    id="donor-name"
                    type="text"
                    className="donation-input"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="donation-field-group">
                  <label className="donation-field-label" htmlFor="donor-email">
                    Email Address <span className="field-required">*</span>
                  </label>
                  <input
                    id="donor-email"
                    type="email"
                    className="donation-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="donation-field-group">
                  <label className="donation-field-label" htmlFor="donor-phone">
                    Mobile Number <span className="field-required">*</span>
                  </label>
                  <div className="donation-phone-wrap">
                    <span className="phone-prefix">+91</span>
                    <input
                      id="donor-phone"
                      type="tel"
                      maxLength={10}
                      className="donation-input phone-input"
                      placeholder="Enter your mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                    />
                  </div>
                </div>

                <div className="donation-field-group">
                  <label className="donation-field-label" htmlFor="donor-msg">
                    Message <span className="field-optional">(Optional)</span>
                  </label>
                  <textarea
                    id="donor-msg"
                    rows={2}
                    className="donation-textarea"
                    placeholder="Your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <label className="donation-checkbox-label">
                  <input
                    type="checkbox"
                    className="donation-checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span>Donate Anonymously (Hide name from public audit ledger)</span>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="donation-cta-wrap">
                <button
                  type="submit"
                  className="btn btn-primary btn-large donation-pay-btn"
                  disabled={loading}
                >
                  <FaLock className="btn-lock-icon" />
                  <span>
                    {loading
                      ? 'Securing Payment Gateway...'
                      : `Proceed to Payment (₹${(activeAmount || 0).toLocaleString('en-IN')})`}
                  </span>
                  <FaArrowRight className="btn-icon" />
                </button>
                <div className="donation-security-notice">
                  <FaShieldHalved />
                  <span>256-Bit Encrypted • Razorpay Secured • 100% Tax Deductible Initiative</span>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
