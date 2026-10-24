import React, { useState, useEffect, useCallback } from 'react';
import {
  FaMagnifyingGlass,
  FaRotate,
  FaXmark,
  FaIndianRupeeSign,
  FaUsers,
  FaCircleCheck,
  FaCircleExclamation
} from 'react-icons/fa6';
import adminFetch from '../../utils/adminFetch';
import DonationStatCard from './DonationStatCard';
import DonationTable from './DonationTable';
import DonationDetailsModal from './DonationDetailsModal';

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
    <div className="donation-management-wrapper">
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

          {/* Reserved slot for Add Donation button in next prompt + Refresh */}
          <div className="donation-toolbar-right">
            {/* Slot for future Add Donation button */}
            <div id="add-donation-slot" />

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
                placeholder="Search by name, email, amount, ID..."
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

            {/* Filter: Gateway */}
            <select
              className="donation-select"
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              aria-label="Filter by payment gateway"
            >
              <option value="all">All Payment Gateway</option>
              <option value="Razorpay">Razorpay</option>
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
          formatDate={formatDate}
          pagination={pagination}
          page={page}
          setPage={setPage}
        />
      </div>

      {/* 3. Details Modal Component */}
      {selectedDonation && (
        <DonationDetailsModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
