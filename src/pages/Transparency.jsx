import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaShieldHalved,
  FaFileContract,
  FaUserLock,
  FaReceipt,
  FaPhoneVolume,
  FaArrowRight,
  FaCircleCheck,
  FaLocationDot,
  FaKitMedical,
  FaScaleBalanced,
  FaFilePdf,
  FaHeartPulse,
  FaTruckMedical,
  FaWater
} from 'react-icons/fa6';
import { RACE_PACKAGES } from '../data/marathonData';

export default function Transparency() {
  const costBreakdown = [
    {
      percent: '38%',
      title: 'Runner Kit & Finisher Keepsakes',
      desc: 'Technical dry-fit moisture-wicking jersey, custom die-cast metal finisher medal with ribbon, RFID bib tag, and digital certificate systems.'
    },
    {
      percent: '26%',
      title: 'Course Safety, Police & Medical Support',
      desc: 'City traffic police permissions, barricades, signage, stationed BLS ambulances, doctors, paramedic bike units, and safety marshals.'
    },
    {
      percent: '18%',
      title: 'Hydration & Post-Race Nutrition',
      desc: 'Pure RO water stations every 1.5 km, Enerzal electrolyte drinks, bananas, energy bars, and hot, hygienic breakfast boxes.'
    },
    {
      percent: '10%',
      title: 'Eco-Waste & Afforestation Fund',
      desc: 'Compostable cups, post-race waste segregation squads, course cleaning crews, and our "1 Finisher = 1 Tree" plantation initiative.'
    },
    {
      percent: '8%',
      title: 'Timing Tech, Platform & Logistics',
      desc: 'Electronic timing mats, SMS gateways, cloud servers for high-res photo downloads, and customer registration desk.'
    }
  ];

  const safetyProtocols = [
    {
      icon: <FaTruckMedical />,
      title: 'BLS Ambulances on Standby',
      desc: 'Multiple Basic Life Support ambulances positioned strategically at the start, midpoint, and finish line with direct hospital green-corridors.'
    },
    {
      icon: <FaHeartPulse />,
      title: 'Mobile AED Response Patrols',
      desc: 'Paramedic rapid-response bike units equipped with Automated External Defibrillators (AEDs) and trauma kits patrol the runner route continuously.'
    },
    {
      icon: <FaWater />,
      title: 'Standardized Hydration Cadence',
      desc: 'Water stations at exact 1.5 km intervals stocked with mineral water, electrolytes, and cool ice sponges during humid conditions.'
    },
    {
      icon: <FaKitMedical />,
      title: 'Post-Finish Physio Recovery Tent',
      desc: 'Certified sports physiotherapists on site to assist runners with acute muscle cramps, ice therapy, and assisted cooldown stretches.'
    }
  ];

  const policies = [
    {
      icon: <FaReceipt />,
      tag: 'Governance Rule',
      title: 'Pre-Race Course Publication',
      desc: 'Detailed course maps, elevation charts, water station intervals, and emergency exit routes are published at least 14 days before race day.'
    },
    {
      icon: <FaCircleCheck />,
      tag: 'Runner Safety',
      title: 'Strict Bib Non-Transferability',
      desc: 'Bib numbers are strictly non-transferable. Your bib is linked to your blood group and emergency contact details for rapid paramedic intervention.'
    },
    {
      icon: <FaFileContract />,
      tag: 'Cancellation & Rollover',
      title: 'Weather & Force Majeure Rollover',
      desc: 'If an event is rescheduled due to extreme weather or municipal directives, 100% of registrations automatically rollover to the rescheduled date or alternative city run.'
    },
    {
      icon: <FaUserLock />,
      tag: 'Privacy Commitment',
      title: 'Zero Data-Selling Guarantee',
      desc: 'Your personal data (phone, email, age, medical notes) is strictly used for race logistics and emergency contact. We never sell data to commercial advertisers.'
    },
    {
      icon: <FaScaleBalanced />,
      tag: 'Integrity Rule',
      title: 'Checkpoint Split Timing Verification',
      desc: 'Runners must trigger all on-course RFID timing mats. Taking route shortcuts or missing turnaround gates results in immediate forfeiture of official certification.'
    },
    {
      icon: <FaPhoneVolume />,
      tag: 'Support Guarantee',
      title: 'Direct Helpdesk & Grievance Desk',
      desc: 'We resolve ticket modifications, receipt generation, and bib queries within 24 business hours via our dedicated support portal.'
    }
  ];

  const rulebooks = [
    {
      title: 'Official Participant Rulebook 2026',
      type: 'PDF Document • 1.4 MB',
      desc: 'Complete technical regulations, age categories, corral seeding, and prize money guidelines.'
    },
    {
      title: 'Medical Safety & Contingency Protocol',
      type: 'PDF Document • 850 KB',
      desc: 'Paramedic procedures, heat stress management, and ambulance transfer logistics.'
    },
    {
      title: 'Volunteer Charter & Code of Conduct',
      type: 'PDF Document • 620 KB',
      desc: 'Standards of runner respect, emergency reporting protocol, and marshal responsibilities.'
    }
  ];

  return (
    <div className="page-wrapper transparency-page">

      {/* ── FULL-SCREEN HERO ── */}
      <section className="page-hero">
        <div
          className="page-hero-bg"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1620478074574-6d51b03d8a4c?auto=format&fit=crop&w=1600&q=80')"
          }}
        />
        <div className="page-hero-inner">
          {/* LEFT */}
          <div className="page-hero-content">
            <div className="page-hero-badge">
              <FaShieldHalved />
              <span>Operational Clarity</span>
            </div>
            <h1 className="page-hero-title">
              Trust Through<br /><span>Transparency</span>
            </h1>
            <p className="page-hero-subtitle">
              Clear commitments regarding event charges, fund allocation, data privacy, and participant safety standards — zero hidden fees, no surprises.
            </p>
            <div className="page-hero-actions">
              <a href="#pricing-table" className="btn btn-primary btn-large">
                <span>View Standard Fees</span>
                <FaArrowRight className="btn-icon" />
              </a>
              <Link to="/contact" className="btn btn-outline btn-large">
                <span>Contact Organizers</span>
              </Link>
            </div>
            <div className="page-hero-highlights">
              <span className="page-hero-highlight"><FaCircleCheck /> Zero Hidden Checkout Fees</span>
              <span className="page-hero-highlight"><FaCircleCheck /> 100% Data Privacy</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Fair Play Verified</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="page-hero-image-wrap">
            <div className="page-hero-stat-card">
              <span className="stat-num">100%</span>
              <span className="stat-label">Transparent</span>
            </div>
            <div className="page-hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80"
                alt="Transparent marathon operations"
                className="page-hero-img"
              />
              <div className="page-hero-img-caption">
                <FaLocationDot /> Trusted Race Management
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHERE YOUR REGISTRATION FEE GOES ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Fund Utilization</span>
            <h2 className="section-title">Where Does Your Entry Fee Go?</h2>
            <p className="section-subtitle">
              We operate on an open-book ethos. Here is the exact breakdown of how every rupee of your registration is deployed.
            </p>
          </div>

          <div className="cost-breakdown-grid">
            {costBreakdown.map((item, idx) => (
              <div key={idx} className="cost-card">
                <div className="cost-percent">{item.percent}</div>
                <div className="cost-bar">
                  <div className="cost-bar-fill" style={{ width: item.percent }} />
                </div>
                <h3 className="cost-title">{item.title}</h3>
                <p className="cost-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 1: REGISTRATION FEES TABLE ── */}
      <section id="pricing-table" className="section transparency-section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Standardized Pricing</span>
            <h2 className="section-title">Official Registration Fees</h2>
            <p className="section-subtitle">
              All package fees are fixed across our South Indian events. The price you see is the price you pay at checkout.
            </p>
          </div>

          <div className="transparency-pricing-table-wrap">
            <table className="transparency-table">
              <thead>
                <tr>
                  <th>Race Category</th>
                  <th>Distance</th>
                  <th>Fee (INR)</th>
                  <th>Included Race Kit Items</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {RACE_PACKAGES.map((pkg) => (
                  <tr key={pkg.id}>
                    <td>
                      <strong>{pkg.name}</strong>
                    </td>
                    <td>{pkg.distance}</td>
                    <td>
                      <span className="table-price-badge">{pkg.formattedPrice}</span>
                    </td>
                    <td>
                      <ul className="table-perks">
                        {pkg.includes.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <Link
                        to={`/register?package=${pkg.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Select
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SAFETY & MEDICAL PROTOCOLS ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Medical Readiness</span>
            <h2 className="section-title">Safety &amp; Emergency Protocols</h2>
            <p className="section-subtitle">
              Runner wellbeing is our highest operational priority. Here is our medical response framework on race morning.
            </p>
          </div>

          <div className="safety-protocol-grid">
            {safetyProtocols.map((protocol, idx) => (
              <div key={idx} className="safety-card">
                <div className="safety-icon-wrap">{protocol.icon}</div>
                <h3 className="safety-title">{protocol.title}</h3>
                <p className="safety-desc">{protocol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POLICIES GRID ── */}
      <section className="section transparency-policies-section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Guidelines &amp; Governance</span>
            <h2 className="section-title">Policies and Participant Safety</h2>
            <p className="section-subtitle">
              Our clear, participant-centric policies guarantee fair play, mutual respect, and accountability.
            </p>
          </div>

          <div className="policies-grid">
            {policies.map((p, idx) => (
              <div key={idx} className="policy-card">
                <div className="policy-icon-wrap">{p.icon}</div>
                <div className="policy-meta-tag status">{p.tag}</div>
                <h3 className="policy-title">{p.title}</h3>
                <p className="policy-text">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="transparency-note-box">
            <p>
              * All participant safety standards comply with Athletic Federation of India (AFI) guidelines and local municipal public assembly permits.
            </p>
          </div>
        </div>
      </section>

      {/* ── DOWNLOADABLE RULEBOOKS & CODE OF CONDUCT ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Official Documents</span>
            <h2 className="section-title">Download Governance Manuals</h2>
            <p className="section-subtitle">
              Review full technical specifications, medical protocols, and volunteer codes in detail.
            </p>
          </div>

          <div className="category-matrix-grid">
            {rulebooks.map((doc, idx) => (
              <div key={idx} className="category-matrix-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <FaFilePdf style={{ color: '#9E1B22', fontSize: '1.75rem' }} />
                  <span className="category-matrix-badge" style={{ marginBottom: 0 }}>Verified Docs</span>
                </div>
                <h3 className="category-matrix-title" style={{ fontSize: '1.15rem' }}>{doc.title}</h3>
                <span style={{ fontSize: '0.78rem', color: '#9E1B22', fontWeight: 600, marginBottom: '0.65rem', display: 'block' }}>
                  {doc.type}
                </span>
                <p className="category-matrix-subtitle" style={{ flexGrow: 1, marginBottom: '1.25rem' }}>
                  {doc.desc}
                </p>
                <Link to="/contact" className="btn btn-outline btn-block">
                  <span>Request Full Document</span>
                  <FaArrowRight className="btn-icon" />
                </Link>
              </div>
            ))}
          </div>

          {/* Action Callout */}
          <div className="how-it-works-cta-box" style={{ marginTop: '3.5rem' }}>
            <h3 className="cta-box-title">Have questions about our event rules?</h3>
            <p className="cta-box-desc">
              Our support team is always available to assist with eligibility, timing chip, or route clarifications.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary btn-large">
                <span>TALK TO ORGANIZERS</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/register" className="btn btn-outline btn-large">
                <span>REGISTER NOW</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
