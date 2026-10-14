import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCalendarDays,
  FaLocationDot,
  FaArrowRight,
  FaPersonRunning,
  FaClock,
  FaFilter,
  FaCircleCheck,
  FaMedal,
  FaRoute,
  FaChevronDown,
  FaWater,
  FaKitMedical,
  FaShirt,
  FaAppleWhole
} from 'react-icons/fa6';
import { UPCOMING_EVENTS } from '../data/marathonData';

export default function Events() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('All');
  const [activeFaq, setActiveFaq] = useState(null);

  const cities = ['All', 'Chennai', 'Coimbatore', 'Bengaluru', 'Kochi'];

  const filteredEvents = selectedCity === 'All'
    ? UPCOMING_EVENTS
    : UPCOMING_EVENTS.filter(evt => evt.city.toLowerCase() === selectedCity.toLowerCase());

  const handleRegister = (eventId) => {
    navigate(`/register?event=${eventId}`);
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const categories = [
    {
      distance: '1K',
      title: 'Family & Fun Run',
      tagline: 'Ideal for Beginners & Kids',
      cutOff: '30 Minutes',
      minAge: '5+ Years',
      elevation: 'Flat (0m)',
      hydration: '1 Station',
      perks: ['Finisher Medal', 'E-Certificate', 'Breakfast Box', 'Bib (Un-timed)'],
      featured: false
    },
    {
      distance: '3K',
      title: 'Health Stride',
      tagline: 'Step into Regular Running',
      cutOff: '45 Minutes',
      minAge: '8+ Years',
      elevation: 'Gentle (<10m)',
      hydration: '2 Stations',
      perks: ['RFID Timing Bib', 'Finisher Medal', 'E-Certificate', 'Refreshment Pack'],
      featured: false
    },
    {
      distance: '5K',
      title: 'Classic Fitness Run',
      tagline: 'The Popular Community Stride',
      cutOff: '60 Minutes',
      minAge: '12+ Years',
      elevation: 'Gradual (<15m)',
      hydration: '3 Stations',
      perks: ['Timed RFID Bib', 'Technical Dry-fit T-Shirt', 'Finisher Medal', 'Post-Race Nutrition'],
      featured: true
    },
    {
      distance: '10K',
      title: 'Endurance Challenge',
      tagline: 'Pace, Speed & Stamina',
      cutOff: '1 Hour 45 Mins',
      minAge: '15+ Years',
      elevation: 'Rolling Course',
      hydration: '5 Stations',
      perks: ['Official Timing Chip', 'Performance Jersey', 'Heavy Finisher Medal', 'Split Point Tracking'],
      featured: false
    },
    {
      distance: '21K',
      title: 'Half Marathon',
      tagline: 'The Pinnacle Distance Test',
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
              Join upcoming community running events across South India — 1K, 3K, 5K, 10K &amp; 21K categories available in Chennai, Coimbatore, Bengaluru, and Kochi.
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
              <span className="page-hero-highlight"><FaCircleCheck /> 4 Cities</span>
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
                src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80"
                alt="Marathon event runners"
                className="page-hero-img"
              />
              <div className="page-hero-img-caption">
                <FaLocationDot /> Across South India
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="events-filter-section">
        <div className="content-container">
          <div className="filter-bar">
            <div className="filter-label">
              <FaFilter className="filter-icon" />
              <span>Filter by City:</span>
            </div>
            <div className="filter-pills">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`filter-pill ${selectedCity === city ? 'active' : ''}`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="section events-list-section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Upcoming Runs</span>
            <h2 className="section-title">South India Marathon Series</h2>
            <p className="section-subtitle">
              Carefully scouted routes with tree-lined boulevards, waterfront paths, and full runner hydration facilities.
            </p>
          </div>

          <div className="events-grid">
            {filteredEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-image-wrap">
                  <img src={event.image} alt={event.name} className="event-card-img" />
                  <span className="event-city-badge">{event.city}</span>
                </div>

                <div className="event-card-body">
                  <h2 className="event-card-title">{event.name}</h2>

                  <div className="event-meta-list">
                    <div className="event-meta-item">
                      <FaCalendarDays className="event-meta-icon" />
                      <div>
                        <strong>Date:</strong> {event.date}
                      </div>
                    </div>
                    <div className="event-meta-item">
                      <FaClock className="event-meta-icon" />
                      <div>
                        <strong>Flag-off:</strong> {event.time}
                      </div>
                    </div>
                    <div className="event-meta-item">
                      <FaLocationDot className="event-meta-icon" />
                      <div>
                        <strong>Venue:</strong> {event.location}
                      </div>
                    </div>
                  </div>

                  <div className="event-distances-block">
                    <span className="distances-heading">Available Categories:</span>
                    <div className="event-distances-tags">
                      {event.distances.map((dist) => (
                        <span key={dist} className="distance-tag">{dist}</span>
                      ))}
                    </div>
                  </div>

                  <p className="event-card-desc">{event.description}</p>

                  <div className="event-card-actions">
                    <button
                      type="button"
                      onClick={() => handleRegister(event.id)}
                      className="btn btn-primary btn-block event-btn"
                    >
                      <span>Register for this Event</span>
                      <FaArrowRight className="btn-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="sample-disclaimer-box" style={{ marginTop: '2.5rem' }}>
            <p>
              * Note: Flag-off schedules and courses are finalized in collaboration with city traffic police and municipal sports authorities.
            </p>
          </div>
        </div>
      </section>

      {/* ── DISTANCE CATEGORIES BREAKDOWN ── */}
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
              <div key={cat.distance} className={`category-matrix-card ${cat.featured ? 'featured' : ''}`}>
                <span className="category-matrix-badge">{cat.distance} Race</span>
                <h3 className="category-matrix-title">{cat.title}</h3>
                <p className="category-matrix-subtitle">{cat.tagline}</p>

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

                <Link
                  to={`/register?package=${cat.distance.toLowerCase()}`}
                  className={`btn ${cat.featured ? 'btn-primary' : 'btn-outline'} btn-block`}
                  style={{ marginTop: 'auto' }}
                >
                  <span>Select {cat.distance}</span>
                  <FaArrowRight className="btn-icon" />
                </Link>
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

      {/* ── FAQS ACCORDION ── */}
      <section className="section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Frequently Asked Questions</span>
            <h2 className="section-title">Runner Queries &amp; Event Day Guide</h2>
            <p className="section-subtitle">
              Got questions before registering? Find everything you need right here.
            </p>
          </div>

          <div className="faq-accordion-wrap">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`faq-item ${activeFaq === idx ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                >
                  <span>{faq.q}</span>
                  <FaChevronDown className="faq-arrow" />
                </button>
                {activeFaq === idx && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Callout */}
          <div className="how-it-works-cta-box" style={{ marginTop: '3.5rem' }}>
            <h3 className="cta-box-title">Ready to Experience the Course?</h3>
            <p className="cta-box-desc">
              Bib numbers are allocated on a first-come, first-served basis. Secure your registration today.
            </p>
            <Link to="/register" className="btn btn-primary btn-large">
              <span>REGISTER FOR NEXT EVENT</span>
              <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
