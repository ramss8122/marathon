import React, { useState, useEffect, useCallback } from 'react';
import {
  FaMagnifyingGlass,
  FaRotate,
  FaXmark,
  FaIndianRupeeSign,
  FaUsers,
  FaCircleCheck,
  FaCircleExclamation,
  FaPlus,
  FaTriangleExclamation
} from 'react-icons/fa6';
import adminFetch from '../../utils/adminFetch';
import DonationStatCard from './DonationStatCard';
import DonationTable from './DonationTable';
import DonationDetailsModal from './DonationDetailsModal';
import AddDonationModal from './AddDonationModal';

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

  // Modals & Dialogs
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [deleteConfirmDonation, setDeleteConfirmDonation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

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
    if (gatewayFilter === 'all') return true;
    if (gatewayFilter === 'Razorpay') {
      return d.source === 'razorpay' || d.paymentGateway === 'Razorpay';
    }
    if (gatewayFilter === 'Manual') {
      return d.source === 'admin' || d.paymentGateway === 'Manual / Offline';
    }
    return true;
  });

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

  // Delete manual donation handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmDonation) return;
    setIsDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/donations/${deleteConfirmDonation._id}`, {
        method: 'DELETE'
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        showToast(`Manual donation ${deleteConfirmDonation.donationId} deleted successfully.`, 'success');
        setDeleteConfirmDonation(null);
        fetchDonations();
      } else {
        showToast(json.message || 'Could not delete donation record.', 'error');
      }
    } catch (err) {
      console.error('Delete donation error:', err);
      showToast('Network error while deleting donation.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="donation-management-wrapper">
      {/* Floating Toast Notification */}
      {toast && (
        <div className={`donation-toast ${toast.type}`}>
          {toast.type === 'success' ? <FaCircleCheck /> : <FaCircleExclamation />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. Overview Stat Cards */}
      <div className="donation-stats-grid">
        <DonationStatCard
          icon={<FaUsers />}
          label="TOTAL DONORS"
          value={stats.totalDonors ?? 0}
          helper="Verified unique contributors"
          iconColor="#A71920"
          iconBg="rgba(167, 25, 32, 0.1)"
        />

        <DonationStatCard
          icon={<FaIndianRupeeSign />}
          label="TOTAL DONATIONS RECEIVED"
          value={`₹${(stats.totalDonationsReceived || 0).toLocaleString('en-IN')}`}
          helper="100% genuine reconciled funds"
          iconColor="#A71920"
          iconBg="rgba(167, 25, 32, 0.1)"
        />

        <DonationStatCard
          icon={<FaCircleCheck />}
          label="SUCCESSFUL DONATIONS"
          value={stats.successfulDonations ?? 0}
          helper="Completed payment transactions"
          iconColor="#15803D"
          iconBg="rgba(21, 128, 61, 0.12)"
        />
      </div>

      {/* 2. Main Ledger & Operations Card */}
      <div className="donation-card">
        {/* Header */}
        <div className="donation-card-header">
          <div>
            <h2 className="donation-header-title">Donation Management</h2>
            <p className="donation-header-desc">
              Track live contributions, amounts, donor contact records, and payment gateway references.
            </p>
          </div>

          {/* Action Toolbar Right: Add Donation + Refresh */}
          <div className="donation-toolbar-right">
            <button
              type="button"
              className="donation-add-btn"
              onClick={() => {
                setEditingDonation(null);
                setIsAddModalOpen(true);
              }}
              title="Add manual or offline donation record"
            >
              <FaPlus />
              <span>Add Donation</span>
            </button>

            <button
              type="button"
              className="donation-refresh-btn"
              onClick={fetchDonations}
              disabled={loading}
              title="Refresh donation records"
            >
              <FaRotate className={loading ? 'donation-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Select Filters */}
        <div className="donation-toolbar">
          <div className="donation-toolbar-left">
            {/* Search Input with embedded icon */}
            <div className="donation-search-box">
              <FaMagnifyingGlass className="donation-search-icon" />
              <input
                type="text"
                className="donation-search-input"
                placeholder="Search by name, email, amount, ID, ref..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="donation-search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <FaXmark />
                </button>
              )}
            </div>

            {/* Filter: Status */}
            <select
              className="donation-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by payment status"
            >
              <option value="all">All Status</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            {/* Filter: Gateway / Source */}
            <select
              className="donation-select"
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              aria-label="Filter by payment gateway or source"
            >
              <option value="all">All Sources &amp; Gateways</option>
              <option value="Razorpay">Online (Razorpay)</option>
              <option value="Manual">Offline / Manual (Admin)</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              fontSize: '0.86rem'
            }}
          >
            <FaCircleExclamation />
            <span>{error}</span>
          </div>
        )}

        {/* Table Component */}
        <DonationTable
          donations={filteredDonations}
          loading={loading}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onView={(d) => setSelectedDonation(d)}
          onEdit={(d) => {
            setEditingDonation(d);
            setIsAddModalOpen(true);
          }}
          onDelete={(d) => setDeleteConfirmDonation(d)}
          formatDate={formatDate}
          pagination={pagination}
          page={page}
          setPage={setPage}
        />
      </div>

      {/* 3. Add / Edit Donation Modal */}
      <AddDonationModal
        isOpen={isAddModalOpen}
        editingDonation={editingDonation}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDonation(null);
        }}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          fetchDonations();
        }}
      />

      {/* 4. Details View Modal Component */}
      {selectedDonation && (
        <DonationDetailsModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          formatDate={formatDate}
        />
      )}

      {/* 5. Delete Confirmation Dialog for Admin Donations */}
      {deleteConfirmDonation && (
        <div
          className="admin-modal-backdrop"
          onClick={() => !isDeleting && setDeleteConfirmDonation(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="donation-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            <div className="donation-modal-header" style={{ background: 'linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)' }}>
              <div className="donation-modal-header-left">
                <div className="donation-modal-icon-badge" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <FaTriangleExclamation />
                </div>
                <div>
                  <h3 className="donation-modal-title">Delete Donation</h3>
                  <span className="donation-modal-ref">{deleteConfirmDonation.donationId}</span>
                </div>
              </div>
              <button
                type="button"
                className="donation-modal-close-round"
                onClick={() => !isDeleting && setDeleteConfirmDonation(null)}
                aria-label="Close dialog"
              >
                <FaXmark />
              </button>
            </div>

            <div className="donation-modal-body" style={{ padding: '1.4rem' }}>
              <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main, #1F1214)', lineHeight: 1.5 }}>
                Are you sure you want to delete this offline donation record for{' '}
                <strong>{deleteConfirmDonation.fullName}</strong> (
                <strong style={{ color: '#A71920' }}>
                  ₹{(deleteConfirmDonation.amount || 0).toLocaleString('en-IN')}
                </strong>
                )?
              </p>
              <p style={{ margin: '0.65rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted, #6E5658)' }}>
                This manual entry will be permanently removed from the ledger and the donation totals will be recalculated immediately.
              </p>
            </div>

            <div className="donation-modal-footer" style={{ gap: '10px' }}>
              <button
                type="button"
                className="donation-refresh-btn"
                onClick={() => setDeleteConfirmDonation(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="donation-add-btn"
                style={{ background: '#DC2626' }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
