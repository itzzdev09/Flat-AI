import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { Container, Row, Col } from 'react-bootstrap';
import LocationInput from './LocationInput';
import { chartLayout, chartPalette, countByField, filterByLocation } from './analysisHelpers';

const PieChart = ({ data = [] }) => {
  const [xAxis, setXAxis] = useState('BEDROOM_NUM'); 
  const [locationInput, setLocationInput] = useState('');

  const categoryLabels = {
    BEDROOM_NUM: 'BHK',
    AREA: 'Area (sqft)',
    PRICE: 'Price (Crores)',
    Price_per_sqft: 'Price/ Sqft',
    AGE: 'Age of Property',
    FURNISH: 'Furnishing',
    FLOOR_NUM: 'Floor Number',
    TOTAL_FLOOR: 'Total Floors',
    CITY: 'City',
    location: 'Location',
    Facing_Direction: 'Facing Direction',
    amenity_luxury: 'Luxury Category',
  };

  const availableXOptions = ['BEDROOM_NUM', 'AGE', 'FURNISH', 'CITY', 'location', 'Facing_Direction', 'amenity_luxury'];
  const filteredData = useMemo(() => filterByLocation(data, locationInput), [data, locationInput]);
  const groupedData = countByField(filteredData, xAxis);
  const sortedEntries = Object.entries(groupedData).sort((a, b) => b[1] - a[1]);
  const primary = sortedEntries.slice(0, 6);
  const otherTotal = sortedEntries.slice(6).reduce((sum, [, value]) => sum + value, 0);
  if (otherTotal) primary.push(['Other', otherTotal]);
  const totalCount = primary.reduce((sum, [, value]) => sum + value, 0);
  const pieData = [{
    labels: primary.map(([label]) => label),
    values: primary.map(([, count]) => (totalCount ? (count / totalCount) * 100 : 0)), 
    type: 'pie',
    hole: 0.48,
    marker: {
      colors: [chartPalette[0], chartPalette[1], chartPalette[2], chartPalette[5], chartPalette[6], chartPalette[7], chartPalette[3]],
    },
    hoverinfo: 'label+percent',
    textinfo: 'label+percent', 
    textposition: 'outside',
    automargin: true,
  }];

  return (
    <Container className="section-shell">
      <div className="feature-band">
        <div className="section-heading">
          <div>
            <h2>Inventory mix</h2>
            <p>Switch categories to understand where supply is concentrated and where the tail begins to thin out.</p>
          </div>
        </div>
        <Row className="g-4 align-items-start">
          <Col md={3}>
            <div className="analytics-sidepanel">
            <h4>Category split</h4>
            {availableXOptions.map(option => (
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
              <LocationInput
                locationInput={locationInput}
                setLocationInput={setLocationInput}
              />
            </div>
          </Col>
            <Col md={9}>
                <div className="analytics-plot-shell" style={{ height: '500px' }}>
                  <Plot
                    data={pieData}
                    layout={chartLayout({
                      title: `Distribution of ${categoryLabels[xAxis]}`,
                      yaxis: {},
                      xaxis: {},
                      extra: { margin: { l: 24, r: 24, t: 60, b: 32 } },
                    })}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
            </Col>
        </Row>
      </div>
    </Container>
  );
};

export default PieChart;

