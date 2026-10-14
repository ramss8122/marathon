import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FaGaugeHigh,
  FaUsers,
  FaClock,
  FaCreditCard,
  FaEnvelope,
  FaRightFromBracket,
  FaBars,
  FaXmark,
  FaMagnifyingGlass,
  FaRotate,
  FaCircleCheck,
  FaCircleExclamation,
  FaEye,
  FaDatabase,
  FaArrowUpRightFromSquare,
  FaTrashCan,
  FaReply
} from 'react-icons/fa6';
import Logo from '../../components/Logo';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication check
  const [adminUser, setAdminUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active section based on URL or tab
  // Options: 'dashboard', 'registrations', 'pending', 'payments', 'messages'
  const getSectionFromPath = (path) => {
    if (path.includes('/admin/registrations')) return 'registrations';
    if (path.includes('/admin/pending')) return 'pending';
    if (path.includes('/admin/payments')) return 'payments';
    if (path.includes('/admin/messages')) return 'messages';
    return 'dashboard';
  };

  const [activeSection, setActiveSection] = useState(() => getSectionFromPath(location.pathname));

  // Sync section with route changes
  useEffect(() => {
    setActiveSection(getSectionFromPath(location.pathname));
    setSidebarOpen(false);
  }, [location.pathname]);

  // Data states
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    confirmedRegistrations: 0,
    pendingRegistrations: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    totalContactMessages: 0,
    unreadContactMessages: 0
  });

  const [registrations, setRegistrations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Filters & Search for Registrations
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('All');
  const [filterRegStatus, setFilterRegStatus] = useState('All');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('All');

  // Filters & Search for Messages
  const [messageSearch, setMessageSearch] = useState('');
  const [filterMsgRead, setFilterMsgRead] = useState('All');

  // Verify auth on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    try {
      const stored = localStorage.getItem('adminUser');
      if (stored) setAdminUser(JSON.parse(stored));
    } catch {
      setAdminUser({ username: 'admin', role: 'Administrator' });
    }
  }, [navigate]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
          setIsDbConnected(statsData.isDbConnected);
        }
      }

      // 2. Fetch Registrations
      const regsRes = await fetch('/api/admin/registrations');
      if (regsRes.ok) {
        const regsData = await regsRes.json();
        if (regsData.success) {
          setRegistrations(regsData.data || []);
        }
      }

      // 3. Fetch Messages
      const msgRes = await fetch('/api/admin/messages');
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        if (msgData.success) {
          setMessages(msgData.data || []);
        }
      }
    } catch (err) {
      console.warn('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login', { replace: true });
  };

  // Update participant status
  const handleUpdateParticipant = async (id, regStatus, payStatus) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationStatus: regStatus,
          paymentStatus: payStatus
        })
      });

      if (res.ok) {
        setRefreshKey(prev => prev + 1);
        if (selectedParticipant && selectedParticipant._id === id) {
          setSelectedParticipant(prev => ({
            ...prev,
            registrationStatus: regStatus || prev.registrationStatus,
            paymentStatus: payStatus || prev.paymentStatus
          }));
        }
      }
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  // Delete participant
  const handleDeleteParticipant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration record?')) return;
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedParticipant(null);
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Mark message as read/unread
  const handleToggleMessageRead = async (id, currentRead) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !currentRead })
      });

      if (res.ok) {
        setRefreshKey(prev => prev + 1);
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage(prev => ({ ...prev, isRead: !currentRead }));
        }
      }
    } catch (err) {
      console.error('Message read update error:', err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedMessage(null);
        setRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  // Filtered registrations
  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch =
      (r.fullName && r.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.mobileNumber && r.mobileNumber.includes(searchTerm)) ||
      (r.registrationRef && r.registrationRef.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEvent = filterEvent === 'All' || r.selectedEvent === filterEvent || r.eventName === filterEvent;
    const matchesReg = filterRegStatus === 'All' || r.registrationStatus === filterRegStatus;
    const matchesPay = filterPaymentStatus === 'All' || r.paymentStatus === filterPaymentStatus;

    return matchesSearch && matchesEvent && matchesReg && matchesPay;
  });

  // Pending registrations only
  const pendingRegistrations = registrations.filter(r =>
    r.registrationStatus === 'Pending' || r.paymentStatus === 'Pending'
  );

  // Filtered messages
  const filteredMessages = messages.filter(m => {
    const matchesSearch =
      (m.fullName && m.fullName.toLowerCase().includes(messageSearch.toLowerCase())) ||
      (m.email && m.email.toLowerCase().includes(messageSearch.toLowerCase())) ||
      (m.subject && m.subject.toLowerCase().includes(messageSearch.toLowerCase())) ||
      (m.message && m.message.toLowerCase().includes(messageSearch.toLowerCase()));

    const matchesRead =
      filterMsgRead === 'All' ||
      (filterMsgRead === 'Unread' && !m.isRead) ||
      (filterMsgRead === 'Read' && m.isRead);

    return matchesSearch && matchesRead;
  });

  const navigateTo = (sec) => {
    setActiveSection(sec);
    navigate(`/admin/${sec === 'dashboard' ? 'dashboard' : sec}`);
  };

  return (
    <div className="admin-shell">
      {/* ── TOP HEADER BAR ── */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button
            type="button"
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Navigation Sidebar"
          >
            {sidebarOpen ? <FaXmark /> : <FaBars />}
          </button>
          <div className="admin-header-brand">
            <Logo size="small" clickable={false} />
            <span className="admin-header-title">ADMIN CONSOLE</span>
          </div>
        </div>

        <div className="admin-header-right">
          {/* DB Indicator */}
          <div className={`admin-db-status ${isDbConnected ? 'connected' : 'standby'}`}>
            <span className="db-pulse-dot" />
            <FaDatabase className="db-icon" />
            <span>{isDbConnected ? 'MongoDB Connected' : 'Local Standby'}</span>
          </div>

          {/* View Website Link */}
          <Link to="/" target="_blank" rel="noopener noreferrer" className="admin-view-site-link">
            <span>View Website</span>
            <FaArrowUpRightFromSquare className="site-icon" />
          </Link>

          {/* User Profile Pill */}
          <div className="admin-user-pill">
            <span className="user-avatar">{adminUser?.username?.[0]?.toUpperCase() || 'A'}</span>
            <span className="user-name">{adminUser?.username || 'admin'}</span>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="admin-logout-btn"
            title="End Admin Session"
          >
            <FaRightFromBracket />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </header>

      <div className="admin-body">
        {/* ── SIDEBAR NAVIGATION ── */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="admin-sidebar-nav">
            <div className="sidebar-group-label">NAVIGATION</div>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => navigateTo('dashboard')}
            >
              <FaGaugeHigh className="sidebar-icon" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSection === 'registrations' ? 'active' : ''}`}
              onClick={() => navigateTo('registrations')}
            >
              <FaUsers className="sidebar-icon" />
              <span>All Registrations</span>
              <span className="sidebar-count-badge">{stats.totalRegistrations}</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSection === 'pending' ? 'active' : ''}`}
              onClick={() => navigateTo('pending')}
            >
              <FaClock className="sidebar-icon" />
              <span>Pending Registrations</span>
              {stats.pendingRegistrations > 0 && (
                <span className="sidebar-count-badge warning">{stats.pendingRegistrations}</span>
              )}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSection === 'payments' ? 'active' : ''}`}
              onClick={() => navigateTo('payments')}
            >
              <FaCreditCard className="sidebar-icon" />
              <span>Payments</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSection === 'messages' ? 'active' : ''}`}
              onClick={() => navigateTo('messages')}
            >
              <FaEnvelope className="sidebar-icon" />
              <span>Contact Messages</span>
              {stats.unreadContactMessages > 0 && (
                <span className="sidebar-count-badge gold">{stats.unreadContactMessages}</span>
              )}
            </button>

            <div className="sidebar-group-label" style={{ marginTop: '2rem' }}>SESSION</div>

            <button
              type="button"
              className="sidebar-nav-item logout-nav"
              onClick={handleLogout}
            >
              <FaRightFromBracket className="sidebar-icon" />
              <span>Logout</span>
            </button>
          </div>

          {/* Sidebar Footer Info */}
          <div className="admin-sidebar-footer">
            <div className="system-version">RUNORA Core v2.6</div>
            <div className="system-db">
              {isDbConnected ? 'MongoDB Online (Port 27017)' : 'Local File Persistence'}
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── MAIN CONTENT AREA ── */}
        <main className="admin-main">
          {/* Action Bar */}
          <div className="admin-action-bar">
            <div>
              <h1 className="admin-page-title">
                {activeSection === 'dashboard' && 'Dashboard Overview'}
                {activeSection === 'registrations' && 'Registered Participants'}
                {activeSection === 'pending' && 'Pending Registrations & Payments'}
                {activeSection === 'payments' && 'Payment & Transaction Management'}
                {activeSection === 'messages' && 'Contact Inquiries & Messages'}
              </h1>
              <p className="admin-page-sub">
                {activeSection === 'dashboard' && 'Live event statistics, registration activity, and messages.'}
                {activeSection === 'registrations' && 'Complete roster of runners across all distance categories.'}
                {activeSection === 'pending' && 'Participants awaiting payment confirmation or race-kit allocation.'}
                {activeSection === 'payments' && 'Financial overview of entry fees collected and pending receipts.'}
                {activeSection === 'messages' && 'Participant inquiries received from the public Contact page.'}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm admin-refresh-btn"
              onClick={() => setRefreshKey(prev => prev + 1)}
              disabled={isLoading}
            >
              <FaRotate className={isLoading ? 'spinning' : ''} />
              <span>{isLoading ? 'Updating...' : 'Refresh Data'}</span>
            </button>
          </div>

          {/* ══════════════════════════════════════════
              VIEW 1: DASHBOARD OVERVIEW
             ══════════════════════════════════════════ */}
          {activeSection === 'dashboard' && (
            <div className="dashboard-view">
              {/* Summary Cards Grid */}
              <div className="admin-stats-grid">
                {/* 1. Total Registrations */}
                <div className="admin-stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">Total Registrations</span>
                    <div className="stat-card-icon-wrap primary">
                      <FaUsers />
                    </div>
                  </div>
                  <div className="stat-card-val">{stats.totalRegistrations}</div>
                  <div className="stat-card-sub">All runner entries submitted</div>
                </div>

                {/* 2. Confirmed Registrations */}
                <div className="admin-stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">Confirmed Entries</span>
                    <div className="stat-card-icon-wrap success">
                      <FaCircleCheck />
                    </div>
                  </div>
                  <div className="stat-card-val">{stats.confirmedRegistrations}</div>
                  <div className="stat-card-sub">Bib &amp; slot confirmed</div>
                </div>

                {/* 3. Pending Registrations */}
                <div className="admin-stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">Pending Entries</span>
                    <div className="stat-card-icon-wrap warning">
                      <FaClock />
                    </div>
                  </div>
                  <div className="stat-card-val">{stats.pendingRegistrations}</div>
                  <div className="stat-card-sub">Awaiting verification</div>
                </div>

                {/* 4. Successful Payments */}
                <div className="admin-stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">Successful Payments</span>
                    <div className="stat-card-icon-wrap success">
                      <FaCreditCard />
                    </div>
                  </div>
                  <div className="stat-card-val">{stats.successfulPayments}</div>
                  <div className="stat-card-sub">Verified payment receipts</div>
                </div>

                {/* 5. Pending Payments */}
                <div className="admin-stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">Pending Payments</span>
                    <div className="stat-card-icon-wrap warning">
                      <FaCircleExclamation />
                    </div>
                  </div>
                  <div className="stat-card-val">{stats.pendingPayments}</div>
                  <div className="stat-card-sub">Unpaid / pending bank clear</div>
                </div>

                {/* 6. Contact Messages */}
                <div className="admin-stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">Contact Messages</span>
                    <div className="stat-card-icon-wrap gold">
                      <FaEnvelope />
                    </div>
                  </div>
                  <div className="stat-card-val">{stats.totalContactMessages}</div>
                  <div className="stat-card-sub">
                    {stats.unreadContactMessages > 0
                      ? `${stats.unreadContactMessages} unread inquiry`
                      : 'All inquiries reviewed'}
                  </div>
                </div>
              </div>

              {/* Database Status Alert Banner */}
              {!isDbConnected ? (
                <div className="admin-alert-box warning">
                  <FaCircleExclamation className="alert-box-icon" />
                  <div className="alert-box-content">
                    <h4>Database Alert: MongoDB Disconnected</h4>
                    <p>
                      Currently operating with local in-memory fallback. Ensure MongoDB Server is running on{' '}
                      <code>mongodb://127.0.0.1:27017/runora_marathon</code> or set <code>MONGODB_URI</code> in <code>.env</code>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="admin-alert-box success">
                  <FaCircleCheck className="alert-box-icon" />
                  <div className="alert-box-content">
                    <h4>Database Online: Connected to MongoDB Server</h4>
                    <p>
                      All participant registrations and contact inquiries are safely persisted to MongoDB database <code>runora_marathon</code>.
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Activity Split */}
              <div className="dashboard-activity-split">
                {/* Left: Latest Registrations */}
                <div className="dashboard-activity-card">
                  <div className="activity-card-header">
                    <h3>Recent Registrations</h3>
                    <button
                      type="button"
                      className="activity-view-all-btn"
                      onClick={() => navigateTo('registrations')}
                    >
                      View All ({registrations.length})
                    </button>
                  </div>

                  {registrations.length === 0 ? (
                    <div className="admin-empty-state">
                      <FaUsers className="empty-icon" />
                      <p>No participant registrations submitted yet.</p>
                      <span className="empty-hint">Registrations submitted on the public website will appear here.</span>
                    </div>
                  ) : (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Ref #</th>
                            <th>Participant</th>
                            <th>Event &amp; Distance</th>
                            <th>Reg Status</th>
                            <th>Payment</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.slice(0, 5).map((r) => (
                            <tr key={r._id || r.registrationRef}>
                              <td>
                                <span className="ref-tag">{r.registrationRef}</span>
                              </td>
                              <td>
                                <div className="participant-name-cell">
                                  <strong>{r.fullName}</strong>
                                  <span>{r.email}</span>
                                </div>
                              </td>
                              <td>
                                <div className="event-cell">
                                  <span>{r.eventName || r.selectedEvent}</span>
                                  <span className="dist-badge">{r.distance || r.raceCategory}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`status-pill ${r.registrationStatus?.toLowerCase()}`}>
                                  {r.registrationStatus}
                                </span>
                              </td>
                              <td>
                                <span className={`status-pill ${r.paymentStatus?.toLowerCase()}`}>
                                  {r.paymentStatus}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="admin-action-btn"
                                  onClick={() => setSelectedParticipant(r)}
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right: Latest Contact Inquiries */}
                <div className="dashboard-activity-card">
                  <div className="activity-card-header">
                    <h3>Recent Contact Messages</h3>
                    <button
                      type="button"
                      className="activity-view-all-btn"
                      onClick={() => navigateTo('messages')}
                    >
                      View All ({messages.length})
                    </button>
                  </div>

                  {messages.length === 0 ? (
                    <div className="admin-empty-state">
                      <FaEnvelope className="empty-icon" />
                      <p>No contact inquiries received yet.</p>
                      <span className="empty-hint">Messages submitted via the Contact Us form will appear here.</span>
                    </div>
                  ) : (
                    <div className="recent-messages-list">
                      {messages.slice(0, 5).map((m) => (
                        <div
                          key={m._id}
                          className={`recent-message-item ${m.isRead ? 'read' : 'unread'}`}
                          onClick={() => setSelectedMessage(m)}
                        >
                          <div className="msg-item-top">
                            <strong>{m.fullName}</strong>
                            <span className="msg-date">
                              {new Date(m.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="msg-subject">{m.subject}</div>
                          <div className="msg-preview">{m.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              VIEW 2: ALL REGISTERED PARTICIPANTS
             ══════════════════════════════════════════ */}
          {activeSection === 'registrations' && (
            <div className="registrations-view">
              {/* Filter Controls Bar */}
              <div className="admin-filter-bar">
                <div className="search-input-wrap">
                  <FaMagnifyingGlass className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by participant name, email, or ref..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
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

                <div className="filter-dropdowns">
                  {/* Event Filter */}
                  <div className="filter-select-wrap">
                    <label>Event:</label>
                    <select
                      value={filterEvent}
                      onChange={(e) => setFilterEvent(e.target.value)}
                      className="admin-select"
                    >
                      <option value="All">All Events</option>
                      <option value="chennai-coastal-run">Chennai Coastal Run</option>
                      <option value="coimbatore-hills-run">Coimbatore Green Marathon</option>
                      <option value="bengaluru-tech-stride">Bengaluru Heritage Stride</option>
                      <option value="kochi-backwater-marathon">Kochi Backwater Run</option>
                    </select>
                  </div>

                  {/* Reg Status Filter */}
                  <div className="filter-select-wrap">
                    <label>Reg Status:</label>
                    <select
                      value={filterRegStatus}
                      onChange={(e) => setFilterRegStatus(e.target.value)}
                      className="admin-select"
                    >
                      <option value="All">All</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div className="filter-select-wrap">
                    <label>Payment:</label>
                    <select
                      value={filterPaymentStatus}
                      onChange={(e) => setFilterPaymentStatus(e.target.value)}
                      className="admin-select"
                    >
                      <option value="All">All</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="admin-table-card">
                <div className="table-card-header">
                  <div className="count-info">
                    Showing <strong>{filteredRegistrations.length}</strong> of{' '}
                    <strong>{registrations.length}</strong> Total Participants
                  </div>
                </div>

                {filteredRegistrations.length === 0 ? (
                  <div className="admin-empty-state">
                    <FaUsers className="empty-icon" />
                    <p>No participants match your search criteria.</p>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setSearchTerm('');
                        setFilterEvent('All');
                        setFilterRegStatus('All');
                        setFilterPaymentStatus('All');
                      }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Participant Name</th>
                          <th>Email Address</th>
                          <th>Phone Number</th>
                          <th>Marathon Event</th>
                          <th>Distance</th>
                          <th>Reg Date</th>
                          <th>Reg Status</th>
                          <th>Payment</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRegistrations.map((r) => (
                          <tr key={r._id || r.registrationRef}>
                            <td>
                              <div className="participant-name-cell">
                                <strong>{r.fullName}</strong>
                                <span className="ref-tag">{r.registrationRef}</span>
                              </div>
                            </td>
                            <td>{r.email}</td>
                            <td>{r.mobileNumber}</td>
                            <td>
                              <span className="event-name-text">
                                {r.eventName || r.selectedEvent}
                              </span>
                            </td>
                            <td>
                              <span className="dist-badge">{r.distance || r.raceCategory}</span>
                            </td>
                            <td>
                              {new Date(r.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <span className={`status-pill ${r.registrationStatus?.toLowerCase()}`}>
                                {r.registrationStatus}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${r.paymentStatus?.toLowerCase()}`}>
                                {r.paymentStatus}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="admin-action-btn view-btn"
                                onClick={() => setSelectedParticipant(r)}
                                title="View Participant Details"
                              >
                                <FaEye />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              VIEW 3: PENDING REGISTRATIONS
             ══════════════════════════════════════════ */}
          {activeSection === 'pending' && (
            <div className="pending-view">
              <div className="admin-alert-box warning" style={{ marginBottom: '1.5rem' }}>
                <FaClock className="alert-box-icon" />
                <div className="alert-box-content">
                  <h4>Pending Registrations Roster ({pendingRegistrations.length})</h4>
                  <p>
                    These participants have submitted their registration, but either their registration approval or payment verification is still pending. Review details carefully before manually confirming.
                  </p>
                </div>
              </div>

              <div className="admin-table-card">
                {pendingRegistrations.length === 0 ? (
                  <div className="admin-empty-state">
                    <FaCircleCheck className="empty-icon success-icon" />
                    <p>All registrations and payments are fully confirmed!</p>
                    <span className="empty-hint">There are currently zero pending entries.</span>
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Participant</th>
                          <th>Email &amp; Phone</th>
                          <th>Selected Event</th>
                          <th>Distance</th>
                          <th>Reg Status</th>
                          <th>Payment Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRegistrations.map((r) => (
                          <tr key={r._id || r.registrationRef}>
                            <td>
                              <div className="participant-name-cell">
                                <strong>{r.fullName}</strong>
                                <span className="ref-tag">{r.registrationRef}</span>
                              </div>
                            </td>
                            <td>
                              <div>{r.email}</div>
                              <div style={{ fontSize: '0.8rem', color: '#6B6B6B' }}>{r.mobileNumber}</div>
                            </td>
                            <td>{r.eventName || r.selectedEvent}</td>
                            <td>
                              <span className="dist-badge">{r.distance || r.raceCategory}</span>
                            </td>
                            <td>
                              <span className={`status-pill ${r.registrationStatus?.toLowerCase()}`}>
                                {r.registrationStatus}
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${r.paymentStatus?.toLowerCase()}`}>
                                {r.paymentStatus}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setSelectedParticipant(r)}
                              >
                                Review &amp; Verify
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              VIEW 4: PAYMENTS OVERVIEW
             ══════════════════════════════════════════ */}
          {activeSection === 'payments' && (
            <div className="payments-view">
              {/* Payment Summary Cards */}
              <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <div className="admin-stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">Successful Payments</span>
                    <div className="stat-card-icon-wrap success"><FaCircleCheck /></div>
                  </div>
                  <div className="stat-card-val">{stats.successfulPayments}</div>
                  <div className="stat-card-sub">Cleared transactions</div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">Pending Payments</span>
                    <div className="stat-card-icon-wrap warning"><FaClock /></div>
                  </div>
                  <div className="stat-card-val">{stats.pendingPayments}</div>
                  <div className="stat-card-sub">Awaiting confirmation</div>
                </div>

                <div className="admin-stat-card">
                  <div className="stat-card-top">
                    <span className="stat-card-label">Estimated Revenue</span>
                    <div className="stat-card-icon-wrap gold"><FaCreditCard /></div>
                  </div>
                  <div className="stat-card-val">
                    ₹{registrations.filter(r => r.paymentStatus === 'Paid').reduce((acc, curr) => acc + (curr.amount || 699), 0).toLocaleString()}
                  </div>
                  <div className="stat-card-sub">From confirmed paid entries</div>
                </div>
              </div>

              {/* Payments Table */}
              <div className="admin-table-card">
                <div className="table-card-header">
                  <h3>Payment Transactions</h3>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ref #</th>
                        <th>Participant</th>
                        <th>Amount</th>
                        <th>Distance</th>
                        <th>Payment Mode</th>
                        <th>Payment Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((r) => (
                        <tr key={r._id || r.registrationRef}>
                          <td><span className="ref-tag">{r.registrationRef}</span></td>
                          <td>
                            <strong>{r.fullName}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#6B6B6B' }}>{r.email}</div>
                          </td>
                          <td>
                            <strong style={{ color: '#9E1B22' }}>₹{r.amount || 699}</strong>
                          </td>
                          <td><span className="dist-badge">{r.distance || r.raceCategory}</span></td>
                          <td>{r.paymentMethod || 'Online UPI'}</td>
                          <td>
                            <span className={`status-pill ${r.paymentStatus?.toLowerCase()}`}>
                              {r.paymentStatus}
                            </span>
                          </td>
                          <td>
                            {r.paymentStatus !== 'Paid' ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handleUpdateParticipant(r._id, null, 'Paid')}
                              >
                                Mark as Paid
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#2E7D32', fontWeight: 600 }}>
                                <FaCircleCheck /> Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              VIEW 5: CONTACT MESSAGES
             ══════════════════════════════════════════ */}
          {activeSection === 'messages' && (
            <div className="messages-view">
              <div className="admin-filter-bar">
                <div className="search-input-wrap">
                  <FaMagnifyingGlass className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by sender, email, or message..."
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    className="admin-search-input"
                  />
                </div>

                <div className="filter-dropdowns">
                  <div className="filter-select-wrap">
                    <label>Filter:</label>
                    <select
                      value={filterMsgRead}
                      onChange={(e) => setFilterMsgRead(e.target.value)}
                      className="admin-select"
                    >
                      <option value="All">All Inquiries</option>
                      <option value="Unread">Unread Only</option>
                      <option value="Read">Read Only</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-table-card">
                <div className="table-card-header">
                  <h3>Public Contact Messages ({filteredMessages.length})</h3>
                </div>

                {filteredMessages.length === 0 ? (
                  <div className="admin-empty-state">
                    <FaEnvelope className="empty-icon" />
                    <p>No messages match your criteria.</p>
                  </div>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Sender Name</th>
                          <th>Email Address</th>
                          <th>Subject</th>
                          <th>Message Preview</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMessages.map((m) => (
                          <tr key={m._id} className={m.isRead ? '' : 'unread-row'}>
                            <td>
                              <span className={`msg-status-dot ${m.isRead ? 'read' : 'unread'}`} />
                              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                {m.isRead ? 'Read' : 'New'}
                              </span>
                            </td>
                            <td><strong>{m.fullName}</strong></td>
                            <td>{m.email}</td>
                            <td><strong>{m.subject}</strong></td>
                            <td>
                              <div className="msg-preview-cell">{m.message}</div>
                            </td>
                            <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button
                                type="button"
                                className="admin-action-btn view-btn"
                                onClick={() => setSelectedMessage(m)}
                              >
                                <FaEye />
                                <span>Read</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════
          MODAL: PARTICIPANT DETAILS
         ══════════════════════════════════════════ */}
      {selectedParticipant && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedParticipant(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <FaUsers className="modal-icon" />
                <div>
                  <h2>Participant Information</h2>
                  <span className="ref-tag">{selectedParticipant.registrationRef}</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedParticipant(null)}
              >
                <FaXmark />
              </button>
            </div>

            <div className="modal-body">
              <div className="participant-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-val">{selectedParticipant.fullName}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-val">{selectedParticipant.email}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Mobile Number</span>
                  <span className="detail-val">{selectedParticipant.mobileNumber}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Date of Birth</span>
                  <span className="detail-val">{selectedParticipant.dob}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Gender</span>
                  <span className="detail-val">{selectedParticipant.gender}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-val">
                    {selectedParticipant.city}, {selectedParticipant.state}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Selected Marathon</span>
                  <span className="detail-val">
                    {selectedParticipant.eventName || selectedParticipant.selectedEvent}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Distance &amp; Fee</span>
                  <span className="detail-val">
                    {selectedParticipant.distance || selectedParticipant.raceCategory} (₹{selectedParticipant.amount || 699})
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Emergency Contact</span>
                  <span className="detail-val">
                    {selectedParticipant.emergencyContact} ({selectedParticipant.emergencyPhone})
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Registration Date</span>
                  <span className="detail-val">
                    {new Date(selectedParticipant.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="modal-status-controls">
                <h4>Update Status</h4>
                <div className="status-buttons-row">
                  <div>
                    <label>Registration Status:</label>
                    <div className="btn-group">
                      <button
                        type="button"
                        className={`btn btn-sm ${selectedParticipant.registrationStatus === 'Confirmed' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleUpdateParticipant(selectedParticipant._id, 'Confirmed', null)}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${selectedParticipant.registrationStatus === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleUpdateParticipant(selectedParticipant._id, 'Pending', null)}
                      >
                        Pending
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${selectedParticipant.registrationStatus === 'Cancelled' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleUpdateParticipant(selectedParticipant._id, 'Cancelled', null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div>
                    <label>Payment Status:</label>
                    <div className="btn-group">
                      <button
                        type="button"
                        className={`btn btn-sm ${selectedParticipant.paymentStatus === 'Paid' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleUpdateParticipant(selectedParticipant._id, null, 'Paid')}
                      >
                        Paid
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${selectedParticipant.paymentStatus === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleUpdateParticipant(selectedParticipant._id, null, 'Pending')}
                      >
                        Pending
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${selectedParticipant.paymentStatus === 'Failed' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleUpdateParticipant(selectedParticipant._id, null, 'Failed')}
                      >
                        Failed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm delete-btn"
                onClick={() => handleDeleteParticipant(selectedParticipant._id)}
              >
                <FaTrashCan />
                <span>Delete Entry</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedParticipant(null)}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL: VIEW CONTACT MESSAGE
         ══════════════════════════════════════════ */}
      {selectedMessage && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedMessage(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <FaEnvelope className="modal-icon gold" />
                <div>
                  <h2>Contact Inquiry</h2>
                  <span className="msg-date">
                    Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedMessage(null)}
              >
                <FaXmark />
              </button>
            </div>

            <div className="modal-body">
              <div className="message-meta-box">
                <div><strong>Sender:</strong> {selectedMessage.fullName}</div>
                <div><strong>Email:</strong> {selectedMessage.email}</div>
                <div><strong>Subject:</strong> {selectedMessage.subject}</div>
              </div>

              <div className="message-full-content">
                <h4>Message:</h4>
                <p>{selectedMessage.message}</p>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-footer-left">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleToggleMessageRead(selectedMessage._id, selectedMessage.isRead)}
                >
                  {selectedMessage.isRead ? 'Mark as Unread' : 'Mark as Read'}
                </button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'RUNORA Marathon Inquiry')}`}
                  className="btn btn-primary btn-sm"
                >
                  <FaReply />
                  <span>Reply via Email</span>
                </a>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm delete-btn"
                onClick={() => handleDeleteMessage(selectedMessage._id)}
              >
                <FaTrashCan />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
