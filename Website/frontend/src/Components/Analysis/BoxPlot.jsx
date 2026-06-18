import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Container } from 'react-bootstrap';
import { chartLayout, chartPalette } from './analysisHelpers';

const BoxPlot = ({ data = [] }) => {
  const groupedData = useMemo(() => {
    const sorted = data.reduce((acc, property) => {
      const groupKey = `${property.BEDROOM_NUM} BHK`;
      const yValue = parseFloat(property.PRICE);
      if (!acc[groupKey]) acc[groupKey] = [];
      if (!Number.isNaN(yValue)) acc[groupKey].push(yValue);
      return acc;
    }, {});

    return Object.entries(sorted).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [data]);

  const boxPlotData = groupedData.map(([group, values], index) => ({
    x: Array(values.length).fill(group),
    y: values,
    type: 'box',
    name: group,
    boxpoints: 'outliers',
    marker: {
      color: chartPalette[index % 2],
      size: 5,
    },
    fillcolor: 'rgba(30, 58, 138, 0.14)',
  }));

  const widestSpread = groupedData
    .map(([label, values]) => ({ label, spread: Math.max(...values) - Math.min(...values) }))
    .sort((a, b) => b.spread - a.spread)[0];

  return (
    <Container className="section-shell">
      <div className="feature-band">
        <div className="section-heading">
          <div>
            <h2>Price spread by BHK</h2>
            <p>Each box shows the median, spread, and outliers for asking prices within a bedroom band.</p>
          </div>
        </div>
        <div className="analysis-grid-two">
          <div className="analytics-plot-shell" style={{ height: '500px' }}>
            <Plot
              data={boxPlotData}
              layout={chartLayout({
                title: 'Price distribution by bedroom count',
                xaxis: {
                  title: { text: 'BHK band' },
                },
                yaxis: {
                  title: { text: 'Price (Crores)' },
                },
                showlegend: false,
              })}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="insight-card insight-card-lg">
            <span>How to read this</span>
            <strong>{widestSpread ? `${widestSpread.label} has the widest price spread` : 'No spread available'}</strong>
            <p>
              Wider boxes mean buyers will see more variation in quality, amenities, and building positioning inside the same bedroom band.
            </p>
            <p>
              If you want predictable pricing, target the tighter bands. If you want bargains, inspect the low outliers in the wider ones.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default BoxPlot;
