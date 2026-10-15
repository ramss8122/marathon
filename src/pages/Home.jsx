import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPersonRunning,
  FaCalendarDays,
  FaLocationDot,
  FaArrowRight,
  FaUsers,
  FaHeartPulse,
  FaShieldHalved,
  FaCircleCheck,
  FaRoute,
  FaTrophy,
  FaUserPlus,
  FaArrowsRotate,
  FaCircleExclamation
} from 'react-icons/fa6';
import { RACE_PACKAGES, UPCOMING_EVENTS } from '../data/marathonData';

// ⬇️ PASTE your marathon image link here.
// Find one at https://unsplash.com/s/photos/marathon → right-click image → "Copy image address"
// Tip: add ?auto=format&fit=crop&w=1200&q=80 at the end of the URL for faster loading.
const HERO_IMAGE_URL = 'https://unsplash.com/photos/ttbCwN_mWic/download?force=true&w=1200';
// Photo page: https://unsplash.com/photos/grayscale-photo-of-people-during-marathon-ttbCwN_mWic
// Other options (swap the ID before /download):
//   4oK5BlObZXg  (group running on road, daytime)
//   wQNHTxEhIr8  (grayscale, men running a marathon)

export default function Home() {
  const navigate = useNavigate();

  // ── DYNAMIC LIVE DATABASE STATS (TRANSPARENCY) ──
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/transparency/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
          setLastUpdated(new Date(json.updatedAt || Date.now()).toLocaleTimeString());
          setStatsError(null);
        } else {
          setStatsError(json.message || 'Live statistics unavailable.');
          setStats(null);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        setStatsError(errJson.message || 'Live database statistics currently unavailable.');
        setStats(null);
      }
    } catch {
      setStatsError('Backend server is offline. Live statistics unavailable.');
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Periodically sync every 12 seconds with MongoDB database
    const timer = setInterval(fetchStats, 12000);
    return () => clearInterval(timer);
  }, [fetchStats]);

  // Show only Chennai events in the Upcoming Events section
  const chennaiEvents = UPCOMING_EVENTS.filter((event) =>
    `${event.city} ${event.location}`.toLowerCase().includes('chennai')
  );

  const handleRegisterPackage = (packageId) => {
    navigate(`/register?package=${packageId}`);
  };

  return (
    <div className="page-wrapper home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg-layer" aria-hidden="true"></div>
        <div className="hero-overlay" aria-hidden="true"></div>
        <div className="content-container hero-container">
          {/* LEFT SIDE CONTENT */}
          <div className="hero-content">
            <div className="hero-badge">
              <FaPersonRunning className="hero-badge-icon" />
              <span>INDIA RUNTRUST</span>
            </div>

            <h1 className="hero-title">Run Together. Make an Impact.</h1>

            <p className="hero-description">
              Discover running events, embrace fitness, and become part of a stronger community.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary hero-btn">
                <span>REGISTER NOW</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/events" className="btn btn-secondary hero-btn">
                <span>EXPLORE EVENTS</span>
                <FaArrowRight className="btn-icon" />
              </Link>
            </div>

            {/* Quick Hero Highlights */}
            <div className="hero-highlights">
              <div className="hero-highlight-item">
                <span className="highlight-val">42.2K</span>
                <span className="highlight-lbl">Certified Routes</span>
              </div>
              <div className="hero-highlight-divider" aria-hidden="true"></div>
              <div className="hero-highlight-item">
                <span className="highlight-val">5,000+</span>
                <span className="highlight-lbl">Active Runners</span>
              </div>
              <div className="hero-highlight-divider" aria-hidden="true"></div>
              <div className="hero-highlight-item">
                <span className="highlight-val">100%</span>
                <span className="highlight-lbl">Charity Driven</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="hero-visual-wrap">
            <div className="hero-image-frame">
              <img
                src={HERO_IMAGE_URL}
                alt="Marathon runners on a road race"
                className="hero-runner-img"
              />
    
              <div className="hero-card-glow" aria-hidden="true"></div>

              {/* Floating Status Badges */}
              <div className="hero-floating-card hero-floating-card-top">
                <div className="floating-card-icon">
                  <FaPersonRunning />
                </div>
                <div className="floating-card-text">
                  <span className="floating-card-title">Season 2026</span>
                  <span className="floating-card-sub">Registrations Open</span>
                </div>
              </div>

              <div className="hero-floating-card hero-floating-card-bottom">
                <div className="hero-pulse-dot" aria-hidden="true"></div>
                <div className="floating-card-text">
                  <span className="floating-card-title">Next Race: 15 Nov</span>
                  <span className="floating-card-sub">Chennai Coastal 21K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="content-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap">
                <FaUsers />
              </div>
              <div className="stat-number">500+</div>
              <div className="stat-label">Participants</div>
              <span className="stat-note">(Sample Estimate)</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap">
                <FaCalendarDays />
              </div>
              <div className="stat-number">10+</div>
              <div className="stat-label">Events</div>
              <span className="stat-note">(Planned Schedule)</span>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap">
                <FaLocationDot />
              </div>
              <div className="stat-number">1</div>
              <div className="stat-label">City</div>
              <span className="stat-note">(Chennai)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: UPCOMING EVENTS */}
      <section className="section section-upcoming-events">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Scheduled Races</span>
           
            <p className="section-subtitle">
              Join spirited morning marathons designed for every runner and experience level.
            </p>
          </div>

          {chennaiEvents.length === 0 && (
            <p className="section-subtitle">
              No Chennai events are scheduled right now. Please check back soon.
            </p>
          )}

          <div className="events-grid">
            {chennaiEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-image-wrap">
                  <img src={event.image} alt={event.name} className="event-card-img" />
                  <span className="event-city-badge">{event.city}</span>
                </div>
                <div className="event-card-body">
                  <h3 className="event-card-title">Chennai</h3>
                  <div className="event-meta-list">
                    <div className="event-meta-item">
                      <FaCalendarDays className="event-meta-icon" />
                      <span>{event.date}</span>
                    </div>
                    <div className="event-meta-item">
                      <FaLocationDot className="event-meta-icon" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="event-distances-tags">
                    {event.distances.map((dist) => (
                      <span key={dist} className="distance-tag">{dist}</span>
                    ))}
                  </div>
                  <p className="event-card-desc">{event.description}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/register?event=${event.id}`)}
                    className="btn btn-primary btn-block event-btn"
                  >
                    <span>Register Now</span>
                    <FaArrowRight className="btn-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          
        </div>
      </section>

      {/* SECTION 2: CHOOSE YOUR RACE */}
      <section className="section section-packages bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Race Categories</span>
            <h2 className="section-title">Choose Your Race</h2>
            <p className="section-subtitle">
              Select your ideal challenge with transparent pricing and official finisher perks.
            </p>
          </div>

          <div className="packages-grid">
            {RACE_PACKAGES.map((pkg) => (
              <div key={pkg.id} className="package-card">
                <div className="package-card-header">
                  <span className="package-distance-badge">{pkg.distance}</span>
                  <h3 className="package-title">{pkg.name}</h3>
                  <div className="package-price-wrap">
                    <span className="package-price">{pkg.formattedPrice}</span>
                    <span className="package-fee-note">per runner</span>
                  </div>
                </div>
                <p className="package-desc">{pkg.description}</p>
                <ul className="package-perks-list">
                  {pkg.includes.map((perk, idx) => (
                    <li key={idx} className="package-perk-item">
                      <FaCircleCheck className="perk-check-icon" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleRegisterPackage(pkg.id)}
                  className="btn btn-primary btn-block package-btn"
                >
                  <span>Register Now</span>
                  <FaArrowRight className="btn-icon" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="section section-how-it-works">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Seamless Experience</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Four quick checkpoints from finding your event to crossing the finish line.
            </p>
          </div>

          <div className="steps-compact-grid">
            <div className="step-compact-card">
              <div className="step-num">1</div>
              <div className="step-icon-wrap"><FaRoute /></div>
              <h3 className="step-card-title">Explore Events</h3>
              <p className="step-card-desc">Find upcoming marathon dates in Chennai.</p>
            </div>

            <div className="step-compact-card">
              <div className="step-num">2</div>
              <div className="step-icon-wrap"><FaPersonRunning /></div>
              <h3 className="step-card-title">Choose Distance</h3>
              <p className="step-card-desc">Select 1K, 3K, 5K, 10K, or 21K matched to your endurance level.</p>
            </div>

            <div className="step-compact-card">
              <div className="step-num">3</div>
              <div className="step-icon-wrap"><FaUserPlus /></div>
              <h3 className="step-card-title">Register Online</h3>
              <p className="step-card-desc">Fill in your runner details and receive instant confirmation.</p>
            </div>

            <div className="step-compact-card">
              <div className="step-num">4</div>
              <div className="step-icon-wrap"><FaTrophy /></div>
              <h3 className="step-card-title">Run & Celebrate</h3>
              <p className="step-card-desc">Collect your race bib, hit the road, and earn your finisher medal.</p>
            </div>
          </div>

          <div className="section-footer-cta">
            <Link to="/how-it-works" className="btn btn-outline">
              <span>View All 6 Steps</span>
              <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: OUR IMPACT */}
      <section className="section section-impact bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Purposeful Movement</span>
            <h2 className="section-title">Our Impact</h2>
            <p className="section-subtitle">
              Building lasting wellness habits and strengthening community bonds with each mile.
            </p>
          </div>

          <div className="impact-triad-grid">
            <div className="impact-card">
              <div className="impact-icon-wrap"><FaHeartPulse /></div>
              <h3 className="impact-card-title">Healthy Living</h3>
              <p className="impact-card-desc">
                Inspiring everyday athletes of all generations to embrace aerobic health and vitality.
              </p>
            </div>

            <div className="impact-card">
              <div className="impact-icon-wrap"><FaUsers /></div>
              <h3 className="impact-card-title">Community Unity</h3>
              <p className="impact-card-desc">
                Bringing friends, families, and neighborhood running groups together with shared cheer.
              </p>
            </div>

            <div className="impact-card">
              <div className="impact-icon-wrap"><FaShieldHalved /></div>
              <h3 className="impact-card-title">Trust & Transparency</h3>
              <p className="impact-card-desc">
                Maintaining clear race operations, open guidelines, and dedicated on-ground safety.
              </p>
            </div>
          </div>

          <div className="section-footer-cta">
            <Link to="/impact" className="btn btn-outline">
              <span>Read Impact Stories</span>
              <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6: FINAL REGISTRATION CTA */}
      <section className="section section-final-cta">
        <div className="content-container">
          <div className="final-cta-card">
            <h2 className="final-cta-title">Ready To Lace Up?</h2>
            <p className="final-cta-desc">
              Secure your spot for the next INDIA RUNTRUST event today and take the first stride.
            </p>
            <div className="final-cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>REGISTER NOW</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/contact" className="btn btn-outline btn-large">
                <span>Have Questions? Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: LIVE TRANSPARENCY STATISTICS (IMMEDIATELY ABOVE FOOTER) */}
      <section className="section home-transparency-section" id="transparency-stats">
        <div className="content-container">
          <span className="transparency-eyebrow">OPEN BY DESIGN</span>
          <h2 className="transparency-headline">
            Nothing Hidden.<br />
            Everything Accounted For.
          </h2>
          <p className="transparency-subhead">
            Trust should not depend on a promise. The website makes it easy for runners to understand the initiative, registrations, and verified outcomes.
          </p>

          {/* Database Live Synchronization Status Bar */}
          <div className="transparency-status-bar">
            {statsLoading ? (
              <span className="live-indicator" style={{ color: 'var(--text-muted)' }}>
                <span className="live-indicator-dot" style={{ backgroundColor: '#9CA3AF' }} />
                <span>Connecting to live registration database...</span>
              </span>
            ) : statsError ? (
              <span className="live-indicator" style={{ color: '#DC2626' }}>
                <FaCircleExclamation />
                <span>{statsError}</span>
              </span>
            ) : (
              <span className="live-indicator">
                <span className="live-indicator-dot" />
                <span>Live MongoDB Database Synchronized • Real-Time Participant Ledger</span>
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {lastUpdated && (
                <span className="live-timestamp">Last synced: {lastUpdated}</span>
              )}
              <button
                type="button"
                onClick={fetchStats}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                title="Refresh live counts from database"
              >
                <FaArrowsRotate className={statsLoading ? 'fa-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* 4 DYNAMIC STATISTIC CARDS (MATCHING REFERENCE SCREENSHOT) */}
          <div className="transparency-stats-grid">
            {/* 1. Total Registrations */}
            <div className="transparency-stat-card">
              <div className="transparency-stat-number">
                {statsLoading ? (
                  <span className="stat-loading-pulse">...</span>
                ) : stats ? (
                  stats.totalRegistrations
                ) : (
                  <span style={{ color: '#9CA3AF' }}>--</span>
                )}
              </div>
              <div className="transparency-stat-label">
                Total Registrations
              </div>
              <span className="transparency-stat-sub">
                Total participants registered in database
              </span>
            </div>

            {/* 2. Pending Registrations */}
            <div className="transparency-stat-card">
              <div className="transparency-stat-number">
                {statsLoading ? (
                  <span className="stat-loading-pulse">...</span>
                ) : stats ? (
                  stats.pendingRegistrations
                ) : (
                  <span style={{ color: '#9CA3AF' }}>--</span>
                )}
              </div>
              <div className="transparency-stat-label">
                Pending Registrations
              </div>
              <span className="transparency-stat-sub">
                Registrations awaiting verification
              </span>
            </div>

            {/* 3. Confirmed Registrations */}
            <div className="transparency-stat-card">
              <div className="transparency-stat-number">
                {statsLoading ? (
                  <span className="stat-loading-pulse">...</span>
                ) : stats ? (
                  stats.confirmedRegistrations
                ) : (
                  <span style={{ color: '#9CA3AF' }}>--</span>
                )}
              </div>
              <div className="transparency-stat-label">
                Confirmed Registrations
              </div>
              <span className="transparency-stat-sub">
                Verified participant runner entries
              </span>
            </div>

            {/* 4. Completed Payments */}
            <div className="transparency-stat-card">
              <div className="transparency-stat-number">
                {statsLoading ? (
                  <span className="stat-loading-pulse">...</span>
                ) : stats ? (
                  stats.completedPayments
                ) : (
                  <span style={{ color: '#9CA3AF' }}>--</span>
                )}
              </div>
              <div className="transparency-stat-label">
                Completed Payments
              </div>
              <span className="transparency-stat-sub">
                Successfully verified entrant transactions
              </span>
            </div>
          </div>

          {/* PUBLIC IMPACT LEDGER CARD (MATCHING REFERENCE SCREENSHOT) */}
          <div className="transparency-ledger-card">
            <div className="transparency-ledger-header">
              <h3 className="transparency-ledger-title">Public impact ledger</h3>
              <span className="live-indicator" style={{ fontSize: '0.82rem' }}>
                <span className="live-indicator-dot" /> Live Verified Data Only
              </span>
            </div>
            <p className="transparency-ledger-desc">
              This area is connected directly to our verified runner registration database. Each participant entry, registration status, and verified confirmation is accounted for transparently without manual intervention or hidden figures.
            </p>
            <div className="transparency-ledger-actions">
              <Link to="/transparency" className="btn btn-primary">
                <span>View Full Transparency Policy</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/register" className="btn btn-outline">
                <span>Register as a Runner</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}