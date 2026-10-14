import React from 'react';
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
  FaUserPlus
} from 'react-icons/fa6';
import { RACE_PACKAGES, UPCOMING_EVENTS } from '../data/marathonData';

export default function Home() {
  const navigate = useNavigate();

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
                src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1000&q=80"
                alt="Marathon Runner in action"
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
              <div className="stat-number">5+</div>
              <div className="stat-label">Cities</div>
              <span className="stat-note">(Across South India)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: UPCOMING EVENTS */}
      <section className="section section-upcoming-events">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Scheduled Races</span>
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">
              Join spirited morning marathons designed for every runner and experience level.
            </p>
          </div>

          <div className="events-grid">
            {UPCOMING_EVENTS.slice(0, 3).map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-image-wrap">
                  <img src={event.image} alt={event.name} className="event-card-img" />
                  <span className="event-city-badge">{event.city}</span>
                </div>
                <div className="event-card-body">
                  <h3 className="event-card-title">{event.name}</h3>
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

          <div className="section-footer-cta">
            <Link to="/events" className="btn btn-outline">
              <span>View All Events</span>
              <FaArrowRight className="btn-icon" />
            </Link>
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
              <p className="step-card-desc">Find upcoming marathon dates in Chennai, Bengaluru, and beyond.</p>
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
    </div>
  );
}
