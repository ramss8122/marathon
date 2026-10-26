import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FaPen,
  FaPaperPlane,
  FaClock,
  FaFileLines,
  FaBullhorn,
  FaPaperclip,
  FaXmark,
  FaCircleCheck,
  FaTriangleExclamation,
  FaRotate,
  FaTrashCan,
  FaEnvelope,
  FaEye,
  FaUsers,
  FaTag,
  FaLocationDot,
  FaFilter,
  FaCheck
} from 'react-icons/fa6';
import adminFetch from '../../utils/adminFetch';
import { getCityDisplayName } from '../../utils/cityHelper';

export default function EmailMarketing({ registrations = [], messages = [], cities = [], onEmailSent }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active Tab: 'compose' | 'sent' | 'drafts' | 'campaigns'
  const initialTab = searchParams.get('compose') === '1' ? 'compose' : 'campaigns';
  const [activeTab, setActiveTab] = useState(initialTab);

  // SMTP Configuration State
  const [config, setConfig] = useState({
    configured: false,
    mailFromName: 'India RunTrust',
    mailFromAddress: 'noreply@runtrust.org',
    fromFormatted: '"India RunTrust" <noreply@runtrust.org>'
  });
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // Email List States
  const [emails, setEmails] = useState([]);
  const [counts, setCounts] = useState({ sent: 0, pending: 0, drafts: 0, campaigns: 0 });
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  // Sent Campaigns State (saved in Campaign model)
  const [campaigns, setCampaigns] = useState([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [sentSubTab, setSentSubTab] = useState('all'); // 'all' | 'campaigns' | 'direct'

  // Campaigns Tab Filters
  const [selectedCampaignCity, setSelectedCampaignCity] = useState('All Cities');
  const [selectedCampaignStatus, setSelectedCampaignStatus] = useState('Confirmed'); // 'Confirmed' | 'Pending' | 'All'

  // Compose State
  const [toInput, setToInput] = useState('');
  const [toChips, setToChips] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [activeDraftId, setActiveDraftId] = useState(null);
  const [registrationId, setRegistrationId] = useState('');
  const [messageId, setMessageId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'warning' | 'error', message: string }
  const [campaignContext, setCampaignContext] = useState(null); // { city, status, count }
  const [selectedTemplateName, setSelectedTemplateName] = useState('');

  // Confirmation Modal State (Requirement 7)
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Attachment state (mock attachment or ticket chip)
  const [attachments, setAttachments] = useState([]);

  // Preview Modal
  const [previewEmail, setPreviewEmail] = useState(null);

  // 1. Fetch Email Config
  const fetchConfig = async () => {
    try {
      setIsLoadingConfig(true);
      const res = await adminFetch('/api/admin/emails/config');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setConfig(data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch email config:', err);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // 2. Fetch Emails for tables
  const fetchEmails = async (tabName = activeTab) => {
    try {
      setIsLoadingEmails(true);
      const res = await adminFetch(`/api/admin/emails?tab=${tabName}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEmails(data.data || []);
          if (data.counts) setCounts(data.counts);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch emails:', err);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  // 3. Fetch Sent Campaigns (Requirement 6)
  const fetchCampaigns = async () => {
    try {
      setIsLoadingCampaigns(true);
      const res = await adminFetch('/api/email/campaigns');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCampaigns(data.data || []);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch campaigns:', err);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchEmails('sent');
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (activeTab === 'sent') {
      fetchEmails('sent');
      fetchCampaigns();
    } else if (activeTab === 'drafts') {
      fetchEmails('drafts');
    } else if (activeTab === 'campaigns') {
      fetchCampaigns();
    }
  }, [activeTab]);

  // 4. Handle incoming Query Parameters for Compose
  useEffect(() => {
    const isComposeParam = searchParams.get('compose') === '1';
    const toParam = searchParams.get('to');
    const subjectParam = searchParams.get('subject');
    const regIdParam = searchParams.get('registrationId');
    const msgIdParam = searchParams.get('messageId');

    if (isComposeParam || toParam || subjectParam) {
      setActiveTab('compose');

      if (toParam) {
        const emails = toParam.split(/[,;]+/).map(e => e.trim()).filter(Boolean);
        setToChips(emails);
      }

      if (subjectParam) {
        setSubject(subjectParam);
      }

      if (regIdParam) {
        setRegistrationId(regIdParam);
        const reg = registrations.find(r => (r._id === regIdParam || r.registrationRef === regIdParam));
        const runnerName = reg ? reg.fullName : 'Runner';
        const cityOnly = reg ? getCityDisplayName(reg, cities) : 'Chennai';
        const distanceVal = reg ? (reg.distance || reg.raceCategory || '5K') : '1K';
        const refVal = reg ? reg.registrationRef : regIdParam;

        setBody(
`Dear ${runnerName},

Thank you for registering for the ${cityOnly} Marathon (${distanceVal}).

We are writing regarding your registration (${refVal}).

If you have any questions or require any assistance, please do not hesitate to reach out to us.

Warm regards,
India RunTrust Team`
        );
      } else if (msgIdParam) {
        setMessageId(msgIdParam);
        const msg = messages.find(m => m._id === msgIdParam);
        const senderName = msg ? msg.fullName : 'Participant';
        const senderEmail = msg ? msg.email : (toParam || '');
        const msgDate = msg ? new Date(msg.createdAt).toLocaleString() : new Date().toLocaleString();
        const originalText = msg ? msg.message : '';
        const originalSubj = msg ? msg.subject : (subjectParam || '');

        setBody(
`Dear ${senderName},

Thank you for reaching out to India RunTrust. 



Warm regards,
India RunTrust Team

--- Original Inquiry ---
From: ${senderName} <${senderEmail}>
Date: ${msgDate}
Subject: ${originalSubj}

${originalText}`
        );
      }
    }
  }, [searchParams, registrations, messages, cities]);

  // ── DYNAMIC CITY LIST (Requirement 1) ──
  const availableCities = useMemo(() => {
    const set = new Set();
    registrations.forEach(r => {
      if (r.city && typeof r.city === 'string' && r.city.trim()) {
        const c = r.city.trim();
        const formatted = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
        set.add(formatted);
      }
    });

    cities.forEach(c => {
      const cityName = (typeof c === 'string' ? c : c.name || c.id || '').trim();
      if (cityName) {
        set.add(cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase());
      }
    });

    set.add('Chennai'); // Ensure Chennai is always available
    const sortedCities = Array.from(set).sort();
    return ['All Cities', ...sortedCities];
  }, [registrations, cities]);

  // ── FILTERED REGISTRATIONS FOR CAMPAIGN (Requirement 2 & 3) ──
  const matchingCampaignRunners = useMemo(() => {
    return registrations.filter(r => {
      if (!r.email) return false;

      // City filter
      if (selectedCampaignCity !== 'All Cities') {
        const regCity = (r.city || '').trim().toLowerCase();
        const filterCity = selectedCampaignCity.trim().toLowerCase();
        if (regCity !== filterCity && !regCity.includes(filterCity)) {
          return false;
        }
      }

      // Status filter
      if (selectedCampaignStatus === 'Confirmed') {
        return r.registrationStatus === 'Confirmed';
      } else if (selectedCampaignStatus === 'Pending') {
        return r.registrationStatus === 'Pending' || r.paymentStatus === 'Pending';
      }
      return true; // 'All'
    });
  }, [registrations, selectedCampaignCity, selectedCampaignStatus]);

  // Unique recipient emails
  const uniqueCampaignEmails = useMemo(() => {
    return Array.from(
      new Set(matchingCampaignRunners.map(r => r.email.toLowerCase().trim()))
    );
  }, [matchingCampaignRunners]);

  // Live Recipient Count Label (Requirement 3: e.g. "Chennai - Confirmed: 3 runners")
  const recipientCountLabel = `${selectedCampaignCity} - ${selectedCampaignStatus}: ${uniqueCampaignEmails.length} ${uniqueCampaignEmails.length === 1 ? 'runner' : 'runners'}`;

  // ── CAMPAIGN TEMPLATES (Requirement 4) ──
  const CAMPAIGN_TEMPLATES = {
    'Event Postponed': {
      name: 'Event Postponed',
      getSubject: (city) => `Important Notice: India RunTrust Marathon Event Postponed - ${city === 'All Cities' ? 'All Editions' : city}`,
      getBody: (city) => `Dear Runner,

We wish to inform you that the upcoming India RunTrust Marathon in ${city === 'All Cities' ? 'your registered city' : city} has been postponed due to unforeseen municipal logistics and runner safety advisories.

Revised Schedule:
The new date and timing for the event will be officially announced shortly. Please rest assured that your registration, bib allocation, and finisher kit entitlements remain fully confirmed and reserved.

Next Steps:
- No action is needed from your side; your entry automatically carries forward.
- If the rescheduled date is inconvenient, you may request a deferral to another city or a full refund by replying directly to this email.

We sincerely apologize for the inconvenience and appreciate your patience, dedication, and understanding.

Warm regards,
India RunTrust Marathon Organizing Committee
Besant Nagar Promenade, Chennai, Tamil Nadu`
    },
    'Venue Changed': {
      name: 'Venue Changed',
      getSubject: (city) => `Venue Change Announcement: India RunTrust Marathon - ${city === 'All Cities' ? 'All Editions' : city}`,
      getBody: (city) => `Dear Runner,

Please be advised that the venue and starting point for the India RunTrust Marathon in ${city === 'All Cities' ? 'your city edition' : city} have been officially updated to accommodate enhanced safety, better parking facilities, and wider running tracks.

Updated Event Details:
• Edition: ${city === 'All Cities' ? 'India RunTrust Marathon' : `${city} Marathon`}
• New Starting Arena: Main Sports Complex & Coastal Promenade
• Reporting Time: 5:00 AM (Warm-up & brief: 5:15 AM)
• Flag-off Times: Half Marathon (5:30 AM) | 10K (5:45 AM) | 5K (6:15 AM) | 1K Family (6:45 AM)

Important Instructions:
- Baggage drop counters and medical aid hubs are located at Gate 2.
- Expo bib distribution will take place at the new venue on the day before the event.
- Please have your registration QR code or bib confirmation ready on your mobile.

We look forward to welcoming you at the new venue for an unforgettable marathon experience!

Warm regards,
India RunTrust Marathon Organizing Committee
Besant Nagar Promenade, Chennai, Tamil Nadu`
    },
    'General Update': {
      name: 'General Update',
      getSubject: (city) => `Important Marathon Update: Guidelines & Schedule - ${city === 'All Cities' ? 'All Editions' : city}`,
      getBody: (city) => `Dear Runner,

As race day approaches for the India RunTrust Marathon in ${city === 'All Cities' ? 'your city edition' : city}, here are the critical guidelines and instructions for all registered runners:

Key Guidelines & Race Day Instructions:
1. Bib & Kit Collection: Official marathon kits, timing chips, and dry-fit t-shirts must be collected from the Marathon Expo. Carry a government photo ID and your registration reference.
2. Race Day Assembly: Report at least 45 minutes prior to your category start. Warm-up and safety briefings will commence promptly.
3. Hydration & Support: Medical aid stations, ambulance support, energy drinks, and water booths are positioned every 1.5 km along the route.
4. Finisher Medals & Refreshments: Commemorative finisher medals, hot breakfast, and official timing certificates will be provided upon crossing the finish line.

Thank you for running for a cause and being a valued part of India RunTrust!

Warm regards,
India RunTrust Marathon Organizing Committee
Besant Nagar Promenade, Chennai, Tamil Nadu`
    }
  };

  // Apply a template to Subject & Body
  const handleApplyTemplate = (templateKey, cityOverride) => {
    const tpl = CAMPAIGN_TEMPLATES[templateKey];
    if (!tpl) return;
    const targetCity = cityOverride || campaignContext?.city || selectedCampaignCity || 'Chennai';
    setSubject(tpl.getSubject(targetCity));
    setBody(tpl.getBody(targetCity));
    setSelectedTemplateName(templateKey);
  };

  // "Send Bulk Email" button handler from Campaigns tab (Requirement 4)
  const handleOpenBulkCompose = (templateToApply = 'General Update') => {
    const city = selectedCampaignCity;
    const status = selectedCampaignStatus;
    const recipients = uniqueCampaignEmails;

    setToChips(recipients);
    setToInput('');
    setCampaignContext({
      city,
      status,
      count: recipients.length
    });

    handleApplyTemplate(templateToApply, city);
    setActiveTab('compose');
    setFeedback(null);
  };

  // Handle To Chip additions
  const handleAddChip = (val) => {
    const trimmed = val.trim().replace(/,$/, '');
    if (!trimmed) return;
    if (!toChips.includes(trimmed)) {
      setToChips([...toChips, trimmed]);
    }
    setToInput('');
  };

  const handleRemoveChip = (chipToRemove) => {
    setToChips(toChips.filter(c => c !== chipToRemove));
  };

  const handleKeyDownTo = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddChip(toInput);
    } else if (e.key === 'Backspace' && !toInput && toChips.length > 0) {
      setToChips(toChips.slice(0, -1));
    }
  };

  // Compose Submit Interceptor (Opens Confirmation Popup - Requirement 7)
  const handleComposeSubmit = (e) => {
    e.preventDefault();
    const finalRecipients = [...toChips];
    if (toInput.trim()) {
      finalRecipients.push(toInput.trim());
    }

    if (finalRecipients.length === 0) {
      setFeedback({ type: 'error', message: 'Please specify at least one recipient email address.' });
      return;
    }
    if (!subject.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a subject line.' });
      return;
    }
    if (!body.trim()) {
      setFeedback({ type: 'error', message: 'Please write a message body.' });
      return;
    }

    // Trigger Confirmation Popup (Requirement 7)
    setShowConfirmModal(true);
  };

  // Actual Dispatch Execution (Requirement 5, 6, 7)
  const handleExecuteSend = async () => {
    setShowConfirmModal(false);
    setIsSending(true);
    setFeedback(null);

    const finalRecipients = [...toChips];
    if (toInput.trim() && !finalRecipients.includes(toInput.trim())) {
      finalRecipients.push(toInput.trim());
    }

    try {
      let res;
      let data;

      // If this is a bulk campaign (or has campaignContext)
      if (campaignContext || finalRecipients.length > 1) {
        const city = campaignContext?.city || selectedCampaignCity;
        const status = campaignContext?.status || selectedCampaignStatus;

        res = await adminFetch('/api/email/campaign/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: city || 'All Cities',
            status: status || 'All',
            subject: subject.trim(),
            body: body.trim(),
            template: selectedTemplateName || '',
            recipients: finalRecipients
          })
        });
        data = await res.json();
      } else {
        // Individual email dispatch
        res = await adminFetch('/api/admin/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: finalRecipients,
            subject: subject.trim(),
            body: body.trim(),
            registrationId,
            messageId
          })
        });
        data = await res.json();
      }

      if (res.ok && data.success) {
        if (data.pending) {
          setFeedback({
            type: 'warning',
            message: `Email queued (${data.sentCount || 0} sent, ${finalRecipients.length} total). SMTP is not configured yet. Add SMTP details in .env to deliver live emails.`
          });
        } else {
          setFeedback({
            type: 'success',
            message: `Bulk campaign successfully dispatched to ${data.sentCount ?? finalRecipients.length} recipients.`
          });
        }

        // Reset compose state
        setToChips([]);
        setToInput('');
        setSubject('');
        setBody('');
        setActiveDraftId(null);
        setRegistrationId('');
        setMessageId('');
        setAttachments([]);
        setCampaignContext(null);
        setSelectedTemplateName('');

        if (onEmailSent) onEmailSent();

        // Refresh Sent and Campaigns
        fetchEmails('sent');
        fetchCampaigns();
      } else {
        setFeedback({
          type: 'error',
          message: data.message || 'Failed to dispatch campaign email.'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Network error communicating with email campaign service.'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    const finalRecipients = [...toChips];
    if (toInput.trim()) finalRecipients.push(toInput.trim());

    if (!subject.trim() && !body.trim() && finalRecipients.length === 0) {
      setFeedback({ type: 'warning', message: 'Nothing to save in draft.' });
      return;
    }

    setIsSavingDraft(true);
    setFeedback(null);

    try {
      const res = await adminFetch('/api/admin/emails/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeDraftId,
          to: finalRecipients,
          subject: subject.trim() || 'Untitled Draft',
          body: body.trim(),
          registrationId,
          messageId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActiveDraftId(data.data?._id || activeDraftId);
        setFeedback({ type: 'success', message: 'Draft saved securely.' });
        fetchEmails('drafts');
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to save draft.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error saving draft.' });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Resume editing a draft
  const handleEditDraft = (draft) => {
    setActiveDraftId(draft._id);
    setToChips(draft.to || []);
    setToInput('');
    setSubject(draft.subject || '');
    setBody(draft.body || '');
    setRegistrationId(draft.registrationId || '');
    setMessageId(draft.messageId || '');
    setActiveTab('compose');
  };

  // Delete an email or draft
  const handleDeleteEmail = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this email record?')) return;

    try {
      const res = await adminFetch(`/api/admin/emails/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmails(prev => prev.filter(item => item._id !== id));
        fetchEmails(activeTab);
      }
    } catch (err) {
      console.error('Delete email error:', err);
    }
  };

  // Quick Launcher for General Groups
  const handleLaunchCampaign = (targetGroup) => {
    setActiveTab('compose');
    let recipients = [];
    let defaultSubj = '';

    if (targetGroup === 'confirmed') {
      recipients = registrations
        .filter(r => r.registrationStatus === 'Confirmed' && r.email)
        .map(r => r.email);
      defaultSubj = 'Official Update: India RunTrust Marathon Guidelines & Bib Collection';
    } else if (targetGroup === 'pending') {
      recipients = registrations
        .filter(r => (r.registrationStatus === 'Pending' || r.paymentStatus === 'Pending') && r.email)
        .map(r => r.email);
      defaultSubj = 'Complete Your Marathon Registration — India RunTrust';
    } else if (targetGroup === 'inquirers') {
      const unique = new Set(messages.map(m => m.email).filter(Boolean));
      recipients = Array.from(unique);
      defaultSubj = 'India RunTrust Newsletter & Upcoming Marathon Updates';
    }

    const uniqueRecipients = Array.from(new Set(recipients));
    setToChips(uniqueRecipients);
    setSubject(defaultSubj);
    setBody(
`Dear Marathon Runner / Supporter,

We are excited to share an update regarding the upcoming India RunTrust Marathon.

---
[Insert campaign announcement details here]
---

Warm regards,
India RunTrust Team`
    );
  };

  // Confirmation Prompt Text (Requirement 7: "Send to 3 runners in Chennai?")
  const confirmPromptText = useMemo(() => {
    const totalCount = toChips.length + (toInput.trim() ? 1 : 0);
    const targetCity = campaignContext?.city || (selectedCampaignCity !== 'All Cities' ? selectedCampaignCity : 'All Cities');
    if (targetCity === 'All Cities') {
      return `Send to ${totalCount} runners across All Cities?`;
    }
    return `Send to ${totalCount} runners in ${targetCity}?`;
  }, [toChips, toInput, campaignContext, selectedCampaignCity]);

  return (
    <div className="email-marketing-view" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* ── SECTION HEADER ── */}
      <div className="admin-action-bar" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title" style={{ margin: '0 0 0.25rem 0' }}>
            Email Marketing
          </h1>
          <p className="admin-page-sub" style={{ margin: 0 }}>
            City-wise bulk announcements, official runner updates, and participant email communications.
          </p>
        </div>

        <div className="admin-action-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => { fetchConfig(); fetchEmails(activeTab); fetchCampaigns(); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', borderColor: '#E2E8F0', color: '#334155' }}
          >
            <FaRotate className={isLoadingEmails || isLoadingCampaigns ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── SMTP NOT CONFIGURED BANNER ── */}
      {!config.configured && (
        <div
          style={{
            backgroundColor: '#FEF9C3',
            border: '1px solid #FDE047',
            borderLeft: '5px solid #CA8A04',
            borderRadius: '8px',
            padding: '0.9rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            color: '#854D0E',
            fontSize: '0.92rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
          }}
        >
          <FaTriangleExclamation style={{ fontSize: '1.25rem', flexShrink: 0, color: '#CA8A04' }} />
          <div>
            <strong>Email is not configured yet.</strong> Add SMTP details in <code style={{ background: '#FEF08A', padding: '2px 6px', borderRadius: '4px', color: '#713F12' }}>backend/.env</code> (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM_NAME, MAIL_FROM_ADDRESS) to start sending.
          </div>
        </div>
      )}

      {/* ── FEEDBACK ALERTS ── */}
      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
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

      {/* ── TABS NAVIGATION ── */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #E2E8F0', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('campaigns'); setFeedback(null); }}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'campaigns' ? '3px solid #A51C1F' : '3px solid transparent',
            color: activeTab === 'campaigns' ? '#A51C1F' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <FaBullhorn style={{ fontSize: '0.85rem' }} />
          <span>Campaigns</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('compose'); setFeedback(null); }}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'compose' ? '3px solid #A51C1F' : '3px solid transparent',
            color: activeTab === 'compose' ? '#A51C1F' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <FaPen style={{ fontSize: '0.85rem' }} />
          <span>Compose</span>
          {toChips.length > 0 && (
            <span style={{ background: '#FEE2E2', color: '#A51C1F', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              {toChips.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('sent'); setFeedback(null); }}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'sent' ? '3px solid #A51C1F' : '3px solid transparent',
            color: activeTab === 'sent' ? '#A51C1F' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <FaPaperPlane style={{ fontSize: '0.85rem' }} />
          <span>Sent Messages</span>
          {(emails.length > 0 || campaigns.length > 0) && (
            <span style={{ background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
              {campaigns.length + emails.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('drafts'); setFeedback(null); }}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'drafts' ? '3px solid #A51C1F' : '3px solid transparent',
            color: activeTab === 'drafts' ? '#A51C1F' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <FaFileLines style={{ fontSize: '0.85rem' }} />
          <span>Drafts</span>
          {counts.drafts > 0 && (
            <span style={{ background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
              {counts.drafts}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════
          TAB: CAMPAIGNS (City-Wise Bulk Email)
         ══════════════════════════════════════════ */}
      {activeTab === 'campaigns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Main City-Wise Bulk Campaign Builder */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.75rem',
              border: '1px solid #CBD5E1',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ background: '#FEE2E2', color: '#A51C1F', padding: '4px 8px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
                    BULK DISPATCH
                  </span>
                  <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#1E293B', margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
                    City-Wise Bulk Email Campaign
                  </h2>
                </div>
                <p style={{ color: '#64748B', fontSize: '0.92rem', margin: 0 }}>
                  Select a city and status filter to target verified participants with batch-queued updates.
                </p>
              </div>

              {/* Live Count Pill (Requirement 3) */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  padding: '0.65rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: uniqueCampaignEmails.length > 0 ? '#16A34A' : '#94A3B8' }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Live Recipient Target
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>
                    {recipientCountLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Controls Row (Requirement 1 & 2) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
                background: '#FAF8F5',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                marginBottom: '1.5rem'
              }}
            >
              {/* City Dropdown (Requirement 1) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
                  <FaLocationDot style={{ color: '#A51C1F', marginRight: '6px' }} />
                  Filter by City
                </label>
                <select
                  value={selectedCampaignCity}
                  onChange={(e) => setSelectedCampaignCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    fontSize: '0.92rem',
                    color: '#1E293B',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                  Extracted from live participant registrations
                </span>
              </div>

              {/* Status Filter (Requirement 2: Confirmed / Pending / All) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
                  <FaFilter style={{ color: '#A51C1F', marginRight: '6px' }} />
                  Registration Status Filter
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['Confirmed', 'Pending', 'All'].map(statusOption => (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() => setSelectedCampaignStatus(statusOption)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.5rem',
                        borderRadius: '6px',
                        border: selectedCampaignStatus === statusOption ? '2px solid #A51C1F' : '1px solid #CBD5E1',
                        background: selectedCampaignStatus === statusOption ? '#FEE2E2' : '#FFFFFF',
                        color: selectedCampaignStatus === statusOption ? '#A51C1F' : '#475569',
                        fontWeight: selectedCampaignStatus === statusOption ? 700 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {statusOption === 'Confirmed' && <FaCheck style={{ marginRight: '4px', fontSize: '0.75rem' }} />}
                      {statusOption}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                  Filter runners by their bib/payment confirmation status
                </span>
              </div>
            </div>

            {/* Template Selection & Launch Actions (Requirement 4) */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                    Quick Campaign Templates:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.keys(CAMPAIGN_TEMPLATES).map(tplKey => (
                      <button
                        key={tplKey}
                        type="button"
                        onClick={() => handleOpenBulkCompose(tplKey)}
                        className="btn btn-outline btn-sm"
                        style={{
                          background: '#FFFFFF',
                          borderColor: '#CBD5E1',
                          color: '#334155',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          borderRadius: '6px',
                          padding: '0.45rem 0.85rem'
                        }}
                      >
                        <FaFileLines style={{ color: '#A51C1F', marginRight: '5px' }} />
                        {tplKey}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Launch Button (Requirement 4) */}
                <button
                  type="button"
                  onClick={() => handleOpenBulkCompose('General Update')}
                  disabled={uniqueCampaignEmails.length === 0}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#A51C1F',
                    borderColor: '#A51C1F',
                    color: '#FFFFFF',
                    padding: '0.75rem 1.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    boxShadow: '0 4px 10px rgba(165, 28, 31, 0.25)',
                    cursor: uniqueCampaignEmails.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: uniqueCampaignEmails.length === 0 ? 0.6 : 1
                  }}
                >
                  <FaPaperPlane />
                  <span>Send Bulk Email ({uniqueCampaignEmails.length})</span>
                </button>
              </div>
            </div>

            {/* Recipient Preview Chips */}
            {matchingCampaignRunners.length > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #E2E8F0' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaUsers />
                  <span>Matching Recipients Preview ({matchingCampaignRunners.length} registrations, {uniqueCampaignEmails.length} unique emails):</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto', padding: '6px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  {matchingCampaignRunners.slice(0, 30).map((r, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        color: '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <strong style={{ color: '#0F172A' }}>{r.fullName}</strong>
                      <span style={{ color: '#64748B' }}>({r.email})</span>
                      <span style={{ color: r.registrationStatus === 'Confirmed' ? '#166534' : '#854D0E', fontWeight: 700, fontSize: '0.7rem' }}>
                        [{r.city || 'Chennai'}]
                      </span>
                    </span>
                  ))}
                  {matchingCampaignRunners.length > 30 && (
                    <span style={{ fontSize: '0.75rem', color: '#64748B', padding: '2px 8px', fontStyle: 'italic' }}>
                      + {matchingCampaignRunners.length - 30} more runners
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Pre-Set Launcher Cards for General Segments */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0'
            }}
          >
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#1E293B', margin: '0 0 0.4rem', fontSize: '1.15rem', fontWeight: 700 }}>
              Global Recipient Groups
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Quickly launch general blasts targeting runners nationwide or website inquirers.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Confirmed */}
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '10px', padding: '1.25rem', background: '#FAF8F5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <FaCircleCheck />
                    <span>All Confirmed Runners</span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 1rem' }}>
                    All verified participants across every city edition.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    {registrations.filter(r => r.registrationStatus === 'Confirmed').length} Runners
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLaunchCampaign('confirmed')}
                    className="btn btn-primary btn-sm"
                    style={{ background: '#A51C1F', borderColor: '#A51C1F' }}
                  >
                    <span>Launch Blast</span>
                  </button>
                </div>
              </div>

              {/* Pending */}
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '10px', padding: '1.25rem', background: '#FAF8F5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#854D0E', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <FaClock />
                    <span>Pending Participants</span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 1rem' }}>
                    Runners with pending confirmation or awaiting online payment.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    {registrations.filter(r => r.registrationStatus === 'Pending' || r.paymentStatus === 'Pending').length} Runners
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLaunchCampaign('pending')}
                    className="btn btn-primary btn-sm"
                    style={{ background: '#A51C1F', borderColor: '#A51C1F' }}
                  >
                    <span>Send Reminder</span>
                  </button>
                </div>
              </div>

              {/* Inquirers */}
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '10px', padding: '1.25rem', background: '#FAF8F5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E293B', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <FaEnvelope />
                    <span>Contact Inquirers</span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 1rem' }}>
                    All individuals who submitted queries via the public website.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '0.85rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    {new Set(messages.map(m => m.email).filter(Boolean)).size} Unique Contacts
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLaunchCampaign('inquirers')}
                    className="btn btn-primary btn-sm"
                    style={{ background: '#A51C1F', borderColor: '#A51C1F' }}
                  >
                    <span>Compose Update</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: COMPOSE WINDOW
         ══════════════════════════════════════════ */}
      {activeTab === 'compose' && (
        <div
          className="gmail-compose-card"
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #CBD5E1',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Dark Title Bar */}
          <div
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <FaPen style={{ color: '#F87171', fontSize: '0.85rem' }} />
              <span>{campaignContext ? `Bulk Campaign Dispatch: ${campaignContext.city}` : 'Compose Message'}</span>
              {activeDraftId && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px', color: '#E2E8F0' }}>
                  Editing Draft
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94A3B8', fontSize: '0.8rem' }}>
              <span>India RunTrust Official Webmailer</span>
            </div>
          </div>

          {/* Campaign Target Badge in Compose */}
          {campaignContext && (
            <div
              style={{
                background: '#FEF2F2',
                borderBottom: '1px solid #FCA5A5',
                padding: '0.6rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
                color: '#991B1B'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaBullhorn />
                <span>
                  Targeting <strong>{campaignContext.city}</strong> ({campaignContext.status} Status) — <strong>{toChips.length} runners</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCampaignContext(null)}
                style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
              >
                Clear Target Info
              </button>
            </div>
          )}

          {/* Quick Templates Selector Row in Compose (Requirement 4) */}
          <div
            style={{
              padding: '0.65rem 1.25rem',
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                Quick Templates:
              </span>
              {Object.keys(CAMPAIGN_TEMPLATES).map(tplKey => (
                <button
                  key={tplKey}
                  type="button"
                  onClick={() => handleApplyTemplate(tplKey)}
                  style={{
                    background: selectedTemplateName === tplKey ? '#A51C1F' : '#FFFFFF',
                    color: selectedTemplateName === tplKey ? '#FFFFFF' : '#334155',
                    border: `1px solid ${selectedTemplateName === tplKey ? '#A51C1F' : '#CBD5E1'}`,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tplKey}
                </button>
              ))}
            </div>

            {selectedTemplateName && (
              <span style={{ fontSize: '0.75rem', color: '#166534', background: '#DCFCE7', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Template: {selectedTemplateName}
              </span>
            )}
          </div>

          <form onSubmit={handleComposeSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* From Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #F1F5F9',
                fontSize: '0.9rem',
                background: '#FAF8F5',
                minWidth: 0
              }}
            >
              <span style={{ width: '70px', flexShrink: 0, color: '#64748B', fontWeight: 600 }}>From:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E293B', fontWeight: 500, minWidth: 0, overflow: 'hidden' }}>
                <span style={{ flexShrink: 0 }}>{config.mailFromName}</span>
                <span style={{ color: '#64748B', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>&lt;{config.mailFromAddress}&gt;</span>
                <span style={{ background: '#E2E8F0', color: '#475569', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', marginLeft: '0.5rem', flexShrink: 0 }}>
                  Website Mailer
                </span>
              </div>
            </div>

            {/* To Row with Chips (Requirement 4: Auto-filled from city+status) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #F1F5F9',
                fontSize: '0.9rem',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <span style={{ width: '70px', flexShrink: 0, color: '#64748B', fontWeight: 600, paddingTop: '4px' }}>
                To ({toChips.length}):
              </span>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', maxHeight: '140px', overflowY: 'auto' }}>
                {toChips.map((chip, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '16px',
                      padding: '2px 10px',
                      fontSize: '0.84rem',
                      color: '#1E293B',
                      fontWeight: 500
                    }}
                  >
                    <span>{chip}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChip(chip)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Remove recipient"
                    >
                      <FaXmark style={{ fontSize: '0.75rem' }} />
                    </button>
                  </span>
                ))}
                <input
                  type="email"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onKeyDown={handleKeyDownTo}
                  onBlur={() => { if (toInput.trim()) handleAddChip(toInput); }}
                  placeholder={toChips.length === 0 ? 'Recipient email address (press Enter or comma to add multiple)' : 'Add recipient...'}
                  style={{
                    border: 'none',
                    outline: 'none',
                    flex: 1,
                    minWidth: '220px',
                    fontSize: '0.9rem',
                    color: '#1E293B',
                    padding: '4px 0'
                  }}
                />
              </div>
            </div>

            {/* Subject Row (Editable - Requirement 4) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid #F1F5F9',
                fontSize: '0.9rem',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <span style={{ width: '70px', flexShrink: 0, color: '#64748B', fontWeight: 600 }}>Subject:</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject line..."
                style={{
                  border: 'none',
                  outline: 'none',
                  flex: 1,
                  minWidth: 0,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#1E293B',
                  padding: '4px 0'
                }}
              />
            </div>

            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div
                style={{
                  padding: '0.6rem 1.25rem',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Attachments:</span>
                {attachments.map((att, i) => (
                  <span
                    key={i}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FaPaperclip style={{ fontSize: '0.7rem', color: '#64748B' }} />
                    <span>{att.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', marginLeft: '4px' }}
                    >
                      <FaXmark style={{ fontSize: '0.7rem' }} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Body Area (Editable - Requirement 4) */}
            <div style={{ padding: '1rem 1.25rem', flex: 1 }}>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={14}
                placeholder="Compose your message here..."
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#1E293B',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Bottom Actions Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid #E2E8F0',
                background: '#FAF8F5'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Red Send Button */}
                <button
                  type="submit"
                  disabled={isSending}
                  style={{
                    backgroundColor: '#A51C1F',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.65rem 1.4rem',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(165, 28, 31, 0.3)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <FaPaperPlane />
                  <span>
                    {isSending
                      ? 'Dispatching...'
                      : toChips.length > 1
                      ? `Send Bulk to ${toChips.length} Runners`
                      : 'Send Message'}
                  </span>
                </button>

                {/* Save Draft Button */}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.65rem 1.1rem',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: isSavingDraft ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <FaFileLines />
                  <span>{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Reset / Clear Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Discard current compose draft?')) {
                      setToChips([]);
                      setToInput('');
                      setSubject('');
                      setBody('');
                      setActiveDraftId(null);
                      setAttachments([]);
                      setCampaignContext(null);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '0.65rem',
                    borderRadius: '6px'
                  }}
                  title="Discard Draft"
                >
                  <FaTrashCan />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: SENT MESSAGES (Requirement 6)
         ══════════════════════════════════════════ */}
      {activeTab === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Sub-Tabs: All / Bulk Campaigns / Direct Emails */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setSentSubTab('all')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                border: 'none',
                background: sentSubTab === 'all' ? '#1E293B' : '#F1F5F9',
                color: sentSubTab === 'all' ? '#FFFFFF' : '#475569',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              All Dispatches ({campaigns.length + emails.length})
            </button>
            <button
              type="button"
              onClick={() => setSentSubTab('campaigns')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                border: 'none',
                background: sentSubTab === 'campaigns' ? '#A51C1F' : '#F1F5F9',
                color: sentSubTab === 'campaigns' ? '#FFFFFF' : '#475569',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              <FaBullhorn style={{ marginRight: '5px' }} />
              Bulk Campaigns ({campaigns.length})
            </button>
            <button
              type="button"
              onClick={() => setSentSubTab('direct')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                border: 'none',
                background: sentSubTab === 'direct' ? '#1E293B' : '#F1F5F9',
                color: sentSubTab === 'direct' ? '#FFFFFF' : '#475569',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Direct Emails ({emails.length})
            </button>
          </div>

          {/* 1. Bulk Campaigns Table (Requirement 6) */}
          {(sentSubTab === 'all' || sentSubTab === 'campaigns') && (
            <div className="admin-table-card" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div className="table-card-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaBullhorn style={{ color: '#A51C1F' }} />
                  <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#A51C1F', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                    Sent Campaigns ({campaigns.length})
                  </h3>
                </div>
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                  City-wise bulk dispatches recorded via Campaign model
                </span>
              </div>

              {campaigns.length === 0 ? (
                <div className="admin-empty-state" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
                  <FaBullhorn style={{ fontSize: '2.2rem', color: '#CBD5E1', marginBottom: '0.75rem' }} />
                  <p>No bulk email campaigns dispatched yet. Launch one from the Campaigns tab.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>City &amp; Filter</th>
                        <th>Subject</th>
                        <th>Recipients</th>
                        <th>Dispatched Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((c) => (
                        <tr key={c._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ background: '#FEE2E2', color: '#A51C1F', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                                {c.city || 'All Cities'}
                              </span>
                              <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                {c.statusFilter || 'All'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#1E293B' }}>{c.subject}</strong>
                            {c.template && (
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                Template: {c.template}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.88rem' }}>
                              <strong style={{ color: '#166534' }}>{c.sentCount ?? 0} sent</strong>
                              {c.failedCount > 0 && (
                                <span style={{ color: '#991B1B', marginLeft: '6px' }}>
                                  ({c.failedCount} failed)
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              Total: {c.totalRecipients || (c.sentCount + (c.failedCount || 0))} runners
                            </span>
                          </td>
                          <td>{new Date(c.createdAt).toLocaleString()}</td>
                          <td>
                            <span
                              className="status-pill"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: c.status === 'completed' ? '#DCFCE7' : c.status === 'failed' ? '#FEE2E2' : '#FEF9C3',
                                color: c.status === 'completed' ? '#166534' : c.status === 'failed' ? '#991B1B' : '#854D0E',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                fontSize: '0.78rem'
                              }}
                            >
                              {c.status === 'completed' ? 'Delivered' : c.status === 'failed' ? 'Failed' : 'Sending'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="admin-action-btn view-btn"
                              onClick={() => setPreviewEmail({
                                to: c.recipients && c.recipients.length > 0 ? c.recipients.slice(0, 10).join(', ') + (c.recipients.length > 10 ? `... (+${c.recipients.length - 10} more)` : '') : `${c.totalRecipients || c.sentCount} runners (${c.city})`,
                                from: config.fromFormatted,
                                subject: c.subject,
                                body: c.body,
                                sentAt: c.createdAt
                              })}
                              title="Preview campaign email"
                            >
                              <FaEye />
                              <span>Preview</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. Direct Messages Table */}
          {(sentSubTab === 'all' || sentSubTab === 'direct') && (
            <div className="admin-table-card" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div className="table-card-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaEnvelope style={{ color: '#1E293B' }} />
                  <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#1E293B', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                    Direct Email Logs ({emails.length})
                  </h3>
                </div>
              </div>

              {emails.length === 0 ? (
                <div className="admin-empty-state" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
                  <FaEnvelope style={{ fontSize: '2.2rem', color: '#CBD5E1', marginBottom: '0.75rem' }} />
                  <p>No direct messages recorded yet.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>To (Recipients)</th>
                        <th>Subject</th>
                        <th>Dispatched Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emails.map((m) => (
                        <tr key={m._id}>
                          <td>
                            <span
                              className={`status-pill ${m.status === 'sent' ? 'confirmed' : 'pending'}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: m.status === 'sent' ? '#DCFCE7' : '#FEF9C3',
                                color: m.status === 'sent' ? '#166534' : '#854D0E',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                fontSize: '0.78rem'
                              }}
                            >
                              {m.status === 'sent' ? 'Sent' : 'Pending (No SMTP)'}
                            </span>
                          </td>
                          <td>
                            <strong>{Array.isArray(m.to) ? m.to.join(', ') : m.to}</strong>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#1E293B' }}>{m.subject}</span>
                          </td>
                          <td>{m.sentAt ? new Date(m.sentAt).toLocaleString() : new Date(m.createdAt).toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="admin-action-btn view-btn"
                                onClick={() => setPreviewEmail(m)}
                                title="Preview sent HTML email"
                              >
                                <FaEye />
                                <span>Preview</span>
                              </button>
                              <button
                                type="button"
                                className="admin-action-btn delete-btn"
                                onClick={(e) => handleDeleteEmail(m._id, e)}
                                title="Delete log"
                              >
                                <FaTrashCan />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: DRAFTS
         ══════════════════════════════════════════ */}
      {activeTab === 'drafts' && (
        <div className="admin-table-card" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div className="table-card-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#A51C1F', margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              Saved Email Drafts ({emails.length})
            </h3>
          </div>

          {emails.length === 0 ? (
            <div className="admin-empty-state" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
              <FaFileLines style={{ fontSize: '2.5rem', color: '#CBD5E1', marginBottom: '1rem' }} />
              <p>No drafts currently saved.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Recipients</th>
                    <th>Subject</th>
                    <th>Last Saved</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((d) => (
                    <tr key={d._id}>
                      <td>
                        <strong>{Array.isArray(d.to) && d.to.length > 0 ? d.to.join(', ') : 'No recipient specified'}</strong>
                      </td>
                      <td>
                        <strong style={{ color: '#1E293B' }}>{d.subject || '(Untitled Draft)'}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.body}
                        </div>
                      </td>
                      <td>{new Date(d.createdAt).toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEditDraft(d)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FaPen />
                            <span>Edit in Compose</span>
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn delete-btn"
                            onClick={(e) => handleDeleteEmail(d._id, e)}
                          >
                            <FaTrashCan />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          CONFIRMATION POPUP MODAL (Requirement 7)
         ══════════════════════════════════════════ */}
      {showConfirmModal && (
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
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="admin-modal-card"
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #E2E8F0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#A51C1F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}
              >
                <FaBullhorn />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', fontFamily: 'Playfair Display, Georgia, serif' }}>
                  Confirm Bulk Dispatch
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  India RunTrust Email Marketing
                </span>
              </div>
            </div>

            {/* Prompt Text (Requirement 7: "Send to 3 runners in Chennai?") */}
            <div
              style={{
                background: '#FAF8F5',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                margin: '1.25rem 0',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#A51C1F',
                textAlign: 'center'
              }}
            >
              {confirmPromptText}
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
              This operation will queue the message through the email dispatch queue in batches of 50. Each sent campaign will be saved in the database for tracking.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-outline"
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  borderColor: '#CBD5E1',
                  color: '#475569'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSend}
                disabled={isSending}
                className="btn btn-primary"
                style={{
                  backgroundColor: '#A51C1F',
                  borderColor: '#A51C1F',
                  color: '#FFFFFF',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 6px rgba(165, 28, 31, 0.3)'
                }}
              >
                <FaPaperPlane />
                <span>Confirm &amp; Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PREVIEW MODAL (OFFICIAL RUNTRUST EMAIL TEMPLATE)
         ══════════════════════════════════════════ */}
      {previewEmail && (
        <div className="admin-modal-backdrop" onClick={() => setPreviewEmail(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                background: '#A51C1F',
                color: '#FFFFFF',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700 }}>
                  INDIA RUNTRUST
                </h2>
                <span style={{ color: '#FEE2E2', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Official Email Template Preview
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                style={{ color: '#FFFFFF' }}
                onClick={() => setPreviewEmail(null)}
              >
                <FaXmark />
              </button>
            </div>

            {/* Email Meta Info */}
            <div style={{ padding: '1rem 1.5rem', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '0.88rem' }}>
              <div><strong>To:</strong> {Array.isArray(previewEmail.to) ? previewEmail.to.join(', ') : previewEmail.to}</div>
              <div><strong>From:</strong> {previewEmail.from}</div>
              <div><strong>Subject:</strong> {previewEmail.subject}</div>
              <div><strong>Date:</strong> {previewEmail.sentAt ? new Date(previewEmail.sentAt).toLocaleString() : 'Not sent yet'}</div>
            </div>

            {/* Rendered Body Container */}
            <div style={{ padding: '1.75rem', background: '#FFFFFF', fontSize: '0.95rem', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-wrap' }}>
              {previewEmail.body}
            </div>

            {/* Footer */}
            <div
              style={{
                background: '#0F172A',
                color: '#94A3B8',
                padding: '1rem 1.5rem',
                textAlign: 'center',
                fontSize: '0.78rem'
              }}
            >
              <p style={{ margin: '0 0 4px' }}>&copy; {new Date().getFullYear()} INDIA RUNTRUST. All rights reserved.</p>
              <p style={{ margin: 0 }}>Besant Nagar Promenade, Chennai, Tamil Nadu, India</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
