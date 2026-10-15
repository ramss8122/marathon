import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCircleQuestion } from 'react-icons/fa6';

export default function FloatingFaqButton() {
  const location = useLocation();
  const isFaqPage = location.pathname === '/faq' || location.pathname === '/faq.html';

  return (
    <Link
      to="/faq.html"
      className={`floating-faq-btn ${isFaqPage ? 'floating-faq-active' : ''}`}
      aria-label="Frequently Asked Questions"
      title="View Frequently Asked Questions"
      id="floating-faq-button"
    >
      <FaCircleQuestion className="floating-faq-icon" />
      <span className="floating-faq-label">FAQ</span>
    </Link>
  );
}
