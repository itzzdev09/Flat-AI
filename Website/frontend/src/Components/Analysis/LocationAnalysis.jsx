import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { Row, Col } from 'react-bootstrap';
import LocationInput from './LocationInput';
import { formatCrore, normalizeCoordinates, toNumber } from './analysisHelpers';

const categoryOptions = ['Area (sqft)', 'Price (Crores)', 'BHK', 'Price/Sqft'];

const categoryLabels = {
  'Area (sqft)': 'Area (sqft)',
  'Price (Crores)': 'Price (Crores)',
  BHK: 'BHK',
  'Price/Sqft': 'Price/Sqft',
};

const getMetricValue = (item, selectedCategory) => {
  switch (selectedCategory) {
    case 'Area (sqft)':
      return toNumber(item.AREA) || 0;
    case 'Price (Crores)':
      return toNumber(item.PRICE) || 0;
    case 'BHK':
      return toNumber(item.BEDROOM_NUM) || 0;
    case 'Price/Sqft':
      return toNumber(item.Price_per_sqft) || 0;
    default:
      return 0;
  }
};

const getMarkerColor = (value, selectedCategory) => {
  if (selectedCategory === 'BHK') {
    if (value >= 4) return '#f97316';
    if (value >= 3) return '#0d9488';
    return '#3b82f6';
  }
  if (selectedCategory === 'Price (Crores)') {
    if (value >= 1.25) return '#f97316';
    if (value >= 0.75) return '#14b8a6';
    return '#3b82f6';
  }
  if (selectedCategory === 'Price/Sqft') {
    if (value >= 8000) return '#f97316';
    if (value >= 6000) return '#14b8a6';
    return '#3b82f6';
  }
  if (value >= 1600) return '#f97316';
  if (value >= 1100) return '#14b8a6';
  return '#3b82f6';
};

const MapViewportController = ({ mapRef, points }) => {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
    map.invalidateSize();

    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 150);

    if (!points.length) {
      map.setView([22.5726, 88.3639], 11);
      return () => window.clearTimeout(resizeTimer);
    }

    if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
      return () => window.clearTimeout(resizeTimer);
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });

    return () => window.clearTimeout(resizeTimer);
  }, [map, mapRef, points]);

  return null;
};

const LocationAnalysis = ({
  data = [],
  locationInput,
  setLocationInput,
  suggestions = [],
  totalListings = 0,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Price (Crores)');
  const mapRef = useRef(null);

  const mapData = data
    .map((item) => {
      const coordinates = normalizeCoordinates(item);
      return coordinates ? { ...item, coordinates } : null;
    })
    .filter(Boolean);
  const mapPoints = mapData.map((item) => [item.coordinates.lat, item.coordinates.lng]);

  return (
    <section className="section-shell">
      <div className="feature-band">
        <div className="section-heading">
          <div>
            <h2>Neighborhood map</h2>
            <p>Browse homes on a live map and color the markers by the metric that matters most to you.</p>
          </div>
          <div className="analysis-kicker">
            Showing <strong>{data.length.toLocaleString()}</strong> matched homes
          </div>
        </div>

        <Row className="g-4">
          <Col md={3}>
            <div className="analytics-sidepanel">
              <h4>Show me by</h4>
              <p className="analytics-muted">Filter the whole page by locality, then switch the map coloring to compare price, size, or density.</p>
              <div className="analytics-toggle-group" role="tablist" aria-label="Map metric">
                {categoryOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`analytics-toggle ${selectedCategory === option ? 'is-active' : ''}`}
                    onClick={() => setSelectedCategory(option)}
                    aria-pressed={selectedCategory === option}
                  >
                    {categoryLabels[option]}
                  </button>
                ))}
              </div>
              <LocationInput
                locationInput={locationInput}
                setLocationInput={setLocationInput}
                suggestions={suggestions}
                label="Filter homes"
                placeholder="Search a locality, area, or neighborhood"
              />
              <div className="analytics-stat">
                <span>Listings on map</span>
                <strong>{mapData.length}</strong>
                <small>{totalListings.toLocaleString()} total in the current market view</small>
              </div>
            </div>
          </Col>

          <Col md={9}>
            <div className="analytics-plot-shell analytics-map-shell">
              <MapContainer center={[22.5726, 88.3639]} zoom={11} scrollWheelZoom className="leaflet-map">
                <MapViewportController mapRef={mapRef} points={mapPoints} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapData.map((item) => {
                  const metricValue = getMetricValue(item, selectedCategory);
                  return (
                    <CircleMarker
                      key={item._id || item.PROP_ID}
                      center={[item.coordinates.lat, item.coordinates.lng]}
                      radius={4}
                      pathOptions={{
                        color: '#ffffff',
                        weight: 1.5,
                        fillColor: getMarkerColor(metricValue, selectedCategory),
                        fillOpacity: 0.96,
                      }}
                    >
                      <Popup>
                        <strong>{item.location}</strong>
                        <br />
                        {item.BEDROOM_NUM} BHK
                        <br />
                        {formatCrore(item.PRICE)}
                        <br />
                        Rs. {item.Price_per_sqft} / sqft
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default LocationAnalysis;
