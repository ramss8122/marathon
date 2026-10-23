import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarDays,
  FaClock,
  FaLocationDot,
  FaPersonRunning,
  FaCircleCheck
} from 'react-icons/fa6';
import { UPCOMING_EVENTS } from '../data/marathonData';

export default function ChennaiEvent() {
  const navigate = useNavigate();

  // Find official Chennai event data
  const event = UPCOMING_EVENTS.find(e => e.city?.toLowerCase() === 'chennai') || UPCOMING_EVENTS[0];

  const handleRegister = () => {
    navigate(`/register?event=${event.id}`);
  };

  return (
    <div className="chennai-details-page-wrapper">
      <div className="content-container chennai-details-container">
        {/* Back navigation button */}
        <div className="chennai-top-nav">
          <Link to="/" className="chennai-back-btn" aria-label="Back to previous page">
            <FaArrowLeft className="back-icon" />
            <span>Back</span>
          </Link>
        </div>

        {/* Responsive Two-Column Layout (Matching Screenshot) */}
        <div className="chennai-two-column-card">
          {/* Left Column: Large Image with Badge */}
          <div className="chennai-image-column">
            <div className="chennai-image-frame">
              <img
                src={event.image || 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80'}
                alt="Chennai Marathon"
                className="chennai-featured-img"
              />
              {/* Black Badge at Bottom-Left */}
              <div className="chennai-image-badge">
                <FaPersonRunning className="badge-icon" />
                <span>Certified Coastal Course</span>
              </div>
            </div>
          </div>

          {/* Right Column: Event Details */}
          <div className="chennai-content-column">
            {/* Top Pill Badge */}
            <div className="chennai-event-badge">
              <FaCircleCheck className="badge-check-icon" />
              <span>OFFICIAL CHENNAI EVENT</span>
            </div>

            {/* Main Heading: Chennai only */}
            <h1 className="chennai-main-heading">Chennai</h1>

            {/* Description */}
            <p className="chennai-description">
              Experience the excitement of marathon running in Chennai, bringing runners together for a memorable sporting event.
            </p>

            {/* Event Information Card (White card matching screenshot) */}
            <div className="chennai-info-card">
              {/* RACE DATE */}
              <div className="info-card-row">
                <div className="info-card-icon-wrap">
                  <FaCalendarDays className="info-card-icon" />
                </div>
                <div className="info-card-text">
                  <span className="info-card-label">RACE DATE</span>
                  <strong className="info-card-value">Sunday, 15 Nov 2026</strong>
                </div>
              </div>

              {/* FLAG-OFF SCHEDULE */}
              <div className="info-card-row">
                <div className="info-card-icon-wrap">
                  <FaClock className="info-card-icon" />
                </div>
                <div className="info-card-text">
                  <span className="info-card-label">FLAG-OFF SCHEDULE</span>
                  <strong className="info-card-value">5:30 AM IST (Gates Open 4:30 AM)</strong>
                </div>
              </div>

              {/* STARTING VENUE */}
              <div className="info-card-row">
                <div className="info-card-icon-wrap">
                  <FaLocationDot className="info-card-icon" />
                </div>
                <div className="info-card-text">
                  <span className="info-card-label">STARTING VENUE</span>
                  <strong className="info-card-value">Besant Nagar Promenade, Chennai</strong>
                </div>
              </div>
            </div>

            {/* Red Action Button (Matching screenshot) */}
            <div className="chennai-button-wrap">
              <button
                type="button"
                className="chennai-register-btn"
                onClick={handleRegister}
              >
                <span>REGISTER FOR THIS EVENT</span>
                <FaArrowRight className="btn-arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
