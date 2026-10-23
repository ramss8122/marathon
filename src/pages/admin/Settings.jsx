import React, { useState, useEffect } from 'react';
import {
  FaGear,
  FaBell,
  FaEnvelope,
  FaShieldHalved,
  FaCalendarDays,
  FaClock,
  FaPaperPlane,
  FaFloppyDisk,
  FaLock,
  FaTriangleExclamation,
  FaCircleCheck,
  FaXmark,
  FaRotate,
  FaUserShield
} from 'react-icons/fa6';
import adminFetch from '../../utils/adminFetch';

/**
 * Format relative time (e.g. "2 hours ago", "1 day ago")
 */
function getRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'min' : 'mins'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return past.toLocaleDateString();
}

export default function Settings({ cities = [] }) {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'general' | 'notifications' | 'email' | 'security' | 'events' | 'activity'

  // Settings State
  const [formData, setFormData] = useState({
    websiteName: 'RUNTRUST',
    adminDisplayName: 'admin',
    supportEmail: 'support@runtrust.com',
    timeZone: 'Asia/Kolkata',
    notifications: {
      newRegistration: true,
      paymentReceived: true,
      contactMessage: true,
      campaignStatus: true
    },
    eventPreferences: {
      defaultEventCity: 'Chennai',
      defaultRaceCategory: '3K Run',
      maxSlotsPerRegistration: 5
    },
    security: {
      sessionTimeout: '8 hours'
    },
    email: {
      configured: false,
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUser: '',
      mailFromName: 'India RunTrust',
      mailFromAddress: 'noreply@runtrust.com'
    }
  });

  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'warning', message: string }

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load Settings from Backend
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await adminFetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setFormData(prev => ({
            ...prev,
            websiteName: data.settings.websiteName || prev.websiteName,
            adminDisplayName: data.settings.adminDisplayName || prev.adminDisplayName,
            supportEmail: data.settings.supportEmail || prev.supportEmail,
            timeZone: data.settings.timeZone || prev.timeZone,
            notifications: {
              ...prev.notifications,
              ...(data.settings.notifications || {})
            },
            eventPreferences: {
              ...prev.eventPreferences,
              ...(data.settings.eventPreferences || {})
            },
            security: {
              ...prev.security,
              ...(data.settings.security || {})
            },
            email: {
              ...prev.email,
              ...(data.settings.email || {})
            }
          }));
        }
        if (data.activities && Array.isArray(data.activities)) {
          setActivities(data.activities);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch settings from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Settings to Backend
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    // Validate inputs
    if (formData.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supportEmail)) {
      setFeedback({ type: 'error', message: 'Please enter a valid support email address.' });
      setIsSaving(false);
      return;
    }

    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Settings saved successfully.' });
        fetchSettings();
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to save settings.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error saving settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Test Email Handler
  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setFeedback(null);

    try {
      const res = await adminFetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: formData.supportEmail })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: data.message || `Test email dispatched to ${formData.supportEmail}.`
        });
        fetchSettings();
      } else {
        setFeedback({
          type: formData.email.configured ? 'error' : 'warning',
          message: data.message || 'Failed to send test email. Please check SMTP configuration.'
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error sending test email.' });
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await adminFetch('/api/admin/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsPasswordModalOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setFeedback({ type: 'success', message: 'Admin password changed successfully.' });
        fetchSettings();
      } else {
        setPasswordError(data.message || 'Failed to change password.');
      }
    } catch {
      setPasswordError('Network error changing password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Toggle switch helper
  const handleToggle = (key) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  // City options from props + fallback
  const cityOptions = cities.length > 0
    ? cities.map(c => (typeof c === 'string' ? c : c.name || c.id))
    : ['Chennai', 'Madurai', 'Coimbatore', 'Trichy', 'Salem'];

  return (
    <div className="settings-page-view" style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'rgba(165, 28, 31, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A51C1F',
              fontSize: '1.5rem',
              flexShrink: 0
            }}
          >
            <FaGear />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#1E293B', fontSize: '1.85rem', fontWeight: 800, margin: '0 0 2px' }}>
              Settings
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
              Manage your RUNTRUST admin preferences and platform configuration
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="btn btn-outline btn-sm"
          style={{ background: '#FFFFFF', borderColor: '#E2E8F0', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <FaRotate className={isLoading ? 'spinning' : ''} />
          <span>Reload</span>
        </button>
      </div>

      {/* ── FEEDBACK ALERT ── */}
      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            background: feedback.type === 'success' ? '#DCFCE7' : feedback.type === 'warning' ? '#FEF9C3' : '#FEE2E2',
            color: feedback.type === 'success' ? '#166534' : feedback.type === 'warning' ? '#854D0E' : '#991B1B',
            border: `1px solid ${feedback.type === 'success' ? '#86EFAC' : feedback.type === 'warning' ? '#FDE047' : '#FCA5A5'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {feedback.type === 'success' && <FaCircleCheck />}
            {feedback.type === 'warning' && <FaTriangleExclamation />}
            {feedback.type === 'error' && <FaTriangleExclamation />}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.2rem' }}
          >
            <FaXmark />
          </button>
        </div>
      )}

      {/* ── HORIZONTAL TABS NAVIGATION ── */}
      <div
        style={{
          display: 'flex',
          gap: '1.75rem',
          borderBottom: '2px solid #E2E8F0',
          marginBottom: '1.75rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}
      >
        {[
          { id: 'general', label: 'General', icon: FaGear },
          { id: 'notifications', label: 'Notifications', icon: FaBell },
          { id: 'email', label: 'Email & SMTP', icon: FaEnvelope },
          { id: 'security', label: 'Security', icon: FaShieldHalved },
          { id: 'events', label: 'Event Preferences', icon: FaCalendarDays },
          { id: 'activity', label: 'Activity Timeline', icon: FaClock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                const el = document.getElementById(`card-${tab.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.25rem',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid #A51C1F' : '3px solid transparent',
                color: isActive ? '#A51C1F' : '#475569',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon style={{ fontSize: '0.9rem' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3-COLUMN x 2-ROW SETTINGS CARDS GRID ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}
      >
        {/* ══════════════════════════════════════════
            CARD 1: GENERAL SETTINGS
           ══════════════════════════════════════════ */}
        <div
          id="card-general"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: activeTab === 'general' ? '1px solid #A51C1F' : '1px solid #CBD5E1',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'border-color 0.2s ease'
          }}
        >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <FaGear style={{ color: '#A51C1F', fontSize: '1.15rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>
                  General Settings
                </h3>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
                Update your basic platform information and contact details.
              </p>

              {/* Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Website Name
                    </label>
                    <input
                      type="text"
                      value={formData.websiteName}
                      onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        color: '#1E293B',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Admin Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.adminDisplayName}
                      onChange={(e) => setFormData({ ...formData, adminDisplayName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        color: '#1E293B',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Time Zone
                  </label>
                  <select
                    value={formData.timeZone}
                    onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                    <option value="UTC">UTC (+0:00)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Changes Button */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="btn btn-primary btn-sm"
                style={{
                  background: '#A51C1F',
                  borderColor: '#A51C1F',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1rem'
                }}
              >
                <FaFloppyDisk />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

        {/* ══════════════════════════════════════════
            CARD 2: EMAIL CONFIGURATION (EMAIL & SMTP)
           ══════════════════════════════════════════ */}
        <div
          id="card-email"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: activeTab === 'email' ? '1px solid #A51C1F' : '1px solid #CBD5E1',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'border-color 0.2s ease'
          }}
        >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <FaEnvelope style={{ color: '#A51C1F', fontSize: '1.15rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>
                  Email Configuration
                </h3>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                Configure your SMTP settings to send emails.
              </p>

              {/* Status Banner */}
              <div
                style={{
                  background: formData.email.configured ? '#DCFCE7' : '#FEF9C3',
                  border: `1px solid ${formData.email.configured ? '#86EFAC' : '#FDE047'}`,
                  borderRadius: '6px',
                  padding: '0.55rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.84rem',
                  color: formData.email.configured ? '#166534' : '#854D0E',
                  fontWeight: 600
                }}
              >
                {formData.email.configured ? (
                  <>
                    <FaCircleCheck style={{ color: '#16A34A', flexShrink: 0 }} />
                    <span>SMTP is configured and connected</span>
                  </>
                ) : (
                  <>
                    <FaTriangleExclamation style={{ color: '#CA8A04', flexShrink: 0 }} />
                    <span>Email is not configured yet</span>
                  </>
                )}
              </div>

              {/* Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={formData.email.smtpHost}
                      onChange={(e) => setFormData({
                        ...formData,
                        email: { ...formData.email, smtpHost: e.target.value }
                      })}
                      placeholder="smtp.example.com"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        color: '#1E293B',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={formData.email.smtpPort}
                      onChange={(e) => setFormData({
                        ...formData,
                        email: { ...formData.email, smtpPort: Number(e.target.value) || 587 }
                      })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        color: '#1E293B',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={formData.email.smtpUser}
                      onChange={(e) => setFormData({
                        ...formData,
                        email: { ...formData.email, smtpUser: e.target.value }
                      })}
                      placeholder="username@gmail.com"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        color: '#1E293B',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      readOnly
                      placeholder={formData.email.configured ? "•••••••• (stored securely)" : "Configured in backend/.env"}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        color: '#64748B',
                        backgroundColor: '#F8FAFC',
                        boxSizing: 'border-box'
                      }}
                      title="For security, SMTP passwords are read from backend/.env and never exposed to the browser"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Sender Email
                  </label>
                  <input
                    type="email"
                    value={formData.email.mailFromAddress}
                    onChange={(e) => setFormData({
                      ...formData,
                      email: { ...formData.email, mailFromAddress: e.target.value }
                    })}
                    placeholder="noreply@runtrust.com"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Test Email Button */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={isTestingEmail}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1rem',
                  cursor: isTestingEmail ? 'not-allowed' : 'pointer'
                }}
              >
                <FaPaperPlane />
                <span>{isTestingEmail ? 'Sending Test...' : 'Test Email'}</span>
              </button>
            </div>
          </div>

        {/* ══════════════════════════════════════════
            CARD 3: NOTIFICATION PREFERENCES
           ══════════════════════════════════════════ */}
        <div
          id="card-notifications"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: activeTab === 'notifications' ? '1px solid #A51C1F' : '1px solid #CBD5E1',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'border-color 0.2s ease'
          }}
        >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <FaBell style={{ color: '#A51C1F', fontSize: '1.15rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>
                  Notification Preferences
                </h3>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
                Choose which notifications you want to receive.
              </p>

              {/* Toggles List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  {
                    key: 'newRegistration',
                    title: 'New registration',
                    desc: 'Receive notification for new participant registrations.'
                  },
                  {
                    key: 'paymentReceived',
                    title: 'Payment received',
                    desc: 'Get notified when payments are successfully received.'
                  },
                  {
                    key: 'contactMessage',
                    title: 'Contact message',
                    desc: 'Receive messages from the contact form.'
                  },
                  {
                    key: 'campaignStatus',
                    title: 'Campaign status',
                    desc: 'Get updates on campaign status and performance.'
                  }
                ].map(item => {
                  const isChecked = Boolean(formData.notifications?.[item.key]);
                  return (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E293B' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          {item.desc}
                        </div>
                      </div>

                      {/* Custom Accessible Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isChecked}
                        onClick={() => handleToggle(item.key)}
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '24px',
                          background: isChecked ? '#A51C1F' : '#CBD5E1',
                          border: 'none',
                          padding: '3px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isChecked ? 'flex-end' : 'flex-start',
                          transition: 'background-color 0.2s ease',
                          flexShrink: 0
                        }}
                      >
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        {/* ══════════════════════════════════════════
            CARD 4: EVENT PREFERENCES
           ══════════════════════════════════════════ */}
        <div
          id="card-events"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: activeTab === 'events' ? '1px solid #A51C1F' : '1px solid #CBD5E1',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'border-color 0.2s ease'
          }}
        >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <FaCalendarDays style={{ color: '#A51C1F', fontSize: '1.15rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>
                  Event Preferences
                </h3>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
                Set default values for new registrations and event management.
              </p>

              {/* Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Default Event City
                    </label>
                    <select
                      value={formData.eventPreferences.defaultEventCity}
                      onChange={(e) => setFormData({
                        ...formData,
                        eventPreferences: { ...formData.eventPreferences, defaultEventCity: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        color: '#1E293B',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    >
                      {cityOptions.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Default Race Category
                    </label>
                    <select
                      value={formData.eventPreferences.defaultRaceCategory}
                      onChange={(e) => setFormData({
                        ...formData,
                        eventPreferences: { ...formData.eventPreferences, defaultRaceCategory: e.target.value }
                      })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        color: '#1E293B',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="1K Family Run">1K Family Run</option>
                      <option value="3K Run">3K Run</option>
                      <option value="5K Run">5K Run</option>
                      <option value="10K Run">10K Run</option>
                      <option value="Half Marathon">Half Marathon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Maximum Slots per Registration
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.eventPreferences.maxSlotsPerRegistration}
                    onChange={(e) => setFormData({
                      ...formData,
                      eventPreferences: {
                        ...formData.eventPreferences,
                        maxSlotsPerRegistration: Number(e.target.value) || 1
                      }
                    })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#1E293B',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

        {/* ══════════════════════════════════════════
            CARD 5: SECURITY
           ══════════════════════════════════════════ */}
        <div
          id="card-security"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: activeTab === 'security' ? '1px solid #A51C1F' : '1px solid #CBD5E1',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'border-color 0.2s ease'
          }}
        >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <FaShieldHalved style={{ color: '#A51C1F', fontSize: '1.15rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>
                  Security
                </h3>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
                Keep your account secure with a strong password.
              </p>

              {/* Password Row */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Current Password
                </label>
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <input
                    type="password"
                    readOnly
                    value="••••••••••••"
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#64748B',
                      backgroundColor: '#F8FAFC',
                      letterSpacing: '2px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(true)}
                    style={{
                      background: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.55rem 0.95rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <FaLock style={{ fontSize: '0.8rem' }} />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>

              {/* Session Timeout */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Session Timeout
                </label>
                <select
                  value={formData.security.sessionTimeout}
                  onChange={(e) => setFormData({
                    ...formData,
                    security: { ...formData.security, sessionTimeout: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="1 hour">1 hour</option>
                  <option value="4 hours">4 hours</option>
                  <option value="8 hours">8 hours</option>
                  <option value="24 hours">24 hours</option>
                </select>
              </div>
            </div>
          </div>

        {/* ══════════════════════════════════════════
            CARD 6: RECENT ADMIN ACTIVITY
           ══════════════════════════════════════════ */}
        <div
          id="card-activity"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: activeTab === 'activity' ? '1px solid #A51C1F' : '1px solid #CBD5E1',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'border-color 0.2s ease'
          }}
        >
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <FaClock style={{ color: '#A51C1F', fontSize: '1.15rem' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>
                Recent Admin Activity
              </h3>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.82rem', margin: '0 0 1.25rem' }}>
              Real admin settings activities and audit logs.
            </p>

            {/* Timeline */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.15rem', flex: 1 }}>
              {/* Connecting Vertical Line */}
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '12px',
                  bottom: '12px',
                  width: '2px',
                  background: '#E2E8F0',
                  zIndex: 0
                }}
              />

              {activities.length === 0 ? (
                <div style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>
                  No recent activities recorded.
                </div>
              ) : (
                activities.slice(0, 4).map((act, idx) => {
                  return (
                    <div
                      key={act._id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.85rem',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      {/* Deep Red Dot with Mini Icon */}
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#A51C1F',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          flexShrink: 0,
                          boxShadow: '0 0 0 3px #FFFFFF'
                        }}
                      >
                        {act.icon === 'mail' && <FaEnvelope />}
                        {act.icon === 'bell' && <FaBell />}
                        {act.icon === 'shield' && <FaShieldHalved />}
                        {act.icon !== 'mail' && act.icon !== 'bell' && act.icon !== 'shield' && <FaUserShield />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                            {act.title}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {getRelativeTime(act.createdAt)}
                          </span>
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748B' }}>
                          {act.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
      </div>

      {/* ── BOTTOM RIGHT SAVE SETTINGS BUTTON ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="btn btn-primary"
          style={{
            background: '#A51C1F',
            borderColor: '#A51C1F',
            color: '#FFFFFF',
            padding: '0.75rem 1.75rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            boxShadow: '0 4px 12px rgba(165, 28, 31, 0.25)',
            cursor: isSaving ? 'not-allowed' : 'pointer'
          }}
        >
          <FaFloppyDisk />
          <span>{isSaving ? 'Saving Settings...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* ── CHANGE PASSWORD MODAL ── */}
      {isPasswordModalOpen && (
        <div
          className="admin-modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsPasswordModalOpen(false)}
        >
          <div
            className="admin-modal-card"
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              border: '1px solid #E2E8F0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FaLock style={{ color: '#A51C1F', fontSize: '1.2rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Playfair Display, Georgia, serif' }}>
                  Change Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                <FaXmark />
              </button>
            </div>

            {passwordError && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  borderRadius: '6px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FaTriangleExclamation />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.55rem 1.1rem', borderColor: '#CBD5E1', color: '#475569', fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="btn btn-primary"
                  style={{
                    background: '#A51C1F',
                    borderColor: '#A51C1F',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
