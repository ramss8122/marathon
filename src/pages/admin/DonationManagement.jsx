import React, { useState, useEffect, useCallback } from 'react';
import {
  FaMagnifyingGlass,
  FaRotate,
  FaEye,
  FaXmark,
  FaHeart,
  FaIndianRupeeSign,
  FaUsers,
  FaCircleCheck,
  FaCircleExclamation,
  FaClock,
  FaShieldHalved
} from 'react-icons/fa6';
import adminFetch from '../../utils/adminFetch';

export default function DonationManagement() {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalDonationsReceived: 0,
    successfulDonations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 15 });

  // View Modal
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '15',
        search: searchTerm,
        status: statusFilter
      });

      const res = await adminFetch(`/api/admin/donations?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDonations(json.data || []);
          if (json.pagination) setPagination(json.pagination);
          if (json.stats) setStats(json.stats);
        } else {
          setError(json.message || 'Failed to load donations.');
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.message || 'Server error loading donations.');
      }
    } catch (err) {
      console.error('Donation fetch error:', err);
      setError('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  // Apply local gateway filter if selected
  const filteredDonations = donations.filter((d) => {
    if (gatewayFilter !== 'all' && d.paymentGateway !== gatewayFilter) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'successful') {
      return <span className="status-badge confirmed">Successful</span>;
    }
    if (s === 'pending') {
      return <span className="status-badge pending">Pending</span>;
    }
    return <span className="status-badge cancelled">Failed</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="admin-content-inner">
      {/* Overview Stat Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="admin-stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(167, 25, 32, 0.1)', color: '#A71920' }}>
            <FaUsers />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Donors</span>
            <span className="stat-card-value">{stats.totalDonors ?? 0}</span>
            <span className="stat-card-sub">Verified unique contributors</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(167, 25, 32, 0.1)', color: '#A71920' }}>
            <FaIndianRupeeSign />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Donations Received</span>
            <span className="stat-card-value">₹{(stats.totalDonationsReceived || 0).toLocaleString('en-IN')}</span>
            <span className="stat-card-sub">100% genuine reconciled funds</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(21, 128, 61, 0.1)', color: '#15803D' }}>
            <FaCircleCheck />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Successful Donations</span>
            <span className="stat-card-value">{stats.successfulDonations ?? 0}</span>
            <span className="stat-card-sub">Completed payment transactions</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="admin-card-title">Donation Management</h2>
            <p className="admin-card-desc">
              Track live contributions, amounts, donor contact records, and payment gateway references.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchDonations}
            disabled={loading}
          >
            <FaRotate className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters Bar matching reference screenshot */}
        <div className="admin-filter-bar" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <FaMagnifyingGlass className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, amount, payment ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
              >
                <FaXmark />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            <select
              className="admin-select"
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
            >
              <option value="all">All Payment Gateway</option>
              <option value="Razorpay">Razorpay</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="admin-alert-banner warning" style={{ margin: '1rem 0' }}>
            <FaCircleExclamation />
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        <div className="admin-table-wrapper" style={{ marginTop: '1rem' }}>
          <table className="admin-table">
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
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <FaRotate className="spinning" />
                      <span>Loading donation records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                    <FaHeart style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.75rem' }} />
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--color-dark-gray)' }}>
                      No donations found
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                      {searchTerm || statusFilter !== 'all'
                        ? 'No records match your selected filter criteria.'
                        : 'Donations completed through the Transparency page will appear here automatically.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d) => (
                  <tr key={d._id || d.donationId}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--color-crimson, #A71920)', fontFamily: 'monospace', fontSize: '0.92rem' }}>
                        {d.donationId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-dark-gray)' }}>
                        {d.isAnonymous ? (
                          <span>
                            Anonymous{' '}
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                              ({d.fullName})
                            </span>
                          </span>
                        ) : (
                          d.fullName
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.email}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                        ₹{(d.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>{getStatusBadge(d.status)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatDate(d.paidAt || d.createdAt)}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                        {d.razorpayPaymentId || d.razorpayOrderId || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={() => setSelectedDonation(d)}
                      >
                        <FaEye style={{ marginRight: '0.3rem' }} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count */}
        {!loading && filteredDonations.length > 0 && (
          <div className="admin-pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.25rem', padding: '0.75rem 0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredDonations.length} of {pagination.total || filteredDonations.length} donations
            </span>
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{ minWidth: '34px', padding: '0.3rem' }}
                >
                  &lt;
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`btn btn-sm ${page === num ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setPage(num)}
                    style={{ minWidth: '34px', padding: '0.3rem' }}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  style={{ minWidth: '34px', padding: '0.3rem' }}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {selectedDonation && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedDonation(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(167, 25, 32, 0.1)', color: 'var(--color-crimson, #A71920)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaHeart />
                </div>
                <div>
                  <h3 className="admin-modal-title" style={{ margin: 0 }}>
                    Donation Details
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {selectedDonation.donationId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedDonation(null)}
              >
                <FaXmark />
              </button>
            </div>

            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="admin-info-box">
                  <span className="info-label">Amount</span>
                  <span className="info-value" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-crimson, #A71920)' }}>
                    ₹{(selectedDonation.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="admin-info-box">
                  <span className="info-label">Payment Status</span>
                  <div style={{ marginTop: '0.25rem' }}>{getStatusBadge(selectedDonation.status)}</div>
                </div>
              </div>

              <div className="admin-info-box">
                <span className="info-label">Donor Name</span>
                <span className="info-value" style={{ fontWeight: 700 }}>
                  {selectedDonation.fullName}
                  {selectedDonation.isAnonymous && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#15803D', fontWeight: 600 }}>
                      (Requested Anonymous on Ledger)
                    </span>
                  )}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="admin-info-box">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{selectedDonation.email}</span>
                </div>
                <div className="admin-info-box">
                  <span className="info-label">Mobile Number</span>
                  <span className="info-value">+91 {selectedDonation.mobileNumber}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div className="admin-info-box">
                  <span className="info-label">Payment Gateway</span>
                  <span className="info-value">{selectedDonation.paymentGateway || 'Razorpay'}</span>
                </div>
                <div className="admin-info-box">
                  <span className="info-label">Payment Date</span>
                  <span className="info-value">{formatDate(selectedDonation.paidAt || selectedDonation.createdAt)}</span>
                </div>
              </div>

              <div className="admin-info-box">
                <span className="info-label">Razorpay Order ID</span>
                <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>
                  {selectedDonation.razorpayOrderId || '—'}
                </span>
              </div>

              <div className="admin-info-box">
                <span className="info-label">Razorpay Payment ID / Reference</span>
                <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.84rem' }}>
                  {selectedDonation.razorpayPaymentId || '—'}
                </span>
              </div>

              {selectedDonation.message && (
                <div className="admin-info-box">
                  <span className="info-label">Donor Message</span>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--text-main)' }}>
                    "{selectedDonation.message}"
                  </p>
                </div>
              )}
            </div>

            <div className="admin-modal-footer" style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setSelectedDonation(null)}
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
