import React from 'react';
import {
  FaEye,
  FaHeart,
  FaCircleCheck,
  FaCircleExclamation,
  FaClock
} from 'react-icons/fa6';

export default function DonationTable({
  donations = [],
  loading = false,
  searchTerm = '',
  statusFilter = 'all',
  onView,
  formatDate,
  pagination = { total: 0, pages: 1 },
  page = 1,
  setPage
}) {
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
    <div>
      <div className="donation-table-wrap">
        <table className="donation-table">
          <thead>
            <tr>
              <th>Donation ID</th>
              <th>Donor Name</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment Date</th>
              <th>Gateway Ref</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="donation-skeleton-row">
                  <td style={{ width: '130px' }}>
                    <div className="donation-skeleton-bar" style={{ width: '90px' }} />
                  </td>
                  <td>
                    <div className="donation-skeleton-bar" style={{ width: '160px', marginBottom: '6px' }} />
                    <div className="donation-skeleton-bar" style={{ width: '110px', height: '12px' }} />
                  </td>
                  <td style={{ width: '110px' }}>
                    <div className="donation-skeleton-bar" style={{ width: '70px' }} />
                  </td>
                  <td style={{ width: '130px' }}>
                    <div className="donation-skeleton-bar" style={{ width: '95px', borderRadius: '9999px' }} />
                  </td>
                  <td style={{ width: '160px' }}>
                    <div className="donation-skeleton-bar" style={{ width: '130px' }} />
                  </td>
                  <td style={{ width: '180px' }}>
                    <div className="donation-skeleton-bar" style={{ width: '150px' }} />
                  </td>
                  <td style={{ width: '100px', textAlign: 'center' }}>
                    <div className="donation-skeleton-bar" style={{ width: '70px', borderRadius: '9999px', margin: '0 auto' }} />
                  </td>
                </tr>
              ))
            ) : donations.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(167, 25, 32, 0.08)',
                      color: 'var(--color-crimson, #A71920)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <FaHeart />
                  </div>
                  <h4
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--color-maroon-dark, #351014)',
                      margin: '0 0 0.4rem'
                    }}
                  >
                    No donations found
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted, #6E5658)', maxWidth: '420px', margin: '0 auto' }}>
                    {searchTerm || statusFilter !== 'all'
                      ? 'No records match your selected filter or search terms.'
                      : 'Live donations completed on the Transparency page will automatically appear in this ledger.'}
                  </p>
                </td>
              </tr>
            ) : (
              // Data Rows
              donations.map((d) => (
                <tr key={d._id || d.donationId}>
                  <td>
                    <span className="donation-id-badge">{d.donationId}</span>
                  </td>
                  <td>
                    <div className="donation-donor-cell">
                      <div className="donation-donor-name">
                        {d.isAnonymous ? (
                          <>
                            <span>{d.fullName || 'Anonymous'}</span>
                            <span className="donation-anon-tag">Requested anonymous</span>
                          </>
                        ) : (
                          <span>{d.fullName}</span>
                        )}
                      </div>
                      <span className="donation-donor-email">{d.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="donation-amount-text">
                      ₹{(d.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>{renderStatusPill(d.status)}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted, #6E5658)', whiteSpace: 'nowrap' }}>
                    {formatDate(d.paidAt || d.createdAt)}
                  </td>
                  <td>
                    <span className="donation-gateway-ref" title={d.razorpayPaymentId || d.razorpayOrderId || '—'}>
                      {d.razorpayPaymentId || d.razorpayOrderId || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="donation-view-btn"
                      onClick={() => onView(d)}
                      title="View donation details"
                    >
                      <FaEye />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Count Bar */}
      {!loading && donations.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginTop: '1.25rem',
            padding: '0.25rem 0.5rem'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #6E5658)', fontWeight: 500 }}>
            Showing <strong>{donations.length}</strong> of <strong>{pagination.total || donations.length}</strong> donation records
          </span>

          {pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <button
                type="button"
                className="donation-refresh-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ padding: '0.35rem 0.75rem', minWidth: '34px', fontSize: '0.82rem' }}
              >
                &larr; Prev
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((num) => {
                const isActive = page === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    style={{
                      minWidth: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--color-crimson, #A71920)' : '#D9CBC7',
                      background: isActive ? 'var(--color-crimson, #A71920)' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : 'var(--text-main, #1F1214)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {num}
                  </button>
                );
              })}
              <button
                type="button"
                className="donation-refresh-btn"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                style={{ padding: '0.35rem 0.75rem', minWidth: '34px', fontSize: '0.82rem' }}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
