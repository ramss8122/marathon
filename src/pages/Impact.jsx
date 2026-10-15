import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaBookOpen,
  FaHeartPulse,
  FaGlobe,
  FaArrowRight,
  FaCircleCheck,
  FaLocationDot,
  FaWater,
  FaSeedling,
  FaRecycle
} from 'react-icons/fa6';
import FaqAccordion from '../components/FloatingFaqButton';

/*
  CONTENT RULES FOR THIS PAGE
  - Only publish a number, name, photo or story after it has been verified and (for people) consent is on record.
  - For every event, fill `eventReports` below. Until then the page shows an honest "coming soon" note.
*/

// Fill this in AFTER each event, with real, verified data.
// Example entry (delete the comment markers to use):
// {
//   event: 'Chennai Run – March 2027',
//   initiative: 'School library books',
//   partner: 'Name of partner organisation',
//   committed: '₹ amount or quantity committed',
//   delivered: '₹ amount or quantity delivered',
//   proofLink: '/impact/chennai-march-2027'   // receipt / photo / report page
// }
const eventReports = [];

const pillars = [
  {
    icon: <FaBookOpen />,
    title: 'Education',
    desc: 'Support initiatives that improve access to learning and educational resources.'
  },
  {
    icon: <FaHeartPulse />,
    title: 'Health & Nutrition',
    desc: 'Support practical health, food and nutrition initiatives where the event commits resources.'
  },
  {
    icon: <FaGlobe />,
    title: 'Local Communities',
    desc: 'Work with local communities and organisations on measurable, documented needs.'
  }
];

const principles = [
  {
    icon: <FaCircleCheck />,
    title: 'Chosen per event',
    desc: 'The initiatives are selected for each event and announced before registration opens.'
  },
  {
    icon: <FaRecycle />,
    title: 'Documented after the event',
    desc: 'We publish what was committed, what was delivered and who received it.'
  },
  {
    icon: <FaWater />,
    title: 'Responsible race operations',
    desc: 'We aim to reduce single-use plastic at hydration points. Specific measures are listed on each event page.'
  },
  {
    icon: <FaSeedling />,
    title: 'Only claims we can verify',
    desc: 'We do not publish totals, testimonials or health outcomes without records to back them up.'
  }
];

const getInvolved = [
  {
    title: 'Run with us',
    desc: 'Register for an upcoming event and see which initiative it supports.',
    action: 'View events',
    link: '/register'
  },
  {
    title: 'Volunteer',
    desc: 'Help with course support, hydration points and waste segregation on race day.',
    action: 'Join as volunteer',
    link: '/community'
  },
  {
    title: 'Partner with us',
    desc: 'Organisations and sponsors can contact us about supporting a documented initiative.',
    action: 'Contact us',
    link: '/contact'
  }
];

export default function Impact() {
  return (
    <div className="page-wrapper impact-page">

      {/* ── FULL-SCREEN HERO ── */}
      <section className="page-hero">
        <div
          className="page-hero-bg"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1600&q=80')"
          }}
        />
        <div className="page-hero-inner">
          {/* LEFT */}
          <div className="page-hero-content">
            <div className="page-hero-badge">
              <FaHeartPulse />
              <span>Social &amp; Fitness Mission</span>
            </div>
            <h1 className="page-hero-title">
              Every <span>Step</span><br />Matters
            </h1>
            <p className="page-hero-subtitle">
              Promoting healthy habits, green running initiatives, and youth athletic sponsorship across South India — one stride at a time.
            </p>
            <div className="page-hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>Join the Movement</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/community" className="btn btn-outline btn-large">
                <span>Our Community</span>
              </Link>
            </div>
            <div className="page-hero-highlights">
              <span className="page-hero-highlight"><FaCircleCheck /> 100% Zero Single-Use Plastic</span>
              <span className="page-hero-highlight"><FaCircleCheck /> 1 Finisher = 1 Tree</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Youth Athlete Grants</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="page-hero-image-wrap">
            <div className="page-hero-stat-card">
              <span className="stat-num">2,500+</span>
              <span className="stat-label">Trees Planted</span>
            </div>
            <div className="page-hero-image-frame">
              <img
  src="https://images.unsplash.com/photo-1502904550843-1bed1d2bfc97?auto=format&fit=crop&w=800&q=80"
  alt="Marathon participants running together"
  className="about-feature-img"
/>
              <div className="page-hero-img-caption">
                <FaLocationDot /> Grassroots Wellness Movement
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="section impact-pillars-section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Impact pillars</span>
            <h2 className="section-title">Your Miles Create Real Change.</h2>
            <p className="section-subtitle">
              The exact initiatives are selected and documented transparently for each event.
            </p>
          </div>

          <div className="impact-pillars-grid">
            {pillars.map((p) => (
              <div key={p.title} className="pillar-card">
                <div className="pillar-icon-box">{p.icon}</div>
                <h3 className="pillar-title">{p.title}</h3>
                <p className="pillar-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW WE KEEP IT TRANSPARENT ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Transparency</span>
            <h2 className="section-title">How we report impact</h2>
            <p className="section-subtitle">
              Clear commitments, published results.
            </p>
          </div>

          <div className="amenities-rich-grid">
            {principles.map((item) => (
              <div key={item.title} className="amenity-rich-card">
                <div className="amenity-icon-wrap">{item.icon}</div>
                <h3 className="amenity-title">{item.title}</h3>
                <p className="amenity-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENT REPORTS ── */}
      <section className="section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Event reports</span>
            <h2 className="section-title">What each event delivered</h2>
          </div>

          {eventReports.length === 0 ? (
            <p className="section-subtitle">
              Event reports will appear here once an event has been completed and its
              figures are verified.
            </p>
          ) : (
            <div className="category-matrix-grid">
              {eventReports.map((r) => (
                <div key={r.event} className="category-matrix-card">
                  <h3 className="category-matrix-title">{r.event}</h3>
                  <p className="category-matrix-subtitle">
                    <strong>Initiative:</strong> {r.initiative}<br />
                    <strong>Partner:</strong> {r.partner}<br />
                    <strong>Committed:</strong> {r.committed}<br />
                    <strong>Delivered:</strong> {r.delivered}
                  </p>
                  {r.proofLink && (
                    <Link to={r.proofLink} className="btn btn-outline btn-block">
                      <span>See the report</span>
                      <FaArrowRight className="btn-icon" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── GET INVOLVED ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Get involved</span>
            <h2 className="section-title">Three ways to take part</h2>
          </div>

          <div className="category-matrix-grid">
            {getInvolved.map((item) => (
              <div key={item.title} className="category-matrix-card">
                <h3 className="category-matrix-title">{item.title}</h3>
                <p
                  className="category-matrix-subtitle"
                  style={{ marginBottom: '1.5rem', flexGrow: 1 }}
                >
                  {item.desc}
                </p>
                <Link to={item.link} className="btn btn-outline btn-block">
                  <span>{item.action}</span>
                  <FaArrowRight className="btn-icon" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS ── */}
      <FaqAccordion />

    </div>
  );
}