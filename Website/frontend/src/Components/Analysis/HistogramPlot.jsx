import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Container } from 'react-bootstrap';
import { chartLayout, chartPalette, formatCrore, toNumber } from './analysisHelpers';

const HistogramPlot = ({ data = [] }) => {
  const priceSeries = useMemo(
    () => data.map((item) => toNumber(item.PRICE)).filter((item) => item !== null),
    [data]
  );

  const averagePrice = priceSeries.length
    ? priceSeries.reduce((sum, value) => sum + value, 0) / priceSeries.length
    : 0;

  const sorted = [...priceSeries].sort((a, b) => a - b);
  const medianPrice = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;

  return (
    <Container className="section-shell">
      <div className="feature-band">
        <div className="section-heading">
          <div>
            <h2>Price distribution</h2>
            <p>This shows whether the current inventory is concentrated in budget, mid-market, or premium price bands.</p>
          </div>
        </div>
        <div className="analysis-grid-two">
          <div className="analytics-plot-shell" style={{ height: '420px' }}>
            <Plot
              data={[{
                x: priceSeries,
                type: 'histogram',
                marker: { color: chartPalette[0], line: { width: 1, color: '#ffffff' } },
                nbinsx: 24,
                opacity: 0.88,
              }]}
              layout={chartLayout({
                title: 'Distribution of asking prices',
                xaxis: { title: { text: 'Price (Crores)' } },
                yaxis: { title: { text: 'Number of listings' } },
                showlegend: false,
                height: 420,
                extra: {
                  shapes: [
                    {
                      type: 'line',
                      x0: averagePrice,
                      x1: averagePrice,
                      y0: 0,
                      y1: 1,
                      yref: 'paper',
                      line: { color: chartPalette[5], width: 2.5, dash: 'dash' },
                    },
                    {
                      type: 'line',
                      x0: medianPrice,
                      x1: medianPrice,
                      y0: 0,
                      y1: 1,
                      yref: 'paper',
                      line: { color: chartPalette[1], width: 2.5, dash: 'dot' },
                    },
                  ],
                },
              })}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="insight-card insight-card-lg">
            <span>What it means</span>
            <strong>Average price is {formatCrore(averagePrice)}</strong>
            <p>
              Median price is {formatCrore(medianPrice)}. If the average sits above the median, higher-end homes are stretching the top end of the market.
            </p>
            <p>
              The tallest bars show the price band where most of the current inventory is competing for attention.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default HistogramPlot;
