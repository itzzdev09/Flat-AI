import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { countByField, formatCrore, toNumber } from './analysisHelpers';
import { cardMotion } from '../Sections/Motion';

const getGroupedMetric = (data, metric) => {
  const grouped = {};
  data.forEach((item) => {
    const key = item.location || 'Unknown';
    const value = toNumber(item[metric]);
    if (value === null) return;
    if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
    grouped[key].total += value;
    grouped[key].count += 1;
  });
  return Object.entries(grouped)
    .map(([label, details]) => ({
      label,
      value: details.count ? details.total / details.count : 0,
      count: details.count,
    }))
    .filter((item) => item.count >= 10);
};

const InsightCards = ({ data = [] }) => {
  const insights = useMemo(() => {
    const hottestLocation = Object.entries(countByField(data, 'location')).sort((a, b) => b[1] - a[1])[0];
    const premiumLocation = [...getGroupedMetric(data, 'Price_per_sqft')].sort((a, b) => b.value - a.value)[0];
    const valueLocation = [...getGroupedMetric(data, 'Price_per_sqft')].sort((a, b) => a.value - b.value)[0];
    const dominantBhk = Object.entries(countByField(data, 'BEDROOM_NUM')).sort((a, b) => b[1] - a[1])[0];

    return [
      {
        title: 'Most active locality',
        value: hottestLocation ? hottestLocation[0] : 'N/A',
        note: hottestLocation ? `${hottestLocation[1]} listings are concentrated here.` : 'No data available.',
      },
      {
        title: 'Highest asking rate',
        value: premiumLocation ? premiumLocation.label : 'N/A',
        note: premiumLocation ? `Avg. Rs. ${Math.round(premiumLocation.value)} / sqft.` : 'No data available.',
      },
      {
        title: 'Best value pocket',
        value: valueLocation ? valueLocation.label : 'N/A',
        note: valueLocation ? `Avg. Rs. ${Math.round(valueLocation.value)} / sqft keeps it accessible.` : 'No data available.',
      },
      {
        title: 'Most common demand size',
        value: dominantBhk ? `${dominantBhk[0]} BHK` : 'N/A',
        note: dominantBhk ? `${dominantBhk[1]} listings fall in this band.` : 'No data available.',
      },
    ];
  }, [data]);

  const cityAverage = data.length
    ? data.reduce((sum, item) => sum + (toNumber(item.PRICE) || 0), 0) / data.length
    : 0;

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <h2>Quick market signals</h2>
          <p>A fast read on where demand is strongest and where value still holds.</p>
        </div>
        <div className="analysis-kicker">
          City average asking price: <strong>{formatCrore(cityAverage)}</strong>
        </div>
      </div>
      <div className="insight-grid">
        {insights.map((item) => (
          <motion.article key={item.title} className="insight-card" {...cardMotion}>
            <span>{item.title}</span>
            <strong>{item.value}</strong>
            <p>{item.note}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
};

export default InsightCards;
