import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { Container, Row, Col } from 'react-bootstrap';
import LocationInput from './LocationInput';
import { chartLayout, chartPalette, filterByLocation } from './analysisHelpers';

const ScatterPlot = ({ data = [] }) => {
  const [xAxis, setXAxis] = useState('AREA');
  const [yAxis, setYAxis] = useState('PRICE');
  const [colorParameter, setColorParameter] = useState('BEDROOM_NUM');
  const [locationInput, setLocationInput] = useState('');

  const categoryLabels = {
    BEDROOM_NUM: 'BHK',
    AREA: 'Area (sqft)',
    PRICE: 'Price (Crores)',
    Price_per_sqft: 'Price / sqft',
    FLOOR_NUM: 'Floor number',
  };

  const availableOptions = ['AREA', 'PRICE', 'BEDROOM_NUM', 'Price_per_sqft', 'FLOOR_NUM'];
  const colorOptions = ['None', ...availableOptions];
  const filteredData = useMemo(() => filterByLocation(data, locationInput), [data, locationInput]);

  const groupedData = filteredData.reduce((acc, property) => {
    const groupKey = colorParameter === 'None' ? 'All homes' : (property[colorParameter] || 'Unknown');
    if (!acc[groupKey]) acc[groupKey] = { x: [], y: [], text: [], size: [] };
    acc[groupKey].x.push(property[xAxis]);
    acc[groupKey].y.push(property[yAxis]);
    acc[groupKey].size.push(Math.max(10, Number(property.BEDROOM_NUM || 1) * 5));
    acc[groupKey].text.push(`${property.location}<br>${property.BEDROOM_NUM} BHK<br>Rs. ${property.PRICE} Cr`);
    return acc;
  }, {});

  const plotData = Object.keys(groupedData).map((group, index) => ({
    x: groupedData[group].x,
    y: groupedData[group].y,
    mode: 'markers',
    type: 'scatter',
    name: group,
    marker: {
      size: groupedData[group].size,
      opacity: 0.75,
      color: chartPalette[index % 5],
      line: { width: 1, color: '#ffffff' },
    },
    text: groupedData[group].text,
    hovertemplate: '%{text}<extra></extra>',
  }));

  return (
    <Container className="section-shell">
      <div className="feature-band">
        <div className="section-heading">
          <div>
            <h2>Demand and size relationship</h2>
            <p>Bubble sizes reflect BHK count so you can compare compact demand and larger-ticket supply at the same time.</p>
          </div>
        </div>
        <Row className="g-4 align-items-start">
          <Col md={3}>
            <div className="analytics-sidepanel">
              <h4>X axis</h4>
              {availableOptions.map((option) => (
                <label key={option} className="analytics-option">
                  <input
                    type="radio"
                    value={option}
                    checked={xAxis === option}
                    onChange={() => setXAxis(option)}
                  />
                  {categoryLabels[option] || option}
                </label>
              ))}
              <h4 className="mt-4">Y axis</h4>
              {availableOptions.map((option) => (
                <label key={option} className="analytics-option">
                  <input
                    type="radio"
                    value={option}
                    checked={yAxis === option}
                    onChange={() => setYAxis(option)}
                  />
                  {categoryLabels[option] || option}
                </label>
              ))}
              <h4 className="mt-4">Color grouping</h4>
              {colorOptions.map((option) => (
                <label key={option} className="analytics-option">
                  <input
                    type="radio"
                    value={option}
                    checked={colorParameter === option}
                    onChange={() => setColorParameter(option)}
                  />
                  {categoryLabels[option] || option}
                </label>
              ))}
              <LocationInput locationInput={locationInput} setLocationInput={setLocationInput} />
            </div>
          </Col>
          <Col md={9}>
            <div className="analytics-plot-shell" style={{ height: '500px' }}>
              <Plot
                data={plotData}
                layout={chartLayout({
                  title: `${categoryLabels[xAxis]} vs ${categoryLabels[yAxis]}`,
                  xaxis: { title: { text: categoryLabels[xAxis] } },
                  yaxis: { title: { text: categoryLabels[yAxis] } },
                })}
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

export default ScatterPlot;
