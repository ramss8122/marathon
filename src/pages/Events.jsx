import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaLocationDot,
  FaArrowRight,
  FaPersonRunning,
  FaCircleCheck,
  FaMedal,
  FaRoute,
  FaChevronDown,
  FaWater,
  FaKitMedical,
  FaShirt,
  FaAppleWhole,
  FaXmark,
  FaCalendarDays
} from 'react-icons/fa6';
import CityTicketCard from '../components/CityTicketCard';
import CitySelectModal from '../components/CitySelectModal';

export default function Events() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedCategoryModal, setSelectedCategoryModal] = useState(null);

  // ── CITY SELECTION MODAL ──
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null);

  const openCityModal = (category) => {
    setSelectedCategoryForModal(category);
    setCityModalOpen(true);
  };

  // ── DYNAMIC CITIES FETCH ──
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);

  const fetchCities = useCallback(async () => {
    try {
      setCitiesLoading(true);
      const res = await fetch(`/api/cities?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Strictly active cities only
          const activeOnly = json.data.filter(c => (c.status ? c.status === 'active' : c.isActive !== false));
          setCities(activeOnly);
        } else {
          setCities([]);
        }
      } else {
        setCities([]);
      }
    } catch {
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);


  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const categories = [
    {
      id: '1k',
      distance: '1K',
      title: 'Family & Fun Run',
      fee: '₹499',
      tagline: 'Ideal for Beginners & Kids',
      shortDescription: 'A cheerful, un-timed run designed for first-timers, kids, and families seeking an active morning together.',
      cutOff: '30 Minutes',
      minAge: '5+ Years',
      elevation: 'Flat (0m)',
      hydration: '1 Station',
      perks: ['Finisher Medal', 'E-Certificate', 'Breakfast Box', 'Bib (Un-timed)'],
      featured: false
    },
    {
      id: '3k',
      distance: '3K',
      title: 'Health Stride',
      fee: '₹599',
      tagline: 'Step into Regular Running',
      shortDescription: 'Ideal milestone for joggers transitioning into regular running routines with full course cheer zones.',
      cutOff: '45 Minutes',
      minAge: '8+ Years',
      elevation: 'Gentle (<10m)',
      hydration: '2 Stations',
      perks: ['RFID Timing Bib', 'Finisher Medal', 'E-Certificate', 'Refreshment Pack'],
      featured: false
    },
    {
      id: '5k',
      distance: '5K',
      title: 'Classic Fitness Run',
      fee: '₹699',
      tagline: 'The Popular Community Stride',
      shortDescription: 'A popular choice for fitness enthusiasts and community groups aiming to test endurance and pace.',
      cutOff: '60 Minutes',
      minAge: '12+ Years',
      elevation: 'Gradual (<15m)',
      hydration: '3 Stations',
      perks: ['Timed RFID Bib', 'Technical Dry-fit T-Shirt', 'Finisher Medal', 'Post-Race Nutrition'],
      featured: true
    },
    {
      id: '10k',
      distance: '10K',
      title: 'Endurance Challenge',
      fee: '₹799',
      tagline: 'Pace, Speed & Stamina',
      shortDescription: 'Targeted for seasoned runners focusing on speed and aerobic conditioning with official timing splits.',
      cutOff: '1 Hour 45 Mins',
      minAge: '15+ Years',
      elevation: 'Rolling Course',
      hydration: '5 Stations',
      perks: ['Official Timing Chip', 'Performance Jersey', 'Heavy Finisher Medal', 'Split Point Tracking'],
      featured: false
    },
    {
      id: '21k',
      distance: '21K',
      title: 'Half Marathon',
      fee: '₹899',
      tagline: 'The Pinnacle Distance Test',
      shortDescription: 'The pinnacle distance challenge featuring pacing pacers, energy stations, and comprehensive recovery facilities.',
      cutOff: '3 Hours 30 Mins',
      minAge: '18+ Years',
      elevation: 'Certified Course',
      hydration: '10 Stations',
      perks: ['Certified Timing Bib', 'Premium Runner Jersey', 'Heavy Finisher Medal', 'Recovery Zone Access'],
      featured: true
    }
  ];

  const raceSchedule = [
    { time: '04:30 AM', title: 'Gates & Baggage Open', desc: 'Venue gates unlock, security check-in, and token-based baggage drop counters open.' },
    { time: '05:00 AM', title: 'Zesty Pre-Race Warm-up', desc: 'Energetic aerobics and dynamic stretching led by certified fitness coaches.' },
    { time: '05:30 AM', title: '21K Half Marathon Flag-off', desc: 'Half marathoners commence race with pacers across multiple pace buses.' },
    { time: '06:00 AM', title: '10K Challenge Flag-off', desc: '10K runners take off under morning daylight with electronic timing mat splits.' },
    { time: '06:30 AM', title: '5K & 3K Stride Flag-off', desc: 'Fitness enthusiasts and youth runners take the central scenic route.' },
    { time: '07:00 AM', title: '1K Family Fun Run Flag-off', desc: 'Children, parents, and seniors start their celebratory walk-and-run.' },
    { time: '08:00 AM', title: 'Podium & Trophy Ceremony', desc: 'Age category winners, overall champions, and inspiring community heroes awarded.' },
    { time: '08:30 AM', title: 'Hot Breakfast & Photo Zone', desc: 'Wholesome nutritious breakfast served, finisher photo backdrops open.' }
  ];

  const courseAmenities = [
    {
      icon: <FaWater />,
      title: 'Hydration & Electrolytes',
      desc: 'Pure RO water and Enerzal electrolyte drinks available every 1.5 km in 100% recyclable paper cups.'
    },
    {
      icon: <FaKitMedical />,
      title: 'Mobile Medical & Ambulances',
      desc: 'Paramedic rapid-response bike units and Basic Life Support (BLS) ambulances positioned on route.'
    },
    {
      icon: <FaRoute />,
      title: 'Certified RFID Timing Mats',
      desc: 'Precision electronic split-timing mats at Start, Turnaround points, and Finish for certified timing.'
    },
    {
      icon: <FaShirt />,
      title: 'Baggage & Locker Counters',
      desc: 'Secure tag-and-token baggage holding counters monitored by our dedicated event marshals.'
    },
    {
      icon: <FaAppleWhole />,
      title: 'Post-Race Nutrition Box',
      desc: 'Wholesome breakfast box including fresh bananas, energy bars, and high-protein South Indian breakfast.'
    },
    {
      icon: <FaMedal />,
      title: 'Heavy Cast Finisher Medals',
      desc: 'Exclusive high-relief metal finisher medals awarded at the finish arch to every proud finisher.'
    }
  ];

  const faqs = [
    {
      q: 'Where and when do I collect my runner kit & bib number?',
      a: 'Runner kits are distributed at the official Expo held 2 days prior to each race (Friday and Saturday, 10:00 AM to 6:00 PM). Venue locations are emailed to registered runners 1 week before the event.'
    },
    {
      q: 'Can a family member or friend collect my bib on my behalf?',
      a: 'Yes! They need to bring a signed authorization letter or a copy of your Registration Confirmation Email along with a photocopy/screenshot of your Government Photo ID.'
    },
    {
      q: 'Are there strict cut-off times for each category?',
      a: 'Yes, to reopen traffic lanes safely: 21K cut-off is 3h 30m; 10K is 1h 45m; 5K is 60m. Sweeper vehicles follow the course with hydration and medical support for runners unable to complete in time.'
    },
    {
      q: 'Is vehicle parking available at the marathon venues?',
      a: 'Designated participant parking is arranged near the start venue. However, spaces fill quickly, so we strongly recommend carpooling or arriving by 4:30 AM.'
    },
    {
      q: 'When will the official timing certificates and photos be available?',
      a: 'Provisional results are published online by 12:00 PM on race day. Official e-certificates and high-resolution downloadable race photos tagged by your Bib Number are available within 24 hours.'
    }
  ];

  // Register button alignment - inline styles (CSS file touch panna vendam)
  const actionsRowStyle = {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: 'auto',
    paddingTop: '1.25rem',
    boxSizing: 'border-box'
  };

  const registerBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    textAlign: 'center'
  };

  return (
    <div className="page-wrapper events-page">

      {/* ── FULL-SCREEN HERO ── */}
      <section className="page-hero">
        <div
          className="page-hero-bg"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1600&q=80')"
          }}
        />
        <div className="page-hero-inner">
          {/* LEFT */}
          <div className="page-hero-content">
            <div className="page-hero-badge">
              <FaPersonRunning />
              <span>Official Event Calendar</span>
            </div>
            <h1 className="page-hero-title">
              Find Your <span>Next</span><br />Run
            </h1>
            <p className="page-hero-subtitle">
              Join upcoming community running events in Chennai — 1K, 3K, 5K, 10K &amp; 21K categories available
            </p>
            <div className="page-hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>Register Now</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <a href="#schedule" className="btn btn-outline btn-large">
                <span>View Race Schedule</span>
              </a>
            </div>
            <div className="page-hero-highlights">
              <span className="page-hero-highlight"><FaCircleCheck /> 5 Distances</span>
              <span className="page-hero-highlight"><FaCircleCheck /> RFID Timed</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Finisher Medals</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="page-hero-image-wrap">
            <div className="page-hero-stat-card">
              <span className="stat-num">10+</span>
              <span className="stat-label">Events Planned</span>
            </div>
            <div className="page-hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80"
                alt="Group of runners participating in a marathon"
                className="about-feature-img"
              />
              
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS LIST (Chennai only) ── */}
      <section className="section events-list-section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Upcoming Runs</span>
            <h2 className="section-title">Our Race Services</h2>
            <p className="section-subtitle">
              Carefully scouted routes with tree-lined boulevards, waterfront paths, and full runner hydration facilities.
            </p>
          </div>

          {citiesLoading ? (
            <div className="ctc-grid">
              {[1, 2, 3].map((n) => (
                <div key={n} className="ctc-skeleton">
                  <div className="ctc-skeleton-img" />
                  <div className="ctc-skeleton-body">
                    <div className="ctc-skeleton-line" style={{ width: '50%' }} />
                    <div className="ctc-skeleton-line" style={{ width: '75%', height: '24px' }} />
                    <div className="ctc-skeleton-line" style={{ width: '85%' }} />
                    <div className="ctc-skeleton-line" style={{ width: '70%' }} />
                    <div className="ctc-skeleton-line" style={{ width: '80%' }} />
                    <div className="ctc-skeleton-btn" />
                  </div>
                </div>
              ))}
            </div>
          ) : cities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--bg-card, #ffffff)', borderRadius: '12px', border: '1px dashed #cbd5e1', margin: '1rem 0' }}>
              <FaLocationDot style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                New cities coming soon
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto' }}>
                We are actively coordinating with city sports councils to bring RUNTRUST marathons to more locations. Check back soon for new race announcements!
              </p>
            </div>
          ) : (
            <div className="ctc-grid">
              {cities.map((city) => (
                <CityTicketCard key={city._id || city.slug || city.name} city={city} />
              ))}
            </div>
          )}


          <div className="sample-disclaimer-box" style={{ marginTop: '2.5rem' }}>
            <p>
              * Note: Flag-off schedules and courses are finalized in collaboration with city traffic police and municipal sports authorities.
            </p>
          </div>
        </div>
      </section>

      {/* ── DISTANCE CATEGORIES (Register buttons only) ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Distance Matrix</span>
            <h2 className="section-title">Choose Your Race Category</h2>
            <p className="section-subtitle">
              From first-time walkers to seasoned marathoners, we have a certified course designed for your fitness goal.
            </p>
          </div>

          <div className="category-matrix-grid">
            {categories.map((cat) => (
              <div
                key={cat.distance}
                className={`category-matrix-card ${cat.featured ? 'featured' : ''}`}
                style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}
              >
                <div className="category-matrix-head">
                  <span className="category-matrix-badge">{cat.distance} Race</span>
                  <span className="category-fee-badge">{cat.fee}</span>
                </div>

                <h3 className="category-matrix-title">{cat.title}</h3>
                <p className="category-matrix-subtitle">{cat.tagline}</p>
                <p className="category-short-desc">{cat.shortDescription}</p>

                <div className="category-matrix-specs">
                  <div className="category-matrix-spec">
                    <span className="spec-label">Cut-off Time</span>
                    <span className="spec-value">{cat.cutOff}</span>
                  </div>
                  <div className="category-matrix-spec">
                    <span className="spec-label">Age Eligibility</span>
                    <span className="spec-value">{cat.minAge}</span>
                  </div>
                  <div className="category-matrix-spec">
                    <span className="spec-label">Elevation</span>
                    <span className="spec-value">{cat.elevation}</span>
                  </div>
                  <div className="category-matrix-spec">
                    <span className="spec-label">Hydration Points</span>
                    <span className="spec-value">{cat.hydration}</span>
                  </div>
                </div>

                <div className="category-matrix-perks">
                  {cat.perks.map((perk, i) => (
                    <div key={i} className="category-matrix-perk">
                      <FaCircleCheck />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                <div style={actionsRowStyle}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    style={registerBtnStyle}
                    onClick={() => openCityModal(cat)}
                  >
                    <span>Register {cat.distance}</span>
                    <FaArrowRight className="btn-icon" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={registerBtnStyle}
                    onClick={() => setSelectedCategoryModal(cat)}
                  >
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RACE DAY TIMELINE / SCHEDULE ── */}
      <section id="schedule" className="section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Race Day Itinerary</span>
            <h2 className="section-title">Master Flag-Off Schedule</h2>
            <p className="section-subtitle">
              Synchronized race morning timings to ensure smooth crowd movement and optimal runner safety.
            </p>
          </div>

          <div className="schedule-timeline">
            {raceSchedule.map((slot, idx) => (
              <div key={idx} className="schedule-card">
                <div className="schedule-time-box">{slot.time}</div>
                <div className="schedule-info">
                  <h4 className="schedule-title">{slot.title}</h4>
                  <p className="schedule-desc">{slot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ON-COURSE AMENITIES & FACILITIES ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Course Support</span>
            <h2 className="section-title">World-Class On-Course Amenities</h2>
            <p className="section-subtitle">
              Every kilometer is monitored with medical aid, refreshments, and high-energy cheer squads.
            </p>
          </div>

          <div className="amenities-rich-grid">
            {courseAmenities.map((amenity, idx) => (
              <div key={idx} className="amenity-rich-card">
                <div className="amenity-icon-wrap">{amenity.icon}</div>
                <h3 className="amenity-title">{amenity.title}</h3>
                <p className="amenity-desc">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── RACE CATEGORY DETAILS MODAL ── */}
      {selectedCategoryModal && (
        <div className="modal-backdrop" onClick={() => setSelectedCategoryModal(null)}>
          <div
            className="modal-container category-details-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-header-text">
                <span className="modal-badge">{selectedCategoryModal.distance} Official Distance</span>
                <h3 className="modal-title">{selectedCategoryModal.title}</h3>
                <span className="modal-price-tag">{selectedCategoryModal.fee} Registration Fee</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedCategoryModal(null)}
                aria-label="Close modal"
              >
                <FaXmark />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-tagline"><strong>Focus:</strong> {selectedCategoryModal.tagline}</p>
              <p className="modal-description">{selectedCategoryModal.shortDescription}</p>

              <div className="modal-specs-grid">
                <div className="spec-card">
                  <span className="spec-label">Cut-off Time</span>
                  <span className="spec-val">{selectedCategoryModal.cutOff}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-label">Minimum Age</span>
                  <span className="spec-val">{selectedCategoryModal.minAge}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-label">Course Elevation</span>
                  <span className="spec-val">{selectedCategoryModal.elevation}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-label">Hydration Stations</span>
                  <span className="spec-val">{selectedCategoryModal.hydration}</span>
                </div>
              </div>

              <div className="modal-inclusions-section">
                <h4 className="inclusions-head">Package Perks &amp; Finisher Kit</h4>
                <div className="modal-inclusions-list">
                  {selectedCategoryModal.perks.map((perk, i) => (
                    <div key={i} className="modal-perk-item">
                      <FaCircleCheck className="perk-icon" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedCategoryModal(null)}
              >
                <span>Close</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const cat = selectedCategoryModal;
                  setSelectedCategoryModal(null);
                  openCityModal(cat);
                }}
              >
                <span>Continue to Register ({selectedCategoryModal.distance})</span>
                <FaArrowRight className="btn-icon" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHARED CITY SELECTION MODAL ── */}
      <CitySelectModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        category={selectedCategoryForModal}
        initialCities={cities}
      />

    </div>
  );
}