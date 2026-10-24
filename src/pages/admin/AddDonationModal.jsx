import React, { useState, useEffect } from 'react';
import {
  FaHeart,
  FaXmark,
  FaIndianRupeeSign,
  FaCheck,
  FaCircleExclamation
} from 'react-icons/fa6';
import adminFetch from '../../utils/adminFetch';

export default function AddDonationModal({
  isOpen,
  onClose,
  onSuccess,
  editingDonation = null
}) {
  // Format current local datetime to YYYY-MM-DDTHH:mm
  const getNowLocalDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    amount: '',
    paymentMethod: 'Cash',
    referenceNumber: '',
    paidAt: getNowLocalDateTime(),
    status: 'Successful',
    notes: '',
    isAnonymous: false
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (editingDonation) {
      let paidAtFormatted = getNowLocalDateTime();
      if (editingDonation.paidAt || editingDonation.createdAt) {
        try {
          const d = new Date(editingDonation.paidAt || editingDonation.createdAt);
          const offset = d.getTimezoneOffset();
          const local = new Date(d.getTime() - offset * 60 * 1000);
          paidAtFormatted = local.toISOString().slice(0, 16);
        } catch {
          paidAtFormatted = getNowLocalDateTime();
        }
      }

      setFormData({
        fullName: editingDonation.fullName || '',
        email: editingDonation.email || '',
        mobileNumber: editingDonation.mobileNumber || '',
        amount: String(editingDonation.amount || ''),
        paymentMethod: editingDonation.paymentMethod || 'Cash',
        referenceNumber: editingDonation.referenceNumber || editingDonation.razorpayPaymentId || '',
        paidAt: paidAtFormatted,
        status: editingDonation.status || 'Successful',
        notes: editingDonation.notes || '',
        isAnonymous: Boolean(editingDonation.isAnonymous)
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        mobileNumber: '',
        amount: '',
        paymentMethod: 'Cash',
        referenceNumber: '',
        paidAt: getNowLocalDateTime(),
        status: 'Successful',
        notes: '',
        isAnonymous: false
      });
    }
    setValidationErrors({});
    setServerError(null);
  }, [editingDonation, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Donor full name is required.';
    }

    const numAmount = Number(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than ₹0.';
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address (e.g. name@example.com).';
      }
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber.trim(),
        paidAt: formData.paidAt ? new Date(formData.paidAt).toISOString() : new Date().toISOString(),
        status: formData.status,
        notes: formData.notes.trim(),
        isAnonymous: formData.isAnonymous
      };

      const isEdit = Boolean(editingDonation?._id);
      const url = isEdit
        ? `/api/admin/donations/${editingDonation._id}`
        : '/api/admin/donations';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        onSuccess(json.message || (isEdit ? 'Donation updated successfully!' : 'Donation recorded successfully!'));
        onClose();
      } else {
        setServerError(json.message || 'Failed to save donation record.');
      }
    } catch (err) {
      console.error('Save donation error:', err);
      setServerError('Network error while connecting to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
        style={{ maxWidth: '640px' }}
      >
        {/* Fixed Header */}
        <div className="donation-modal-header">
          <div className="donation-modal-header-left">
            <div className="donation-modal-icon-badge">
              <FaHeart />
            </div>
            <div>
              <h3 className="donation-modal-title">
                {editingDonation ? `Edit Donation: ${editingDonation.donationId}` : 'Add Offline / Manual Donation'}
              </h3>
              <span className="donation-modal-ref">
                {editingDonation ? `ID: ${editingDonation.donationId}` : 'Admin Recorded Contribution'}
              </span>
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', margin: 0 }}>
          <div className="donation-modal-body">
            {serverError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  fontSize: '0.86rem'
                }}
              >
                <FaCircleExclamation />
                <span>{serverError}</span>
              </div>
            )}

            {/* 2-Column Responsive Grid */}
            <div className="donation-modal-grid-2">
              {/* Donor Name (Required) */}
              <div className="donation-info-box full-width" style={{ background: '#FFFFFF', border: '1px solid #D9CBC7' }}>
                <label className="donation-info-label" htmlFor="donorFullName">
                  Donor Full Name *
                </label>
                <input
                  id="donorFullName"
                  type="text"
                  className="donation-search-input"
                  style={{ background: '#FAF7F5', padding: '0.55rem 0.85rem' }}
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
                {validationErrors.fullName && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginTop: '2px' }}>
                    {validationErrors.fullName}
                  </span>
                )}
              </div>

              {/* Amount (Required) */}
              <div className="donation-info-box" style={{ background: '#FFFFFF', border: '1px solid #D9CBC7' }}>
                <label className="donation-info-label" htmlFor="donationAmount">
                  Amount in ₹ *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '10px', color: '#A71920', fontWeight: 800 }}>₹</span>
                  <input
                    id="donationAmount"
                    type="number"
                    min="1"
                    step="any"
                    className="donation-search-input"
                    style={{ background: '#FAF7F5', padding: '0.55rem 0.85rem 0.55rem 1.85rem', fontWeight: 700 }}
                    placeholder="e.g. 500"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>
                {validationErrors.amount && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginTop: '2px' }}>
                    {validationErrors.amount}
                  </span>
                )}
              </div>

              {/* Payment Method */}
              <div className="donation-info-box" style={{ background: '#FFFFFF', border: '1px solid #D9CBC7' }}>
                <label className="donation-info-label" htmlFor="paymentMethod">
                  Payment Method *
                </label>
                <select
                  id="paymentMethod"
                  className="donation-select"
                  style={{ width: '100%', padding: '0.55rem 1.8rem 0.55rem 0.85rem' }}
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="Cheque">Cheque / Demand Draft</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Email Address (Optional) */}
              <div className="donation-info-box" style={{ background: '#FFFFFF', border: '1px solid #D9CBC7' }}>
                <label className="donation-info-label" htmlFor="donorEmail">
                  Email Address (Optional)
                </label>
                <input
                  id="donorEmail"
                  type="email"
                  className="donation-search-input"
                  style={{ background: '#FAF7F5', padding: '0.55rem 0.85rem' }}
                  placeholder="donor@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
                {validationErrors.email && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginTop: '2px' }}>
                    {validationErrors.email}
                  </span>
                )}
              </div>

              {/* Mobile Number (Optional) */}
              <div className="donation-info-box" style={{ background: '#FFFFFF', border: '1px solid #D9CBC7' }}>
                <label className="donation-info-label" htmlFor="donorMobile">
                  Mobile Number (Optional)
                </label>
                <input
                  id="donorMobile"
                  type="text"
                  className="donation-search-input"
                  style={{ background: '#FAF7F5', padding: '0.55rem 0.85rem' }}
                  placeholder="e.g. 9876543210"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                />
              </div>

              {/* Reference / Transaction ID (Optional) */}
              <div className="donation-info-box" style={{ background: '#FFFFFF', border: '1px solid #D9CBC7' }}>
                <label className="donation-info-label" htmlFor="referenceNumber">
                  Transaction / Ref ID (Optional)
                </label>
                <input
                  id="referenceNumber"
                  type="text"
                  className="donation-search-input"
                  style={{ background: '#FAF7F5', padding: '0.55rem 0.85rem', fontFamily: 'monospace' }}
                  placeholder="e.g. UPI-REF-4928194"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                />
              </div>

              {/* Status */}
              <div className="donation-info-box" style={{ background: '#FFFFFF', border: '1px solid #D9CBC7' }}>
                <label className="donation-info-label" htmlFor="donationStatus">
                  Payment Status
                </label>
                <select
                  id="donationStatus"
                  className="donation-select"
                  style={{ width: '100%', padding: '0.55rem 1.8rem 0.55rem 0.85rem' }}
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Successful">Successful (Reconciled)</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              {/* Payment Date & Time */}
              <div className="donation-info-box full-width" style={{ background: '#FFFFFF', border: '1px solid #D9CBC7' }}>
                <label className="donation-info-label" htmlFor="paidAt">
                  Payment Date &amp; Time
                </label>
                <input
                  id="paidAt"
                  type="datetime-local"
                  className="donation-search-input"
                  style={{ background: '#FAF7F5', padding: '0.55rem 0.85rem' }}
                  value={formData.paidAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, paidAt: e.target.value }))}
                />
              </div>

              {/* Notes (Optional) */}
              <div className="donation-info-box full-width" style={{ background: '#FFFFFF', border: '1px solid #D9CBC7' }}>
                <label className="donation-info-label" htmlFor="donationNotes">
                  Internal Notes / Remarks (Optional)
                </label>
                <textarea
                  id="donationNotes"
                  rows={2}
                  className="donation-search-input"
                  style={{ background: '#FAF7F5', padding: '0.55rem 0.85rem', resize: 'vertical' }}
                  placeholder="e.g. Handed over at marathon counter by sponsor coordinator"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="donation-info-box full-width" style={{ background: '#FAF7F5', border: '1px dashed #D9CBC7', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input
                  id="isAnonymousCheckbox"
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-crimson, #A71920)' }}
                />
                <label htmlFor="isAnonymousCheckbox" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main, #1F1214)', cursor: 'pointer', userSelect: 'none' }}>
                  Donor wants to remain anonymous (name masked on public transparency ledger)
                </label>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="donation-modal-footer" style={{ gap: '10px' }}>
            <button
              type="button"
              className="donation-refresh-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="donation-add-btn"
              disabled={submitting}
              style={{
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? (
                <>Saving Donation...</>
              ) : (
                <>
                  <FaCheck />
                  <span>{editingDonation ? 'Update Donation' : 'Save Donation'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
