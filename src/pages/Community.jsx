import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaHeartPulse,
  FaPersonRunning,
  FaQuoteLeft,
  FaArrowRight,
  FaCircleCheck,
  FaLocationDot,
  FaClock,
  FaFlagCheckered,
  FaShirt,
  FaAward
} from 'react-icons/fa6';

export default function Community() {
  const cityChapters = [
    {
      city: 'Chennai',
      hub: 'Besant Nagar & Marina Striders',
      members: '180+ Weekly Runners',
      timing: 'Every Sunday • 5:30 AM IST',
      location: 'Besant Nagar Beach Promenade (Near Police Booth)',
      paces: ['5:30 min/km Tempo', '6:30 min/km Steady', '7:30 min/km Walk-Jog'],
      coordinator: 'Karthik Ramanathan & Priya'
    },
    {
      city: 'Bengaluru',
      hub: 'Cubbon & Lalbagh Pacesetters',
      members: '260+ Weekly Runners',
      timing: 'Every Sunday • 6:00 AM IST',
      location: 'Cubbon Park Bandstand & Queen Victoria Statue',
      paces: ['5:00 min/km Fast', '6:00 min/km Endurance', '7:00 min/km Beginner'],
      coordinator: 'Vikram Joshi & Deepa'
    },
    {
      city: 'Coimbatore',
      hub: 'Race Course Foothills Club',
      members: '110+ Weekly Runners',
      timing: 'Every Saturday • 6:00 AM IST',
      location: 'Race Course Ring Road (Opposite Thomas Park)',
      paces: ['5:45 min/km Pace', '6:45 min/km Steady', 'Easy 3K Stride'],
      coordinator: 'Dr. S. Sundar & Ananya'
    },
    {
      city: 'Kochi',
      hub: 'Marine Drive Coastal Striders',
      members: '95+ Weekly Runners',
      timing: 'Every Sunday • 6:00 AM IST',
      location: 'Rainbow Bridge Promenade Walkway',
      paces: ['6:00 min/km Coastal Pace', '7:00 min/km Easy Stride'],
      coordinator: 'Mathew Thomas & Reema'
    }
  ];

  const pacers = [
    {
      bus: '50 Mins',
      distance: '10K Challenge',
      pace: '5:00 min/km Pace',
      tagline: 'Aggressive cadence for speed-oriented runners chasing personal records.'
    },
    {
      bus: '60 Mins',
      distance: '10K Challenge',
      pace: '6:00 min/km Pace',
      tagline: 'The iconic sub-60 benchmark. Even pacing and steady breathing rhythm.'
    },
    {
      bus: '1 Hr 45 M',
      distance: '21K Half Marathon',
      pace: '4:58 min/km Pace',
      tagline: 'For advanced endurance runners aiming for competitive regional seeding.'
    },
    {
      bus: '2 Hrs 00 M',
      distance: '21K Half Marathon',
      pace: '5:41 min/km Pace',
      tagline: 'The holy grail of half marathons! Smooth cadence and disciplined hydration.'
    },
    {
      bus: '2 Hrs 15 M',
      distance: '21K Half Marathon',
      pace: '6:23 min/km Pace',
      tagline: 'Balanced endurance pacing with gentle walk-throughs at water stations.'
    },
    {
      bus: '2 Hrs 30 M',
      distance: '21K Half Marathon',
      pace: '7:06 min/km Pace',
      tagline: 'The celebration party bus! Enthusiastic cheers, zero pressure, 100% finish.'
    }
  ];

  const volunteerRoles = [
    {
      icon: <FaFlagCheckered />,
      title: 'Course Route Marshal',
      desc: 'Guide runners at turns, manage cheering stations, and maintain course perimeter safety alongside local traffic police.',
      perks: ['Official Volunteer Jersey', 'Breakfast & Refreshments', 'Certificate of Service', 'Free Next Race Pass']
    },
    {
      icon: <FaHeartPulse />,
      title: 'Hydration & Cheer Crew',
      desc: 'Distribute pure water and Enerzal electrolytes, encourage weary runners with music, cowbells, and enthusiastic high-fives.',
      perks: ['Official Volunteer Jersey', 'Energy Snack Box', 'Community Service Credits', 'Next Event Discount']
    },
    {
      icon: <FaAward />,
      title: 'Finish Line & Medal Squad',
      desc: 'Drape the heavy finisher medals around runners, distribute recovery bananas, and celebrate finish arch emotional triumphs.',
      perks: ['Exclusive Crew Apparel', 'Hot Breakfast', 'Digital Volunteer Badge', 'Event Token Keepsake']
    },
    {
      icon: <FaShirt />,
      title: 'Pre-Race Expo & Kit Desk',
      desc: 'Welcome participants during Friday-Saturday kit pickup, issue bib numbers with RFID chips, and manage size exchanges.',
      perks: ['Crew T-Shirt', 'Lunch Voucher', 'Direct Leadership Experience', 'Free Race Bib Pass']
    }
  ];

  const galleryMoments = [
    {
      img: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=600&q=80',
      title: 'Sunrise Flag-off Energy',
      desc: 'Thousands of runners stepping across the electronic timing mat as dawn breaks.'
    },
    {
      img: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80',
      title: 'Coastal Route Pacing',
      desc: 'Cool morning sea breeze propelling half marathoners along the coastal promenade.'
    },
    {
      img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80',
      title: 'Finish Arch Celebrations',
      desc: 'The pure ecstasy of crossing the final timing gate after 21 demanding kilometers.'
    },
    {
      img: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?auto=format&fit=crop&w=600&q=80',
      title: 'Community Warm-up Vibes',
      desc: 'Certified coaches leading dynamic stretching routines before the starting gun.'
    },
    {
      img: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80',
      title: 'Family & First-Timers',
      desc: 'Parents and children hand-in-hand collecting their first commemorative medals.'
    },
    {
      img: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=600&q=80',
      title: 'Post-Race Cooldown Circle',
      desc: 'Sharing breakfast, comparing timing splits, and forging lasting friendships.'
    }
  ];

  const testimonials = [
    {
      name: 'Rohan Sharma',
      category: '10K Finisher',
      city: 'Bengaluru',
      quote: 'The 60-minute pacer bus in Cubbon Park was exceptional! He kept our pace rock steady, called out water stations 100 meters ahead, and brought our entire group home under 59 minutes.'
    },
    {
      name: 'Priya Sundaram',
      category: 'Family 1K Fun Run',
      city: 'Chennai',
      quote: 'Loved bringing my 8-year-old daughter for her very first organized run in Besant Nagar. Safe traffic-free roads, friendly volunteers cheering her name, and gorgeous medals we will treasure.'
    },
    {
      name: 'Arun Varma',
      category: '21K Half Marathon',
      city: 'Kochi',
      quote: 'The waterfront route in Kochi was breathtaking. Water stations were cleanly managed with zero litter on the road, and the hot traditional breakfast at the finish arch was the best reward.'
    },
    {
      name: 'Dr. Meera Nambiar',
      category: '5K Fitness Stride',
      city: 'Coimbatore',
      quote: 'As a physician, I recommend India Runtrust events to all my patients. There is no elitist intimidation — everyone from fast sprinters to brisk walkers feels respected and celebrated.'
    }
  ];

  return (
    <div className="page-wrapper community-page">

      {/* ── FULL-SCREEN HERO ── */}
      <section className="page-hero">
        <div
          className="page-hero-bg"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1600&q=80')"
          }}
        />
        <div className="page-hero-inner">
          {/* LEFT */}
          <div className="page-hero-content">
            <div className="page-hero-badge">
              <FaUsers />
              <span>Runner Network</span>
            </div>
            <h1 className="page-hero-title">
              Run Together.<br /><span>Grow Together.</span>
            </h1>
            <p className="page-hero-subtitle">
              A vibrant community of weekend walkers, fitness enthusiasts, volunteer pacers, and seasoned marathoners cheering each other on across South India.
            </p>
            <div className="page-hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>Join the Community</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <a href="#chapters" className="btn btn-outline btn-large">
                <span>Find Local Chapter</span>
              </a>
            </div>
            <div className="page-hero-highlights">
              <span className="page-hero-highlight"><FaCircleCheck /> 4 City Hubs</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Free Weekly Shakeout Runs</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Certified Pacer Squad</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="page-hero-image-wrap">
            <div className="page-hero-stat-card">
              <span className="stat-num">500+</span>
              <span className="stat-label">Active Runners</span>
            </div>
            <div className="page-hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80"
                alt="Community runners celebrating together"
                className="page-hero-img"
              />
              <div className="page-hero-img-caption">
                <FaLocationDot /> Community Stride Network
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CITY CHAPTERS (WEEKLY MEETUPS) ── */}
      <section id="chapters" className="section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Local Running Hubs</span>
            <h2 className="section-title">City Running Chapters</h2>
            <p className="section-subtitle">
              Join free weekly weekend morning shakeout runs. All fitness levels and paces are warmly welcomed.
            </p>
          </div>

          <div className="chapters-grid">
            {cityChapters.map((ch, idx) => (
              <div key={idx} className="chapter-card">
                <div className="chapter-city-header">
                  <h3 className="chapter-city-name">{ch.city}</h3>
                  <span className="chapter-members-count">{ch.members}</span>
                </div>
                <h4 className="chapter-hub-title">{ch.hub}</h4>

                <div className="chapter-details-list">
                  <div className="chapter-detail-row">
                    <FaClock />
                    <span><strong>When:</strong> {ch.timing}</span>
                  </div>
                  <div className="chapter-detail-row">
                    <FaLocationDot />
                    <span><strong>Meetup:</strong> {ch.location}</span>
                  </div>
                  <div className="chapter-detail-row">
                    <FaPersonRunning />
                    <span><strong>Pace Groups:</strong> {ch.paces.join(', ')}</span>
                  </div>
                  <div className="chapter-detail-row">
                    <FaUsers />
                    <span><strong>Lead:</strong> {ch.coordinator}</span>
                  </div>
                </div>

                <Link to="/contact" className="btn btn-outline btn-block" style={{ marginTop: 'auto' }}>
                  <span>Join {ch.city} Chapter</span>
                  <FaArrowRight className="btn-icon" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFICIAL PACER SQUAD ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Goal Achievement</span>
            <h2 className="section-title">The Official Pacer Squad</h2>
            <p className="section-subtitle">
              Trained volunteer pacers carry colored balloons and guide you with disciplined splits to help you cross the finish on target.
            </p>
          </div>

          <div className="pacers-grid">
            {pacers.map((p, idx) => (
              <div key={idx} className="pacer-card">
                <span className="pacer-distance-label">{p.distance}</span>
                <div className="pacer-bus-time">{p.bus}</div>
                <div className="pacer-target-pace">{p.pace}</div>
                <p className="pacer-tagline">{p.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VOLUNTEER CREW PROGRAM ── */}
      <section className="section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Join the Crew</span>
            <h2 className="section-title">Be the Heartbeat of the Marathon</h2>
            <p className="section-subtitle">
              Not running this weekend? Experience the thrill of event morning by joining our passionate volunteer crew.
            </p>
          </div>

          <div className="volunteer-roles-grid">
            {volunteerRoles.map((v, idx) => (
              <div key={idx} className="volunteer-card">
                <div className="volunteer-card-icon">{v.icon}</div>
                <h3 className="volunteer-title">{v.title}</h3>
                <p className="volunteer-desc">{v.desc}</p>

                <div className="volunteer-perks-list">
                  <strong style={{ fontSize: '0.78rem', color: '#1C1C1E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Volunteer Perks:
                  </strong>
                  {v.perks.map((perk, i) => (
                    <div key={i} className="volunteer-perk-item">
                      <FaCircleCheck />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/contact" className="btn btn-primary btn-large">
              <span>SIGN UP AS RACE VOLUNTEER</span>
              <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY GRID ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Visual Memories</span>
            <h2 className="section-title">Moments from the Course</h2>
            <p className="section-subtitle">
              Smiles, determination, camaraderie, and personal triumphs captured in morning light.
            </p>
          </div>

          <div className="gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {galleryMoments.map((item, idx) => (
              <div key={idx} className="gallery-item">
                <img src={item.img} alt={item.title} className="gallery-img" />
                <div className="gallery-caption">
                  <strong>{item.title}</strong>
                  <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '0.2rem' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTICIPANT VOICES (TESTIMONIALS) ── */}
      <section className="section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Runner Experiences</span>
            <h2 className="section-title">Voices from the Course</h2>
            <p className="section-subtitle">
              Hear directly from runners who experienced the spirit of our community events.
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div key={idx} className="testimonial-card">
                <FaQuoteLeft className="testimonial-quote-icon" />
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-name">{t.name} <span className="sample-badge">(Verified Runner)</span></div>
                  <div className="author-meta">{t.category} • {t.city}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Callout Banner */}
          <div className="community-cta-banner">
            <div className="community-cta-text">
              <h3>Become Part of the Next Running Chapter</h3>
              <p>Reserve your bib number today and join our expanding community of active runners across South India.</p>
            </div>
            <Link to="/register" className="btn btn-primary btn-large">
              <span>REGISTER NOW</span>
              <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
