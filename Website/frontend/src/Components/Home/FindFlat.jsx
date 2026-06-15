import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Form,
  Container,
  DropdownButton,
  ListGroup,
} from 'react-bootstrap';
import { locationSuggestions } from '../../others/Keywords';
import { useDispatch } from 'react-redux';
import { resetSearchResults, searchFlatSlice } from '../../RTK/Slices/SearchSlice';
import { getLocationSuggestions } from '../../utils/propertyUtils';

const FindFlat = () => {
  const locationOptions = locationSuggestions;
  const [location, setLocation] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [bedroom, setBedroom] = useState('');
  const [property, setProperty] = useState('');
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

  useEffect(() => {
    // The search stays debounced so typing does not spam the backend on every keystroke.
    const hasFilters = location.trim() || bedroom || property;
    const timer = window.setTimeout(() => {
      if (hasFilters) {
        dispatch(searchFlatSlice({
          location: location.trim(),
          bedroom: bedroom ? [parseInt(bedroom)] : [],
          property: property ? [property] : [],
        }));
      } else {
        dispatch(resetSearchResults());
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [location, bedroom, property, dispatch]);

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
              <DropdownButton menuVariant="dark" title={`BHK: ${bedroom ? `${bedroom} BHK` : 'Any'}`} className="w-100">
                <div className="p-3">
                  <Form.Check
                    key="any-bhk"
                    label="Any BHK"
                    type="radio"
                    name="bedroom"
                    value=""
                    onChange={() => setBedroom('')}
                    checked={bedroom === ''}
                    className="filter-check mb-2"
                  />
                  {[1, 2, 3, 4, 5, 6].map((value) => (
                    <Form.Check
                      key={value}
                      label={`${value} BHK`}
                      type="radio"
                      name="bedroom"
                      value={String(value)}
                      onChange={(event) => setBedroom(event.target.value)}
                      checked={bedroom === String(value)}
                      className="filter-check"
                    />
                  ))}
                </div>
              </DropdownButton>
            </Col>

            <Col md={3}>
              <DropdownButton menuVariant="dark" title={`Type: ${property || 'Any'}`} className="w-100">
                <div className="p-3">
                  <Form.Check
                    key="any-property"
                    label="Any Type"
                    type="radio"
                    name="property"
                    value=""
                    onChange={() => setProperty('')}
                    checked={property === ''}
                    className="filter-check mb-2"
                  />
                  {['Flat/Apartment', 'Farm House', 'House/Villa', 'Residential Land'].map((value) => (
                    <Form.Check
                      key={value}
                      label={value}
                      type="radio"
                      name="property"
                      value={value}
                      onChange={(event) => setProperty(event.target.value)}
                      checked={property === value}
                      className="filter-check"
                    />
                  ))}
                </div>
              </DropdownButton>
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
