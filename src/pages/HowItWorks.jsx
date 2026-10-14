import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaMagnifyingGlass,
  FaRoute,
  FaClipboardCheck,
  FaEnvelopeOpenText,
  FaPersonRunning,
  FaTrophy,
  FaArrowRight,
  FaCircleCheck,
  FaLocationDot,
  FaShirt,
  FaMedal,
  FaAppleWhole,
  FaWater,
  FaChevronDown,
  FaCheck,
  FaXmark,
  FaShieldHalved
} from 'react-icons/fa6';

export default function HowItWorks() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const steps = [
    {
      step: 1,
      icon: <FaMagnifyingGlass />,
      title: 'Explore & Choose Event',
      desc: 'Browse our scheduled runs across Chennai, Coimbatore, Bengaluru, and Kochi. Select the destination that fits your calendar.'
    },
    {
      step: 2,
      icon: <FaRoute />,
      title: 'Select Race Distance',
      desc: 'Choose from 1K Fun Run, 3K Health Stride, 5K Fitness Run, 10K Challenge, or 21K Half Marathon based on your current fitness.'
    },
    {
      step: 3,
      icon: <FaClipboardCheck />,
      title: '2-Minute Online Registration',
      desc: 'Fill in your name, contact details, emergency point-of-contact, and t-shirt size. Receive an instant confirmation email with your Runner ID.'
    },
    {
      step: 4,
      icon: <FaEnvelopeOpenText />,
      title: 'Collect Kit at Runner Expo',
      desc: 'Visit the pre-race Expo 2 days prior to race day. Collect your official RFID timing bib, technical dry-fit jersey, and event guide.'
    },
    {
      step: 5,
      icon: <FaPersonRunning />,
      title: 'Report on Race Morning',
      desc: 'Arrive 45 minutes before flag-off. Drop your bags safely at the token counter, join the group warm-up aerobics, and assemble in your start corral.'
    },
    {
      step: 6,
      icon: <FaTrophy />,
      title: 'Cross Finish Line & Celebrate',
      desc: 'Cross the finish arch to the applause of the crowd! Receive your commemorative medal, hot breakfast, and download your verified timing certificate.'
    }
  ];

  const kitItems = [
    {
      icon: <FaShirt />,
      title: 'Technical Dry-Fit T-Shirt',
      desc: 'Breathable, moisture-wicking premium marathon jersey crafted for hot and humid Indian morning runs.'
    },
    {
      icon: <FaRoute />,
      title: 'RFID Chip Timing Bib',
      desc: 'High-frequency electronic timing chip embedded on your bib tag for millisecond-precision race splits.'
    },
    {
      icon: <FaMedal />,
      title: 'Die-Cast Metallic Medal',
      desc: 'Custom heavy finisher medal with embossed event landmark art and a premium satin lanyard ribbon.'
    },
    {
      icon: <FaWater />,
      title: 'Hydration & Nutrition Pack',
      desc: 'Instant electrolyte sachet, energy chew bar, and race morning hydration recommendations pamphlet.'
    },
    {
      icon: <FaAppleWhole />,
      title: 'Post-Race Breakfast Box',
      desc: 'Fresh banana, high-protein traditional breakfast box, and refreshing beverage immediately after the finish line.'
    },
    {
      icon: <FaTrophy />,
      title: 'Digital E-Certificate & Photos',
      desc: 'Instant timing SMS, verified digital certificate, and free high-resolution finish line photos.'
    }
  ];

  const checklistDo = [
    'Official Race Bib pinned firmly to front of your jersey with 4 safety pins',
    'Properly laced running shoes and tested anti-blister athletic socks',
    'Government Photo ID copy on phone or printed registration confirmation',
    'Pre-race light hydration bottle for sipping before the starting gun',
    'Running cap or visor plus sports sunscreen for daytime protection',
    'Small waist pouch or running belt for phone and car key'
  ];

  const checklistDont = [
    'Do not wear brand-new untested shoes on race morning to avoid painful blisters',
    'Do not carry heavy backpacks or valuable jewelry onto the race route',
    'Do not fold, bend, or pierce the electronic RFID timing chip on your bib',
    'Do not bring unregistered runners or non-registered companions into start corrals'
  ];

  const trainingPlan = [
    {
      week: 'Week 01',
      title: 'Habit & Foundation',
      desc: 'Establish rhythm with brisk walks and short conversational jogs.',
      routines: ['3x 30-min brisk walk/jog', 'Core planks and mobility stretches', 'Hydrate 2.5L daily']
    },
    {
      week: 'Week 02',
      title: 'Aerobic Base Building',
      desc: 'Gradually increase continuous running intervals without stressing joints.',
      routines: ['2x 4km steady jog', '1x 5km weekend long walk-jog', 'Post-run calf and hamstring stretches']
    },
    {
      week: 'Week 03',
      title: 'Peak Distance Practice',
      desc: 'Simulate race conditions and practice morning wake-up timings.',
      routines: ['1x 6km steady pace run', '1x 80% race distance weekend run', 'Test race kit and shoes']
    },
    {
      week: 'Week 04',
      title: 'Taper & Race Morning',
      desc: 'Reduce mileage, preserve energy, and prepare mind and body.',
      routines: ['2x light 20-min shakeout jogs', 'Carbohydrate-rich meals 48h prior', '8 hours deep sleep before race day']
    }
  ];

  const faqs = [
    {
      q: 'How does the electronic RFID timing bib work?',
      a: 'Your bib contains an ultra-thin RFID microchip. As you run across the timing mats located at the Start line, midpoint turnaround gates, and Finish arch, sensors automatically record your exact split time.'
    },
    {
      q: 'Can I change my registered distance category before the event?',
      a: 'Yes, category upgrades or downgrades are accepted up to 10 days before race day by emailing support@indiaruntrust.org. In case of an upgrade, only the difference in fee applies.'
    },
    {
      q: 'What is the difference between Gun Time and Net Chip Time?',
      a: 'Gun Time starts the moment the official race horn sounds. Net Chip Time starts only when you physically step on the start line mat. Your official certificate displays both times.'
    },
    {
      q: 'Are baggage storage facilities safe at the venue?',
      a: 'Yes, we provide secure, token-matched baggage holding areas managed by verified crew. Only lightweight bags (no laptops or high-value items) are permitted.'
    },
    {
      q: 'Can children participate in the running events?',
      a: 'Children aged 5+ are welcome in the 1K Fun Run with a guardian. For the 3K and 5K, the minimum age is 8 and 12 years respectively with parental consent.'
    }
  ];

  return (
    <div className="page-wrapper how-it-works-page">

      {/* ── FULL-SCREEN HERO ── */}
      <section className="page-hero">
        <div
          className="page-hero-bg"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=80')"
          }}
        />
        <div className="page-hero-inner">
          {/* LEFT */}
          <div className="page-hero-content">
            <div className="page-hero-badge">
              <FaRoute />
              <span>Step-by-Step Guide</span>
            </div>
            <h1 className="page-hero-title">
              Your Run in <span>Simple</span><br />Steps
            </h1>
            <p className="page-hero-subtitle">
              From signing up to crossing the finish line — everything you need to know about joining an INDIA RUNTRUST event in 6 easy, transparent steps.
            </p>
            <div className="page-hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                <span>Register Now</span>
                <FaArrowRight className="btn-icon" />
              </Link>
              <Link to="/events" className="btn btn-outline btn-large">
                <span>Browse Events</span>
              </Link>
            </div>
            <div className="page-hero-highlights">
              <span className="page-hero-highlight"><FaCircleCheck /> 6 Simple Steps</span>
              <span className="page-hero-highlight"><FaCircleCheck /> 2-Min Registration</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Beginner Friendly</span>
              <span className="page-hero-highlight"><FaCircleCheck /> Verified RFID Chip</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="page-hero-image-wrap">
            <div className="page-hero-stat-card">
              <span className="stat-num">6</span>
              <span className="stat-label">Easy Steps</span>
            </div>
            <div className="page-hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?auto=format&fit=crop&w=800&q=80"
                alt="Runners preparing for the race"
                className="page-hero-img"
              />
              <div className="page-hero-img-caption">
                <FaLocationDot /> Race Morning Preparation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6 STEPS GRID ── */}
      <section className="section steps-section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">The Participant Flow</span>
            <h2 className="section-title">How To Join An Event</h2>
            <p className="section-subtitle">
              We make the marathon experience seamless from the moment you register to when you proudly wear your finisher medal.
            </p>
          </div>

          <div className="steps-cards-grid">
            {steps.map((item) => (
              <div key={item.step} className="step-card">
                <div className="step-card-header">
                  <span className="step-badge">Step 0{item.step}</span>
                  <div className="step-card-icon">{item.icon}</div>
                </div>
                <h3 className="step-card-title">{item.title}</h3>
                <p className="step-card-desc">{item.desc}</p>
                <div className="step-card-footer">
                  <span className="step-status">
                    <FaCircleCheck className="step-status-icon" /> Seamless Experience
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT'S IN YOUR RUNNER KIT ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Race Kit Unboxing</span>
            <h2 className="section-title">What Every Runner Receives</h2>
            <p className="section-subtitle">
              Collected at our pre-race Expo, your runner kit equips you with everything required for an unforgettable morning.
            </p>
          </div>

          <div className="unboxing-grid">
            {kitItems.map((item, idx) => (
              <div key={idx} className="unboxing-card">
                <div className="unboxing-icon-circle">{item.icon}</div>
                <h4 className="unboxing-title">{item.title}</h4>
                <p className="unboxing-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RACE MORNING CHECKLIST ── */}
      <section className="section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Race Day Preparedness</span>
            <h2 className="section-title">Race Morning Packing Checklist</h2>
            <p className="section-subtitle">
              Avoid last-minute anxiety by reviewing this quick checklist before leaving home on race morning.
            </p>
          </div>

          <div className="checklist-columns">
            {/* MUST BRING */}
            <div className="checklist-card">
              <div className="checklist-header">
                <FaCircleCheck className="checklist-header-icon" style={{ color: '#9E1B22' }} />
                <h3 className="checklist-header-title">What to Bring With You</h3>
              </div>
              <div className="checklist-items">
                {checklistDo.map((item, i) => (
                  <div key={i} className="checklist-row">
                    <FaCheck />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WHAT TO LEAVE BEHIND */}
            <div className="checklist-card">
              <div className="checklist-header">
                <FaShieldHalved className="checklist-header-icon" style={{ color: '#3B0F13' }} />
                <h3 className="checklist-header-title">What to Avoid or Leave Behind</h3>
              </div>
              <div className="checklist-items">
                {checklistDont.map((item, i) => (
                  <div key={i} className="checklist-row">
                    <FaXmark style={{ color: '#7F1319' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4-WEEK BEGINNER TRAINING PLAN ── */}
      <section className="section bg-surface">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Training Guidance</span>
            <h2 className="section-title">4-Week Beginner Prep Blueprint</h2>
            <p className="section-subtitle">
              Starting from scratch? Here is our recommended weekly pacing guide to prepare comfortably for 3K or 5K.
            </p>
          </div>

          <div className="training-plan-grid">
            {trainingPlan.map((plan, idx) => (
              <div key={idx} className="training-card">
                <span className="training-week-tag">{plan.week}</span>
                <h4 className="training-title">{plan.title}</h4>
                <p className="training-desc">{plan.desc}</p>
                <div className="training-routine-list">
                  {plan.routines.map((routine, i) => (
                    <div key={i} className="training-routine-item">
                      <FaCircleCheck />
                      <span>{routine}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQS ── */}
      <section className="section">
        <div className="content-container">
          <div className="section-header">
            <span className="section-eyebrow">Clear Answers</span>
            <h2 className="section-title">How It Works: Common Questions</h2>
            <p className="section-subtitle">
              Have doubts about chip timing, corral line-ups, or distance adjustments?
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
            <h3 className="cta-box-title">Ready to take the first step?</h3>
            <p className="cta-box-desc">
              Registration takes less than two minutes. Choose your race category now.
            </p>
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
