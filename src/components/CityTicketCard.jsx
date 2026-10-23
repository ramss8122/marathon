import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarDays,
  FaClock,
  FaLocationDot,
  FaPersonRunning,
  FaArrowRight
} from 'react-icons/fa6';
import './CityTicketCard.css';

/**
 * CityTicketCard – Vertical red ticket-style card for the Events page.
 *
 * Props:
 *  - city          : city object from GET /api/cities
 *  - fallbackImage : fallback src when imageUrl fails (optional)
 */
export default function CityTicketCard({ city, fallbackImage = '/assets/chennai.png' }) {
  const navigate = useNavigate();

  const cName      = city.name || 'Event';
  const cDate      = city.eventDate || city.date || '';
  const cFlagOff   = city.flagOffTime || city.time || '';
  const cGatesOpen = city.gatesOpenTime || '';
  const cTimeDisplay = cGatesOpen
    ? `${cFlagOff} (Gates Open ${cGatesOpen})`
    : cFlagOff;
  const cVenue  = city.venue || '';
  const cImage  = city.imageUrl || fallbackImage;
  const cBadge  = city.badgeText || 'Certified course';

  const handleRegister = () => {
    localStorage.setItem('selectedCity', city.slug);
    navigate(`/register/${city.slug}`);
  };

  return (
    <div className="ctc-card">
      {/* ── Image with badge ── */}
      <div className="ctc-image-wrap">
        <div className="ctc-image-frame">
          <img
            src={cImage}
            alt={`${cName} Marathon`}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackImage; }}
          />
          <div className="ctc-badge">
            <FaPersonRunning />
            <span>{cBadge}</span>
          </div>
        </div>
      </div>

      {/* ── Horizontal dashed divider with side notches ── */}
      <div className="ctc-divider-row">
        <div className="ctc-notch ctc-notch-left" />
        <div className="ctc-divider-line" />
        <div className="ctc-notch ctc-notch-right" />
      </div>

      {/* ── Info section ── */}
      <div className="ctc-info">
        <div className="ctc-official-label">
          OFFICIAL {cName.toUpperCase()} EVENT
        </div>
        <h2 className="ctc-city-title">{cName}</h2>

        <div className="ctc-info-rows">
          <div className="ctc-info-row">
            <div className="ctc-row-icon"><FaCalendarDays /></div>
            <div className="ctc-row-texts">
              <span className="ctc-row-label">RACE DATE</span>
              <strong className="ctc-row-value">{cDate}</strong>
            </div>
          </div>

          <div className="ctc-info-row">
            <div className="ctc-row-icon"><FaClock /></div>
            <div className="ctc-row-texts">
              <span className="ctc-row-label">FLAG-OFF SCHEDULE</span>
              <strong className="ctc-row-value">{cTimeDisplay}</strong>
            </div>
          </div>

          <div className="ctc-info-row">
            <div className="ctc-row-icon"><FaLocationDot /></div>
            <div className="ctc-row-texts">
              <span className="ctc-row-label">STARTING VENUE</span>
              <strong className="ctc-row-value">{cVenue}</strong>
            </div>
          </div>
        </div>

        <button type="button" className="ctc-register-btn" onClick={handleRegister}>
          <span>Register now</span>
          <FaArrowRight className="ctc-btn-arrow" />
        </button>
      </div>
    </div>
  );
}
