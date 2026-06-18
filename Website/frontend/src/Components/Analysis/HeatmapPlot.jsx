import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { Col, Container, Row } from 'react-bootstrap';
import LocationInput from './LocationInput';
import { chartLayout, filterByLocation, heatmapScale, toNumber } from './analysisHelpers';

const HeatmapPlot = ({ data = [] }) => {
  const [metric, setMetric] = useState('Price_per_sqft');
  const [locationInput, setLocationInput] = useState('');

  const filteredData = useMemo(() => filterByLocation(data, locationInput), [data, locationInput]);

  const { xLabels, yLabels, zValues } = useMemo(() => {
    const topLocations = Object.entries(
      filteredData.reduce((acc, item) => {
        const key = item.location || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label]) => label);

    const bhkLabels = [...new Set(filteredData.map((item) => `${item.BEDROOM_NUM} BHK`))].sort();
    const matrix = bhkLabels.map((bhkLabel) =>
      topLocations.map((location) => {
        const matches = filteredData.filter(
          (item) => `${item.BEDROOM_NUM} BHK` === bhkLabel && item.location === location
        );
        if (!matches.length) return null;
        const avg =
          matches.reduce((sum, item) => sum + (toNumber(item[metric]) || 0), 0) / matches.length;
        return Number(avg.toFixed(2));
      })
    );

    return { xLabels: topLocations, yLabels: bhkLabels, zValues: matrix };
  }, [filteredData, metric]);

  return (
    <Container className="section-shell">
      <div className="feature-band">
        <div className="section-heading">
          <div>
            <h2>Location pressure heatmap</h2>
            <p>See where each BHK band becomes expensive fastest across the busiest micro-markets.</p>
          </div>
        </div>
        <Row className="g-4 align-items-start">
          <Col md={3}>
            <div className="analytics-sidepanel">
              <h4>Heat metric</h4>
              {['Price_per_sqft', 'PRICE', 'AREA'].map((option) => (
                <label key={option} className="analytics-option">
                  <input
                    type="radio"
                    value={option}
                    checked={metric === option}
                    onChange={() => setMetric(option)}
                  />
                  {option === 'Price_per_sqft' ? 'Price / sqft' : option === 'PRICE' ? 'Price (Cr)' : 'Area (sqft)'}
                </label>
              ))}
              <LocationInput locationInput={locationInput} setLocationInput={setLocationInput} />
            </div>
          </Col>
          <Col md={9}>
            <div className="analytics-plot-shell" style={{ height: '500px' }}>
              <Plot
                data={[{
                  x: xLabels,
                  y: yLabels,
                  z: zValues,
                  type: 'heatmap',
                  colorscale: heatmapScale,
                  hovertemplate: '%{y} in %{x}<br>%{z}<extra></extra>',
                }]}
                layout={chartLayout({
                  title: 'Average value by locality and bedroom mix',
                  xaxis: { title: { text: 'Location' } },
                  yaxis: { title: { text: 'Bedroom mix' } },
                  showlegend: false,
                })}
                config={{ displayModeBar: false, responsive: true }}
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default HeatmapPlot;
