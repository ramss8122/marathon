import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { FaBars, FaXmark, FaArrowRight } from 'react-icons/fa6';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(prev => !prev);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Impact', path: '/impact' },
    { name: 'Transparency', path: '/transparency' },
    { name: 'Community', path: '/community' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <header className="site-header">
      <div className="site-header-container">
        {/* Left: Brand Logo */}
        <div className="site-header-left">
          <Logo size="medium" />
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="site-nav-desktop" aria-label="Main Navigation">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.path} className="nav-item">
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                  end={link.path === '/'}
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: CTA & Mobile Toggle */}
        <div className="site-header-right">
          <Link to="/register" className="btn btn-primary nav-cta-btn">
            <span>REGISTER NOW</span>
            <FaArrowRight className="btn-icon" />
          </Link>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <FaXmark /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay & Drawer */}
      <div className={`mobile-nav-backdrop ${isOpen ? 'active' : ''}`} onClick={closeMenu}>
        <div
          className={`mobile-nav-drawer ${isOpen ? 'active' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-drawer-header">
            <Logo size="small" />
            <button
              type="button"
              className="mobile-drawer-close"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <FaXmark />
            </button>
          </div>

          <nav className="mobile-nav-list-wrap">
            <ul className="mobile-nav-list">
              {navLinks.map((link) => (
                <li key={link.path} className="mobile-nav-item">
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
                    }
                    end={link.path === '/'}
                    onClick={closeMenu}
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-drawer-footer">
            <Link
              to="/register"
              className="btn btn-primary mobile-drawer-cta"
              onClick={closeMenu}
            >
              <span>REGISTER NOW</span>
              <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
