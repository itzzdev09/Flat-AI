import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Container } from 'react-bootstrap';
import { averageByField, chartLayout, chartPalette, topEntries } from './analysisHelpers';

const BarPlot = ({ data = [] }) => {
  const averagedData = useMemo(
    () => topEntries(averageByField(data, 'location', 'Price_per_sqft').filter((item) => item.count >= 10), 8),
    [data]
  );
  const priciest = averagedData[0];
  const valuePocket = [...averagedData].sort((a, b) => a.value - b.value)[0];
  const barColors = averagedData.map((_, index) => (index === 0 ? chartPalette[5] : chartPalette[0])).reverse();

  return (
    <Container className="section-shell">
      <div className="feature-band">
        <div className="section-heading">
          <div>
            <h2>Locality price leaders</h2>
            <p>This compares the busiest neighborhoods by average asking rate per square foot.</p>
          </div>
        </div>
        <div className="analysis-grid-two">
          <div className="analytics-plot-shell" style={{ height: '500px' }}>
            <Plot
              data={[{
                x: averagedData.map((item) => item.value).reverse(),
                y: averagedData.map((item) => item.label).reverse(),
                type: 'bar',
                orientation: 'h',
                marker: { color: barColors },
                hovertemplate: '%{y}: Rs. %{x:.0f} / sqft<extra></extra>',
              }]}
              layout={chartLayout({
                title: 'Average asking rate by locality',
                xaxis: {
                  title: { text: 'Average price / sqft' },
                },
                yaxis: {
                  title: { text: 'Locality' },
                },
                showlegend: false,
              })}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="insight-card insight-card-lg">
            <span>How to read this</span>
            <strong>{priciest ? priciest.label : 'N/A'} leads the pack</strong>
            <p>
              {priciest ? `It is averaging about Rs. ${Math.round(priciest.value)} / sqft.` : 'No pricing signal available.'}
            </p>
            <p>
              {valuePocket ? `${valuePocket.label} is the lowest among the active localities shown here, which makes it the strongest value pocket in this view.` : 'No value comparison available.'}
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default BarPlot;

