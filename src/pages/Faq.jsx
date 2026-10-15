import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCircleQuestion,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaEnvelope,
  FaPhone,
  FaShieldHalved
} from 'react-icons/fa6';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const faqList = [
    {
      q: 'How do I register for the RUNTRUST Marathon?',
      a: 'Registering is simple and secure through our official Runner Portal. Visit the Register Now page, select your preferred event location (such as the Chennai Coastal Sunrise Run), choose your race distance package (1K, 3K, 5K, 10K, or 21K Half Marathon), specify your desired ticket quantity using the quantity controls, and click "Proceed" to enter attendee details and complete checkout.'
    },
    {
      q: 'Can I add multiple tickets and register for more than one person?',
      a: 'Yes! In the Pick Tickets section, you can use the Add (+) button to select 1, 2, 10, 50, or more tickets for your family, running group, or corporate team, subject to available race capacity. On the Attendee Details page, you can enter details for each runner or use the "Same person / Copy Details to All" feature to quickly fill recurring information.'
    },
    {
      q: 'What race distances and packages are available?',
      a: 'We offer 5 official race categories suited for all fitness levels: 1K Fun Run (Family & Beginners, ₹499), 3K Run (Step Into Regular Running, ₹599), 5K Run (The Classic Fitness Challenge, ₹699), 10K Run (Endurance & Performance Pace, ₹799), and the 21K Half Marathon (The Ultimate Endurance Test, ₹899). Every package includes an official finisher medal, e-certificate, hydration, and medical support.'
    },
    {
      q: 'How and when will I receive my registration confirmation email?',
      a: 'Upon successful online registration, an instant confirmation screen with your unique Registration Reference ID (e.g., RUN-123456) will be generated. An official Registration Confirmation Email containing your booking summary, event details, and reporting guidelines is automatically dispatched to the email address entered for Participant 1 within a few minutes.'
    },
    {
      q: 'How do I download my ticket receipt and runner pass?',
      a: 'Your confirmation screen displays your complete registration receipt along with individual participant tags and reference codes. You can print or save this receipt directly as a PDF via your browser. Additionally, the confirmation email contains a direct link to download your digital registration pass, which serves as your entry token for bib collection at the Expo.'
    },
    {
      q: 'Where and when do I collect my runner kit & RFID bib number?',
      a: 'Runner kits—including dry-fit technical t-shirts, RFID bib tags, and sponsor goodies—must be collected in person at the official Marathon Expo held 2 days prior to race day (Friday and Saturday, 10:00 AM to 6:00 PM). Detailed venue directions and Expo stall locations are sent to all registered runners via email and SMS one week before the event.'
    },
    {
      q: 'Can a family member or friend collect my bib on my behalf?',
      a: 'Yes. If you cannot attend the Expo in person, an authorized representative may collect your kit on your behalf. They must present a printed or digital copy of your Registration Confirmation Email, an authorization note signed by you, and a photo ID of the registered runner.'
    },
    {
      q: 'What are the race cut-off times for each distance?',
      a: 'To guarantee runner safety and allow city roads to reopen on schedule, the following course cut-offs apply: 21K Half Marathon – 3 hours 30 minutes; 10K Run – 1 hour 45 minutes; 5K Run – 60 minutes; 3K Run – 45 minutes; 1K Fun Run – 30 minutes. Dedicated sweep vehicles, hydration stations, and medical crews follow all courses until the final runner finishes.'
    },
    {
      q: 'Can I transfer my registration or request a refund?',
      a: 'As marathon route clearances, chip timers, and personalized bibs are arranged well in advance, registrations are non-refundable. However, runner transfers to another person or category deferrals can be requested up to 10 days before race day by contacting support@indiaruntrust.org with your Registration Reference ID.'
    },
    {
      q: 'What emergency medical and hydration support is provided on the course?',
      a: 'Runner safety is our highest priority. The entire race course features hydration stations stocked with water and electrolytes every 1 to 1.5 km, mobile physiotherapist bikes, cardiac ambulances stationed at strategic intervals, and a fully equipped medical recovery base camp at the finish line.'
    }
  ];

  return (
    <div className="page-wrapper faq-page" id="faq-page-root">
      {/* Page Banner */}
      <section className="page-banner">
        <div className="content-container">
          <div className="page-banner-content">
            <div className="page-badge">
              <FaCircleQuestion className="page-badge-icon" />
              <span>Runner Help Center &amp; Knowledge Base</span>
            </div>
            <h1 className="page-title">Frequently Asked Questions</h1>
            <p className="page-subtitle">
              Have questions about registration, race categories, bib collection, or downloading your confirmation tickets? Find comprehensive answers and official guidelines below.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Main Content */}
      <section className="section faq-main-section">
        <div className="content-container">
          <div className="faq-page-container">
            <div className="faq-page-intro">
              <span className="section-eyebrow">Clear &amp; Transparent Information</span>
              <h2 className="section-title">Everything You Need to Know</h2>
              <p className="section-subtitle">
                Browse our most common runner inquiries regarding ticket selection, entry passes, bib collection, and race day rules. Click any question to view its detailed answer.
              </p>
            </div>

            {/* Accordion Component */}
            <div className="faq-accordion-wrap" role="region" aria-label="Frequently Asked Questions Accordion">
              {faqList.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className={`faq-accordion-card ${isOpen ? 'open' : ''}`}
                    id={`faq-item-${index}`}
                  >
                    <button
                      type="button"
                      className="faq-accordion-trigger"
                      onClick={() => toggleAccordion(index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      id={`faq-btn-${index}`}
                    >
                      <span className="faq-question-label">{item.q}</span>
                      <span className="faq-accordion-icon-box" aria-hidden="true">
                        {isOpen ? <FaMinus className="faq-icon-minus" /> : <FaPlus className="faq-icon-plus" />}
                      </span>
                    </button>
                    <div
                      id={`faq-answer-${index}`}
                      className={`faq-accordion-panel ${isOpen ? 'expanded' : ''}`}
                      role="region"
                      aria-labelledby={`faq-btn-${index}`}
                    >
                      <div className="faq-accordion-body">
                        <p>{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Support Callout Box */}
            <div className="faq-support-callout">
              <div className="faq-support-content">
                <div className="faq-support-badge">
                  <FaShieldHalved />
                  <span>Dedicated Runner Helpdesk</span>
                </div>
                <h3>Still have a question or need assistance with your ticket?</h3>
                <p>
                  Our official race assistance desk is here to help with special registrations, bulk corporate bookings, or technical support.
                </p>
                <div className="faq-support-actions">
                  <Link to="/contact" className="btn btn-primary">
                    <span>Contact Support Team</span>
                    <FaArrowRight className="btn-icon" />
                  </Link>
                  <Link to="/register" className="btn btn-outline">
                    <span>Register as a Runner</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
