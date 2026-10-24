import React from 'react';

export default function DonationStatCard({
  icon,
  label,
  value,
  helper,
  iconColor = '#A71920',
  iconBg = 'rgba(167, 25, 32, 0.1)'
}) {
  return (
    <div className="donation-stat-card">
      <div
        className="donation-stat-icon-badge"
        style={{
          backgroundColor: iconBg,
          color: iconColor
        }}
      >
        {icon}
      </div>
      <div className="donation-stat-content">
        <span className="donation-stat-label">{label}</span>
        <span className="donation-stat-value">{value}</span>
        {helper && <span className="donation-stat-helper">{helper}</span>}
      </div>
    </div>
  );
}
