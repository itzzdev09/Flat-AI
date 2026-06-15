import React from 'react';
import { formatCrore } from './analysisHelpers';

const Poster = ({ data = [] }) => {
  const totalListings = data.length;
  const avgPrice = totalListings
    ? data.reduce((sum, item) => sum + (Number(item.PRICE) || 0), 0) / totalListings
    : 0;
  const avgArea = totalListings
    ? Math.round(data.reduce((sum, item) => sum + (Number(item.AREA) || 0), 0) / totalListings)
    : 0;
  const topLocality = Object.entries(
    data.reduce((acc, item) => {
      const key = item.location || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Rajarhat';

  return (
    <section className="page-hero">
      <div className="eyebrow" style={{ color: 'var(--teal)' }}>Market snapshot</div>
      <h1>See how homes are priced across the city.</h1>
      <p>
        Explore pricing clusters, neighborhood pressure, and inventory mix from the same live
        listings that power the rest of the site.
      </p>
      <div className="metric-strip">
        <div className="metric-tile">
          <span>Live inventory</span>
          <strong>{totalListings.toLocaleString()} listings</strong>
        </div>
        <div className="metric-tile">
          <span>Average asking price</span>
          <strong>{formatCrore(avgPrice)}</strong>
        </div>
        <div className="metric-tile">
          <span>Typical brief</span>
          <strong>{avgArea} sqft near {topLocality}</strong>
        </div>
      </div>
    </section>
  );
};

export default Poster;
