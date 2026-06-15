import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Form,
  Container,
  ListGroup,
} from 'react-bootstrap';
import { locationSuggestions } from '../../others/Keywords';
import { useDispatch } from 'react-redux';
import { resetSearchResults, searchFlatSlice } from '../../RTK/Slices/SearchSlice';
import { getLocationSuggestions } from '../../utils/propertyUtils';

const BHK_OPTIONS = [1, 2, 3, 4, 5, 6];
const PROPERTY_OPTIONS = ['Flat/Apartment', 'Farm House', 'House/Villa', 'Residential Land'];

const FindFlat = () => {
  const locationOptions = locationSuggestions;
  const [location, setLocation] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [bedrooms, setBedrooms] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const value = e.target.value;
    setLocation(value);

    if (value.length > 0) {
      setFilteredSuggestions(getLocationSuggestions(locationOptions, value));
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  const toggleBedroom = (value) => {
    setBedrooms((current) => (
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    ));
  };

  const togglePropertyType = (value) => {
    setPropertyTypes((current) => (
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    ));
  };

  useEffect(() => {
    const hasFilters = location.trim() || bedrooms.length > 0 || propertyTypes.length > 0;
    const timer = window.setTimeout(() => {
      if (hasFilters) {
        dispatch(searchFlatSlice({
          location: location.trim(),
          bedroom: bedrooms,
          property: propertyTypes,
        }));
      } else {
        dispatch(resetSearchResults());
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [location, bedrooms, propertyTypes, dispatch]);

  return (
    <Container>
      <div className="search-console">
        <div className="section-heading">
          <div>
            <h2>Search Kolkata flats</h2>
            <p>Choose a locality, BHK band, and property type. Results update automatically as you filter.</p>
          </div>
        </div>

        <Form>
          <Row className="g-3 align-items-start">
            <Col md={3}>
              <div className="filter-group">
                <div className="filter-label">BHK</div>
                <div className="filter-chip-grid">
                  {BHK_OPTIONS.map((value) => (
                    <Form.Check
                      key={value}
                      type="checkbox"
                      id={`bhk-${value}`}
                      label={`${value} BHK`}
                      checked={bedrooms.includes(value)}
                      onChange={() => toggleBedroom(value)}
                      className="filter-check"
                    />
                  ))}
                </div>
              </div>
            </Col>

            <Col md={3}>
              <div className="filter-group">
                <div className="filter-label">Property type</div>
                <div className="filter-chip-grid filter-chip-grid-lg">
                  {PROPERTY_OPTIONS.map((value) => (
                    <Form.Check
                      key={value}
                      type="checkbox"
                      id={`property-${value}`}
                      label={value}
                      checked={propertyTypes.includes(value)}
                      onChange={() => togglePropertyType(value)}
                      className="filter-check"
                    />
                  ))}
                </div>
              </div>
            </Col>

            <Col md={4}>
              <div className="filter-group">
                <div className="filter-label">Location</div>
                <input
                  className="form-control"
                  type="text"
                  value={location}
                  onChange={handleChange}
                  placeholder="Type a location..."
                />
              </div>

              {showSuggestions && location && (
                <ListGroup className="mt-2">
                  {filteredSuggestions.slice(0, 8).map((suggestion) => (
                    <ListGroup.Item
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      action
                    >
                      {suggestion}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Col>

            <Col md={2} className="d-flex align-items-end">
              <div className="filter-hint">
                <span>Live filter</span>
                <strong>Updates as you type</strong>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </Container>
  );
};

export default FindFlat;
