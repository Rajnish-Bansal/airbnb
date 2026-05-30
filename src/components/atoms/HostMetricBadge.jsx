import React from 'react';
import './HostMetricBadge.css';

export const HostMetricBadge = ({ value, label }) => (
  <span className="compact-metric-badge" aria-label={label} title={label}>
    {value}
  </span>
);
