import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaFacebookF, FaInstagram, FaPhone, FaEnvelope, FaLocationDot } from 'react-icons/fa6';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-col footer-col-brand">
          <Logo size="medium" />
          <p className="footer-desc">
            INDIA RUNTRUST is committed to promoting fitness, community unity, and purposeful running across Indian cities.
          </p>
          <div className="footer-social-links">
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-nav-list">
            <li><Link to="/" className="footer-link">Home</Link></li>
            <li><Link to="/events" className="footer-link">Events</Link></li>
            <li><Link to="/how-it-works" className="footer-link">How It Works</Link></li>
            <li><Link to="/impact" className="footer-link">Impact</Link></li>
            <li><Link to="/transparency" className="footer-link">Transparency</Link></li>
            <li><Link to="/faq.html" className="footer-link">FAQ</Link></li>
          </ul>
        </div>

        {/* Community & Info */}
        <div className="footer-col">
          <h4 className="footer-heading">Get Involved</h4>
          <ul className="footer-nav-list">
            <li><Link to="/community" className="footer-link">Community</Link></li>
            <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            <li><Link to="/register" className="footer-link ">Register Now</Link></li>
            <li><Link to="/transparency" className="footer-link">Policies & Transparency</Link></li>
          </ul>
        </div>

        {/* Contact Info Snippet */}
        <div className="footer-col">
          <h4 className="footer-heading">Support Desk</h4>
          <ul className="footer-contact-list">
            <li className="footer-contact-item">
              <FaEnvelope className="footer-contact-icon" />
              <span>support@indiaruntrust.org (Demo)</span>
            </li>
            <li className="footer-contact-item">
              <FaPhone className="footer-contact-icon" />
              <span>+91 98765 43210 (Demo)</span>
            </li>
            <li className="footer-contact-item">
              <FaLocationDot className="footer-contact-icon" />
              <span>Chennai </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright-text">
            © {currentYear} INDIA RUNTRUST. All rights reserved. Run Together. Make an Impact.
          </p>
          <div className="footer-policy-links">
            <Link to="/transparency" className="footer-sublink">Transparency & Draft Policies</Link>
            <span className="dot-divider">•</span>
            <Link to="/contact" className="footer-sublink">Help & Inquiries</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
