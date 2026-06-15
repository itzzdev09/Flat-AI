const CRORE_TO_RUPEES = 10000000;

export const getPredictionBand = (prediction, ratio = 0.08, floor = 0.03) => {
  const value = Number(prediction) || 0;
  return Math.max(value * ratio, floor);
};

export const formatPredictionRange = (prediction, ratio = 0.08, floor = 0.03) => {
  const value = Number(prediction) || 0;
  if (!value) return 'N/A';

  const band = getPredictionBand(value, ratio, floor);
  const low = Math.max(value - band, 0.01);
  const high = value + band;

  return high > 1
    ? `${low.toFixed(2)} to ${high.toFixed(2)} Cr`
    : `${(low * 100).toFixed(2)} to ${(high * 100).toFixed(2)} Lakh`;
};

export const formatImpliedPricePerSqft = (prediction, area) => {
  const value = Number(prediction) || 0;
  const sqft = Number(area) || 0;

  if (!value || !sqft) return 'N/A';

  return `Rs. ${Math.round((value * CRORE_TO_RUPEES) / sqft).toLocaleString('en-IN')}`;
};
