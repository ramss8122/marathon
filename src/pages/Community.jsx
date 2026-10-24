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

const IMG_HERO_BG = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1600&q=80';
const IMG_HERO_SIDE = 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80';

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
      img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=600&q=80',
      title: 'Marathon Route Pacing',
      desc: 'Runners finding their rhythm together along the course in the cool morning air.'
    },
    {
      img: 'https://unsplash.com/photos/bPJcBBM4RT8/download?force=true&w=800',
      title: 'Road Race Celebrations',
      desc: 'The pure joy of running shoulder to shoulder with fellow runners on race day.'
    },
    {
      img: 'https://unsplash.com/photos/3NhTyPZ8CO8/download?force=true&w=800',
      title: 'Community Running Vibes',
      desc: 'A big crowd of runners moving together towards the finish stretch.'
    },
    {
      img: 'https://unsplash.com/photos/Y0woUmyxGrw/download?force=true&w=800',
      title: 'Strides on the Road',
      desc: 'Every step counts, from first-timers to seasoned marathoners.'
    },
    {
      img: 'https://unsplash.com/photos/ttbCwN_mWic/download?force=true&w=800',
      title: 'Racing Spirit',
      desc: 'Determination, camaraderie, and personal triumphs captured mid-race.'
    }
  ];

  const testimonials = [
    {
      name: 'Karthik Subramanian',
      category: '5K Run',
      city: 'Chennai',
      avatar: 'https://i.pravatar.cc/120?img=12',
      quote: 'Well-organised route, timely hydration points and a really friendly crowd. Finishing at sunrise was unforgettable.'
    },
    {
      name: 'Meenakshi Sundaram',
      category: '3K Run',
      city: 'Madurai',
      avatar: 'https://i.pravatar.cc/120?img=47',
      quote: 'I started as a weekend walker and crossed the finish line with a smile. The volunteers kept the energy high throughout.'
    },
    {
      name: 'Arun Prakash',
      category: '10K Run',
      city: 'Coimbatore',
      avatar: 'https://i.pravatar.cc/120?img=33',
      quote: 'Timing chip worked perfectly and the fees were exactly as published. No hidden charges, which is rare for events.'
    },
    {
      name: 'Divya Lakshmi',
      category: '1K Fun Run',
      city: 'Tiruchirappalli',
      avatar: 'https://i.pravatar.cc/120?img=45',
      quote: 'Brought my kids for the fun run and they loved it. Safe, cheerful and perfect for families.'
    },
    {
      name: 'Senthil Kumar',
      category: 'Half Marathon',
      city: 'Salem',
      avatar: 'https://i.pravatar.cc/120?img=15',
      quote: 'Great pacers and cheer zones all along the course. It pushed me to a new personal best.'
    },
    {
      name: 'Anitha Ramesh',
      category: '5K Run',
      city: 'Tirunelveli',
      avatar: 'https://i.pravatar.cc/120?img=44',
      quote: 'Registration was simple and the race-day support was excellent. Already signed up for the next one.'
    }
  ];

  return (
    <div className="page-wrapper community-page">

      <section className="page-hero">
        <div
          className="page-hero-bg"
          style={{ backgroundImage: `url('${IMG_HERO_BG}')` }}
        />
        <div className="page-hero-inner">
          <div className="page-hero-content">
            <div className="page-hero-badge">
              <FaUsers />
              <span>Runner Network</span>
            </div>
            <h1 className="page-hero-title">
              Run Together.<br /><span>Grow Together.</span>
            </h1>
            <p className="page-hero-subtitle">
              A vibrant community of weekend walkers, fitness enthusiasts, volunteer pacers, and seasoned marathoners cheering each other on across India.
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
              <span className="page-hero-highlight"><FaCircleCheck /> Community Hub</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Free Weekly Shakeout Runs</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Certified Pacer Squad</span>
            </div>
          </div>

          <div className="page-hero-image-wrap">
            <div className="page-hero-stat-card">
              <span className="stat-num">180+</span>
              <span className="stat-label">Active Runners</span>
            </div>
            <div className="page-hero-image-frame">
              <img
                src={IMG_HERO_SIDE}
                alt="Marathon runners at the start line"
                className="page-hero-img"
              />
            </div>
          </div>
        </div>
      </section>

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
                <div
                  className="testimonial-author"
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div>
                    <div className="author-name">{t.name} <span className="sample-badge">(Verified Runner)</span></div>
                    <div className="author-meta">{t.category} • {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="community-cta-banner">
            <div className="community-cta-text">
              <h3>Become Part of the Next Running Chapter</h3>
              <p>Reserve your bib number today and join our expanding community of active runners across India.</p>
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