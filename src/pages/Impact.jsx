import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeartPulse,
  FaUsers,
  FaHandsHoldingCircle,
  FaLightbulb,
  FaArrowRight,
  FaCircleCheck,
  FaLocationDot,
  FaTree,
  FaWater,
  FaHandHoldingHeart,
  FaSeedling,
  FaAward,
  FaAppleWhole
} from 'react-icons/fa6';

export default function Impact() {
  const impactMetrics = [
    { value: '12,500+', label: 'Kilometers Logged', sub: 'Across Chennai, Coimbatore, Bengaluru & Kochi' },
    { value: '45,000+', label: 'Plastic Cups Eliminated', sub: '100% compostable paper & areca leaf cups used' },
    { value: '2,500+', label: 'Trees Planted', sub: 'Under our "1 Finisher = 1 Tree" green project' },
    { value: '350+', label: 'Youth Athletes Sponsored', sub: 'Running shoes, nutrition & race entry grants' }
  ];

  const impactPillars = [
    {
      icon: <FaHeartPulse />,
      title: 'Preventive Health & Vitality',
      desc: 'Combating sedentary lifestyle risks and pre-diabetes by introducing thousands of first-time runners to sustainable cardio habits.'
    },
    {
      icon: <FaTree />,
      title: 'Zero-Waste Green Marathons',
      desc: 'Leading the benchmark for eco-conscious sports by replacing single-use plastics with compostable hydration stations and upcycled bibs.'
    },
    {
      icon: <FaHandHoldingHeart />,
      title: 'Grassroots Athlete Grants',
      desc: 'Allocating event proceeds to provide athletic footwear, protein supplements, and professional coaching to underprivileged school runners.'
    },
    {
      icon: <FaHandsHoldingCircle />,
      title: 'Inclusive & Para-Athlete Spaces',
      desc: 'Free entry for wheelchair participants, alongside our trained tandem guide-runner program for visually challenged athletes.'
    },
    {
      icon: <FaUsers />,
      title: 'Women in Fitness Movement',
      desc: 'Creating secure, well-lit sunrise corridors and women-led training pacers to encourage more women into open-road endurance running.'
    },
    {
      icon: <FaLightbulb />,
      title: 'Community Mental Wellness',
      desc: 'Harnessing the mental resilience, endorphin boost, and social connection that group running brings to busy urban professionals.'
    }
  ];

  const stories = [
    {
      badge: 'Senior Runner Transformation',
      title: 'From Pre-Diabetes to 10K Finisher at 54',
      name: 'S. Meenakshi, Chennai',
      image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=800&q=80',
      desc: '“I had never run in my life and was diagnosed with high blood sugar in 2024. Joining India Runtrust beginner stride clinic gave me confidence. Today, I finished my first 10K in 68 minutes, and my HbA1c is completely normal!”',
      stat: 'Reversed Pre-Diabetes • Completed 10K'
    },
    {
      badge: 'Youth Sponsorship',
      title: 'Funding Dreams of an Aspiring Sprinter',
      name: 'Vignesh K. (15), Coimbatore',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
      desc: 'Coming from a municipal school with limited athletic facilities, Vignesh was granted professional running spikes and a monthly nutrition stipend through our runner community fund. He recently clocked sub-37 in 10K!',
      stat: 'District Medalist • Full Kit Sponsored'
    },
    {
      badge: 'Inclusive Tandem Running',
      title: 'Running Without Sight, Led by Trust',
      name: 'Ganesh & Volunteer Arun, Bengaluru',
      image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=800&q=80',
      desc: '“Running through Cubbon Park tied by a 1-foot tether rope to my volunteer guide Arun gave me freedom I hadn’t felt in years. The cheers from other runners along the course were unbelievable.”',
      stat: 'Completed 21K Half Marathon'
    }
  ];

  const ecoActions = [
    {
      icon: <FaWater />,
      title: 'Plastic-Free Hydration',
      desc: 'Bulk RO water refill points and 100% biodegradable cups replace tens of thousands of disposable PET plastic bottles.'
    },
    {
      icon: <FaSeedling />,
      title: '1 Finisher = 1 Tree Initiative',
      desc: 'For every runner who crosses the finish arch, we partner with urban forestry trusts to plant and nurture a native shade tree.'
    },
    {
      icon: <FaAppleWhole />,
      title: 'Organic Waste Composting',
      desc: 'All post-race banana peels and food waste are collected and processed into organic soil fertilizer for local parks.'
    },
    {
      icon: <FaAward />,
      title: 'Eco-Crafted Medals & Ribbons',
      desc: 'Our finisher medal ribbons are made from recycled PET yarn, avoiding virgin polyester and reducing carbon footprint.'
    }
  ];

  const getInvolved = [
    {
      title: 'Run with Us',
      desc: 'Every registered runner directly contributes to student athlete scholarships and urban tree plantation.',
      action: 'Register for Next Run',
      link: '/register'
    },
    {
      title: 'Volunteer as Green Marshal',
      desc: 'Help keep courses clean, guide participants at waste segregation points, and cheer on fellow runners.',
      action: 'Join as Volunteer',
      link: '/community'
    },
    {
      title: 'Sponsor a Student Athlete',
      desc: 'A contribution of ₹999 provides an aspiring youth runner with branded running shoes, jersey, and event entry.',
      action: 'Sponsor a Runner',
      link: '/contact'
    },
    {
      title: 'Corporate CSR Partnership',
      desc: 'Partner your company for employee fitness programs while directly sponsoring community health initiatives.',
      action: 'Partner with Us',
      link: '/contact'
    }
  ];

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
                src="https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?auto=format&fit=crop&w=800&q=80"
                alt="Community runners making an impact"
                className="page-hero-img"
              />
              <div className="page-hero-img-caption">
                <FaLocationDot /> Grassroots Wellness Movement
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS COUNTER ── */}
      <section className="impact-stats-bar">
        <div className="content-container">
          <div className="impact-stats-grid">
            {impactMetrics.map((m, idx) => (
              <div key={idx} className="impact-stat-item">
                <span className="impact-stat-val">{m.value}</span>
                <span className="impact-stat-name">{m.label}</span>
                <span className="impact-stat-disclaimer">{m.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PILLARS SECTION ── */}
      <section className="section impact-pillars-section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Our Guiding Pillars</span>
            <h2 className="section-title">Where Running Meets Real Change</h2>
            <p className="section-subtitle">
              We believe a marathon is more than an athletic competition; it is a catalyst for community health and social empathy.
            </p>
          </div>

          <div className="impact-pillars-grid">
            {impactPillars.map((pillar, idx) => (
              <div key={idx} className="pillar-card">
                <div className="pillar-icon-box">{pillar.icon}</div>
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-desc">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSFORMATION STORIES & CASE STUDIES ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Real Transformations</span>
            <h2 className="section-title">Stories from the Course</h2>
            <p className="section-subtitle">
              Inspiring stories of runners, volunteers, and students whose lives have been touched by India Runtrust.
            </p>
          </div>

          <div className="impact-showcase-grid">
            {stories.map((story, idx) => (
              <div key={idx} className="impact-showcase-card">
                <div className="impact-showcase-img-wrap">
                  <img src={story.image} alt={story.title} className="impact-showcase-img" />
                  <span className="impact-showcase-badge">{story.badge}</span>
                </div>
                <div className="impact-showcase-body">
                  <h3 className="impact-showcase-title">{story.title}</h3>
                  <strong style={{ fontSize: '0.85rem', color: '#9E1B22', marginBottom: '0.65rem', display: 'block' }}>
                    {story.name}
                  </strong>
                  <p className="impact-showcase-desc">{story.desc}</p>
                  <div className="impact-showcase-stat">
                    <FaCircleCheck />
                    <span>{story.stat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ECO-FRIENDLY INITIATIVES ── */}
      <section className="section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Green Marathon Standard</span>
            <h2 className="section-title">Leaving Zero Footprint Behind</h2>
            <p className="section-subtitle">
              How we safeguard nature and ensure public spaces remain pristine after thousands of runners finish.
            </p>
          </div>

          <div className="amenities-rich-grid">
            {ecoActions.map((action, idx) => (
              <div key={idx} className="amenity-rich-card">
                <div className="amenity-icon-wrap">{action.icon}</div>
                <h3 className="amenity-title">{action.title}</h3>
                <p className="amenity-desc">{action.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAYS TO GET INVOLVED ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Join Hands</span>
            <h2 className="section-title">4 Ways You Can Contribute</h2>
            <p className="section-subtitle">
              Whether you lace up shoes, volunteer your weekend, or sponsor a young athlete, you make an impact.
            </p>
          </div>

          <div className="category-matrix-grid">
            {getInvolved.map((item, idx) => (
              <div key={idx} className="category-matrix-card">
                <span className="category-matrix-badge">Opportunity 0{idx + 1}</span>
                <h3 className="category-matrix-title">{item.title}</h3>
                <p className="category-matrix-subtitle" style={{ marginBottom: '1.5rem', flexGrow: 1 }}>
                  {item.desc}
                </p>
                <Link to={item.link} className="btn btn-outline btn-block">
                  <span>{item.action}</span>
                  <FaArrowRight className="btn-icon" />
                </Link>
              </div>
            ))}
          </div>

          {/* Action Callout */}
          <div className="how-it-works-cta-box" style={{ marginTop: '3.5rem' }}>
            <h3 className="cta-box-title">Every registration plants a tree &amp; empowers an athlete</h3>
            <p className="cta-box-desc">
              Make your weekend run count for something greater. Register today for our upcoming city race.
            </p>
            <Link to="/register" className="btn btn-primary btn-large">
              <span>REGISTER FOR NEXT MARATHON</span>
              <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
