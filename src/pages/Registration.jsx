import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaShieldHalved,
  FaArrowRight,
  FaArrowLeft,
  FaIdCard,
  FaCheck,
  FaXmark,
  FaCalendarDays,
  FaClock,
  FaLocationDot,
  FaPersonRunning,
  FaArrowDown
} from 'react-icons/fa6';
import { RACE_PACKAGES, UPCOMING_EVENTS } from '../data/marathonData';
import chennaiImg from '../assets/chennai.png';

// Chennai events mattum
const CHENNAI_EVENTS = UPCOMING_EVENTS.filter(
  (e) => e.city && e.city.toLowerCase() === 'chennai'
);
const EVENT_LIST = CHENNAI_EVENTS.length > 0 ? CHENNAI_EVENTS : UPCOMING_EVENTS;

// Time (in seconds) the runner has to fill the details after clicking Proceed
const HOLD_SECONDS = 15 * 60;

// Discount codes: { CODE: percentOff }   e.g. { RUNTRUST10: 10 }
const DISCOUNT_CODES = {};

const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "Don't know"];
const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer not to say'];
const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore',
  'Malaysia', 'Sri Lanka', 'Australia', 'Canada', 'Other'
];

const BLANK_PARTICIPANT = {
  fullName: '',
  email: '',
  mobileNumber: '',
  whatsappNumber: '',
  organisation: '',
  designation: '',
  gender: '',
  dob: '',
  tshirtSize: '',
  bloodGroup: '',
  address: '',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pincode: '',
  country: 'India',
  facebookLink: '',
  instagramLink: '',
  emergencyContact: '',
  emergencyPhone: '',
  hearAbout: '',
  runningGroup: '',
  agreeTerms: false,
  sameAsFirst: false
};

const PERSON_FIELDS = Object.keys(BLANK_PARTICIPANT).filter((f) => f !== 'sameAsFirst');

