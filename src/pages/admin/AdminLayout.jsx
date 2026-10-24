import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  FaReply,
  FaPlus,
  FaFileArrowDown,
  FaLocationDot,
  FaUpload,
  FaBullhorn,
  FaGear,
  FaPenToSquare,
  FaToggleOn,
  FaToggleOff,
  FaChevronDown,
  FaChevronUp,
  FaHeart
} from 'react-icons/fa6';
import Logo from '../../components/Logo';
import { exportRegistrationsToExcel } from '../../utils/exportToExcel';
import AddRegistrationModal from './AddRegistrationModal';
import EmailMarketing from './EmailMarketing';
import Settings from './Settings';
import DonationManagement from './DonationManagement';
import adminFetch from '../../utils/adminFetch';
import { getCityDisplayName } from '../../utils/cityHelper';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication check
  const [adminUser, setAdminUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active section based on URL or tab
  // Options: 'dashboard', 'registrations', 'cities', 'pending', 'payments', 'messages', 'email-marketing'
  const getSectionFromPath = (path) => {
    if (path.includes('/admin/registrations')) return 'registrations';
    if (path.includes('/admin/donations')) return 'donations';
    if (path.includes('/admin/cities')) return 'cities';
    if (path.includes('/admin/pending')) return 'pending';
    if (path.includes('/admin/payments')) return 'payments';
    if (path.includes('/admin/messages')) return 'messages';
    if (path.includes('/admin/email-marketing')) return 'email-marketing';
    if (path.includes('/admin/settings')) return 'settings';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Concurrency guard and notification timeout refs
  const isFetchingRef = useRef(false);
  const notificationTimeoutRef = useRef(null);

  // Modals
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Cities Management State
  const [cities, setCities] = useState([]);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [citySearch, setCitySearch] = useState('');
  const [cityStatusFilter, setCityStatusFilter] = useState('All');
  const [showCommunityFields, setShowCommunityFields] = useState(false);
  const [cityFormData, setCityFormData] = useState({
    name: '',
    slug: '',
    date: '',
    time: '',
    gatesOpenTime: '',
    venue: '',
    imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    badgeText: 'Official Marathon Course',
    categories: ['1K', '3K', '5K', '10K', '21K'],
    description: '',
    status: 'active',
    isActive: true,
    community: {
      chapterName: '',
      weeklyRunners: '',
      meetDay: '',
      meetTime: '',
      meetupPoint: '',
      paceGroups: '',
      leads: ''
    }
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isSavingCity, setIsSavingCity] = useState(false);

  // Filters & Search for Registrations
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('All');
  const [filterRegStatus, setFilterRegStatus] = useState('All');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('All');

  // Filters & Search for Messages
  const [messageSearch, setMessageSearch] = useState('');
  const [filterMsgRead, setFilterMsgRead] = useState('All');

  // Clean up notification timer on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

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

  // Fetch data with concurrency control, manual refresh feedback, and state updates
  const fetchData = useCallback(async (isManual = false) => {
    // Prevent duplicate or overlapping requests
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }

    let hadError = false;

    try {
      // Fetch stats, registrations, messages, and cities concurrently using Promise.allSettled
      const [statsResult, regsResult, msgResult, citiesResult] = await Promise.allSettled([
        adminFetch('/api/admin/stats').then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        }),
        adminFetch('/api/admin/registrations').then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        }),
        adminFetch('/api/admin/messages').then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        }),
        adminFetch('/api/admin/cities').then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        }).catch(() => fetch('/api/cities?all=true').then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        }))
      ]);

      // 1. Process Stats
      if (statsResult.status === 'fulfilled' && statsResult.value?.success) {
        setStats(statsResult.value.stats);
        setIsDbConnected(Boolean(statsResult.value.isDbConnected));
      } else {
        hadError = true;
      }

      // 2. Process Registrations
      if (regsResult.status === 'fulfilled' && regsResult.value?.success) {
        const freshRegs = regsResult.value.data || [];
        setRegistrations(freshRegs);

        // If stats API failed, keep stats & sidebar counts updated from fresh registrations
        if (statsResult.status !== 'fulfilled' || !statsResult.value?.success) {
          setStats(prev => ({
            ...prev,
            totalRegistrations: freshRegs.length,
            confirmedRegistrations: freshRegs.filter(r => r.registrationStatus === 'Confirmed').length,
            pendingRegistrations: freshRegs.filter(r => r.registrationStatus === 'Pending').length,
            successfulPayments: freshRegs.filter(r => r.paymentStatus === 'Paid').length,
            pendingPayments: freshRegs.filter(r => r.paymentStatus === 'Pending').length
          }));
        }
      } else {
        hadError = true;
      }

      // 3. Process Messages
      if (msgResult.status === 'fulfilled' && msgResult.value?.success) {
        setMessages(msgResult.value.data || []);
      }

      // 4. Process Cities
      if (citiesResult.status === 'fulfilled' && citiesResult.value?.success) {
        setCities(citiesResult.value.data || []);
      }

      // Feedback for manual refresh
      if (isManual) {
        if (hadError && statsResult.status !== 'fulfilled' && regsResult.status !== 'fulfilled') {
          // If all critical endpoints failed, retain previous data and show error
          setNotification({
            type: 'error',
            message: 'Unable to connect to the backend server. Previously loaded data has been retained.'
          });
        } else {
          // Success feedback
          setNotification({
            type: 'success',
            message: 'Admin metrics and registration data successfully refreshed.'
          });
          notificationTimeoutRef.current = setTimeout(() => {
            setNotification(null);
          }, 3500);
        }
      }
    } catch (err) {
      console.warn('Error fetching admin data:', err);
      if (isManual) {
        setNotification({
          type: 'error',
          message: 'Error refreshing data. Existing records have been preserved.'
        });
      }
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
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
      const res = await adminFetch(`/api/admin/registrations/${id}`, {
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
      const res = await adminFetch(`/api/admin/registrations/${id}`, { method: 'DELETE' });
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
      const res = await adminFetch(`/api/admin/messages/${id}/read`, {
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
      const res = await adminFetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
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

    const cityDisplay = getCityDisplayName(r, cities);
    const matchesEvent =
      filterEvent === 'All' ||
      cityDisplay.toLowerCase() === filterEvent.toLowerCase() ||
      r.selectedEvent === filterEvent ||
      r.eventName === filterEvent;
    const matchesReg = filterRegStatus === 'All' || r.registrationStatus === filterRegStatus;
    const matchesPay = filterPaymentStatus === 'All' || r.paymentStatus === filterPaymentStatus;

    return matchesSearch && matchesEvent && matchesReg && matchesPay;
  });

  // Unique city list for Event dropdown filter (city names only)
  const eventCityOptions = Array.from(
    new Set([
      'Chennai',
      ...cities.map(c => c.name),
      ...registrations.map(r => getCityDisplayName(r, cities))
    ].filter(Boolean))
  );

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

  const handleOpenAddCity = () => {
    setEditingCity(null);
    setShowCommunityFields(false);
    const defaultImg = 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80';
    setCityFormData({
      name: '',
      slug: '',
      date: '',
      time: '',
      gatesOpenTime: '',
      venue: '',
      imageUrl: defaultImg,
      badgeText: 'Official Marathon Course',
      categories: ['1K', '3K', '5K', '10K', '21K'],
      description: '',
      status: 'active',
      isActive: true,
      community: {
        chapterName: '',
        weeklyRunners: '',
        meetDay: '',
        meetTime: '',
        meetupPoint: '',
        paceGroups: '',
        leads: ''
      }
    });
    setImagePreview(defaultImg);
    setIsCityModalOpen(true);
  };

  const handleOpenEditCity = (city) => {
    setEditingCity(city);
    const currentImg = city.imageUrl || 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80';
    const cityCats = Array.isArray(city.categories) && city.categories.length > 0
      ? city.categories
      : ['1K', '3K', '5K', '10K', '21K'];
    const comm = city.community || {};
    const hasCommData = Boolean(
      comm.chapterName || comm.weeklyRunners || comm.meetDay || comm.meetTime || comm.meetupPoint ||
      (Array.isArray(comm.paceGroups) && comm.paceGroups.length) ||
      (Array.isArray(comm.leads) && comm.leads.length)
    );
    setShowCommunityFields(hasCommData);
    setCityFormData({
      name: city.name || '',
      slug: city.slug || '',
      date: city.date || city.eventDate || '',
      time: city.time || city.flagOffTime || '',
      gatesOpenTime: city.gatesOpenTime || '',
      venue: city.venue || '',
      imageUrl: currentImg,
      badgeText: city.badgeText || 'Official Marathon Course',
      categories: cityCats,
      description: city.description || '',
      status: city.status || (city.isActive !== false ? 'active' : 'inactive'),
      isActive: city.status ? city.status === 'active' : city.isActive !== false,
      community: {
        chapterName: comm.chapterName || '',
        weeklyRunners: comm.weeklyRunners ?? '',
        meetDay: comm.meetDay || '',
        meetTime: comm.meetTime || '',
        meetupPoint: comm.meetupPoint || '',
        paceGroups: Array.isArray(comm.paceGroups) ? comm.paceGroups.join(', ') : (comm.paceGroups || ''),
        leads: Array.isArray(comm.leads) ? comm.leads.join(', ') : (comm.leads || '')
      }
    });
    setImagePreview(currentImg);
    setIsCityModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCityFormData(prev => ({ ...prev, imageUrl: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    const raceDate = (cityFormData.date || '').trim();
    const flagOff = (cityFormData.time || '').trim();
    if (!cityFormData.name || !raceDate || !flagOff || !cityFormData.venue) {
      alert('Please fill all required fields: City Name, Race Date, Flag-off Schedule, Starting Venue.');
      return;
    }
    setIsSavingCity(true);
    try {
      const payload = {
        name: cityFormData.name.trim(),
        slug: cityFormData.slug?.trim() || undefined,
        date: raceDate,
        eventDate: raceDate,
        time: flagOff,
        flagOffTime: flagOff,
        gatesOpenTime: (cityFormData.gatesOpenTime || '').trim(),
        venue: cityFormData.venue.trim(),
        imageUrl: (cityFormData.imageUrl || '').trim(),
        badgeText: (cityFormData.badgeText || '').trim(),
        categories: cityFormData.categories && cityFormData.categories.length ? cityFormData.categories : ['1K', '3K', '5K', '10K', '21K'],
        description: (cityFormData.description || '').trim(),
        status: cityFormData.status,
        isActive: cityFormData.status === 'active',
        community: {
          chapterName: cityFormData.community?.chapterName?.trim() || '',
          weeklyRunners: cityFormData.community?.weeklyRunners ? Number(cityFormData.community.weeklyRunners) : 0,
          meetDay: cityFormData.community?.meetDay?.trim() || '',
          meetTime: cityFormData.community?.meetTime?.trim() || '',
          meetupPoint: cityFormData.community?.meetupPoint?.trim() || '',
          paceGroups: typeof cityFormData.community?.paceGroups === 'string'
            ? cityFormData.community.paceGroups.split(',').map(s => s.trim()).filter(Boolean)
            : (cityFormData.community?.paceGroups || []),
          leads: typeof cityFormData.community?.leads === 'string'
            ? cityFormData.community.leads.split(',').map(s => s.trim()).filter(Boolean)
            : (cityFormData.community?.leads || [])
        }
      };

      const url = editingCity ? `/api/admin/cities/${editingCity._id || editingCity.id}` : '/api/admin/cities';
      const method = editingCity ? 'PUT' : 'POST';
      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: editingCity ? `City '${cityFormData.name}' updated successfully.` : `City '${cityFormData.name}' created successfully.`
        });
        setIsCityModalOpen(false);
        fetchData(false);
      } else {
        alert(data.message || 'Failed to save city.');
      }
    } catch {
      alert('Network error while saving city.');
    } finally {
      setIsSavingCity(false);
    }
  };

  const handleToggleCityStatus = async (city) => {
    const isCurrentlyActive = city.status ? city.status === 'active' : city.isActive !== false;
    const nextStatus = isCurrentlyActive ? 'inactive' : 'active';
    try {
      const res = await adminFetch(`/api/admin/cities/${city._id || city.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, isActive: nextStatus === 'active' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: `City '${city.name}' is now ${nextStatus.toUpperCase()}.`
        });
        setCities(prev => prev.map(c => ((c._id === city._id || c.slug === city.slug) ? { ...c, status: nextStatus, isActive: nextStatus === 'active' } : c)));
        fetchData(false);
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Failed to update city status.'
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Network error while updating city status.'
      });
    }
  };

  const handleDeleteCity = async (id, cityName) => {
    if (!window.confirm(`Are you sure you want to delete ${cityName}? This action cannot be undone.`)) return;
    try {
      const res = await adminFetch(`/api/admin/cities/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: `${cityName} deleted successfully.` });
        fetchData(false);
      } else {
        alert(data.message || 'Failed to delete city.');
      }
    } catch {
      alert('Network error deleting city.');
    }
  };

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
              className={`sidebar-nav-item ${activeSection === 'donations' ? 'active' : ''}`}
              onClick={() => navigateTo('donations')}
            >
              <FaHeart className="sidebar-icon" />
              <span>Donations</span>
              {stats.successfulDonations > 0 && (
                <span className="sidebar-count-badge">{stats.successfulDonations}</span>
              )}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSection === 'cities' ? 'active' : ''}`}
              onClick={() => navigateTo('cities')}
            >
              <FaLocationDot className="sidebar-icon" />
              <span>Event Cities</span>
              <span className="sidebar-count-badge">1</span>
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

            <button
              type="button"
              className={`sidebar-nav-item ${activeSection === 'email-marketing' ? 'active' : ''}`}
              onClick={() => navigateTo('email-marketing')}
            >
              <FaBullhorn className="sidebar-icon" />
              <span>Email Marketing</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => navigateTo('settings')}
            >
              <FaGear className="sidebar-icon" />
              <span>Settings</span>
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
            <div className="system-version">RUNTRUST Core v2.6</div>
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
          {activeSection !== 'email-marketing' && activeSection !== 'settings' && (
            <div className="admin-action-bar">
            <div>
              <h1 className="admin-page-title">
                {activeSection === 'dashboard' && 'Dashboard Overview'}
                {activeSection === 'registrations' && 'Registered Participants'}
                {activeSection === 'donations' && 'Donation Management'}
                {activeSection === 'cities' && 'Event Cities Management'}
                {activeSection === 'pending' && 'Pending Registrations & Payments'}
                {activeSection === 'payments' && 'Payment & Transaction Management'}
                {activeSection === 'messages' && 'Contact Inquiries & Messages'}
              </h1>
              <p className="admin-page-sub">
                {activeSection === 'dashboard' && 'Live event statistics, registration activity, and messages.'}
                {activeSection === 'registrations' && 'Complete roster of runners across all distance categories.'}
                {activeSection === 'donations' && 'Track public donations, donor records, and verified payment gateway transactions.'}
                {activeSection === 'cities' && 'Configure marathon host cities, course badges, venues, and event images.'}
                {activeSection === 'pending' && 'Participants awaiting payment confirmation or race-kit allocation.'}
                {activeSection === 'payments' && 'Financial overview of entry fees collected and pending receipts.'}
                {activeSection === 'messages' && 'Participant inquiries received from the public Contact page.'}
              </p>
            </div>

            {activeSection === 'dashboard' && (
              <button
                type="button"
                className="btn btn-primary btn-sm admin-action-primary-btn"
                onClick={() => fetchData(true)}
                disabled={isRefreshing || isLoading}
                title="Refresh dashboard metrics and data"
              >
                <FaRotate className={isRefreshing ? 'spinning' : ''} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
            )}

            {activeSection === 'cities' && (
              <button
                type="button"
                className="btn btn-primary btn-sm admin-action-primary-btn"
                onClick={handleOpenAddCity}
              >
                <FaPlus />
                <span>Add City</span>
              </button>
            )}
          </div>
          )}

          {/* Notification feedback banner for refresh/action */}
          {notification && (
            <div className={`admin-alert-box ${notification.type}`} style={{ margin: '0 0 1.5rem 0' }}>
              {notification.type === 'success' ? (
                <FaCircleCheck className="alert-box-icon" />
              ) : (
                <FaCircleExclamation className="alert-box-icon" />
              )}
              <div className="alert-box-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div>
                  <h4>{notification.type === 'success' ? 'Data Refreshed' : 'Refresh Warning'}</h4>
                  <p>{notification.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'inherit', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                  aria-label="Dismiss notification"
                >
                  <FaXmark />
                </button>
              </div>
            </div>
          )}

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
                                  <span>{getCityDisplayName(r, cities)}</span>
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
                      {eventCityOptions.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
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
                  <div className="table-card-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm admin-action-primary-btn"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      <FaPlus />
                      <span>Add Registration</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm admin-action-primary-btn"
                      onClick={() => exportRegistrationsToExcel(filteredRegistrations)}
                      title="Export filtered registrations to Excel (.xlsx)"
                    >
                      <FaFileArrowDown />
                      <span>Export Excel</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm admin-action-primary-btn"
                      onClick={() => fetchData(true)}
                      disabled={isRefreshing || isLoading}
                      title="Refresh registration records from server"
                    >
                      <FaRotate className={isRefreshing ? 'spinning' : ''} />
                      <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                    </button>
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
                          <th>Reg Date</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
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
                              {new Date(r.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ textAlign: 'right' }}>
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
                            <td>{getCityDisplayName(r, cities)}</td>
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span className={`msg-status-dot ${m.isRead ? 'read' : 'unread'}`} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                  {m.isRead ? 'Read' : 'New'}
                                </span>
                                {m.isReplied && (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      background: '#DCFCE7',
                                      color: '#166534',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      padding: '1px 6px',
                                      borderRadius: '4px'
                                    }}
                                  >
                                    <FaCircleCheck style={{ fontSize: '0.65rem' }} />
                                    <span>Replied</span>
                                  </span>
                                )}
                              </div>
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

          {/* ══════════════════════════════════════════
              VIEW: EVENT CITIES
             ══════════════════════════════════════════ */}
          {activeSection === 'cities' && (() => {
            const filteredCities = cities.filter(city => {
              const query = citySearch.trim().toLowerCase();
              const matchesSearch = !query || (
                (city.name || '').toLowerCase().includes(query) ||
                (city.slug || '').toLowerCase().includes(query) ||
                (city.venue || '').toLowerCase().includes(query) ||
                (city.date || city.eventDate || '').toLowerCase().includes(query)
              );
              const isActive = city.status ? city.status === 'active' : city.isActive !== false;
              const matchesStatus = cityStatusFilter === 'All' ||
                (cityStatusFilter === 'active' && isActive) ||
                (cityStatusFilter === 'inactive' && !isActive);
              return matchesSearch && matchesStatus;
            });

            const activeCitiesCount = cities.filter(c => c.status ? c.status === 'active' : c.isActive !== false).length;

            return (
              <div className="admin-content-section cities-view">
                <div className="section-header">
                  <div>
                    <h1 className="section-title">Event Cities Management</h1>
                    <p className="section-subtitle">
                      Configure official marathon event host cities, race schedules, venues, badge texts, and custom hero images.
                    </p>
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="admin-filter-bar">
                  <div className="search-input-wrap">
                    <FaMagnifyingGlass className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search cities by name, slug, venue, date..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="admin-search-input"
                    />
                    {citySearch && (
                      <button
                        type="button"
                        className="search-clear-btn"
                        onClick={() => setCitySearch('')}
                        aria-label="Clear search"
                      >
                        <FaXmark />
                      </button>
                    )}
                  </div>

                  <div className="filter-dropdowns">
                    <div className="filter-select-wrap">
                      <label>Status:</label>
                      <select
                        value={cityStatusFilter}
                        onChange={(e) => setCityStatusFilter(e.target.value)}
                        className="admin-select"
                      >
                        <option value="All">All Cities</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="admin-table-card">
                  <div className="table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="count-info">
                      Configured Cities: <strong>{cities.length}</strong> ({activeCitiesCount} active)
                    </div>
                  </div>

                  <div className="admin-table-wrap">
                    {filteredCities.length === 0 ? (
                      <div className="admin-empty-state">
                        <FaLocationDot className="empty-icon" />
                        <p>No event cities found matching your search/filter.</p>
                        <span className="empty-hint">Try adjusting your filters or click &quot;Add City&quot; above to configure a new city.</span>
                      </div>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>City</th>
                            <th>Race Schedule</th>
                            <th>Venue</th>
                            <th>Categories</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCities.map((city) => {
                            const isActive = city.status ? city.status === 'active' : city.isActive !== false;
                            const categoriesList = Array.isArray(city.categories) && city.categories.length > 0
                              ? city.categories
                              : ['1K', '3K', '5K', '10K', '21K'];
                            return (
                              <tr key={city._id || city.slug || city.name}>
                                <td>
                                  <div style={{
                                    width: '70px',
                                    height: '48px',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    background: '#f1f1f1',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto'
                                  }}>
                                    <img
                                      src={city.imageUrl || '/assets/chennai.png'}
                                      alt={city.name || 'City'}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => { e.currentTarget.src = '/assets/chennai.png'; }}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="participant-name-cell">
                                    <strong style={{ fontSize: '0.95rem', color: '#1e293b' }}>{city.name}</strong>
                                    <span className="ref-tag">/{city.slug || ''}</span>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontSize: '0.85rem' }}>
                                    <strong>{city.date || city.eventDate || 'TBD'}</strong>
                                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                                      {city.time || city.flagOffTime || ''}
                                    </div>
                                    {city.gatesOpenTime && (
                                      <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                                        Gates: {city.gatesOpenTime}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                                    {city.venue || 'TBD'}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {categoriesList.map(cat => (
                                      <span
                                        key={cat}
                                        className="dist-badge"
                                        style={{
                                          fontSize: '0.72rem',
                                          padding: '2px 6px',
                                          background: '#f8fafc',
                                          border: '1px solid #cbd5e1',
                                          borderRadius: '4px',
                                          color: '#334155',
                                          fontWeight: 600
                                        }}
                                      >
                                        {cat}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCityStatus(city)}
                                    title={`Click to set as ${isActive ? 'Inactive' : 'Active'}`}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '4px 10px',
                                      borderRadius: '20px',
                                      border: '1px solid',
                                      borderColor: isActive ? '#86efac' : '#cbd5e1',
                                      background: isActive ? '#ecfdf5' : '#f8fafc',
                                      color: isActive ? '#15803d' : '#64748b',
                                      fontWeight: 600,
                                      fontSize: '0.78rem',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {isActive ? (
                                      <>
                                        <FaToggleOn style={{ fontSize: '1.15rem', color: '#16a34a' }} />
                                        <span>Active</span>
                                      </>
                                    ) : (
                                      <>
                                        <FaToggleOff style={{ fontSize: '1.15rem', color: '#94a3b8' }} />
                                        <span>Inactive</span>
                                      </>
                                    )}
                                  </button>
                                </td>
                                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button
                                      type="button"
                                      className="admin-action-btn view-btn"
                                      onClick={() => handleOpenEditCity(city)}
                                      title="Edit City Details"
                                    >
                                      <FaPenToSquare />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      className="admin-action-btn delete-btn"
                                      onClick={() => handleDeleteCity(city._id || city.id, city.name)}
                                      title="Delete City"
                                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                                    >
                                      <FaTrashCan />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════
              VIEW: EMAIL MARKETING
             ══════════════════════════════════════════ */}
          {activeSection === 'email-marketing' && (
            <div className="admin-content-section">
              <EmailMarketing
                registrations={registrations}
                messages={messages}
                cities={cities}
                onEmailSent={() => fetchData(false)}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════
              VIEW: SETTINGS
             ══════════════════════════════════════════ */}
          {activeSection === 'settings' && (
            <div className="admin-content-section">
              <Settings cities={cities} />
            </div>
          )}

          {/* ══════════════════════════════════════════
              VIEW: DONATIONS MANAGEMENT
             ══════════════════════════════════════════ */}
          {activeSection === 'donations' && (
            <div className="admin-content-section">
              <DonationManagement />
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════
          MODAL: PARTICIPANT DETAILS
         ══════════════════════════════════════════ */}
      {selectedParticipant && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedParticipant(null)}>
          <div className="admin-modal-card" style={{ maxWidth: '780px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <FaUsers className="modal-icon" style={{ color: '#FFFFFF' }} />
                <div>
                  <h2 style={{ color: '#FFFFFF', fontWeight: 800, margin: 0, fontSize: '1.25rem' }}>Participant Information</h2>
                  <span className="ref-tag" style={{ color: '#FFFFFF', background: 'rgba(255,255,255,0.2)', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)' }}>
                    {selectedParticipant.registrationRef}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                style={{ color: '#FFFFFF' }}
                onClick={() => setSelectedParticipant(null)}
              >
                <FaXmark />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#FAF8F5' }}>
              {/* Card 1: Participant details */}
              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#A51C1F', margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>
                  Participant details
                </h3>
                <div className="participant-detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-val">{selectedParticipant.fullName || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Gender</span>
                    <span className="detail-val">{selectedParticipant.gender || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date of Birth</span>
                    <span className="detail-val">{selectedParticipant.dob || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">T-Shirt Size</span>
                    <span className="detail-val">{selectedParticipant.tshirtSize || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Blood Group</span>
                    <span className="detail-val">{selectedParticipant.bloodGroup || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Organisation</span>
                    <span className="detail-val">{selectedParticipant.organisation || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Designation</span>
                    <span className="detail-val">{selectedParticipant.designation || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Contact */}
              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#A51C1F', margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>
                  Contact
                </h3>
                <div className="participant-detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-val">{selectedParticipant.email || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mobile Number</span>
                    <span className="detail-val">{selectedParticipant.mobileNumber || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">WhatsApp</span>
                    <span className="detail-val">{selectedParticipant.whatsappNumber || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Facebook Profile Link</span>
                    <span className="detail-val">
                      {selectedParticipant.facebookLink ? (
                        <a href={selectedParticipant.facebookLink} target="_blank" rel="noopener noreferrer" style={{ color: '#A51C1F', wordBreak: 'break-all' }}>
                          {selectedParticipant.facebookLink}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Address */}
              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#A51C1F', margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>
                  Address
                </h3>
                <div className="participant-detail-grid">
                  <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="detail-label">Full Address</span>
                    <span className="detail-val">{selectedParticipant.address || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">City</span>
                    <span className="detail-val">{selectedParticipant.city || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">State</span>
                    <span className="detail-val">{selectedParticipant.state || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pincode</span>
                    <span className="detail-val">{selectedParticipant.pincode || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Country</span>
                    <span className="detail-val">{selectedParticipant.country || 'India'}</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Event and emergency */}
              <div style={{ background: '#FFFFFF', borderRadius: '10px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#A51C1F', margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>
                  Event and emergency
                </h3>
                <div className="participant-detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Event</span>
                    <span className="detail-val" style={{ fontWeight: 700, color: '#1E293B' }}>
                      {getCityDisplayName(selectedParticipant, cities)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Distance &amp; Fee</span>
                    <span className="detail-val">
                      {selectedParticipant.distance || selectedParticipant.raceCategory || '5K'} (₹{selectedParticipant.amount || 699})
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Emergency Contact Name &amp; Number</span>
                    <span className="detail-val">
                      {selectedParticipant.emergencyContact || 'Not provided'} {selectedParticipant.emergencyPhone ? `(${selectedParticipant.emergencyPhone})` : ''}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registration Date</span>
                    <span className="detail-val">
                      {selectedParticipant.createdAt ? new Date(selectedParticipant.createdAt).toLocaleString() : 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="modal-status-controls" style={{ background: '#FFFFFF', borderRadius: '10px', padding: '1.25rem', border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#A51C1F', margin: '0 0 0.75rem', fontSize: '1.05rem', fontWeight: 700 }}>
                  Update Status
                </h4>
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

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                style={{
                  backgroundColor: '#A51C1F',
                  borderColor: '#A51C1F',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontWeight: 700
                }}
                onClick={() => {
                  const runnerEmail = encodeURIComponent(selectedParticipant.email || '');
                  const ref = encodeURIComponent(selectedParticipant.registrationRef || '');
                  const id = encodeURIComponent(selectedParticipant._id);
                  setSelectedParticipant(null);
                  navigate(`/admin/email-marketing?compose=1&to=${runnerEmail}&subject=Regarding%20your%20registration%20${ref}&registrationId=${id}`);
                }}
              >
                <FaReply style={{ transform: 'scaleX(-1)' }} />
                <span>Reply via Email</span>
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
                <FaEnvelope className="modal-icon gold" style={{ color: '#FDE047' }} />
                <div>
                  <h2 style={{ color: '#FFFFFF', fontWeight: 800, margin: 0, fontSize: '1.25rem' }}>Contact Inquiry</h2>
                  <span className="msg-date" style={{ color: '#F1F5F9', fontSize: '0.82rem' }}>
                    Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                style={{ color: '#FFFFFF' }}
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
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{
                    backgroundColor: '#A51C1F',
                    borderColor: '#A51C1F',
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontWeight: 700
                  }}
                  onClick={() => {
                    const to = encodeURIComponent(selectedMessage.email || '');
                    const subj = encodeURIComponent('Re: ' + (selectedMessage.subject || 'Marathon Inquiry'));
                    const msgId = encodeURIComponent(selectedMessage._id);
                    setSelectedMessage(null);
                    navigate(`/admin/email-marketing?compose=1&to=${to}&subject=${subj}&messageId=${msgId}`);
                  }}
                >
                  <FaReply style={{ transform: 'scaleX(-1)' }} />
                  <span>Reply via Email</span>
                </button>
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

      {/* ══════════════════════════════════════════
          MODAL: ADD NEW PARTICIPANT REGISTRATION
         ══════════════════════════════════════════ */}
      <AddRegistrationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchData(true)}
      />

      {/* ══════════════════════════════════════════
          MODAL: ADD / EDIT EVENT CITY
         ══════════════════════════════════════════ */}
      {isCityModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCityModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <FaLocationDot className="modal-icon gold" />
                <div>
                  <h2>{editingCity ? `Edit City: ${editingCity.name}` : 'Add New Event City'}</h2>
                  <span className="ref-tag">
                    {editingCity ? `Slug: /${editingCity.slug}` : 'Configure marathon host city, schedules, categories and community'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsCityModalOpen(false)}
                aria-label="Close Modal"
              >
                <FaXmark />
              </button>
            </div>

            <form onSubmit={handleSaveCity}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '18px 22px' }}>
                {/* 1. City Name & Suggestions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.85rem' }}>
                      City Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={cityFormData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setCityFormData(prev => ({
                          ...prev,
                          name,
                          slug: editingCity ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                        }));
                      }}
                      placeholder="e.g. Chennai, Coimbatore, Bengaluru..."
                      required
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                    {/* Quick Suggestion Chips */}
                    <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Suggestions:</span>
                      {['Chennai', 'Coimbatore', 'Bengaluru', 'Kochi', 'Madurai', 'Hyderabad'].map(sugg => (
                        <button
                          key={sugg}
                          type="button"
                          onClick={() => {
                            setCityFormData(prev => ({
                              ...prev,
                              name: sugg,
                              slug: editingCity ? prev.slug : sugg.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                            }));
                          }}
                          style={{
                            background: cityFormData.name === sugg ? '#9E1B22' : '#f1f5f9',
                            color: cityFormData.name === sugg ? '#ffffff' : '#334155',
                            border: '1px solid',
                            borderColor: cityFormData.name === sugg ? '#9E1B22' : '#cbd5e1',
                            borderRadius: '12px',
                            padding: '1px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.85rem' }}>
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={cityFormData.slug}
                      onChange={(e) => setCityFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                      placeholder="e.g. chennai"
                      required
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Used in public URL: /cities/{cityFormData.slug || '...'}
                    </span>
                  </div>
                </div>

                {/* 2. Race Schedule & Times */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.85rem' }}>
                      Race Date *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={cityFormData.date}
                      onChange={(e) => setCityFormData(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g. Sunday, 15 Nov 2026"
                      required
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.85rem' }}>
                      Flag-off Time *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={cityFormData.time}
                      onChange={(e) => setCityFormData(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="e.g. 5:30 AM IST"
                      required
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                {/* 3. Gates Open Time & Starting Venue */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.85rem' }}>
                      Gates Open Time
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={cityFormData.gatesOpenTime}
                      onChange={(e) => setCityFormData(prev => ({ ...prev, gatesOpenTime: e.target.value }))}
                      placeholder="e.g. 4:30 AM IST"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.85rem' }}>
                      Starting Venue *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={cityFormData.venue}
                      onChange={(e) => setCityFormData(prev => ({ ...prev, venue: e.target.value }))}
                      placeholder="e.g. Besant Nagar Promenade, Chennai"
                      required
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                {/* 4. Race Categories (Multi-select chips: 1K, 3K, 5K, 10K, 21K) */}
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.85rem' }}>
                    Race Categories (Multi-select) *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['1K', '3K', '5K', '10K', '21K'].map(cat => {
                      const isSelected = cityFormData.categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCityFormData(prev => {
                              const exists = prev.categories.includes(cat);
                              const updated = exists
                                ? prev.categories.filter(c => c !== cat)
                                : [...prev.categories, cat];
                              return { ...prev, categories: updated.length ? updated : [cat] };
                            });
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: isSelected ? '#9E1B22' : '#cbd5e1',
                            background: isSelected ? '#9E1B22' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#334155',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: isSelected ? '0 1px 3px rgba(158, 27, 34, 0.25)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{cat}</span>
                          {isSelected && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Selected: {cityFormData.categories.join(', ')}
                  </span>
                </div>

                {/* 5. Image URL + Live Preview + Upload */}
                <div style={{ marginTop: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.85rem' }}>
                    City Image (URL with Live Preview)
                  </label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '110px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#e2e8f0',
                      border: '1px solid #cbd5e1',
                      flexShrink: 0
                    }}>
                      <img
                        src={imagePreview || cityFormData.imageUrl || '/assets/chennai.png'}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = '/assets/chennai.png'; }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '8px'
                      }}>
                        <FaUpload />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Or enter Image URL (e.g. https://... or /assets/chennai.png)"
                        value={cityFormData.imageUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCityFormData(prev => ({ ...prev, imageUrl: val }));
                          setImagePreview(val);
                        }}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Description */}
                <div style={{ marginTop: '14px' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.85rem' }}>
                    Event Description
                  </label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={cityFormData.description}
                    onChange={(e) => setCityFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Short description of this city marathon edition, route highlights, atmosphere..."
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical' }}
                  />
                </div>

                {/* 7. Status */}
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={cityFormData.status === 'active' || cityFormData.isActive}
                    onChange={(e) => setCityFormData(prev => ({
                      ...prev,
                      isActive: e.target.checked,
                      status: e.target.checked ? 'active' : 'inactive'
                    }))}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isActiveCheckbox" style={{ fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>
                    Active (allow runners to view &amp; register for this city on public website)
                  </label>
                </div>

                {/* 8. Collapsible Community Chapter Fields (Optional) */}
                <div style={{ marginTop: '18px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setShowCommunityFields(!showCommunityFields)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#f8fafc',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#334155'
                    }}
                  >
                    <span>Community Running Chapter Details (Optional)</span>
                    {showCommunityFields ? <FaChevronUp /> : <FaChevronDown />}
                  </button>

                  {showCommunityFields && (
                    <div style={{ padding: '14px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', marginBottom: '4px' }}>
                            Chapter Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={cityFormData.community?.chapterName || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCityFormData(prev => ({ ...prev, community: { ...prev.community, chapterName: val } }));
                            }}
                            placeholder="e.g. RUNTRUST Marina Chapter"
                            style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', marginBottom: '4px' }}>
                            Weekly Runners
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={cityFormData.community?.weeklyRunners || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCityFormData(prev => ({ ...prev, community: { ...prev.community, weeklyRunners: val } }));
                            }}
                            placeholder="e.g. 120"
                            style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                        <div className="form-group">
                          <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', marginBottom: '4px' }}>
                            Meet Day
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={cityFormData.community?.meetDay || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCityFormData(prev => ({ ...prev, community: { ...prev.community, meetDay: val } }));
                            }}
                            placeholder="e.g. Every Saturday"
                            style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', marginBottom: '4px' }}>
                            Meet Time
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={cityFormData.community?.meetTime || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCityFormData(prev => ({ ...prev, community: { ...prev.community, meetTime: val } }));
                            }}
                            placeholder="e.g. 6:00 AM IST"
                            style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginTop: '10px' }}>
                        <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', marginBottom: '4px' }}>
                          Meetup Point
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={cityFormData.community?.meetupPoint || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCityFormData(prev => ({ ...prev, community: { ...prev.community, meetupPoint: val } }));
                          }}
                          placeholder="e.g. Marina Light House promenade"
                          style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                        <div className="form-group">
                          <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', marginBottom: '4px' }}>
                            Pace Groups (comma separated)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={cityFormData.community?.paceGroups || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCityFormData(prev => ({ ...prev, community: { ...prev.community, paceGroups: val } }));
                            }}
                            placeholder="e.g. 5:30/km, 6:00/km, 6:30/km"
                            style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label style={{ display: 'block', fontWeight: 500, fontSize: '0.8rem', marginBottom: '4px' }}>
                            Chapter Leads (comma separated)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={cityFormData.community?.leads || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCityFormData(prev => ({ ...prev, community: { ...prev.community, leads: val } }));
                            }}
                            placeholder="e.g. Arun Kumar, Priya R"
                            style={{ width: '100%', padding: '7px 10px', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsCityModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSavingCity}
                  style={{
                    backgroundColor: '#A51C1F',
                    borderColor: '#A51C1F',
                    color: '#FFFFFF',
                    fontWeight: 600
                  }}
                >
                  {isSavingCity ? 'Saving...' : editingCity ? 'Update City' : 'Create City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
