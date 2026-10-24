import React, { useState } from 'react';
import {
  FaHeart,
  FaXmark,
  FaCopy,
  FaCheck,
  FaCircleCheck,
  FaCircleExclamation,
  FaClock,
  FaQuoteLeft
} from 'react-icons/fa6';

export default function DonationDetailsModal({
  donation,
  onClose,
  formatDate
}) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!donation) return null;

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const renderStatusPill = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'successful') {
      return (
        <span className="donation-status-pill successful">
          <FaCircleCheck style={{ fontSize: '0.7rem' }} />
          <span>Successful</span>
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="donation-status-pill pending">
          <FaClock style={{ fontSize: '0.7rem' }} />
          <span>Pending</span>
        </span>
      );
    }
    return (
      <span className="donation-status-pill failed">
        <FaCircleExclamation style={{ fontSize: '0.7rem' }} />
        <span>Failed</span>
      </span>
    );
  };

  return (
    <div
      className="admin-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="donation-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="donation-modal-header">
          <div className="donation-modal-header-left">
            <div className="donation-modal-icon-badge">
              <FaHeart />
            </div>
            <div>
              <h3 className="donation-modal-title">Donation Details</h3>
              <span className="donation-modal-ref">{donation.donationId}</span>
            </div>
          </div>
          <button
            type="button"
            className="donation-modal-close-round"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaXmark />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="donation-modal-body">
          {/* 2-Column Grid */}
          <div className="donation-modal-grid-2">
            {/* Amount */}
            <div className="donation-info-box">
              <span className="donation-info-label">Amount</span>
              <span className="donation-amount-highlight">
                ₹{(donation.amount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Payment Status */}
            <div className="donation-info-box">
              <span className="donation-info-label">Payment Status</span>
              <div>{renderStatusPill(donation.status)}</div>
            </div>

            {/* Donor Name */}
            <div className="donation-info-box full-width">
              <span className="donation-info-label">Donor Name</span>
              <div className="donation-info-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1rem' }}>{donation.fullName}</strong>
                {donation.isAnonymous && (
                  <span className="donation-anon-tag">Requested anonymous on public ledger</span>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className="donation-info-box">
              <span className="donation-info-label">Email Address</span>
              <span className="donation-info-value">{donation.email || '—'}</span>
            </div>

            {/* Mobile Number */}
            <div className="donation-info-box">
              <span className="donation-info-label">Mobile Number</span>
              <span className="donation-info-value">
                {donation.mobileNumber ? `+91 ${donation.mobileNumber}` : '—'}
              </span>
            </div>

            {/* Payment Method / Gateway */}
            <div className="donation-info-box">
              <span className="donation-info-label">
                {donation.source === 'admin' ? 'Payment Method' : 'Payment Gateway'}
              </span>
              <span className="donation-info-value">
                {donation.source === 'admin'
                  ? `${donation.paymentMethod || 'Manual'} (${donation.paymentGateway || 'Offline'})`
                  : (donation.paymentGateway || 'Razorpay')}
              </span>
            </div>

            {/* Payment Date */}
            <div className="donation-info-box">
              <span className="donation-info-label">Payment Date</span>
              <span className="donation-info-value">{formatDate(donation.paidAt || donation.createdAt)}</span>
            </div>

            {/* Reference Number for Admin / Offline */}
            {donation.source === 'admin' && donation.referenceNumber && (
              <div className="donation-info-box full-width">
                <span className="donation-info-label">Transaction / Reference ID</span>
                <div className="donation-copy-row">
                  <span className="donation-info-value" style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.84rem' }}>
                    {donation.referenceNumber}
                  </span>
                  <button
                    type="button"
                    className="donation-copy-btn"
                    onClick={() => handleCopy(donation.referenceNumber, 'refNum')}
                    title="Copy Reference ID"
                  >
                    {copiedKey === 'refNum' ? (
                      <>
                        <FaCheck style={{ color: '#065F46' }} />
                        <span style={{ color: '#065F46' }}>Copied</span>
                      </>
                    ) : (
                      <>
                        <FaCopy />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Razorpay Order ID */}
            {donation.razorpayOrderId && (
              <div className="donation-info-box full-width">
                <span className="donation-info-label">Razorpay Order ID</span>
                <div className="donation-copy-row">
                  <span className="donation-info-value" style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.84rem' }}>
                    {donation.razorpayOrderId}
                  </span>
                  <button
                    type="button"
                    className="donation-copy-btn"
                    onClick={() => handleCopy(donation.razorpayOrderId, 'orderId')}
                    title="Copy Order ID"
                  >
                    {copiedKey === 'orderId' ? (
                      <>
                        <FaCheck style={{ color: '#065F46' }} />
                        <span style={{ color: '#065F46' }}>Copied</span>
                      </>
                    ) : (
                      <>
                        <FaCopy />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Razorpay Payment ID */}
            {donation.razorpayPaymentId && (
              <div className="donation-info-box full-width">
                <span className="donation-info-label">Razorpay Payment ID / Reference</span>
                <div className="donation-copy-row">
                  <span className="donation-info-value" style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.84rem' }}>
                    {donation.razorpayPaymentId}
                  </span>
                  <button
                    type="button"
                    className="donation-copy-btn"
                    onClick={() => handleCopy(donation.razorpayPaymentId, 'payId')}
                    title="Copy Payment ID"
                  >
                    {copiedKey === 'payId' ? (
                      <>
                        <FaCheck style={{ color: '#065F46' }} />
                        <span style={{ color: '#065F46' }}>Copied</span>
                      </>
                    ) : (
                      <>
                        <FaCopy />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Internal Notes (Admin) */}
          {donation.notes && (
            <div className="donation-info-box full-width">
              <span className="donation-info-label">Internal Notes / Remarks</span>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.86rem', color: 'var(--text-main, #1F1214)' }}>
                {donation.notes}
              </p>
            </div>
          )}

          {/* Donor Message */}
          {donation.message && (
            <div className="donation-info-box full-width">
              <span className="donation-info-label">Donor Message</span>
              <div className="donation-quote-block">
                <FaQuoteLeft style={{ marginRight: '8px', opacity: 0.35, fontSize: '0.8rem' }} />
                "{donation.message}"
              </div>
            </div>
          )}
        </div>

        {/* Fixed Sticky Footer */}
        <div className="donation-modal-footer">
          <button
            type="button"
            className="donation-modal-close-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
