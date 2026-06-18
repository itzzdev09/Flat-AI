import { matchesLocationQuery } from '../../utils/propertyUtils';

export const chartPalette = [
  '#1E3A8A',
  '#2563EB',
  '#60A5FA',
  '#94A3B8',
  '#CBD5E1',
  '#D4AF37',
  '#F3F4F6',
  '#334155',
];

export const heatmapScale = [
  [0, '#F8FAFC'],
  [0.18, '#E2E8F0'],
  [0.38, '#BFDBFE'],
  [0.62, '#60A5FA'],
  [0.84, '#1E3A8A'],
  [1, '#D4AF37'],
];

export const filterByLocation = (data, locationInput = '') => {
  const query = locationInput.trim();
  if (!query) return data;

  const knownLocations = data.map((item) => item.location).filter(Boolean);
  return data.filter((item) => matchesLocationQuery(item.location, query, knownLocations));
};

export const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const normalizeCoordinates = (item) => {
  const first = toNumber(item?.LATITUDE);
  const second = toNumber(item?.LONGITUDE);

  if (first === null || second === null) return null;
  if (first === 0 || second === 0) return null;

  const isKolkataCoordinate = (lat, lng) => lat >= 22.2 && lat <= 23.05 && lng >= 88.15 && lng <= 88.7;

  if (isKolkataCoordinate(first, second)) {
    return { lat: first, lng: second };
  }

  if (isKolkataCoordinate(second, first)) {
    return { lat: second, lng: first };
  }

  const firstLooksLikeLatitude = first >= -90 && first <= 90;
  const secondLooksLikeLongitude = second >= -180 && second <= 180;

  if (firstLooksLikeLatitude && secondLooksLikeLongitude) {
    return null;
  }

  const firstLooksLikeLongitude = first >= -180 && first <= 180;
  const secondLooksLikeLatitude = second >= -90 && second <= 90;

  if (firstLooksLikeLongitude && secondLooksLikeLatitude) {
    return null;
  }

  return null;
};

export const formatCrore = (value) => {
  const numericValue = toNumber(value);
  if (numericValue === null) return 'N/A';
  return numericValue >= 1 ? `Rs. ${numericValue.toFixed(2)} Cr` : `Rs. ${(numericValue * 100).toFixed(0)} Lakh`;
};

export const chartLayout = ({
  title,
  height = 460,
  xaxis = {},
  yaxis = {},
  showlegend = true,
  extra = {},
} = {}) => ({
  title: {
    text: title,
    font: { color: '#0F172A', size: 20, family: 'Poppins, sans-serif' },
    x: 0.02,
  },
  height,
  paper_bgcolor: 'rgba(255, 255, 255, 0.98)',
  plot_bgcolor: 'rgba(255, 255, 255, 0.98)',
  font: { color: '#475569', family: 'Poppins, sans-serif' },
  margin: { l: 56, r: 24, t: 58, b: 56 },
  legend: {
    orientation: 'h',
    y: -0.22,
    x: 0,
    font: { color: '#64748B', size: 12 },
  },
  xaxis: {
    gridcolor: 'rgba(148, 163, 184, 0.14)',
    zerolinecolor: 'rgba(148, 163, 184, 0.14)',
    linecolor: 'rgba(148, 163, 184, 0.2)',
    tickfont: { color: '#64748b' },
    title: { font: { color: '#334155', size: 12 } },
    ...xaxis,
  },
  yaxis: {
    gridcolor: 'rgba(148, 163, 184, 0.14)',
    zerolinecolor: 'rgba(148, 163, 184, 0.14)',
    linecolor: 'rgba(148, 163, 184, 0.2)',
    tickfont: { color: '#64748b' },
    title: { font: { color: '#334155', size: 12 } },
    ...yaxis,
  },
  showlegend,
  ...extra,
});

export const countByField = (data, field) => {
  const grouped = {};
  data.forEach((item) => {
    const key = item[field] || 'Unknown';
    grouped[key] = (grouped[key] || 0) + 1;
  });
  return grouped;
};

export const averageByField = (data, field, metric) => {
  const grouped = {};
  data.forEach((item) => {
    const key = item[field] || 'Unknown';
    const value = toNumber(item[metric]);
    if (value === null) return;
    if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
    grouped[key].total += value;
    grouped[key].count += 1;
  });

  return Object.entries(grouped).map(([label, details]) => ({
    label,
    value: details.count ? details.total / details.count : 0,
    count: details.count,
  }));
};

export const topEntries = (entries, limit = 8) => (
  [...entries].sort((a, b) => b.value - a.value).slice(0, limit)
);

export const locationSummary = (data) => {
  const grouped = averageByField(data, 'location', 'PRICE');
  return topEntries(grouped, 6);
};
