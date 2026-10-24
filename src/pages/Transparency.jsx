import React, { useState, useEffect, useCallback } from 'react';
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
  FaWater,
  FaUsers,
  FaRotate,
  FaCircleExclamation,
  FaDatabase,
  FaHeart,
  FaIndianRupeeSign,
  FaClock,
  FaCreditCard
} from 'react-icons/fa6';
import { RACE_PACKAGES } from '../data/marathonData';
import CitySelectModal from '../components/CitySelectModal';
import DonationModal from '../components/DonationModal';

export default function Transparency() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  // ── CITY SELECTION MODAL ──
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null);

  const openCityModal = (category = null) => {
    setSelectedCategoryForModal(category);
    setCityModalOpen(true);
  };

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
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
    const timer = setInterval(fetchStats, 15000);
    return () => clearInterval(timer);
  }, [fetchStats]);
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
      desc: 'If an event is rescheduled due to extreme weather or municipal directives, 100% of registrations automatically rollover to the rescheduled date.'
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
      {/* Spacing / style fix for the Live Event Audit Ledger header */}
      <style>{`
        .transparency-ledger-head {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.9rem;
          margin-bottom: 1.75rem;
        }
        .transparency-ledger-head .transparency-ledger-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.45rem 1rem;
          border-radius: 999px;
          background: rgba(155, 28, 44, 0.08);
          color: #9b1c2c;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .transparency-ledger-head .transparency-ledger-badge svg {
          font-size: 0.95rem;
        }
        .transparency-ledger-head .transparency-ledger-title {
          margin: 0;
          line-height: 1.2;
        }
        .transparency-ledger-head .transparency-ledger-desc {
          margin: 0;
          max-width: 760px;
          line-height: 1.7;
        }
        .transparency-stats-grid {
          gap: 1.25rem;
        }
      `}</style>

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

      {/* ── LIVE AUDIT LEDGER & DATABASE STATS ── */}
      <section className="section transparency-live-section" style={{ paddingBottom: '1rem' }}>
        <div className="content-container">
          <div className="transparency-ledger-head" style={{ marginBottom: '2rem' }}>
            <div className="transparency-ledger-badge">
              <FaDatabase />
              <span>Live Event Audit Ledger</span>
            </div>
            <h2 className="transparency-ledger-title">Transparency</h2>
            <p className="transparency-ledger-desc">
              We believe in complete transparency. Here you can view real-time registration data, payment status and donation records from our MongoDB database.
            </p>
          </div>

          {/* 1. REGISTRATION TRANSPARENCY CARD */}
          <div className="transparency-ledger-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(167, 25, 32, 0.1)', color: 'var(--color-crimson, #A71920)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                  <FaUsers />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dark-gray, #1E1214)' }}>
                  Registration Transparency
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span className="live-indicator" style={{ fontSize: '0.82rem' }}>
                  <span className="live-indicator-dot" /> Live MongoDB Database
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={fetchStats}
                  disabled={statsLoading}
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                >
                  <FaRotate className={statsLoading ? 'spinning' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="transparency-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="stat-card">
                <div className="stat-icon-wrap"><FaUsers /></div>
                <div className="stat-number">
                  {statsLoading ? '...' : (stats ? stats.totalRegistrations : '—')}
                </div>
                <div className="stat-label">Total Registrations</div>
                <span className="stat-note">(All Participant Entries)</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ color: '#D97706' }}><FaClock /></div>
                <div className="stat-number">
                  {statsLoading ? '...' : (stats ? (stats.pendingRegistrations ?? 0) : '—')}
                </div>
                <div className="stat-label">Pending Registrations</div>
                <span className="stat-note">(Awaiting Verification)</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ color: '#15803D' }}><FaCircleCheck /></div>
                <div className="stat-number">
                  {statsLoading ? '...' : (stats ? stats.confirmedRegistrations : '—')}
                </div>
                <div className="stat-label">Confirmed Registrations</div>
                <span className="stat-note">(Bib Allocated)</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap"><FaCreditCard /></div>
                <div className="stat-number">
                  {statsLoading ? '...' : (stats ? stats.completedPayments : '—')}
                </div>
                <div className="stat-label">Completed Payments</div>
                <span className="stat-note">(Verified Online)</span>
              </div>
            </div>
          </div>

          {/* 2. DONATION TRANSPARENCY CARD */}
          <div id="donations" className="transparency-ledger-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(167, 25, 32, 0.1)', color: 'var(--color-crimson, #A71920)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                  <FaHeart />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dark-gray, #1E1214)' }}>
                  Donation Transparency
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span className="live-indicator" style={{ fontSize: '0.82rem' }}>
                  <span className="live-indicator-dot" /> Live MongoDB Database
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={fetchStats}
                  disabled={statsLoading}
                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                >
                  <FaRotate className={statsLoading ? 'spinning' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="transparency-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div className="stat-card">
                <div className="stat-icon-wrap"><FaUsers /></div>
                <div className="stat-number">
                  {statsLoading ? '...' : (stats ? (stats.totalDonors ?? 0) : '0')}
                </div>
                <div className="stat-label">Total Donors</div>
                <span className="stat-note">(Verified Contributors)</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ color: 'var(--color-crimson, #A71920)' }}><FaIndianRupeeSign /></div>
                <div className="stat-number">
                  {statsLoading ? '...' : (stats ? `₹${(stats.totalDonationsReceived || 0).toLocaleString('en-IN')}` : '₹0')}
                </div>
                <div className="stat-label">Total Donations Received</div>
                <span className="stat-note">(100% Traceable Funds)</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap" style={{ color: 'var(--color-crimson, #A71920)' }}><FaHeart /></div>
                <div className="stat-number">
                  {statsLoading ? '...' : (stats ? (stats.successfulDonations ?? 0) : '0')}
                </div>
                <div className="stat-label">Successful Donations</div>
                <span className="stat-note">(Settled & Reconciled)</span>
              </div>
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setDonationModalOpen(true)}
                style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}
              >
                <span>Donate Now</span>
                <FaArrowRight className="btn-icon" />
              </button>
            </div>

            <div className="transparency-ledger-actions" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color, #E8DCD9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.82rem', color: statsError ? '#DC2626' : '#15803D', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {statsError ? (
                  <>
                    <FaCircleExclamation />
                    <span>{statsError}</span>
                  </>
                ) : (
                  <>
                    <FaCircleCheck />
                    <span>MongoDB Database Online • Synced {lastUpdated || 'just now'}</span>
                  </>
                )}
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
              All package fees are fixed across our Chennai events. The price you see is the price you pay at checkout.
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
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => openCityModal(pkg)}
                      >
                        Select
                      </button>
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

      {/* ── SHARED CITY SELECTION MODAL ── */}
      <CitySelectModal
        isOpen={cityModalOpen}
        onClose={() => setCityModalOpen(false)}
        category={selectedCategoryForModal}
      />

      {/* ── DONATION MODAL ── */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        onDonationSuccess={fetchStats}
      />
    </div>
  );
}