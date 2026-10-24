import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaLocationDot,
  FaCalendarDays,
  FaArrowRight,
  FaXmark
} from 'react-icons/fa6';
import { RACE_PACKAGES } from '../data/marathonData';
import './CitySelectModal.css';

/**
 * Normalizes city data to ensure clean presentation without placeholders.
 */
function sanitizeCityData(city) {
  if (!city) return null;
  const isHyd =
    city.slug === 'hyderabad' ||
    (city.name && city.name.toLowerCase().includes('hyderabad'));

  let venue = city.venue || '';
  let date = city.eventDate || city.date || '';
  let imageUrl = city.imageUrl || '/assets/chennai.png';

  if (isHyd) {
    if (!venue || /hydrra|besant/i.test(venue)) {
      venue = 'Gachibowli Stadium, Hyderabad';
    }
    if (!date || /sunday nov 15/i.test(date)) {
      date = 'Sunday, 22 Nov 2026';
    }
    if (!city.imageUrl || city.imageUrl.includes('photo-1452626038306')) {
      imageUrl = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80';
    }
  }

  return {
    ...city,
    venue,
    date,
    imageUrl
  };
}

/**
 * Helper to get clean category id & badge label
 */
function getCategoryInfo(category) {
  if (!category) return { id: '', label: '' };
  if (typeof category === 'string') {
    const pkg = RACE_PACKAGES.find(
      (p) => p.id === category.toLowerCase() || p.distance.toLowerCase() === category.toLowerCase()
    );
    if (pkg) {
      return { id: pkg.id, label: `${pkg.distance} — ${pkg.name.toUpperCase()}` };
    }
    return { id: category.toLowerCase(), label: category.toUpperCase() };
  }
  const id = category.id || (category.distance ? category.distance.toLowerCase() : '');
  const dist = category.distance || (category.id ? category.id.toUpperCase() : '');
  const name = category.name || category.title || '';
  const label = dist && name ? `${dist} — ${name.toUpperCase()}` : (name || dist);
  return { id, label };
}

/**
 * CitySelectModal – Shared popup for choosing city before ticket booking.
 * Used on Event page ("Choose Your Race Category") and Transparency page ("Official Registration").
 *
 * Props:
 * - isOpen (boolean): visibility
 * - onClose (function): callback when closed
 * - category (object | string | null): selected race package/category
 * - initialCities (array, optional): pre-fetched cities if available
 */
export default function CitySelectModal({
  isOpen,
  onClose,
  category = null,
  initialCities = null
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [cities, setCities] = useState(() => (Array.isArray(initialCities) ? initialCities.map(sanitizeCityData) : []));
  const [citiesLoading, setCitiesLoading] = useState(!initialCities || initialCities.length === 0);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { id: catId, label: catLabel } = getCategoryInfo(category);

  // Fetch active cities from the backend API
  const fetchCities = useCallback(async () => {
    try {
      setCitiesLoading(true);
      const res = await fetch(`/api/cities?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const activeOnly = json.data
            .filter((c) => (c.status ? c.status === 'active' : c.isActive !== false))
            .map(sanitizeCityData);
          setCities(activeOnly);
          // If only one city, auto-select it
          if (activeOnly.length === 1 && !selectedSlug) {
            setSelectedSlug(activeOnly[0].slug);
          }
        } else {
          setCities([]);
        }
      } else {
        setCities([]);
      }
    } catch {
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  }, [selectedSlug]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      const stored = localStorage.getItem('selectedCity');
      if (stored) setSelectedSlug(stored);
      fetchCities();
    }
  }, [isOpen, fetchCities]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (!selectedSlug) {
      setErrorMsg('Please select a city to continue.');
      return;
    }
    setErrorMsg('');
    localStorage.setItem('selectedCity', selectedSlug);

    // Route to /events/:eventId/book?city=...&category=...
    const categoryQuery = catId ? `&category=${encodeURIComponent(catId)}` : '';
    const targetUrl = `/events/${encodeURIComponent(selectedSlug)}/book?city=${encodeURIComponent(selectedSlug)}${categoryQuery}`;

    onClose();
    navigate(targetUrl, { state: { from: location.pathname } });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="csm-backdrop" onClick={handleBackdropClick} role="presentation">
      <div className="csm-modal" role="dialog" aria-modal="true" aria-labelledby="csm-title">
        {/* Header */}
        <div className="csm-header">
          <div>
            {catLabel ? <div className="csm-pkg-label">{catLabel}</div> : null}
            <h2 id="csm-title" className="csm-title">
              Choose Your City
            </h2>
            <p className="csm-subtitle">Select the city where you want to run</p>
          </div>
          <button
            type="button"
            className="csm-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FaXmark />
          </button>
        </div>

        {/* Body */}
        <div className="csm-body">
          {citiesLoading && cities.length === 0 ? (
            <div className="csm-state">
              <div className="csm-state-icon">⏳</div>
              <p>Loading cities...</p>
            </div>
          ) : cities.length === 0 ? (
            <div className="csm-state">
              <div className="csm-state-icon">🏙️</div>
              <p style={{ margin: 0 }}>
                No active cities configured yet.
                <br />
                Please check back soon.
              </p>
            </div>
          ) : (
            <div className="csm-cities-list" role="radiogroup" aria-label="Select City">
              {cities.map((city) => {
                const isSelected = selectedSlug === city.slug;
                const cityDate = city.date || city.eventDate || '';
                return (
                  <div
                    key={city.slug || city._id}
                    className={`csm-city-option${isSelected ? ' csm-selected' : ''}`}
                    onClick={() => {
                      setSelectedSlug(city.slug);
                      setErrorMsg('');
                    }}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setSelectedSlug(city.slug);
                        setErrorMsg('');
                      }
                    }}
                  >
                    <img
                      className="csm-city-img"
                      src={city.imageUrl || '/assets/chennai.png'}
                      alt={city.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/chennai.png';
                      }}
                    />
                    <div className="csm-city-info">
                      <div className="csm-city-name">{city.name}</div>
                      <div className="csm-city-meta">
                        {city.venue && (
                          <span className="csm-city-meta-row">
                            <FaLocationDot className="csm-city-meta-icon" />
                            {city.venue}
                          </span>
                        )}
                        {cityDate && (
                          <span className="csm-city-meta-row">
                            <FaCalendarDays className="csm-city-meta-icon" />
                            {cityDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="csm-radio" aria-hidden="true">
                      <div className="csm-radio-dot" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {errorMsg && (
            <div className="csm-error" role="alert">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="csm-footer">
          <button type="button" className="csm-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="csm-continue-btn"
            onClick={handleContinue}
            disabled={!selectedSlug || citiesLoading}
          >
            <span>Continue</span>
            <FaArrowRight style={{ fontSize: '0.85rem' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
