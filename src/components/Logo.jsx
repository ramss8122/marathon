import React from 'react';
import { Link } from 'react-router-dom';
import { FaPersonRunning } from 'react-icons/fa6';

export default function Logo({ size = 'medium', clickable = true, light = false }) {
  const content = (
    <div className={`brand-logo-container brand-logo-${size}`}>
      <div className="brand-logo-icon-wrap" aria-hidden="true">
        <FaPersonRunning className="brand-runner-icon" />
      </div>
      <div className="brand-logo-text">
        <span className="brand-name-primary">INDIA</span>
        <span className="brand-name-secondary">RUNTRUST</span>
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link to="/about" className="brand-logo-link" aria-label="INDIA RUNTRUST - About">
        {content}
      </Link>
    );
  }

  return content;
}
