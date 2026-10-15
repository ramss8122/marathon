import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaPersonRunning,
  FaEye,
  FaBullseye,
  FaHandshakeAngle,
  FaHeartPulse,
  FaShieldHalved,
  FaUsers,
  FaArrowRight,
  FaLocationDot,
  FaCircleCheck,
  FaLightbulb,
  FaCircleInfo
} from 'react-icons/fa6';

// Running / community image for the "Built by the Community" banner.
// Swap this URL (or use a local image like '/images/community-run.jpg' from /public) if you want a different photo.
const COMMUNITY_IMG =
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=700&q=80';

export default function About() {
  const values = [
    {
      icon: <FaHandshakeAngle />,
      title: 'Community First',
      desc: 'Every event is built around bringing people together — friends, families, and first-time runners all belong here.'
    },
    {
      icon: <FaShieldHalved />,
      title: 'Trust & Transparency',
      desc: 'We publish clear registration fees, open event policies, and no hidden charges. What you see is what you get.'
    },
    {
      icon: <FaHeartPulse />,
      title: 'Health & Wellness',
      desc: 'Running is our medium — but promoting a sustained, active lifestyle for every Indian is our mission.'
    },
    {
      icon: <FaLightbulb />,
      title: 'Inclusive Participation',
      desc: 'From 1K walks to 21K half marathons, we design events that welcome all ages, paces, and fitness levels.'
    }
  ];

  return (
    <div className="page-wrapper about-page">
      {/* Button + image fixes for the dark "Built by the Community" banner */}
      <style>{`
        .about-team-banner .team-btn-outline {
          background: transparent !important;
          color: #ffffff !important;
          border: 2px solid rgba(255, 255, 255, 0.85) !important;
        }
        .about-team-banner .team-btn-outline:hover {
          background: #ffffff !important;
          color: #111111 !important;
        }
        .about-team-banner .about-team-img {
          width: 100%;
          height: 100%;
          min-height: 280px;
          object-fit: cover;
          border-radius: 16px;
        }
      `}</style>

      {/* ── FULL-SCREEN HERO ── */}
      <section className="page-hero">
        {/* Marathon background image overlay */}
        <div
          className="page-hero-bg"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1600&q=80')"
          }}
        />

        <div className="page-hero-inner">
          {/* LEFT: Content */}
          <div className="page-hero-content">
            <div className="page-hero-badge">
              <FaPersonRunning />
              <span>Our Story</span>
            </div>
            <h1 className="page-hero-title">
              About <span>INDIA</span><br />RUNTRUST
            </h1>
            <p className="page-hero-subtitle">
              A community-driven running organisation connecting passionate runners in Chennai through transparent, inclusive, and memorable race experiences.
            </p>
            <div className="page-hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>Register Now</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/events" className="btn btn-outline btn-large">
                <span>View Events</span>
              </Link>
            </div>
            <div className="page-hero-highlights">
              <span className="page-hero-highlight"><FaCircleCheck /> Community-Driven Events</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Active in Chennai</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Zero Hidden Fees</span>
            </div>
          </div>

          {/* RIGHT: Image */}
          <div className="page-hero-image-wrap">
            <div className="page-hero-stat-card">
              <span className="stat-num">500+</span>
              <span className="stat-label">Runners</span>
            </div>
            <div className="page-hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?auto=format&fit=crop&w=800&q=80"
                alt="INDIA RUNTRUST runners at the start line"
                className="page-hero-img"
              />
              <div className="page-hero-img-caption">
                <FaLocationDot /> Chennai Marathon 2024
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* WHO WE ARE */}
      <section className="section about-intro-section">
        <div className="content-container">
          <div className="about-split-layout">
            <div className="about-split-text">
              <span className="section-eyebrow">Who We Are</span>
              <h2 className="section-title" style={{ textAlign: 'left' }}>
                Runners Organising for Runners
              </h2>
              <p className="about-body-text">
                INDIA RUNTRUST was founded on the simple belief that running is for everyone. We are a growing
                organisation of passionate volunteers, fitness enthusiasts, and community leaders working together to
                bring world-class running events to Chennai.
              </p>
              <p className="about-body-text">
                Our events are designed to be safe, transparent, and memorable — with clearly published registration
                fees, well-mapped routes, and dedicated support teams on every course.
              </p>
              <div className="about-cities-row">
                <span className="about-cities-label">
                  <FaLocationDot className="about-cities-icon" /> Currently Active In:
                </span>
                <div className="about-city-tags">
                  <span className="about-city-tag">Chennai</span>
                </div>
              </div>
            </div>

            <div className="about-split-image">
              <img
                src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80"
                alt="Runners participating in a marathon"
                className="about-feature-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="section about-mission-section bg-surface">
        <div className="content-container">
          <div className="mission-vision-grid">
            <div className="mv-card mv-card-mission">
              <div className="mv-icon-wrap">
                <FaBullseye />
              </div>
              <h3 className="mv-title">Our Mission</h3>
              <p className="mv-text">
                To organise accessible, transparent, and community-focused running events that inspire Indians
                of every age and background to embrace an active lifestyle — one stride at a time.
              </p>
            </div>

            <div className="mv-card mv-card-vision">
              <div className="mv-icon-wrap">
                <FaEye />
              </div>
              <h3 className="mv-title">Our Vision</h3>
              <p className="mv-text">
                To be India's most trusted grassroots running platform — where every participant feels welcomed,
                every finish line feels meaningful, and every city has a thriving running community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OUR VALUES */}
      <section className="section about-values-section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">What Drives Us</span>
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">
              Every decision we make is guided by these four principles.
            </p>
          </div>

          <div className="values-grid">
            {values.map((val, idx) => (
              <div key={idx} className="value-card">
                <div className="value-icon-box">{val.icon}</div>
                <h3 className="value-title">{val.title}</h3>
                <p className="value-desc">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="section about-offer-section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">What We Provide</span>
            <h2 className="section-title">A Complete Runner Experience</h2>
            <p className="section-subtitle">
              From registration to the finish line, every touchpoint is crafted with care.
            </p>
          </div>

          <div className="offer-list-grid">
            {[
              'Distances for all levels: 1K, 3K, 5K, 10K, and 21K',
              'Clearly published registration fees — no surprises',
              'On-course hydration stations and medical support',
              'Timing chips and official digital race certificates',
              'Finisher medals and technical runner kits',
              'Beginner-friendly warm-up sessions and pace guidance',
              'Community cheering zones and event photography',
              'Transparent draft policies and open communications'
            ].map((item, idx) => (
              <div key={idx} className="offer-list-item">
                <FaCircleCheck className="offer-check-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM / COMMUNITY NOTE */}
      <section className="section about-team-section">
        <div className="content-container">
          <div className="about-team-banner">
            <div className="about-team-text">
              <div className="about-team-icon-wrap">
                <FaUsers />
              </div>
              <h2 className="about-team-title">Built by the Community, for the Community</h2>
              <p className="about-team-desc">
                INDIA RUNTRUST is powered by a team of volunteer coordinators, medical professionals,
                pace guides, and logistics partners who believe running can bring cities closer together.
                We are always looking to collaborate with like-minded individuals and organisations.
              </p>
              <div className="about-team-actions">
                <Link to="/register" className="btn btn-primary">
                  <span>Register Now</span>
                  <FaArrowRight className="btn-icon" />
                </Link>
                <Link to="/contact" className="btn team-btn-outline">
                  <span>Get in Touch</span>
                  <FaArrowRight className="btn-icon" />
                </Link>
              </div>
            </div>
            <div className="about-team-image-wrap">
              <img
                src={COMMUNITY_IMG}
                alt="INDIA RUNTRUST community runners"
                className="about-team-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section about-cta-section bg-surface">
        <div className="content-container">
          <div className="final-cta-card">
            <h2 className="final-cta-title">Ready to Run With Us?</h2>
            <p className="final-cta-desc">
              Join hundreds of runners across Chennai. Register for our next event and be part of the INDIA RUNTRUST story.
            </p>
            <div className="final-cta-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>REGISTER NOW</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/community" className="btn btn-outline btn-large">
                <span>Meet the Community</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}