const formatTimer = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function Registration() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Multi-city states
  const [availableCities, setAvailableCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [selectedCitySlug, setSelectedCitySlug] = useState('chennai');
  const [cityData, setCityData] = useState(null);
  // FIX: start as "loading" when a slug is present, so the page never flashes empty data
  const [isLoadingCityData, setIsLoadingCityData] = useState(!!slug);

  // Fetch active cities if on /register (no slug)
  useEffect(() => {
    if (!slug) {
      setIsLoadingCities(true);
      fetch('/api/cities')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
            const active = data.data.filter((c) => c.isActive !== false);
            setAvailableCities(active);
            if (active.length > 0) {
              setSelectedCitySlug(active[0].slug);
            }
          } else {
            setAvailableCities([]);
          }
        })
        .catch(() => {
          setAvailableCities([]);
        })
        .finally(() => setIsLoadingCities(false));
    }
  }, [slug]);

  // Fetch city by slug if on /register/:slug
  useEffect(() => {
    if (slug) {
      setIsLoadingCityData(true);
      fetch(`/api/cities/${slug}`)
        .then((res) => {
          if (!res.ok) throw new Error('City not found');
          return res.json();
        })
        .then((data) => {
          if (data?.success && data.data && data.data.isActive !== false) {
            setCityData(data.data);
            setSelectedCitySlug(data.data.slug);
            localStorage.setItem('selectedCity', data.data.slug);
          } else {
            // FIX: invalid slug or inactive city -> go to the Events page
            navigate('/events', { replace: true });
          }
        })
        .catch(() => {
          // FIX: city not found -> go to the Events page
          navigate('/events', { replace: true });
        })
        .finally(() => setIsLoadingCityData(false));
    } else {
      setCityData(null);
    }
  }, [slug, navigate]);

  const initialPkgParam =
    searchParams.get('package') || searchParams.get('packages') || searchParams.get('category');
  const initialEventParam = searchParams.get('event');
  const initialStepParam = searchParams.get('step');

  const getInitialQuantities = () => {
    const q = {};
    RACE_PACKAGES.forEach((p) => { q[p.id] = 0; });
    if (initialPkgParam) {
      const splitIds = initialPkgParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      splitIds.forEach(id => {
        if (q[id] !== undefined) q[id] = 1;
      });
    }
    return q;
  };

  const [ticketQuantities, setTicketQuantities] = useState(getInitialQuantities);

  const defaultEvent = EVENT_LIST.find(e => e.id === initialEventParam) || EVENT_LIST[0];

  const [formData, setFormData] = useState({
    selectedCategories: Object.keys(getInitialQuantities()).filter(id => getInitialQuantities()[id] > 0),
    selectedEvent: defaultEvent.id
  });

  // step: 'event' (city cards) -> 'pick' (choose tickets) -> 'details' (participant forms)
  // FIX: when the URL has a city slug (/register/:slug), start directly on the Pick Tickets page
  const [step, setStep] = useState(() => {
    if (initialStepParam === 'details') return 'details';
    if (slug) return 'pick';
    if (initialStepParam === 'pick') return 'pick';
    if (initialPkgParam) return 'pick';
    return 'event';
  });
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);
  const [timeUp, setTimeUp] = useState(false);

  const [participants, setParticipants] = useState({});
  const [errors, setErrors] = useState({});
  const [pickError, setPickError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registeredRefs, setRegisteredRefs] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Discount code
  const [codeInput, setCodeInput] = useState('');
  const [appliedCode, setAppliedCode] = useState(null); // { code, pct }
  const [codeMsg, setCodeMsg] = useState('');

  useEffect(() => {
    if (initialPkgParam) {
      const splitIds = initialPkgParam.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      setTicketQuantities(prev => {
        const next = { ...prev };
        splitIds.forEach(id => {
          if (next[id] !== undefined && next[id] === 0) {
            next[id] = 1;
          }
        });
        return next;
      });
    }
    if (initialEventParam) {
      const matchedEvt = EVENT_LIST.find(e => e.id === initialEventParam);
      if (matchedEvt) {
        setFormData(prev => ({ ...prev, selectedEvent: matchedEvt.id }));
      }
    }
  }, [initialPkgParam, initialEventParam]);

  // Keep formData.selectedCategories synced with non-zero ticket quantities
  useEffect(() => {
    const activeIds = Object.keys(ticketQuantities).filter(id => (ticketQuantities[id] || 0) > 0);
    setFormData(prev => ({ ...prev, selectedCategories: activeIds }));
  }, [ticketQuantities]);

  // FIX: with a city slug in the URL we must stay on the Pick Tickets page.
  // Without a slug (/register), fall back to the city cards step.
  useEffect(() => {
    if (slug) {
      setStep((prev) => (prev === 'event' ? 'pick' : prev));
      return;
    }
    if (!initialPkgParam && !searchParams.get('step')) {
      setStep('event');
    }
  }, [location.key, slug]);

  // Countdown while on details step
  useEffect(() => {
    if (step !== 'details' || isSubmitted) return undefined;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [step, isSubmitted]);

  useEffect(() => {
    if (step === 'details' && secondsLeft === 0 && !isSubmitting && !isSubmitted) {
      setStep('pick');
      setTimeUp(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [secondsLeft, step, isSubmitting, isSubmitted]);

  // ── Derived values ──
  // Expand tickets into individual participant instances
  const ticketItems = [];
  RACE_PACKAGES.forEach(pkg => {
    const qty = ticketQuantities[pkg.id] || 0;
    for (let i = 1; i <= qty; i++) {
      ticketItems.push({
        instanceId: `${pkg.id}_${i}`,
        pkgId: pkg.id,
        itemIndex: i,
        totalInGroup: qty,
        pkg
      });
    }
  });

  const selectedPackages = RACE_PACKAGES.filter(p => (ticketQuantities[p.id] || 0) > 0);
  const totalTickets = ticketItems.length;
  const firstItem = ticketItems[0];
  const firstPkg = selectedPackages[0];
  const eventInfo = EVENT_LIST.find(e => e.id === formData.selectedEvent) || EVENT_LIST[0];

  // FIX: header data comes from the city in the URL (no hard-coded Chennai fallback)
  const eventName = cityData?.name || eventInfo?.city || '';
  const eventDate = cityData?.eventDate || cityData?.date || eventInfo?.date || '';
  const cityFlagOff = cityData?.flagOffTime || cityData?.time || '';
  const eventTime = cityData
    ? (cityData.gatesOpenTime ? `${cityFlagOff} (Gates Open ${cityData.gatesOpenTime})` : cityFlagOff)
    : (eventInfo?.time || '');
  const eventVenue = cityData?.venue || eventInfo?.location || '';
  const eventBadge = cityData?.badgeText || 'Certified coastal course';
  const eventImage = cityData?.imageUrl || '/assets/chennai.png';

  // FIX: show only the categories offered by this city
  const visiblePackages =
    cityData?.categories?.length
      ? RACE_PACKAGES.filter((p) =>
          cityData.categories
            .map((c) => String(c).toLowerCase())
            .includes(String(p.id).toLowerCase())
        )
      : RACE_PACKAGES;

  const subTotal = RACE_PACKAGES.reduce((acc, p) => {
    const qty = ticketQuantities[p.id] || 0;
    return acc + (p.price || 0) * qty;
  }, 0);

  const discountPct = appliedCode ? appliedCode.pct : 0;
  const discountAmount = Math.round((subTotal * discountPct) / 100);
  const totalAmount = subTotal - discountAmount;
  const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const formattedTotalAmount = inr(totalAmount);
  const amountFor = (pkg) => Math.round(((pkg.price || 0) * (100 - discountPct)) / 100);

  const getRaw = (id) => participants[id] || BLANK_PARTICIPANT;

  // Participant 2+ with "same as first" ticked mirrors Participant 1 live
  const getEffective = (item, idx) => {
    const raw = getRaw(item.instanceId);
    if (idx > 0 && raw.sameAsFirst && firstItem) {
      return { ...getRaw(firstItem.instanceId), sameAsFirst: true };
    }
    return raw;
  };

  // ── Ticket Quantity Controls (+ / -) ──
  const handleIncreaseQuantity = (pkgId) => {
    const pkg = RACE_PACKAGES.find(p => p.id === pkgId);
    const maxLimit = pkg?.inventory || pkg?.maxQuantity || 999;
    const currentQty = ticketQuantities[pkgId] || 0;

    if (currentQty >= maxLimit) {
      setPickError(`Maximum inventory capacity reached for ${pkg?.name || 'this category'}.`);
      return;
    }

    setTicketQuantities(prev => ({
      ...prev,
      [pkgId]: (prev[pkgId] || 0) + 1
    }));
    setPickError('');
  };

  const handleDecreaseQuantity = (pkgId) => {
    setTicketQuantities(prev => {
      const currentQty = prev[pkgId] || 0;
      if (currentQty <= 0) return prev;
      return {
        ...prev,
        [pkgId]: Math.max(0, currentQty - 1)
      };
    });
    setPickError('');
  };

  const addCategory = (pkgId) => handleIncreaseQuantity(pkgId);
  const removeCategory = (pkgId) => handleDecreaseQuantity(pkgId);

  // ── Discount code ──
  const handleApplyCode = () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) {
      setCodeMsg('Please enter a code.');
      return;
    }
    if (DISCOUNT_CODES[code]) {
      setAppliedCode({ code, pct: DISCOUNT_CODES[code] });
      setCodeMsg(`Code ${code} applied (${DISCOUNT_CODES[code]}% off).`);
    } else {
      setAppliedCode(null);
      setCodeMsg('Invalid or expired code.');
    }
  };

  // ── Proceed: ticket list -> participant details ──
  const handleProceed = () => {
    if (totalTickets === 0) {
      setPickError('Please add at least one ticket to proceed.');
      return;
    }
    setPickError('');
    setTimeUp(false);
    setSecondsLeft(HOLD_SECONDS);
    setStep('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToPick = () => {
    setStep('pick');
    setSubmitError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Participant field change ──
  const handleParticipantChange = (instanceId, e) => {
    const { name, value, type, checked } = e.target;
    setParticipants(prev => ({
      ...prev,
      [instanceId]: { ...(prev[instanceId] || BLANK_PARTICIPANT), [name]: type === 'checkbox' ? checked : value }
    }));
    const key = `${instanceId}_${name}`;
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const copyFromFirst = (prev, instanceId, checked) => {
    const firstData = firstItem ? (prev[firstItem.instanceId] || BLANK_PARTICIPANT) : BLANK_PARTICIPANT;
    const copied = {};
    PERSON_FIELDS.forEach(f => { copied[f] = firstData[f]; });
    return { ...(prev[instanceId] || BLANK_PARTICIPANT), ...copied, sameAsFirst: checked };
  };

  const clearErrorsFor = (ids) => {
    setErrors(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (ids.some(id => k.startsWith(`${id}_`))) delete next[k];
      });
      return next;
    });
  };

  const handleSameAsFirst = (instanceId, checked) => {
    setParticipants(prev => ({ ...prev, [instanceId]: copyFromFirst(prev, instanceId, checked) }));
    if (checked) clearErrorsFor([instanceId]);
  };

  const handleCopyToAll = () => {
    const others = ticketItems.slice(1).map(item => item.instanceId);
    setParticipants(prev => {
      const next = { ...prev };
      others.forEach(id => { next[id] = copyFromFirst(prev, id, true); });
      return next;
    });
    clearErrorsFor(others);
  };

  // ── Validation ──
  const validate = () => {
    const newErrors = {};
    const phoneOk = (v) => /^[6-9]\d{9}$/.test(String(v).replace(/[\s-]/g, ''));

    ticketItems.forEach((item, idx) => {
      const d = getEffective(item, idx);
      const k = (f) => `${item.instanceId}_${f}`;

      if (!d.fullName.trim()) newErrors[k('fullName')] = 'Full Name is required.';
      else if (d.fullName.trim().length < 3) newErrors[k('fullName')] = 'Full Name must be at least 3 characters.';

      if (!d.email.trim()) newErrors[k('email')] = 'Email address is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) newErrors[k('email')] = 'Please provide a valid email format.';

      if (!d.mobileNumber.trim()) newErrors[k('mobileNumber')] = 'Contact number is required.';
      else if (!phoneOk(d.mobileNumber)) newErrors[k('mobileNumber')] = 'Please provide a valid 10-digit Indian mobile number.';

      if (!d.whatsappNumber.trim()) newErrors[k('whatsappNumber')] = 'WhatsApp number is required.';
      else if (!phoneOk(d.whatsappNumber)) newErrors[k('whatsappNumber')] = 'Please provide a valid 10-digit WhatsApp number.';

      if (!d.gender) newErrors[k('gender')] = 'Gender is required.';
      if (!d.dob) newErrors[k('dob')] = 'Date of birth is required.';
      if (!d.tshirtSize) newErrors[k('tshirtSize')] = 'T-Shirt size is required.';
      if (!d.bloodGroup) newErrors[k('bloodGroup')] = 'Blood group is required.';

      if (!d.address.trim()) newErrors[k('address')] = 'Full address is required.';
      if (!d.city.trim()) newErrors[k('city')] = 'City is required.';
      if (!d.state.trim()) newErrors[k('state')] = 'State is required.';

      if (!d.pincode.trim()) newErrors[k('pincode')] = 'Pincode is required.';
      else if (!/^\d{6}$/.test(d.pincode.trim())) newErrors[k('pincode')] = 'Please provide a valid 6-digit pincode.';

      if (!d.country) newErrors[k('country')] = 'Country is required.';

      if (!d.emergencyContact.trim()) newErrors[k('emergencyContact')] = 'Emergency contact name is required.';
      if (!d.emergencyPhone.trim()) newErrors[k('emergencyPhone')] = 'Emergency contact number is required.';
      else if (!phoneOk(d.emergencyPhone)) newErrors[k('emergencyPhone')] = 'Please provide a valid 10-digit emergency phone number.';

      if (!d.hearAbout.trim()) newErrors[k('hearAbout')] = 'Please tell us how you got to know about this event.';
      if (!d.agreeTerms) newErrors[k('agreeTerms')] = 'You must agree to the Terms & Conditions.';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit (Checkout): one registration per participant / race ──
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitError('');

    if (totalTickets === 0) {
      setStep('pick');
      setPickError('Please add at least one ticket to proceed.');
      return;
    }

    if (!validate()) {
      setTimeout(() => {
        const firstError = document.querySelector('.input-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    setIsSubmitting(true);
    const refs = { ...registeredRefs };
    let failed = false;

    for (let idx = 0; idx < ticketItems.length; idx++) {
      const item = ticketItems[idx];
      if (refs[item.instanceId]) continue; // already registered earlier (retry case)

      const d = getEffective(item, idx);
      const payload = {
        fullName: d.fullName,
        email: d.email,
        mobileNumber: d.mobileNumber,
        whatsappNumber: d.whatsappNumber,
        organisation: d.organisation,
        designation: d.designation,
        gender: d.gender,
        dob: d.dob,
        tshirtSize: d.tshirtSize,
        bloodGroup: d.bloodGroup,
        address: d.address,
        city: d.city || eventName,
        state: d.state,
        pincode: d.pincode,
        country: d.country,
        facebookLink: d.facebookLink,
        instagramLink: d.instagramLink,
        emergencyContact: d.emergencyContact,
        emergencyPhone: d.emergencyPhone,
        hearAbout: d.hearAbout,
        runningGroup: d.runningGroup,
        raceCategory: item.pkg.id,
        selectedCategories: [item.pkg.id],
        distance: item.pkg.distance,
        amount: amountFor(item.pkg),
        discountCode: appliedCode ? appliedCode.code : '',
        // FIX: send the city slug so the backend can look up the correct city
        selectedEvent: cityData?.slug || formData.selectedEvent,
        paymentMethod: 'Online'
      };

      try {
        const res = await fetch('/api/registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.success) {
          refs[item.instanceId] = data.data?.registrationRef || ('RUN-' + Math.floor(100000 + Math.random() * 900000));
          setRegisteredRefs({ ...refs });
        } else {
          setSubmitError(`${item.pkg.distance} (Participant ${idx + 1}): ${data.message || 'Registration failed. Please check the details and try again.'}`);
          failed = true;
          break;
        }
      } catch (err) {
        setSubmitError('Unable to connect to the backend server. Please verify the server and database are running.');
        failed = true;
        break;
      }
    }

    setIsSubmitting(false);

    if (!failed) {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetForm = () => {
    const resetQ = {};
    RACE_PACKAGES.forEach((p) => { resetQ[p.id] = 0; });
    setTicketQuantities(resetQ);
    setFormData({ selectedCategories: [], selectedEvent: EVENT_LIST[0].id });
    setParticipants({});
    setErrors({});
    setIsSubmitted(false);
    setRegisteredRefs({});
    setSubmitError('');
    setPickError('');
    // FIX: stay on the Pick Tickets page when the city is in the URL
    setStep(slug ? 'pick' : 'event');
    setCodeInput('');
    setAppliedCode(null);
    setCodeMsg('');
    setTimeUp(false);
  };

  // ── Inline styles ──
  const headerRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem'
  };
  const backBtnStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0,0,0,0.06)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'inherit',
    textDecoration: 'none',
    flexShrink: 0
  };
  const timerBadgeStyle = {
    marginLeft: 'auto',
    background: '#e11d1d',
    color: '#fff',
    padding: '0.35rem 0.9rem',
    borderRadius: '999px',
    fontWeight: 700,
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem'
  };
  const ticketCardStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.25rem',
    flexWrap: 'wrap',
    padding: '1.15rem 1.35rem',
    marginBottom: '1rem',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '14px',
    background: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
  };
  const roundBtnStyle = (disabled) => ({
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '2px solid #111',
    background: 'transparent',
    fontSize: '1.2rem',
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 1,
    padding: 0
  });
  const qtyBadgeStyle = {
    display: 'inline-block',
    background: '#111',
    color: '#fff',
    borderRadius: '999px',
    padding: '0 0.45rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    marginLeft: '0.4rem'
  };
  const summaryLineStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.75rem',
    alignItems: 'flex-start'
  };
  const participantCardStyle = {
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '14px',
    padding: '1.25rem 1.25rem 0.5rem',
    marginBottom: '1.5rem',
    background: 'rgba(255,255,255,0.55)'
  };
  const participantHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    marginBottom: '1.1rem',
    paddingBottom: '0.85rem',
    borderBottom: '1px dashed rgba(0,0,0,0.15)'
  };
  const numCircleStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#111',
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    flexShrink: 0
  };
  const sameBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.7rem 0.9rem',
    marginBottom: '1rem',
    border: '1px dashed rgba(0,0,0,0.25)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.92rem'
  };
  const copyBannerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.75rem',
    padding: '0.8rem 1rem',
    marginBottom: '1.25rem',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '12px',
    background: 'rgba(0,0,0,0.03)',
    fontSize: '0.92rem',
    fontWeight: 600
  };
  const subHeadStyle = { margin: '0.75rem 0', fontSize: '0.95rem', fontWeight: 700, opacity: 0.85 };
  const phoneWrapStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem' };
  const phonePrefixStyle = {
    padding: '0.65rem 0.75rem',
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: '8px',
    background: 'rgba(0,0,0,0.04)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontSize: '0.9rem'
  };
  const railStyle = {
    width: '96px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '0.78rem',
    fontWeight: 600,
    gap: '0.4rem'
  };
  const railCircleStyle = (done) => ({
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: done ? '#111' : '#fff',
    color: done ? '#fff' : '#111',
    border: '2px solid #111',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700
  });
  const railLineStyle = { flex: 1, minHeight: '90px', borderLeft: '3px dotted #111' };

  // ── One participant form block ──
  const renderParticipant = (item, idx) => {
    const raw = getRaw(item.instanceId);
    const d = getEffective(item, idx);
    const locked = idx > 0 && raw.sameAsFirst;
    const lockStyle = locked ? { opacity: 0.75, cursor: 'not-allowed' } : undefined;
    const err = (f) => errors[`${item.instanceId}_${f}`];
    const fid = (f) => `${item.instanceId}_${f}`;
    const onP = (e) => handleParticipantChange(item.instanceId, e);

    const errorMsg = (name) =>
      err(name) ? (
        <span className="error-message">
          <FaCircleExclamation /> {err(name)}
        </span>
      ) : null;

    const label = (name, text, required) => (
      <label htmlFor={fid(name)} className="form-label">
        {text} {required && <span className="req-star">*</span>}
      </label>
    );

    const input = (name, text, type, placeholder, required = true, extra = {}) => (
      <div className="form-group">
        {label(name, text, required)}
        <input
          type={type}
          id={fid(name)}
          name={name}
          value={d[name]}
          onChange={onP}
          placeholder={placeholder}
          readOnly={locked}
          style={lockStyle}
          className={`form-input ${err(name) ? 'input-error' : ''}`}
          {...extra}
        />
        {errorMsg(name)}
      </div>
    );

    const phone = (name, text, placeholder) => (
      <div className="form-group">
        {label(name, text, true)}
        <div style={phoneWrapStyle}>
          <span style={phonePrefixStyle}>🇮🇳 +91</span>
          <input
            type="tel"
            id={fid(name)}
            name={name}
            value={d[name]}
            onChange={onP}
            placeholder={placeholder}
            maxLength={10}
            readOnly={locked}
            style={{ flex: 1, minWidth: 0, ...(lockStyle || {}) }}
            className={`form-input ${err(name) ? 'input-error' : ''}`}
          />
        </div>
        {errorMsg(name)}
      </div>
    );

    const select = (name, text, options, placeholder = 'Select', required = true) => (
      <div className="form-group">
        {label(name, text, required)}
        <select
          id={fid(name)}
          name={name}
          value={d[name]}
          onChange={onP}
          disabled={locked}
          style={lockStyle}
          className={`form-select ${err(name) ? 'input-error' : ''}`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {errorMsg(name)}
      </div>
    );

    return (
      <div key={item.instanceId} style={participantCardStyle}>
        <div style={participantHeaderStyle}>
          <span style={numCircleStyle}>{idx + 1}</span>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.3 }}>
            {item.pkg.distance} — {item.pkg.name}{' '}
            <span style={{ opacity: 0.6, fontWeight: 500 }}>
              (Participant {idx + 1} of {totalTickets}{item.totalInGroup > 1 ? ` • Ticket #${item.itemIndex}` : ''})
            </span>
          </h4>
        </div>

        {input('fullName', 'Full Name (The same shall be used to display in Bib & E-Certificate)', 'text', 'e.g. Ananya Raman')}

        <div className="form-row-2">
          {input('email', 'Email Address', 'email', 'e.g. ananya@example.com')}
          {phone('mobileNumber', 'Contact Number', 'e.g. 9876543210')}
        </div>

        <div className="form-row-2">
          {phone('whatsappNumber', 'WhatsApp Number', 'e.g. 9876543210')}
          {input('organisation', 'Organisation', 'text', 'Company / College (optional)', false)}
        </div>

        <div className="form-row-2">
          {input('designation', 'Designation', 'text', 'e.g. Software Engineer (optional)', false)}
          {select('gender', 'Gender', GENDERS)}
        </div>

        <div className="form-row-2">
          {input('dob', 'Date of Birth (for age category)', 'date', '')}
          {select('tshirtSize', 'T-Shirt Size (sizes differ for Men & Women)', TSHIRT_SIZES)}
        </div>

        <div className="form-row-2">
          {select('bloodGroup', 'Blood Group', BLOOD_GROUPS)}
          {select('country', 'Country', COUNTRIES, 'Select a country')}
        </div>

        {input('address', 'Full Address with nearest landmark', 'text', 'House no, street, area, landmark')}

        <div className="form-row-2">
          {input('city', 'City', 'text', 'e.g. Chennai')}
          {input('state', 'State', 'text', 'e.g. Tamil Nadu')}
        </div>

        <div className="form-row-2">
          {input('pincode', 'Pincode', 'text', 'e.g. 600001', true, { maxLength: 6, inputMode: 'numeric' })}
          {input('facebookLink', 'Link to Facebook Profile', 'text', 'https://facebook.com/yourprofile (optional)', false)}
        </div>

        <div className="form-row-2">
          {input('instagramLink', 'Link to Instagram Profile', 'text', 'https://instagram.com/yourprofile (optional)', false)}
          {input('runningGroup', 'Running group (write SOLO if none)', 'text', 'Full name of group or SOLO', false)}
        </div>

        <h5 style={subHeadStyle}>Safety &amp; Emergency Details</h5>
        <div className="form-row-2">
          {input('emergencyContact', 'Emergency Contact Name', 'text', 'e.g. Ramesh Raman (Father/Spouse)')}
          {phone('emergencyPhone', 'Emergency Contact Number', 'e.g. 9840123456')}
        </div>

        {input('hearAbout', `How did you get to know about ${eventName}?`, 'text', 'e.g. Instagram, Friend, WhatsApp group')}

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={!!d.agreeTerms}
              onChange={onP}
              disabled={locked}
              className="form-checkbox"
            />
            <span>
              I agree to all the Terms &amp; Conditions and declare that I am physically fit to participate. <span className="req-star">*</span>
            </span>
          </label>
          {errorMsg('agreeTerms')}
        </div>
      </div>
    );
  };

  // ── Right side: Ticket Summary ──
  const renderSummary = () => (
    <div className="sticky-summary-card">
      <h3 className="summary-card-title">Ticket Summary</h3>

      {totalTickets === 0 ? (
        <p style={{ opacity: 0.7, fontSize: '0.92rem', margin: '0.5rem 0 1rem' }}>
          No tickets added yet. Click <strong>+</strong> on a race to get started.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', margin: '0.75rem 0 1rem' }}>
          {selectedPackages.map((pkg) => {
            const qty = ticketQuantities[pkg.id] || 0;
            return (
              <div key={pkg.id} style={summaryLineStyle}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {pkg.distance} — {pkg.name}
                    <span style={qtyBadgeStyle}>x{qty}</span>
                  </div>
                  <div style={{ fontSize: '0.88rem', opacity: 0.8 }}>
                    {inr((pkg.price || 0) * qty)}
                    {qty > 1 && (
                      <span style={{ fontSize: '0.78rem', opacity: 0.7, marginLeft: '0.35rem' }}>
                        ({pkg.formattedPrice} each)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="summary-fee-breakdown">
        <div className="fee-line">
          <span>Sub Total ({totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'}):</span>
          <span>{inr(subTotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="fee-line" style={{ color: '#16a34a' }}>
            <span>Discount ({appliedCode.code}):</span>
            <span>- {inr(discountAmount)}</span>
          </div>
        )}
        <div className="fee-line">
          <span>Taxes &amp; Processing:</span>
          <span>₹0 (Included)</span>
        </div>
        <div className="fee-total-line">
          <span>Total</span>
          <span className="total-val">{formattedTotalAmount}</span>
        </div>
      </div>

      <h4 style={{ margin: '1.25rem 0 0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>
        Have a coupon code?
      </h4>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="form-input"
          style={{ flex: 1, minWidth: 0 }}
          placeholder="Enter Code"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={handleApplyCode}>
          <span>Apply</span>
        </button>
      </div>
      {codeMsg && (
        <p style={{ fontSize: '0.82rem', margin: '0.4rem 0 0', color: appliedCode ? '#16a34a' : '#b91c1c' }}>
          {codeMsg}
        </p>
      )}

      {step === 'pick' ? (
        <>
          {pickError && (
            <p style={{ fontSize: '0.85rem', margin: '0.9rem 0 0', color: '#b91c1c' }}>{pickError}</p>
          )}
          <button
            type="button"
            className="btn btn-primary btn-block"
            style={{ marginTop: '1rem', width: '100%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxSizing: 'border-box' }}
            onClick={handleProceed}
          >
            <span>Proceed</span>
            <FaArrowRight className="btn-icon" />
          </button>
        </>
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-block"
          style={{ marginTop: '1rem', width: '100%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxSizing: 'border-box' }}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? 'Processing...' : 'Checkout'}</span>
          <FaArrowRight className="btn-icon" />
        </button>
      )}
    </div>
  );

  // Navbar Register Now should open the Events page.
  // Keep direct city registration URLs (/register/:slug) and package query URLs working.
  if (!slug && !searchParams.get('package') && !searchParams.get('packages') &&
      !searchParams.get('category') && !searchParams.get('event') && !searchParams.get('step')) {
    return <Navigate to="/events" replace />;
  }

  // ── Render Loading Screen when fetching City by Slug ──
  if (isLoadingCityData && !cityData) {
    return (
      <div className="page-wrapper registration-page">
        <div className="ticket-stage-wrapper">
          <div style={{ textAlign: 'center', color: '#A51C1F', padding: '3rem 1rem' }}>
            <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper registration-page">
      {step === 'event' ? (
        /* ── STEP 1: TICKET-STYLE CITY CARDS (ONE PER ACTIVE CITY) ── */
        <div className="ticket-stage-wrapper">
          <div className="ticket-stage-container">

            {/* Loading skeleton */}
            {isLoadingCities && (
              <div style={{ textAlign: 'center', color: '#A51C1F', padding: '3rem 1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>Loading events...</p>
              </div>
            )}

            {/* No active cities */}
            {!isLoadingCities && availableCities.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '1.2rem', color: '#A51C1F' }}>Registrations are not open yet.</p>
                <p style={{ opacity: 0.7, fontSize: '0.95rem', marginTop: '0.5rem' }}>Please check back later for upcoming events.</p>
              </div>
            )}

            {/* One card per active city */}
            {!isLoadingCities && availableCities.map((city) => {
              const cName = city.name || 'Event';
              const cDate = city.eventDate || city.date || '';
              const cFlagOff = city.flagOffTime || city.time || '';
              const cGatesOpen = city.gatesOpenTime || '';
              const cTimeDisplay = cGatesOpen ? `${cFlagOff} (Gates Open ${cGatesOpen})` : cFlagOff;
              const cVenue = city.venue || '';
              const cImage = city.imageUrl || '/assets/chennai.png';
              const cBadge = city.badgeText || 'Certified course';

              return (
                <div className="ticket-card" key={city.slug || city._id} style={{ marginBottom: '2rem' }}>
                  {/* Semicircle notches */}
                  <div className="ticket-notch ticket-notch-top" />
                  <div className="ticket-notch ticket-notch-bottom" />
                  <div className="ticket-notch ticket-notch-left" />
                  <div className="ticket-notch ticket-notch-right" />

                  {/* Vertical dashed white dividing line */}
                  <div className="ticket-divider-line" />

                  {/* Left Column (~50% width) */}
                  <div className="ticket-col-left">
                    <div className="ticket-img-frame">
                      <img
                        src={cImage}
                        alt={`${cName} Marathon`}
                        className="ticket-img"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = chennaiImg; }}
                      />
                      <div className="ticket-badge-pill">
                        <FaPersonRunning />
                        <span>{cBadge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (~50% width) */}
                  <div className="ticket-col-right">
                    <div className="ticket-official-label">
                      OFFICIAL {cName.toUpperCase()} EVENT
                    </div>
                    <h1 className="ticket-city-title">
                      {cName}
                    </h1>

                    <div className="ticket-info-rows">
                      <div className="ticket-info-row">
                        <div className="ticket-row-icon-box">
                          <FaCalendarDays />
                        </div>
                        <div className="ticket-row-texts">
                          <span className="ticket-row-label">RACE DATE</span>
                          <strong className="ticket-row-value">{cDate}</strong>
                        </div>
                      </div>

                      <div className="ticket-info-row">
                        <div className="ticket-row-icon-box">
                          <FaClock />
                        </div>
                        <div className="ticket-row-texts">
                          <span className="ticket-row-label">FLAG-OFF SCHEDULE</span>
                          <strong className="ticket-row-value">{cTimeDisplay}</strong>
                        </div>
                      </div>

                      <div className="ticket-info-row">
                        <div className="ticket-row-icon-box">
                          <FaLocationDot />
                        </div>
                        <div className="ticket-row-texts">
                          <span className="ticket-row-label">STARTING VENUE</span>
                          <strong className="ticket-row-value">{cVenue}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="ticket-register-btn"
                      onClick={() => {
                        localStorage.setItem('selectedCity', city.slug);
                        navigate(`/register/${city.slug}`);
                      }}
                    >
                      <span>Register now</span>
                      <FaArrowRight className="btn-arrow" />
                    </button>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      ) : (
        <>
          {/* Makes the right summary card sticky (left side scrolls alone) */}
          <style>{`
            .registration-page,
            .registration-page .registration-section,
            .registration-page .content-container,
            .registration-page .registration-layout-grid {
              overflow-x: clip !important;
              overflow-y: visible !important;
            }
            .registration-page .registration-layout-grid { align-items: stretch !important; }
            .registration-page .registration-summary-panel { align-self: stretch !important; }
            .registration-page .sticky-summary-card {
              position: sticky !important;
              top: 100px !important;
              max-height: calc(100vh - 120px);
              overflow-y: auto;
            }
            @media (max-width: 991px) {
              .registration-page .sticky-summary-card {
                position: static !important;
                max-height: none;
              }
            }
            @media (max-width: 767px) {
              .registration-page .reg-rail { display: none !important; }
            }
          `}</style>

          {/* Page Header */}
          <section className="page-banner">
            <div className="content-container">
              <div className="page-banner-content">
                <div className="page-badge">
                  <FaIdCard className="page-badge-icon" />
                  <span>Official Runner Portal</span>
                </div>
                <h1 className="page-title">Register for {eventName}</h1>
                <p className="page-subtitle">
                  Secure your official race bibs. Add one or more tickets, then enter each participant's details.
                </p>
              </div>
            </div>
          </section>

          <section className="section registration-section">
            <div className="content-container">
              {isSubmitted ? (
                /* SUCCESS CONFIRMATION */
                <div className="registration-success-wrapper">
                  <div className="registration-success-card">
                    <div className="success-header">
                      <div className="success-icon-wrap large">
                        <FaCircleCheck />
                      </div>
                      <h2 className="success-main-title">Registration Confirmed!</h2>
                      <p className="success-subtitle">
                        {totalTickets} {totalTickets === 1 ? 'participant has' : 'participants have'} been successfully registered.
                      </p>
                    </div>

                    <div className="registration-receipt-box">
                      <div className="receipt-row">
                        <span className="receipt-label">Target Event:</span>
                        <span className="receipt-value">{eventName}</span>
                      </div>

                      {ticketItems.map((item, idx) => {
                        const d = getEffective(item, idx);
                        return (
                          <div key={item.instanceId} className="receipt-row" style={{ alignItems: 'flex-start' }}>
                            <span className="receipt-label">Participant {idx + 1}:</span>
                            <div className="receipt-value multi-categories-receipt">
                              <span className="category-receipt-tag">
                                <strong>{d.fullName}</strong> — {item.pkg.distance} {item.pkg.name} ({inr(amountFor(item.pkg))})
                              </span>
                              <span className="category-receipt-tag">
                                Registration ID: <strong>{registeredRefs[item.instanceId]}</strong>
                              </span>
                              <span className="category-receipt-tag">
                                {d.email} • {d.mobileNumber}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      <div className="receipt-row">
                        <span className="receipt-label">Total Registration Fee:</span>
                        <span className="receipt-value fee-amount">{formattedTotalAmount}</span>
                      </div>
                    </div>

                    <div className="demo-notice-alert">
                      <FaShieldHalved className="alert-icon" />
                      <p>
                        <strong>Registration Verified:</strong> Confirmation details and runner bib pickup instructions have been queued for dispatch. Please present each Registration ID at the expo bib counter.
                      </p>
                    </div>

                    <div className="success-actions">
                      <button type="button" onClick={handleResetForm} className="btn btn-secondary">
                        <span>Register Another Participant</span>
                      </button>
                      <Link to="/events" className="btn btn-primary">
                        <span>Explore More Events</span>
                        <FaArrowRight className="btn-icon" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Top header: back arrow, name, date, timer */}
                  <div style={headerRowStyle}>
                    {step === 'pick' ? (
                      <button
                        type="button"
                        style={backBtnStyle}
                        onClick={() => {
                          // FIX: back arrow goes to the Events page
                          navigate('/events');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        aria-label="Back to events"
                      >
                        <FaArrowLeft />
                      </button>
                    ) : (
                      <button type="button" style={backBtnStyle} onClick={handleBackToPick} aria-label="Back to tickets">
                        <FaArrowLeft />
                      </button>
                    )}
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{eventName}</h2>
                      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.9rem', opacity: 0.85, marginTop: '0.35rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaCalendarDays style={{ color: '#9E1B22' }} /> {eventDate}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaClock style={{ color: '#9E1B22' }} /> {eventTime}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaLocationDot style={{ color: '#9E1B22' }} /> {eventVenue}
                        </span>
                      </div>
                    </div>
                    {step === 'details' && (
                      <span style={timerBadgeStyle}>
                        <FaClock /> Time Left: {formatTimer(secondsLeft)}
                      </span>
                    )}
                  </div>

                  <div className="registration-layout-grid">
                    {/* Left Column */}
                    <div className="registration-form-panel">
                      {step === 'pick' ? (
                        /* ───── STEP 1: PICK TICKETS ───── */
                        <div>
                          {timeUp && (
                            <div
                              style={{
                                marginBottom: '1rem',
                                padding: '0.85rem 1.1rem',
                                background: '#FEF2F2',
                                border: '1px solid #F87171',
                                borderRadius: '10px',
                                color: '#991B1B',
                                fontSize: '0.92rem'
                              }}
                            >
                              Your time ran out. Please click <strong>Proceed</strong> again to continue (your entered details are saved).
                            </div>
                          )}

                          <h3 className="form-section-title" style={{ marginBottom: '1rem' }}>
                            <span className="section-number-pill">1</span> Pick Tickets
                          </h3>

                          {/* FIX: only the categories offered by this city */}
                          {visiblePackages.map((pkg) => {
                            const qty = ticketQuantities[pkg.id] || 0;
                            const isAdded = qty > 0;
                            return (
                              <div key={pkg.id} style={ticketCardStyle}>
                                <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                    {pkg.distance} — {pkg.name}
                                  </div>
                                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.88rem', lineHeight: 1.5, opacity: 0.85 }}>
                                    {pkg.description}
                                  </p>
                                  {pkg.includes && pkg.includes.length > 0 && (
                                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', opacity: 0.7 }}>
                                      <strong>Includes:</strong> {pkg.includes.join(' • ')}
                                    </p>
                                  )}
                                  <div style={{ marginTop: '0.75rem', fontSize: '1.4rem', fontWeight: 700 }}>
                                    {pkg.formattedPrice}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  {isAdded ? (
                                    <>
                                      <button
                                        type="button"
                                        style={roundBtnStyle(false)}
                                        onClick={() => handleDecreaseQuantity(pkg.id)}
                                        aria-label={`Decrease quantity for ${pkg.name}`}
                                      >
                                        −
                                      </button>
                                      <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center', fontSize: '1rem' }}>
                                        {qty}
                                      </span>
                                      <button
                                        type="button"
                                        style={roundBtnStyle(false)}
                                        onClick={() => handleIncreaseQuantity(pkg.id)}
                                        aria-label={`Increase quantity for ${pkg.name}`}
                                      >
                                        +
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      style={{ minWidth: '96px', justifyContent: 'center' }}
                                      onClick={() => handleIncreaseQuantity(pkg.id)}
                                    >
                                      <span>Add</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* ───── STEP 2: PARTICIPANT DETAILS ───── */
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'stretch' }}>
                          <div className="reg-rail" style={railStyle}>
                            <button
                              type="button"
                              onClick={handleBackToPick}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <span style={railCircleStyle(true)}><FaCheck /></span>
                              <span>Pick Tickets</span>
                            </button>
                            <div style={railLineStyle} />
                            <span style={railCircleStyle(false)}>2</span>
                            <span>Attendee Details</span>
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <form className="site-form" onSubmit={handleSubmit} noValidate>

                              {ticketItems.map((item, idx) => renderParticipant(item, idx))}

                              {submitError && (
                                <div
                                  style={{
                                    marginBottom: '1.25rem',
                                    padding: '0.85rem 1.15rem',
                                    backgroundColor: '#FEF2F2',
                                    border: '1px solid #F87171',
                                    borderRadius: '8px',
                                    color: '#991B1B',
                                    fontSize: '0.92rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.65rem'
                                  }}
                                >
                                  <FaCircleExclamation style={{ flexShrink: 0 }} />
                                  <span>{submitError}</span>
                                </div>
                              )}

                              <button
                                type="submit"
                                className="btn btn-primary btn-block btn-large submit-reg-btn"
                                disabled={isSubmitting}
                              >
                                <span>{isSubmitting ? 'PROCESSING REGISTRATION...' : `COMPLETE REGISTRATION (${formattedTotalAmount})`}</span>
                                <FaArrowRight className="btn-icon" />
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Sticky Ticket Summary */}
                    <div className="registration-summary-panel">
                      {renderSummary()}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}